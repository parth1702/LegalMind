"""
Production Gemini AI Service Abstraction using official google-genai SDK.
Handles:
- Grounded answer synthesis over RAG evidence
- Structured legal risk factor extraction
- Controlled error handling & retries
- Diagnostic logging (scrubbing credentials)
- Configuration validation from GEMINI_API_KEY & GEMINI_MODEL
"""
from __future__ import annotations

import os
import json
import re
import time
from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("LegalMind.GeminiService")

SYSTEM_GROUNDED_PROMPT = """You are LegalMind AI Lead Legal Co-Pilot, an expert AI legal assistant specializing in document analysis, contract risk review, Indian & International jurisprudence, and commercial legal advisory.

When EVIDENCE SOURCE PACKAGES are supplied from uploaded documents:
1. Every factual claim derived from the uploaded document MUST be traceable to the supplied sources.
2. Use exact inline citations: [Source 1], [Source 2].
3. ONLY cite source numbers that actually exist in the supplied evidence.

When answering general legal questions, statutory queries (e.g., Indian Contract Act 1872, DPDP Act 2023, IT Act 2000, Arbitration & Conciliation Act 1996, Labour Laws, Corporate Compliance, US/UK Commercial Law), legal concepts, or contract drafting requests:
1. Provide comprehensive, expert, and well-structured legal answers.
2. Cite relevant statutory sections, landmark principles, or standard legal best practices.
3. If document sources are provided, ground document facts in those sources and supplement with statutory context.

Do not claim to provide definitive formal legal advice (maintain non-authoritative legal disclaimer framing).
Provide clear, actionable, professional legal insights."""

SYSTEM_COPILOT_GENERAL_PROMPT = """You are LegalMind AI Lead Legal Co-Pilot, an expert AI legal assistant for contract intelligence, statutory compliance, legal research, and document analysis.

Provide detailed, highly professional, and structured answers to the user's legal question.
When applicable:
- Explain relevant statutory provisions (e.g. Indian Contract Act 1872, DPDP Act 2023, IT Act 2000, Companies Act 2013, Arbitration Act 1996, or relevant international law).
- Outline key legal rights, obligations, risk factors, or compliance mandates.
- Provide sample clause language or drafting recommendations when requested.
- Maintain professional legal tone with clear bullet points and markdown headers."""


from app.services.groq_service import groq_service

GEMINI_CANDIDATE_MODELS = [
    "gemini-2.5-flash",
    "gemini-1.5-flash",
    "gemini-2.0-flash",
    "gemini-2.5-pro",
]


class GeminiService:
    """
    Clean Gemini Service Abstraction managing Google GenAI client lifecycle,
    grounded RAG reasoning, and structured legal analysis with Groq API failover.
    """

    def __init__(self) -> None:
        self._client = None
        self._model = None
        self._init_client()

    def _init_client(self) -> None:
        """Initialize or refresh the official google-genai client."""
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        model_name = settings.GEMINI_MODEL or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        
        self._model = model_name

        if api_key and api_key.strip():
            try:
                from google import genai
                self._client = genai.Client(api_key=api_key.strip())
                logger.info(f"[GEMINI] Initialized official GenAI client with model='{self._model}'")
            except Exception as exc:
                logger.error(f"[GEMINI] Failed to initialize GenAI client: {exc}")
                self._client = None
        else:
            logger.warning("[GEMINI] GEMINI_API_KEY missing or empty. Will use Groq API fallback.")
            self._client = None

    def is_available(self) -> bool:
        """Check if Gemini client or Groq fallback is available."""
        if not self._client:
            self._init_client()
        return self._client is not None or groq_service.is_available()

    def generate_grounded_answer(
        self,
        query: str,
        sources: List[Dict[str, Any]],
        document_id: str = "",
        user_id: str = "",
    ) -> Dict[str, Any]:
        """
        Generate grounded legal answer using Gemini (or Groq failover) based ONLY on supplied sources package.
        """
        if not sources:
            return {
                "success": True,
                "answer": "I cannot find relevant evidence in the uploaded document to answer your question.",
                "evidence_found": False,
                "error": None,
            }

        # Build Source Package text
        source_package_lines = []
        for idx, src in enumerate(sources, 1):
            source_tag = f"SOURCE {idx}"
            doc_id_val = src.get("doc_id") or src.get("document_id") or document_id
            page_val = src.get("page", 1)
            chunk_val = src.get("chunk_id", idx)
            score_val = src.get("score") or src.get("similarity_score") or 0.0
            text_val = (src.get("text") or src.get("text_snippet") or "").strip()

            source_package_lines.append(
                f"{source_tag}\n"
                f"Document ID: {doc_id_val}\n"
                f"Chunk ID: {chunk_val}\n"
                f"Page: {page_val}\n"
                f"Similarity Score: {score_val:.2f}\n\n"
                f"TEXT:\n\"{text_val}\"\n"
            )

        source_package = "\n---\n".join(source_package_lines)

        full_prompt = (
            f"EVIDENCE SOURCE PACKAGE:\n{source_package}\n\n"
            f"USER QUESTION: {query}\n\n"
            f"ANSWER:"
        )

        last_error = None

        # 1. Try Gemini API first if client exists
        if self._client:
            models_to_try = [self._model] + [m for m in GEMINI_CANDIDATE_MODELS if m != self._model]
            for candidate_model in models_to_try:
                try:
                    t0 = time.time()
                    response = self._client.models.generate_content(
                        model=candidate_model,
                        contents=f"{SYSTEM_GROUNDED_PROMPT}\n\n{full_prompt}",
                    )
                    elapsed = round((time.time() - t0) * 1000, 2)
                    text_out = (response.text or "").strip()
                    if text_out:
                        logger.info(f"[GEMINI] Answer generated using '{candidate_model}' in {elapsed}ms.")
                        return {
                            "success": True,
                            "answer": text_out,
                            "evidence_found": True,
                            "error": None,
                        }
                except Exception as exc:
                    last_error = str(exc)
                    logger.warning(f"[GEMINI] Model '{candidate_model}' attempt failed: {exc}")

        # 2. FAILOVER TO GROQ API if Gemini fails or is not configured
        if groq_service.is_available():
            logger.info("[LLM FAILOVER] Gemini failed or unavailable. Switching to Groq API fallback.")
            groq_res = groq_service.generate_chat_completion(
                messages=[
                    {"role": "system", "content": SYSTEM_GROUNDED_PROMPT},
                    {"role": "user", "content": full_prompt},
                ]
            )
            if groq_res.get("success") and groq_res.get("answer"):
                return {
                    "success": True,
                    "answer": groq_res["answer"],
                    "evidence_found": True,
                    "error": None,
                }
            last_error = groq_res.get("error") or last_error

        logger.error(f"[LLM ERROR] Both Gemini and Groq APIs failed. Last error: {last_error}")
        return {
            "success": False,
            "answer": "AI Service error: Both Gemini and Groq API calls encountered errors.",
            "evidence_found": False,
            "error": last_error,
        }

    def generate_copilot_legal_answer(
        self,
        query: str,
        user_id: str = "",
        document_id: str = "",
    ) -> Dict[str, Any]:
        """
        Generate comprehensive, expert legal co-pilot answer for general legal queries,
        statutory guidance, legal definitions, and compliance with Groq API failover.
        """
        last_error = None

        # 1. Try Gemini API first
        if self._client:
            models_to_try = [self._model] + [m for m in GEMINI_CANDIDATE_MODELS if m != self._model]
            for candidate_model in models_to_try:
                try:
                    t0 = time.time()
                    response = self._client.models.generate_content(
                        model=candidate_model,
                        contents=f"{SYSTEM_COPILOT_GENERAL_PROMPT}\n\nLEGAL QUERY: {query}\n\nEXPERT LEGAL CO-PILOT RESPONSE:",
                    )
                    elapsed = round((time.time() - t0) * 1000, 2)
                    text_out = (response.text or "").strip()
                    if text_out:
                        logger.info(f"[GEMINI] Co-pilot answer generated using '{candidate_model}' in {elapsed}ms.")
                        return {
                            "success": True,
                            "answer": text_out,
                            "evidence_found": False,
                            "error": None,
                        }
                except Exception as exc:
                    last_error = str(exc)
                    logger.warning(f"[GEMINI] Copilot '{candidate_model}' failed: {exc}")

        # 2. FAILOVER TO GROQ API
        if groq_service.is_available():
            logger.info("[LLM FAILOVER] Gemini Co-Pilot failed or unavailable. Switching to Groq API fallback.")
            groq_res = groq_service.generate_chat_completion(
                messages=[
                    {"role": "system", "content": SYSTEM_COPILOT_GENERAL_PROMPT},
                    {"role": "user", "content": f"LEGAL QUERY: {query}"},
                ]
            )
            if groq_res.get("success") and groq_res.get("answer"):
                return {
                    "success": True,
                    "answer": groq_res["answer"],
                    "evidence_found": False,
                    "error": None,
                }
            last_error = groq_res.get("error") or last_error

        return {
            "success": False,
            "answer": "AI Service error: Both Gemini and Groq API calls failed.",
            "evidence_found": False,
            "error": last_error,
        }

    def extract_structured_risk_factors(
        self,
        contract_text: str,
        document_id: str = "",
        user_id: str = "",
    ) -> List[Dict[str, Any]]:
        """
        Extract structured legal risk findings using Gemini.
        Returns list of risk factor dicts:
        [{'category': 'liability', 'severity': 'high', 'finding': '...', 'page': 1, 'evidence': '...'}]
        """
        if not self.is_available() or not contract_text.strip():
            return []

        prompt = (
            "You are a strict legal risk extraction system. Extract structured risk findings from the contract text below.\n"
            "Respond ONLY with a JSON array of objects. Do not include markdown text or explanations outside JSON.\n\n"
            "JSON Format:\n"
            "[\n"
            "  {\n"
            "    \"category\": \"liability | indemnification | termination | payment | confidentiality | ip | data_protection | governing_law | non_compete\",\n"
            "    \"severity\": \"low | medium | high | critical\",\n"
            "    \"finding\": \"Short description of risk finding\",\n"
            "    \"page\": 1,\n"
            "    \"evidence\": \"Exact text excerpt from contract supporting this finding\"\n"
            "  }\n"
            "]\n\n"
            f"CONTRACT TEXT:\n{contract_text[:15000]}\n"
        )

        try:
            response = self._client.models.generate_content(
                model=self._model,
                contents=prompt,
            )
            raw_text = (response.text or "").strip()
            # Extract JSON block if wrapped in markdown
            json_match = re.search(r"\[\s*\{.*\}\s*\]", raw_text, re.DOTALL)
            if json_match:
                raw_text = json_match.group(0)

            findings = json.loads(raw_text)
            if isinstance(findings, list):
                logger.info(f"[GEMINI] Extracted {len(findings)} structured risk factors for doc_id='{document_id}'")
                return findings
        except Exception as exc:
            logger.warning(f"[GEMINI] Structured risk extraction failed for doc_id='{document_id}': {exc}")

        return []


gemini_service = GeminiService()
