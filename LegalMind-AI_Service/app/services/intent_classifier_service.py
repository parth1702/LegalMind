"""
Intent Classifier Service for LegalMind Agentic RAG Pipeline.

Classifies user query intent to route to the correct RAG tool/handler.
Uses Gemini LLM when available, falls back to keyword-based classification.

Intents:
- DOCUMENT_QA:       Questions about specific uploaded document content
- LEGAL_KNOWLEDGE:   General legal questions (statutory, case law, concepts)
- RISK_ANALYSIS:     Request for risk assessment of a document
- SUMMARIZE:         Request to summarize a document
- DRAFT_CLAUSE:      Request to draft or suggest contract clause language
"""
from __future__ import annotations

import re
from typing import Optional
from app.core.logging import get_logger
from app.services.gemini_service import gemini_service

logger = get_logger("LegalMind.IntentClassifierService")

# Intent labels
DOCUMENT_QA = "DOCUMENT_QA"
LEGAL_KNOWLEDGE = "LEGAL_KNOWLEDGE"
RISK_ANALYSIS = "RISK_ANALYSIS"
SUMMARIZE = "SUMMARIZE"
DRAFT_CLAUSE = "DRAFT_CLAUSE"

INTENT_CLASSIFICATION_PROMPT = """You are an intent classifier for a legal AI assistant. Classify the user's query into exactly ONE of these categories:

1. DOCUMENT_QA — The user is asking about specific content, clauses, terms, or provisions in their uploaded legal document
2. LEGAL_KNOWLEDGE — The user is asking a general legal question about law, statutes, regulations, or legal concepts (not about a specific uploaded document)
3. RISK_ANALYSIS — The user is requesting risk assessment, risk factors, red flags, or compliance issues in their document
4. SUMMARIZE — The user wants a summary, overview, or key points of their document
5. DRAFT_CLAUSE — The user wants to draft, write, or suggest clause language for a contract

Rules:
- Output ONLY the category label (e.g., "DOCUMENT_QA"), nothing else
- If the query mentions "this contract", "this document", "the agreement", or refers to uploaded content, it's likely DOCUMENT_QA
- If the query is about general law without referencing a specific document, it's LEGAL_KNOWLEDGE

User Query: {query}
Has Uploaded Document: {has_document}

Intent:"""

# Keyword patterns for rule-based fallback
_RISK_KEYWORDS = [
    "risk", "risky", "red flag", "danger", "exposure", "vulnerability", "compliance",
    "audit", "what are the risks", "risk score", "risk analysis", "risk assessment"
]
_SUMMARY_KEYWORDS = [
    "summarize", "summary", "overview", "key points", "main points", "brief",
    "outline", "tldr", "tl;dr", "what is this about", "high level"
]
_DRAFT_KEYWORDS = [
    "draft", "write a clause", "suggest clause", "generate clause", "create clause",
    "sample language", "boilerplate", "template", "clause for", "write a"
]
_LEGAL_KNOWLEDGE_KEYWORDS = [
    "what is", "define", "explain", "under the law", "according to law",
    "indian contract act", "companies act", "dpdp act", "gdpr", "what does the law say",
    "legal definition", "statute", "section", "legal principle", "case law",
    "what are the rights", "legal requirements"
]


class IntentClassifierService:
    """
    Classifies user query intent to enable intelligent routing in the Agentic RAG pipeline.
    """

    def __init__(self) -> None:
        logger.info("Intent Classifier Service initialized.")

    async def classify(self, query: str, has_document: bool = False) -> str:
        """
        Classify query intent using LLM or rule-based fallback.

        Returns one of: DOCUMENT_QA, LEGAL_KNOWLEDGE, RISK_ANALYSIS, SUMMARIZE, DRAFT_CLAUSE
        """
        query = (query or "").strip()
        if not query:
            return DOCUMENT_QA

        # Try Gemini or Groq LLM classification
        prompt = INTENT_CLASSIFICATION_PROMPT.format(
            query=query,
            has_document="Yes" if has_document else "No"
        )

        if gemini_service._client:
            for m in [gemini_service._model, "gemini-2.5-flash", "gemini-1.5-flash"]:
                try:
                    response = gemini_service._client.models.generate_content(
                        model=m,
                        contents=prompt,
                    )
                    intent_raw = (response.text or "").strip().upper()
                    for valid_intent in [DOCUMENT_QA, LEGAL_KNOWLEDGE, RISK_ANALYSIS, SUMMARIZE, DRAFT_CLAUSE]:
                        if valid_intent in intent_raw:
                            logger.info(f"Intent classified (Gemini '{m}'): '{query[:50]}' → {valid_intent}")
                            return valid_intent
                except Exception as exc:
                    logger.warning(f"Gemini intent classification failed ({m}): {exc}")

        from app.services.groq_service import groq_service
        if groq_service.is_available():
            try:
                groq_res = groq_service.generate_chat_completion(
                    messages=[{"role": "user", "content": prompt}]
                )
                if groq_res.get("success") and groq_res.get("answer"):
                    intent_raw = groq_res["answer"].strip().upper()
                    for valid_intent in [DOCUMENT_QA, LEGAL_KNOWLEDGE, RISK_ANALYSIS, SUMMARIZE, DRAFT_CLAUSE]:
                        if valid_intent in intent_raw:
                            logger.info(f"Intent classified (Groq): '{query[:50]}' → {valid_intent}")
                            return valid_intent
            except Exception as exc:
                logger.warning(f"Groq intent classification failed: {exc}")

        # Rule-based fallback
        return self._rule_based_classify(query, has_document)

    def _rule_based_classify(self, query: str, has_document: bool) -> str:
        """Rule-based intent classification using keyword patterns."""
        q_lower = query.lower()

        # Check risk analysis keywords
        if any(kw in q_lower for kw in _RISK_KEYWORDS):
            intent = RISK_ANALYSIS
        # Check summarization keywords
        elif any(kw in q_lower for kw in _SUMMARY_KEYWORDS):
            intent = SUMMARIZE
        # Check drafting keywords
        elif any(kw in q_lower for kw in _DRAFT_KEYWORDS):
            intent = DRAFT_CLAUSE
        # Check general legal knowledge keywords (only if no document context)
        elif not has_document and any(kw in q_lower for kw in _LEGAL_KNOWLEDGE_KEYWORDS):
            intent = LEGAL_KNOWLEDGE
        # Default to document QA if a document is uploaded, else legal knowledge
        else:
            intent = DOCUMENT_QA if has_document else LEGAL_KNOWLEDGE

        logger.info(f"Intent classified (rule-based): '{query[:50]}' → {intent}")
        return intent


intent_classifier_service = IntentClassifierService()
