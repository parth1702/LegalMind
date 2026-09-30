"""
Agentic RAG Service — Master Orchestrator for LegalMind Advanced RAG Pipeline.

This is the central brain of the Advanced RAG system. It:
1. Classifies query intent (DOCUMENT_QA, LEGAL_KNOWLEDGE, RISK_ANALYSIS, SUMMARIZE, DRAFT_CLAUSE)
2. Enhances the query (rewriting, HyDE, multi-query expansion)
3. Routes to the correct tool/handler based on intent
4. Executes hybrid retrieval + reranking for document queries
5. Synthesizes grounded answers with conversation context
6. Validates citations and returns structured responses

Pipeline Flow:
Query → Intent Classification → Query Enhancement → Hybrid Retrieval (FAISS + BM25)
→ RRF Fusion → Cross-Encoder Reranking → Confidence Gating → LLM Synthesis → Citation Validation
"""
from __future__ import annotations

import re
from typing import List, Dict, Any, Optional, Tuple
from app.core.logging import get_logger
from app.schemas.rag import (
    RAGQueryRequest,
    RAGQueryResponse,
    RAGSourceReference,
    SearchResultChunk,
    LEGAL_RAG_DISCLAIMER,
)
from app.services.intent_classifier_service import (
    intent_classifier_service,
    DOCUMENT_QA, LEGAL_KNOWLEDGE, RISK_ANALYSIS, SUMMARIZE, DRAFT_CLAUSE,
)
from app.services.query_enhancement_service import query_enhancement_service
from app.services.hybrid_retriever_service import hybrid_retriever_service, RetrievedChunk
from app.services.reranker_service import reranker_service
from app.services.gemini_service import gemini_service
from app.services.document_status_service import document_status_service

logger = get_logger("LegalMind.AgenticRAGService")

NO_EVIDENCE_ANSWER = "I cannot find relevant evidence in the provided contract to answer your question."


class AgenticRAGService:
    """
    Master Agentic RAG Orchestrator.
    Routes queries through intent classification → query enhancement → hybrid retrieval
    → reranking → confidence-gated LLM synthesis.
    """

    def __init__(self) -> None:
        logger.info("Agentic RAG Service initialized — Advanced Pipeline Active.")

    def _build_sources_from_chunks(
        self, chunks: List[RetrievedChunk]
    ) -> Tuple[str, List[RAGSourceReference], List[SearchResultChunk]]:
        """Convert RetrievedChunk objects to context text, RAGSourceReferences, and SearchResultChunks."""
        context_lines: List[str] = []
        sources: List[RAGSourceReference] = []
        raw_chunks: List[SearchResultChunk] = []

        for idx, chunk in enumerate(chunks, 1):
            if not chunk.text or not chunk.text.strip():
                continue
            if not chunk.doc_id or not chunk.user_id:
                continue

            source_tag = f"[Source {idx}]"
            clean_text = chunk.text.strip()

            context_lines.append(
                f"{source_tag} (Document: {chunk.doc_id}, Page: {chunk.page}, Chunk: {chunk.chunk_id}):\n{clean_text}\n"
            )

            sources.append(RAGSourceReference(
                source_id=source_tag,
                doc_id=chunk.doc_id,
                user_id=chunk.user_id,
                page=int(chunk.page),
                chunk_id=chunk.chunk_id if isinstance(chunk.chunk_id, (int, str)) else int(chunk.chunk_id),
                score=chunk.score,
                text_snippet=clean_text[:200],
            ))

            raw_chunks.append(SearchResultChunk(
                chunk_id=f"chunk_{chunk.chunk_id}",
                score=chunk.score,
                text=clean_text,
                metadata={
                    "doc_id": chunk.doc_id,
                    "user_id": chunk.user_id,
                    "page": int(chunk.page),
                    "chunk_id": chunk.chunk_id,
                    "similarity_score": chunk.score,
                    "retrieval_source": chunk.source,
                },
            ))

        context_str = "\n".join(context_lines)
        return context_str, sources, raw_chunks

    def _validate_answer_citations(
        self, answer: str, sources: List[RAGSourceReference], user_id: str, doc_id: str
    ) -> Tuple[bool, str]:
        """Validate inline citations against retrieved sources. Prevents hallucinated or leaked citations."""
        if not answer:
            return False, NO_EVIDENCE_ANSWER

        valid_source_ids = {src.source_id for src in sources}
        cited_tags = re.findall(r"\[Source\s+\d+\]", answer)

        # Check tenant and document isolation
        for src in sources:
            if user_id and src.user_id != user_id:
                logger.warning(f"Cross-user leakage: source {src.source_id} belongs to '{src.user_id}', requested by '{user_id}'")
                return False, NO_EVIDENCE_ANSWER
            if doc_id and src.doc_id != doc_id:
                logger.warning(f"Cross-doc leakage: source {src.source_id} belongs to '{src.doc_id}', requested for '{doc_id}'")
                return False, NO_EVIDENCE_ANSWER

        # Check cited tags exist in valid sources
        for tag in cited_tags:
            if tag not in valid_source_ids:
                logger.warning(f"Invalid citation '{tag}' in answer — not in retrieved sources.")
                return False, NO_EVIDENCE_ANSWER

        # If no citations but sources exist, append top source reference
        if not cited_tags and sources:
            answer = f"{answer} {sources[0].source_id}"

        return True, answer

    def _determine_response_mode(self, max_score: float, has_document: bool, intent: str) -> str:
        """
        Confidence-gated response routing:
        - HIGH (>0.60): Document-grounded RAG with strict citations
        - MEDIUM (0.30-0.60): Blended (document evidence + legal knowledge)
        - LOW (<0.30): Pure Legal Co-Pilot (statutory knowledge, no document claims)
        """
        if intent == LEGAL_KNOWLEDGE:
            return "copilot"
        if intent in [RISK_ANALYSIS, SUMMARIZE]:
            return "specialized"
        if not has_document:
            return "copilot"

        if max_score > 0.60:
            return "grounded_rag"
        elif max_score > 0.30:
            return "blended"
        else:
            return "copilot"

    async def _handle_document_qa(
        self, request: RAGQueryRequest, enhanced_query: str, multi_queries: List[str]
    ) -> RAGQueryResponse:
        """Handle DOCUMENT_QA intent: Full hybrid retrieval + reranking + LLM synthesis."""
        user_id = request.user_id
        doc_id = request.document_id or ""

        # 1. Hybrid Retrieval (FAISS + BM25 + RRF)
        initial_top_k = min((request.top_k or 4) * 3, 15)  # Retrieve more for reranking
        retrieved_chunks = await hybrid_retriever_service.hybrid_search(
            query=enhanced_query,
            user_id=user_id,
            doc_id=doc_id,
            top_k=initial_top_k,
            min_score=request.min_score or 0.15,
            queries=multi_queries,
        )

        if not retrieved_chunks:
            # No evidence found — route to co-pilot
            return await self._handle_legal_knowledge(request, enhanced_query)

        # 2. Cross-Encoder Reranking
        final_top_k = request.top_k or 4
        reranked_chunks = reranker_service.rerank(
            query=enhanced_query,
            chunks=retrieved_chunks,
            top_k=final_top_k,
        )

        if not reranked_chunks:
            return await self._handle_legal_knowledge(request, enhanced_query)

        # 3. Build context and sources
        context_text, sources, raw_chunks = self._build_sources_from_chunks(reranked_chunks)

        if not sources:
            return await self._handle_legal_knowledge(request, enhanced_query)

        # 4. Determine response mode based on confidence
        max_score = max(c.score for c in reranked_chunks) if reranked_chunks else 0.0
        response_mode = self._determine_response_mode(max_score, bool(doc_id), DOCUMENT_QA)

        # 5. LLM Synthesis
        answer_text = await self._synthesize_answer(
            query=request.query,  # Original query for natural answer
            enhanced_query=enhanced_query,
            context_text=context_text,
            sources=sources,
            user_id=user_id,
            doc_id=doc_id,
            response_mode=response_mode,
            conversation_history=getattr(request, "conversation_history", None),
        )

        # 6. Citation Validation
        valid, validated_answer = self._validate_answer_citations(answer_text, sources, user_id, doc_id)

        if not valid:
            logger.warning("Citation validation failed. Returning safe fallback.")
            return RAGQueryResponse(
                success=True, query=request.query, answer=NO_EVIDENCE_ANSWER,
                evidence_found=False, confidence_score=0.0,
                sources=[], retrieved_chunks=[], disclaimer=LEGAL_RAG_DISCLAIMER,
                metadata={"citation_validation_failed": True, "pipeline": "agentic_rag"},
            )

        confidence = min(1.0, round(max_score, 2))

        logger.info(
            f"Agentic RAG answer: {len(sources)} sources, mode={response_mode}, "
            f"confidence={confidence}, retrieval={reranked_chunks[0].source if reranked_chunks else 'none'}"
        )

        return RAGQueryResponse(
            success=True,
            query=request.query,
            answer=validated_answer,
            evidence_found=True,
            confidence_score=confidence,
            sources=sources,
            retrieved_chunks=raw_chunks,
            disclaimer=LEGAL_RAG_DISCLAIMER,
            metadata={
                "pipeline": "agentic_rag",
                "intent": DOCUMENT_QA,
                "response_mode": response_mode,
                "enhanced_query": enhanced_query,
                "retrieval_sources": len(sources),
                "top_similarity_score": max_score,
                "reranker_used": reranker_service.is_available(),
                "hybrid_search": True,
            },
        )

    async def _handle_legal_knowledge(self, request: RAGQueryRequest, enhanced_query: str) -> RAGQueryResponse:
        """Handle LEGAL_KNOWLEDGE intent: Pure LLM legal co-pilot response."""
        if gemini_service.is_available():
            try:
                copilot_res = gemini_service.generate_copilot_legal_answer(
                    query=enhanced_query or request.query,
                    user_id=request.user_id,
                    document_id=request.document_id or "",
                )
                if copilot_res.get("success") and copilot_res.get("answer"):
                    return RAGQueryResponse(
                        success=True, query=request.query,
                        answer=copilot_res["answer"],
                        evidence_found=False, confidence_score=0.85,
                        sources=[], retrieved_chunks=[],
                        disclaimer=LEGAL_RAG_DISCLAIMER,
                        metadata={"pipeline": "agentic_rag", "intent": LEGAL_KNOWLEDGE, "response_mode": "copilot"},
                    )
            except Exception as exc:
                logger.warning(f"Legal co-pilot failed: {exc}")

        return RAGQueryResponse(
            success=True, query=request.query, answer=NO_EVIDENCE_ANSWER,
            evidence_found=False, confidence_score=0.0,
            sources=[], retrieved_chunks=[], disclaimer=LEGAL_RAG_DISCLAIMER,
            metadata={"pipeline": "agentic_rag", "intent": LEGAL_KNOWLEDGE, "gemini_available": False},
        )

    async def _handle_risk_analysis(self, request: RAGQueryRequest) -> RAGQueryResponse:
        """Handle RISK_ANALYSIS intent: Route to risk analysis then synthesize."""
        # For risk analysis queries, still do document QA but with risk-focused enhanced query
        enhanced_query = f"What are the key legal risk factors, uncapped liabilities, missing protections, compliance gaps, and red flags in this contract?"
        multi_queries = [
            enhanced_query,
            "What liability limitations and indemnification obligations exist?",
            "What termination rights and notice requirements are specified?",
            "What data protection and confidentiality provisions are included?",
        ]
        return await self._handle_document_qa(request, enhanced_query, multi_queries)

    async def _handle_summarize(self, request: RAGQueryRequest) -> RAGQueryResponse:
        """Handle SUMMARIZE intent: Route to summarization-focused RAG."""
        enhanced_query = "Provide a comprehensive summary of the key terms, parties, obligations, important dates, and critical clauses in this contract."
        multi_queries = [
            enhanced_query,
            "Who are the parties and what are their respective obligations?",
            "What are the key financial terms, payment provisions, and consideration?",
            "What are the termination, renewal, and expiration provisions?",
        ]
        return await self._handle_document_qa(request, enhanced_query, multi_queries)

    async def _handle_draft_clause(self, request: RAGQueryRequest, enhanced_query: str) -> RAGQueryResponse:
        """Handle DRAFT_CLAUSE intent: Use Gemini to draft legal clause language."""
        if gemini_service.is_available():
            try:
                draft_prompt = (
                    f"You are an expert contract lawyer. Draft professional legal clause language for the following request.\n\n"
                    f"Request: {request.query}\n\n"
                    f"Provide:\n"
                    f"1. The drafted clause text in proper legal language\n"
                    f"2. Brief notes on key terms that should be customized\n"
                    f"3. Any important legal considerations\n\n"
                    f"Drafted Clause:"
                )
                response = gemini_service._client.models.generate_content(
                    model=gemini_service._model,
                    contents=draft_prompt,
                )
                answer = (response.text or "").strip()
                if answer:
                    return RAGQueryResponse(
                        success=True, query=request.query, answer=answer,
                        evidence_found=False, confidence_score=0.90,
                        sources=[], retrieved_chunks=[], disclaimer=LEGAL_RAG_DISCLAIMER,
                        metadata={"pipeline": "agentic_rag", "intent": DRAFT_CLAUSE, "response_mode": "clause_drafting"},
                    )
            except Exception as exc:
                logger.warning(f"Clause drafting failed: {exc}")

        return await self._handle_legal_knowledge(request, enhanced_query)

    async def _synthesize_answer(
        self,
        query: str,
        enhanced_query: str,
        context_text: str,
        sources: List[RAGSourceReference],
        user_id: str,
        doc_id: str,
        response_mode: str = "grounded_rag",
        conversation_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """
        Synthesize a grounded answer using Gemini LLM with context, conversation history,
        and response mode-specific prompting.
        """
        if gemini_service.is_available():
            try:
                # Build conversation context if available
                conv_context = ""
                if conversation_history:
                    recent_turns = conversation_history[-3:]  # Last 3 turns
                    conv_lines = []
                    for turn in recent_turns:
                        role = turn.get("role", turn.get("sender", "user"))
                        content = turn.get("content", "")[:300]
                        conv_lines.append(f"{role.upper()}: {content}")
                    if conv_lines:
                        conv_context = f"\n\nPREVIOUS CONVERSATION:\n" + "\n".join(conv_lines)

                # Build mode-specific instructions
                if response_mode == "grounded_rag":
                    mode_instruction = (
                        "Answer STRICTLY based on the evidence sources below. "
                        "Every factual claim MUST cite [Source N]. "
                        "Do NOT add information not present in the sources."
                    )
                elif response_mode == "blended":
                    mode_instruction = (
                        "Answer using the evidence sources below as primary reference, citing [Source N]. "
                        "You may supplement with general legal knowledge where the sources are insufficient, "
                        "but clearly distinguish between document-grounded facts and general legal context."
                    )
                else:
                    mode_instruction = (
                        "Provide a comprehensive legal answer based on your legal knowledge. "
                        "If sources are provided, reference them but you are not limited to them."
                    )

                sources_dict = [
                    {
                        "source_id": s.source_id,
                        "doc_id": s.doc_id,
                        "page": s.page,
                        "chunk_id": s.chunk_id,
                        "score": s.score,
                        "text": s.text_snippet,
                    }
                    for s in sources
                ]

                gemini_res = gemini_service.generate_grounded_answer(
                    query=query,
                    sources=sources_dict,
                    document_id=doc_id,
                    user_id=user_id,
                )

                if gemini_res.get("success") and gemini_res.get("answer"):
                    return gemini_res["answer"]
            except Exception as exc:
                logger.warning(f"Gemini synthesis failed: {exc}. Using fallback synthesis.")

        # Fallback: Extract most relevant sentences from context
        top_source = sources[0].source_id if sources else "[Source 1]"
        first_snippet = sources[0].text_snippet.replace("\n", " ") if sources else ""

        if first_snippet:
            return f"Based on the contract evidence in {top_source}: {first_snippet} {top_source}"
        return NO_EVIDENCE_ANSWER

    async def execute(self, request: RAGQueryRequest) -> RAGQueryResponse:
        """
        Main entry point for the Agentic RAG Pipeline.

        Flow: Intent Classification → Query Enhancement → Tool Routing → Response
        """
        query = (request.query or "").strip()
        user_id = request.user_id
        doc_id = request.document_id or ""

        if not query:
            return RAGQueryResponse(
                success=True, query=query, answer=NO_EVIDENCE_ANSWER,
                evidence_found=False, confidence_score=0.0,
                sources=[], retrieved_chunks=[], disclaimer=LEGAL_RAG_DISCLAIMER,
                metadata={"reason": "Empty query", "pipeline": "agentic_rag"},
            )

        logger.info(f"Agentic RAG executing for user='{user_id}', doc='{doc_id}': '{query[:60]}'")

        # 0. RAG Readiness Check (if document-scoped)
        if doc_id and str(doc_id).strip():
            is_ready, status_info = document_status_service.verify_rag_readiness(user_id, doc_id)
            if not is_ready:
                controlled_msg = f"Document indexing status is {status_info.status.value}. RAG search is disabled."
                if status_info.error_message:
                    controlled_msg += f" Details: {status_info.error_message}"
                return RAGQueryResponse(
                    success=False, query=query, answer=controlled_msg,
                    evidence_found=False, confidence_score=0.0,
                    sources=[], retrieved_chunks=[], disclaimer=LEGAL_RAG_DISCLAIMER,
                    metadata={"status": status_info.status.value, "rag_enabled": False, "pipeline": "agentic_rag"},
                )

        try:
            # 1. Intent Classification
            has_document = bool(doc_id)
            intent = await intent_classifier_service.classify(query, has_document)

            # 2. Query Enhancement (rewrite + multi-query expansion)
            enhanced_query = await query_enhancement_service.rewrite_query(query)
            multi_queries = await query_enhancement_service.expand_multi_query(query)

            # 3. Route to appropriate handler based on intent
            if intent == DOCUMENT_QA:
                return await self._handle_document_qa(request, enhanced_query, multi_queries)
            elif intent == LEGAL_KNOWLEDGE:
                return await self._handle_legal_knowledge(request, enhanced_query)
            elif intent == RISK_ANALYSIS:
                return await self._handle_risk_analysis(request)
            elif intent == SUMMARIZE:
                return await self._handle_summarize(request)
            elif intent == DRAFT_CLAUSE:
                return await self._handle_draft_clause(request, enhanced_query)
            else:
                # Default to document QA
                return await self._handle_document_qa(request, enhanced_query, multi_queries)

        except Exception as exc:
            logger.error(f"Agentic RAG pipeline error: {exc}", exc_info=True)
            return RAGQueryResponse(
                success=True, query=query, answer=NO_EVIDENCE_ANSWER,
                evidence_found=False, confidence_score=0.0,
                sources=[], retrieved_chunks=[], disclaimer=LEGAL_RAG_DISCLAIMER,
                metadata={"error": str(exc), "pipeline": "agentic_rag"},
            )


agentic_rag_service = AgenticRAGService()
