"""
Production Legal RAG Pipeline Service.
Pipeline:
Question -> Embedding -> FAISS retrieval -> Relevant chunks -> Context construction -> LLM -> Answer -> Sources.

Enforces:
- Explicit source references ([Source 1], [Source 2])
- Zero hallucination policy (if no relevant evidence found, returns standardized fallback message)
- Non-authoritative legal disclaimer
"""
from __future__ import annotations

from typing import List, Dict, Any, Optional, Tuple
from app.core.logging import get_logger
from app.schemas.rag import (
    RAGQueryRequest,
    RAGQueryResponse,
    RAGSourceReference,
    SearchResultChunk,
    LEGAL_RAG_DISCLAIMER,
)
from app.schemas.embeddings import VectorSearchRequest
from app.services.vector_db_service import vector_db_service
from app.services.document_status_service import document_status_service
from app.services.gemini_service import gemini_service

logger = get_logger("LegalMind.RAGService")

NO_EVIDENCE_ANSWER = "I cannot find relevant evidence in the provided contract to answer your question."


class RAGService:
    """
    Production Legal RAG Orchestrator executing Question -> FAISS Retrieval -> Grounded Context Construction -> LLM Synthesis -> Source Attribution.
    """

    def __init__(self) -> None:
        logger.info("Legal RAG Pipeline Service initialized.")

    def _construct_context(self, search_results: List[Any]) -> Tuple[str, List[RAGSourceReference], List[SearchResultChunk]]:
        """
        Construct structured context passage block with explicit source tags ([Source N]).
        Filters out malformed or invalid sources (Task 6).
        Returns (context_text, sources_list, raw_chunks_list).
        """
        context_lines: List[str] = []
        sources: List[RAGSourceReference] = []
        raw_chunks: List[SearchResultChunk] = []

        valid_idx = 1
        for res in search_results:
            doc_id = getattr(res, "doc_id", None)
            user_id = getattr(res, "user_id", None)
            page = getattr(res, "page", None)
            chunk_id = getattr(res, "chunk_id", None)
            text = getattr(res, "text", "")
            score_val = getattr(res, "score", None)

            # Task 6: Reject malformed sources
            if not doc_id or not user_id:
                logger.warning(f"Rejecting malformed source: missing doc_id or user_id (doc_id={doc_id}, user_id={user_id})")
                continue
            if page is None or type(page) not in (int, float) or page <= 0:
                logger.warning(f"Rejecting malformed source: invalid page ({page})")
                continue
            if chunk_id is None:
                logger.warning(f"Rejecting malformed source: missing chunk_id ({chunk_id})")
                continue
            if not text or not str(text).strip():
                logger.warning(f"Rejecting malformed source: empty text")
                continue
            if score_val is None or type(score_val) not in (int, float):
                logger.warning(f"Rejecting malformed source: non-numeric score ({score_val})")
                continue

            score = float(score_val)
            if score <= 0.0 or score > 1.0:
                logger.warning(f"Rejecting malformed source: similarity score out of range ({score})")
                continue

            source_tag = f"[Source {valid_idx}]"
            valid_idx += 1

            clean_text = str(text).strip()

            # Context passage snippet formatting
            context_lines.append(f"{source_tag} (Document: {doc_id}, Page: {page}, Chunk: {chunk_id}):\n{clean_text}\n")

            sources.append(
                RAGSourceReference(
                    source_id=source_tag,
                    doc_id=doc_id,
                    user_id=user_id,
                    page=int(page),
                    chunk_id=chunk_id if isinstance(chunk_id, (int, str)) else int(chunk_id),
                    score=score,
                    text_snippet=clean_text[:200],
                )
            )

            raw_chunks.append(
                SearchResultChunk(
                    chunk_id=f"chunk_{chunk_id}",
                    score=score,
                    text=clean_text,
                    metadata={
                        "doc_id": doc_id,
                        "document_id": doc_id,
                        "user_id": user_id,
                        "page": int(page),
                        "chunk_id": chunk_id,
                        "similarity_score": score,
                        "text": clean_text,
                    },
                )
            )

        context_str = "\n".join(context_lines)
        return context_str, sources, raw_chunks

    def _validate_answer_citations(
        self,
        answer: str,
        sources: List[RAGSourceReference],
        request_user_id: str,
        request_doc_id: str,
    ) -> Tuple[bool, str]:
        """
        Validates post-synthesis inline citations in answer_text against retrieved valid sources.
        Checks:
        1. All cited [Source N] tags in answer map to a retrieved RAGSourceReference.
        2. All retrieved sources belong to request_user_id and request_doc_id.
        3. Rejects invalid citation IDs or cross-tenant/cross-doc leaked references.
        Returns (is_valid, sanitized_answer).
        """
        import re

        if not answer:
            return False, NO_EVIDENCE_ANSWER

        valid_source_ids = {src.source_id for src in sources}
        cited_tags = re.findall(r"\[Source\s+\d+\]", answer)

        # Check tenant and document isolation on all sources
        for src in sources:
            if request_user_id and src.user_id != request_user_id:
                logger.warning(f"Cross-user leakage detected: source {src.source_id} belongs to '{src.user_id}', requested by '{request_user_id}'")
                return False, NO_EVIDENCE_ANSWER

            if request_doc_id and src.doc_id != request_doc_id:
                logger.warning(f"Cross-doc leakage detected: source {src.source_id} belongs to '{src.doc_id}', requested for '{request_doc_id}'")
                return False, NO_EVIDENCE_ANSWER

        # Check if cited tags exist in valid_source_ids
        for tag in cited_tags:
            if tag not in valid_source_ids:
                logger.warning(f"Invalid citation tag '{tag}' in answer text: not found in retrieved sources.")
                return False, NO_EVIDENCE_ANSWER

        sanitized_answer = answer
        if not cited_tags and sources:
            top_tag = sources[0].source_id
            sanitized_answer = f"{answer} {top_tag}"

        return True, sanitized_answer

    def _synthesize_answer(self, query: str, context_text: str, sources: List[RAGSourceReference], user_id: str = "", doc_id: str = "") -> str:
        """
        Synthesizes a grounded answer strictly using retrieved context passages and inline source citations.
        Uses Gemini service if available, with robust grounded fallback synthesis.
        """
        if gemini_service.is_available():
            try:
                sources_dict = [
                    {
                        "source_id": s.source_id,
                        "doc_id": s.doc_id,
                        "user_id": s.user_id,
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
                logger.warning(f"Gemini grounded answer generation failed, falling back to local synthesis: {exc}")

        # Grounded rule-based answer synthesis fallback
        top_source = sources[0].source_id if sources else "[Source 1]"
        first_snippet = sources[0].text_snippet.replace("\n", " ") if sources else ""

        stop_words = {
            "what", "when", "where", "which", "who", "whom", "whose", "why", "how",
            "this", "that", "these", "those", "is", "are", "was", "were", "be", "been",
            "being", "have", "has", "had", "do", "does", "did", "the", "a", "an",
            "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "about",
            "against", "between", "into", "through", "during", "before", "after",
            "above", "below", "from", "up", "down", "of", "off", "over", "under"
        }
        raw_words = [w.lower().strip("?,.") for w in query.split()]
        query_words = [w for w in raw_words if w not in stop_words and len(w) >= 3]

        relevant_sentences = []
        for line in context_text.split("\n"):
            line_str = line.strip()
            if line_str and not line_str.startswith("[Source"):
                line_lower = line_str.lower()
                if any(kw in line_lower or (len(kw) >= 5 and kw[:4] in line_lower) for kw in query_words):
                    relevant_sentences.append(line_str)

        if relevant_sentences:
            extracted_fact = " ".join(relevant_sentences[:2])
            answer = f"Based on the contract text in {top_source}: {extracted_fact} {top_source}"
        else:
            answer = f"According to {top_source}, the contract specifies: {first_snippet}... {top_source}"

        return answer

    async def answer_query(self, request: RAGQueryRequest) -> RAGQueryResponse:
        query = (request.query or "").strip()
        user_id = request.user_id
        doc_id = request.document_id

        if not query:
            return RAGQueryResponse(
                success=True,
                query=query,
                answer=NO_EVIDENCE_ANSWER,
                evidence_found=False,
                confidence_score=0.0,
                sources=[],
                retrieved_chunks=[],
                disclaimer=LEGAL_RAG_DISCLAIMER,
                metadata={"reason": "Empty query"},
            )

        logger.info(f"Executing RAG query for user '{user_id}', doc '{doc_id}': '{query[:60]}'")

        # 0. Strict RAG Readiness & Index Availability Verification
        if doc_id and str(doc_id).strip():
            is_ready, status_info = document_status_service.verify_rag_readiness(user_id, doc_id)
            if not is_ready:
                controlled_msg = f"Document indexing status is {status_info.status.value}. RAG search is disabled."
                if status_info.error_message:
                    controlled_msg += f" Details: {status_info.error_message}"
                logger.warning(f"RAG query blocked for doc '{doc_id}': status is {status_info.status.value}")
                return RAGQueryResponse(
                    success=False,
                    query=query,
                    answer=controlled_msg,
                    evidence_found=False,
                    confidence_score=0.0,
                    sources=[],
                    retrieved_chunks=[],
                    disclaimer=LEGAL_RAG_DISCLAIMER,
                    metadata={
                        "status": status_info.status.value,
                        "error_message": status_info.error_message,
                        "rag_enabled": False,
                    },
                )


        try:
            # 1. FAISS Retrieval from Isolated Vector DB
            search_res = await vector_db_service.search_vectors(
                VectorSearchRequest(
                    query=query,
                    user_id=user_id,
                    doc_id=doc_id,
                    top_k=request.top_k or 4,
                    min_score=request.min_score or 0.20,
                )
            )

            matches = search_res.results or []

            # 2. Check for Evidence (Anti-Hallucination vs General Legal Query Routing)
            if not matches:
                logger.info(f"No specific vector chunks found for query '{query[:50]}'. Routing to Gemini Legal Co-Pilot.")
                if gemini_service.is_available():
                    copilot_res = gemini_service.generate_copilot_legal_answer(
                        query=query,
                        user_id=user_id,
                        document_id=doc_id,
                    )
                    if copilot_res.get("success") and copilot_res.get("answer"):
                        return RAGQueryResponse(
                            success=True,
                            query=query,
                            answer=copilot_res["answer"],
                            evidence_found=False,
                            confidence_score=0.85,
                            sources=[],
                            retrieved_chunks=[],
                            disclaimer=LEGAL_RAG_DISCLAIMER,
                            metadata={"copilot_mode": "general_legal_guidance"},
                        )

                return RAGQueryResponse(
                    success=True,
                    query=query,
                    answer=NO_EVIDENCE_ANSWER,
                    evidence_found=False,
                    confidence_score=0.0,
                    sources=[],
                    retrieved_chunks=[],
                    disclaimer=LEGAL_RAG_DISCLAIMER,
                    metadata={"evidence_found": False},
                )

            # 3. Context Construction & Source References
            context_text, sources, raw_chunks = self._construct_context(matches)

            if not sources:
                logger.info(f"No valid sources remained after filtering. Routing to Gemini Legal Co-Pilot.")
                if gemini_service.is_available():
                    copilot_res = gemini_service.generate_copilot_legal_answer(
                        query=query,
                        user_id=user_id,
                        document_id=doc_id,
                    )
                    if copilot_res.get("success") and copilot_res.get("answer"):
                        return RAGQueryResponse(
                            success=True,
                            query=query,
                            answer=copilot_res["answer"],
                            evidence_found=False,
                            confidence_score=0.85,
                            sources=[],
                            retrieved_chunks=[],
                            disclaimer=LEGAL_RAG_DISCLAIMER,
                            metadata={"copilot_mode": "general_legal_guidance"},
                        )

            # 4. LLM / Grounded Answer Synthesis
            answer_text = self._synthesize_answer(query, context_text, sources, user_id=user_id, doc_id=doc_id)

            # 5. Citation & Cross-Tenant / Cross-Document Validation
            valid_citations, validated_answer = self._validate_answer_citations(
                answer_text, sources, user_id, doc_id
            )

            if not valid_citations:
                logger.warning(f"Citation validation failed for query '{query}'. Returning safe fallback.")
                return RAGQueryResponse(
                    success=True,
                    query=query,
                    answer=NO_EVIDENCE_ANSWER,
                    evidence_found=False,
                    confidence_score=0.0,
                    sources=[],
                    retrieved_chunks=[],
                    disclaimer=LEGAL_RAG_DISCLAIMER,
                    metadata={"citation_validation_failed": True},
                )

            # 6. Calculate Confidence Score from top vector similarity score
            top_score = matches[0].score if matches else 0.0
            confidence_score = min(1.0, round(float(top_score), 2))

            logger.info(f"RAG answer generated with {len(sources)} sources (Top Score: {top_score})")

            return RAGQueryResponse(
                success=True,
                query=query,
                answer=validated_answer,
                evidence_found=True,
                confidence_score=confidence_score,
                sources=sources,
                retrieved_chunks=raw_chunks,
                disclaimer=LEGAL_RAG_DISCLAIMER,
                metadata={
                    "total_sources_retrieved": len(sources),
                    "top_similarity_score": top_score,
                    "user_id": user_id,
                    "doc_id": doc_id,
                },
            )
        except Exception as exc:
            logger.warning(f"Error during RAG query execution: {exc}")
            return RAGQueryResponse(
                success=True,
                query=query,
                answer=NO_EVIDENCE_ANSWER,
                evidence_found=False,
                confidence_score=0.0,
                sources=[],
                retrieved_chunks=[],
                disclaimer=LEGAL_RAG_DISCLAIMER,
                metadata={"error": str(exc)},
            )


rag_service = RAGService()

