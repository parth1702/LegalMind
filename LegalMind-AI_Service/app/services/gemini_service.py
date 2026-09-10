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


class GeminiService:
    """
    Clean Gemini Service Abstraction managing Google GenAI client lifecycle,
    grounded RAG reasoning, and structured legal analysis.
    """

    def __init__(self) -> None:
        self._client = None
        self._model = None
        self._init_client()

    def _init_client(self) -> None:
        """Initialize or refresh the official google-genai client."""
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        model_name = settings.GEMINI_MODEL or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        
        # Fallback list of models if configured model hits quota or deprecated
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
            logger.warning("[GEMINI] GEMINI_API_KEY is missing or empty. Gemini features will return controlled service errors.")
            self._client = None

    def is_available(self) -> bool:
        """Check if Gemini client is properly configured and initialized."""
        if not self._client:
            self._init_client()
        return self._client is not None

    def generate_grounded_answer(
        self,
        query: str,
        sources: List[Dict[str, Any]],
        document_id: str = "",
        user_id: str = "",
    ) -> Dict[str, Any]:
        """
        Generate grounded legal answer using Gemini based ONLY on supplied sources package.
        Returns dict with keys: 'answer', 'evidence_found', 'raw_response', 'error'.
        """
        if not self.is_available():
            logger.warning(f"[GEMINI] Unavailable for doc_id='{document_id}'. GEMINI_API_KEY not configured.")
            return {
                "success": False,
                "answer": "AI Service configuration error: GEMINI_API_KEY is not configured.",
                "evidence_found": False,
                "error": "GEMINI_UNAVAILABLE",
            }

        if not sources:
            logger.info(f"[GEMINI] model={self._model} request_document_id={document_id} source_count=0 status=no_evidence")
            return {
                "success": True,
                "answer": "I cannot find relevant evidence in the uploaded document.",
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
            f"{SYSTEM_GROUNDED_PROMPT}\n\n"
            f"EVIDENCE SOURCE PACKAGE:\n{source_package}\n\n"
            f"USER QUESTION: {query}\n\n"
            f"ANSWER:"
        )

        max_retries = 2
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                t0 = time.time()
                # Use official google-genai SDK models.generate_content API
                response = self._client.models.generate_content(
                    model=self._model,
                    contents=full_prompt,
                )
                elapsed = round((time.time() - t0) * 1000, 2)

                text_out = (response.text or "").strip()
                if not text_out:
                    raise ValueError("Empty text response received from Gemini API.")

                logger.info(f"[GEMINI] model={self._model} request_document_id={document_id} source_count={len(sources)} elapsed_ms={elapsed} status=success")

                return {
                    "success": True,
                    "answer": text_out,
                    "evidence_found": True,
                    "error": None,
                }
            except Exception as exc:
                last_error = str(exc)
                logger.warning(f"[GEMINI] Attempt {attempt + 1} failed for doc_id='{document_id}': {exc}")
                
                # Check for model not found / quota / rate limit errors to fallback model if needed
                if "not found" in last_error.lower() or "404" in last_error:
                    # Fallback model attempt
                    self._model = "gemini-2.0-flash" if self._model != "gemini-2.0-flash" else "gemini-1.5-flash"
                    logger.info(f"[GEMINI] Switching model fallback to '{self._model}'")

                if attempt < max_retries:
                    time.sleep(1.0 * (2 ** attempt))

        logger.error(f"[GEMINI] model={self._model} request_document_id={document_id} source_count={len(sources)} status=failure error='{last_error}'")

        return {
            "success": False,
            "answer": "AI Service error: Unable to generate answer from Gemini model.",
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
        statutory guidance, legal definitions, contract drafting advice, and legal compliance.
        """
        if not self.is_available():
            logger.warning(f"[GEMINI] Unavailable for copilot legal query.")
            return {
                "success": False,
                "answer": "AI Service configuration error: GEMINI_API_KEY is not configured.",
                "evidence_found": False,
                "error": "GEMINI_UNAVAILABLE",
            }

        full_prompt = (
            f"{SYSTEM_COPILOT_GENERAL_PROMPT}\n\n"
            f"LEGAL QUERY: {query}\n\n"
            f"EXPERT LEGAL CO-PILOT RESPONSE:"
        )

        max_retries = 2
        last_error = None

        for attempt in range(max_retries + 1):
            try:
                t0 = time.time()
                response = self._client.models.generate_content(
                    model=self._model,
                    contents=full_prompt,
                )
                elapsed = round((time.time() - t0) * 1000, 2)

                text_out = (response.text or "").strip()
                if not text_out:
                    raise ValueError("Empty response received from Gemini model.")

                logger.info(f"[GEMINI] Legal Co-Pilot answer generated for query='{query[:50]}' elapsed_ms={elapsed}")
                return {
                    "success": True,
                    "answer": text_out,
                    "evidence_found": False,
                    "error": None,
                }
            except Exception as exc:
                last_error = str(exc)
                logger.warning(f"[GEMINI] Copilot attempt {attempt + 1} failed: {exc}")
                if "not found" in last_error.lower() or "404" in last_error:
                    self._model = "gemini-2.0-flash" if self._model != "gemini-2.0-flash" else "gemini-1.5-flash"

                if attempt < max_retries:
                    time.sleep(1.0 * (2 ** attempt))

        return {
            "success": False,
            "answer": "AI Service error: Unable to generate legal co-pilot answer.",
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
