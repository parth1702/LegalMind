"""
Advanced Query Enhancement Service for LegalMind RAG Pipeline.
Implements:
1. LLM-powered Query Rewriting — transforms vague queries into precise legal retrieval queries
2. HyDE (Hypothetical Document Embedding) — generates a hypothetical answer for better retrieval
3. Multi-Query Expansion — generates 3-5 query variants covering different legal angles

Uses Gemini LLM when available, falls back to rule-based expansion.
"""
from __future__ import annotations

import re
from typing import List, Optional
from app.core.logging import get_logger
from app.services.gemini_service import gemini_service

logger = get_logger("LegalMind.QueryEnhancementService")

# Legal domain synonyms for rule-based expansion fallback
LEGAL_SYNONYMS = {
    "liability": ["limitation of liability", "liability cap", "consequential damages", "aggregate liability"],
    "termination": ["termination for convenience", "termination for cause", "cancellation", "notice period"],
    "indemnify": ["indemnification", "hold harmless", "defend and indemnify", "indemnity obligations"],
    "confidential": ["confidentiality", "non-disclosure", "proprietary information", "trade secret"],
    "payment": ["payment terms", "invoice", "fee schedule", "billing", "compensation"],
    "ip": ["intellectual property", "patent", "copyright", "trademark", "work for hire", "license grant"],
    "non-compete": ["non-compete", "non-solicitation", "restrictive covenant", "competing business"],
    "governing law": ["governing law", "jurisdiction", "choice of law", "venue", "applicable law"],
    "data": ["data protection", "personal data", "DPDP", "GDPR", "privacy", "data processing"],
    "dispute": ["dispute resolution", "arbitration", "mediation", "litigation", "court"],
    "force majeure": ["force majeure", "act of god", "unforeseen circumstances", "impossibility"],
    "warranty": ["warranty", "representation", "guarantee", "assurance", "covenant"],
}

QUERY_REWRITE_PROMPT = """You are a legal document retrieval query optimizer. Your task is to rewrite the user's vague or informal query into a precise, comprehensive legal retrieval query.

Rules:
1. Expand abbreviations and legal shorthand
2. Add relevant legal terminology the user likely means
3. Keep the query focused on what the user is actually asking
4. Do NOT add information the user didn't ask about
5. Output ONLY the rewritten query text, nothing else

Examples:
- Input: "what about liability?" → Output: "What are the limitation of liability provisions, liability caps, consequential damages exclusions, and aggregate liability amounts in this contract?"
- Input: "termination clause" → Output: "What are the termination provisions including termination for convenience, termination for cause with cure periods, notice requirements, and post-termination obligations?"
- Input: "any risks?" → Output: "What are the key legal risk factors including uncapped liability, unilateral termination rights, broad indemnification obligations, missing limitation clauses, and data protection compliance gaps?"

User Query: {query}

Rewritten Query:"""

HYDE_PROMPT = """You are a legal contract analyst. Given the question below about a legal document, write a short paragraph (3-5 sentences) that would be the ideal answer found in a typical commercial contract. Write as if you are quoting from a real contract clause.

Question: {query}

Ideal Contract Clause Answer:"""

MULTI_QUERY_PROMPT = """You are a legal retrieval assistant. Given the user's question about a legal document, generate exactly 3 alternative search queries that approach the same topic from different angles.

Rules:
1. Each query should target different relevant clauses or sections
2. Use precise legal terminology
3. Output ONLY the 3 queries, one per line, numbered 1-3
4. Do NOT include any explanation

User Question: {query}

Alternative Queries:"""


class QueryEnhancementService:
    """
    Advanced query enhancement layer for legal RAG retrieval.
    Transforms raw user queries into optimized retrieval queries using LLM rewriting,
    hypothetical document embedding (HyDE), and multi-query expansion.
    """

    def __init__(self) -> None:
        logger.info("Query Enhancement Service initialized.")

    async def rewrite_query(self, original_query: str, doc_context: str = "") -> str:
        """
        Rewrite a vague user query into a precise legal retrieval query using Gemini LLM.
        Falls back to rule-based expansion if LLM is unavailable.
        """
        query = (original_query or "").strip()
        if not query:
            return query

        # Skip rewriting for already-detailed queries (>15 words)
        if len(query.split()) > 15:
            logger.info(f"Query already detailed ({len(query.split())} words), skipping rewrite.")
            return query

        if gemini_service._client:
            for m in [gemini_service._model, "gemini-2.5-flash", "gemini-1.5-flash"]:
                try:
                    prompt = QUERY_REWRITE_PROMPT.format(query=query)
                    response = gemini_service._client.models.generate_content(
                        model=m,
                        contents=prompt,
                    )
                    rewritten = (response.text or "").strip()
                    if rewritten and len(rewritten) > len(query):
                        logger.info(f"Query rewritten (Gemini '{m}'): '{query[:50]}' → '{rewritten[:80]}'")
                        return rewritten
                except Exception as exc:
                    logger.warning(f"Gemini query rewrite failed ({m}): {exc}")

        from app.services.groq_service import groq_service
        if groq_service.is_available():
            try:
                prompt = QUERY_REWRITE_PROMPT.format(query=query)
                groq_res = groq_service.generate_chat_completion(
                    messages=[{"role": "user", "content": prompt}]
                )
                if groq_res.get("success") and groq_res.get("answer"):
                    rewritten = groq_res["answer"].strip()
                    if rewritten and len(rewritten) > len(query):
                        logger.info(f"Query rewritten (Groq): '{query[:50]}' → '{rewritten[:80]}'")
                        return rewritten
            except Exception as exc:
                logger.warning(f"Groq query rewrite failed: {exc}")

        # Rule-based fallback expansion
        return self._rule_based_expand(query)

    async def generate_hyde_document(self, query: str) -> str:
        """
        HyDE (Hypothetical Document Embedding): Generate a hypothetical ideal answer passage.
        Returns the hypothetical passage text (to be embedded by the caller).
        """
        query = (query or "").strip()
        if not query:
            return query

        prompt = HYDE_PROMPT.format(query=query)

        if gemini_service._client:
            for m in [gemini_service._model, "gemini-2.5-flash", "gemini-1.5-flash"]:
                try:
                    response = gemini_service._client.models.generate_content(
                        model=m,
                        contents=prompt,
                    )
                    hyde_text = (response.text or "").strip()
                    if hyde_text and len(hyde_text) > 20:
                        logger.info(f"HyDE document generated (Gemini '{m}', {len(hyde_text)} chars) for: '{query[:50]}'")
                        return hyde_text
                except Exception as exc:
                    logger.warning(f"Gemini HyDE generation failed ({m}): {exc}")

        from app.services.groq_service import groq_service
        if groq_service.is_available():
            try:
                groq_res = groq_service.generate_chat_completion(
                    messages=[{"role": "user", "content": prompt}]
                )
                if groq_res.get("success") and groq_res.get("answer"):
                    hyde_text = groq_res["answer"].strip()
                    if hyde_text and len(hyde_text) > 20:
                        logger.info(f"HyDE document generated (Groq, {len(hyde_text)} chars) for: '{query[:50]}'")
                        return hyde_text
            except Exception as exc:
                logger.warning(f"Groq HyDE generation failed: {exc}")

        return query

    async def expand_multi_query(self, query: str) -> List[str]:
        """
        Generate 3-5 query variants covering different angles of the same legal question.
        All variants are used for parallel retrieval; results are merged and deduplicated.
        """
        query = (query or "").strip()
        if not query:
            return [query]

        queries = [query]  # Always include original
        prompt = MULTI_QUERY_PROMPT.format(query=query)

        if gemini_service._client:
            for m in [gemini_service._model, "gemini-2.5-flash", "gemini-1.5-flash"]:
                try:
                    response = gemini_service._client.models.generate_content(
                        model=m,
                        contents=prompt,
                    )
                    raw_text = (response.text or "").strip()
                    for line in raw_text.split("\n"):
                        cleaned = re.sub(r"^\d+[\.\)]\s*", "", line.strip())
                        if cleaned and len(cleaned) > 10 and cleaned not in queries:
                            queries.append(cleaned)
                    if len(queries) > 1:
                        logger.info(f"Multi-query expansion (Gemini '{m}'): {len(queries)} variants generated for '{query[:50]}'")
                        return queries[:5]
                except Exception as exc:
                    logger.warning(f"Gemini multi-query expansion failed ({m}): {exc}")

        from app.services.groq_service import groq_service
        if groq_service.is_available():
            try:
                groq_res = groq_service.generate_chat_completion(
                    messages=[{"role": "user", "content": prompt}]
                )
                if groq_res.get("success") and groq_res.get("answer"):
                    raw_text = groq_res["answer"].strip()
                    for line in raw_text.split("\n"):
                        cleaned = re.sub(r"^\d+[\.\)]\s*", "", line.strip())
                        if cleaned and len(cleaned) > 10 and cleaned not in queries:
                            queries.append(cleaned)
                    if len(queries) > 1:
                        logger.info(f"Multi-query expansion (Groq): {len(queries)} variants generated for '{query[:50]}'")
                        return queries[:5]
            except Exception as exc:
                logger.warning(f"Groq multi-query expansion failed: {exc}")

        # Rule-based fallback: add synonym-expanded variant
        expanded = self._rule_based_expand(query)
        if expanded != query:
            queries.append(expanded)

        return queries

    def _rule_based_expand(self, query: str) -> str:
        """
        Rule-based query expansion using legal domain synonym mapping.
        Expands recognized legal terms into their common variants.
        """
        q_lower = query.lower()
        expansions = []

        for term, synonyms in LEGAL_SYNONYMS.items():
            if term in q_lower:
                # Add 2-3 most relevant synonyms
                for syn in synonyms[:3]:
                    if syn.lower() not in q_lower:
                        expansions.append(syn)

        if expansions:
            expanded = f"{query} (including {', '.join(expansions[:4])})"
            logger.info(f"Rule-based query expansion: '{query[:40]}' → added {len(expansions)} terms")
            return expanded

        return query


query_enhancement_service = QueryEnhancementService()
