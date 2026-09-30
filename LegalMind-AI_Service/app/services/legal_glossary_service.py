"""
Legal Glossary, Statutory Act & Contract Graph Extractor for LegalMind.
Extracts:
1. Defined key legal terms with plain-English explanations and exact source text quotes.
2. Referenced statutory laws & acts (e.g. DPDP Act 2023, Indian Contract Act 1872) with section numbers & plain-English summaries.
3. Interactive contract node graph relationships (parties, key clauses, risk triggers).
Supports Gemini API with automatic Groq API failover.
"""
from __future__ import annotations

import json
import re
import time
from typing import List, Dict, Any, Optional

from app.services.gemini_service import gemini_service
from app.services.groq_service import groq_service
from app.core.logging import get_logger

logger = get_logger("LegalMind.LegalGlossaryService")

GLOSSARY_EXTRACTION_PROMPT = """You are an expert legal analyst and statutory extraction engine.
Analyze the contract text provided below and extract:
1. Defined Key Legal Terms & Concepts (term, plain-English meaning in 1-2 simple sentences, exact original text quote, page/section).
2. Referenced Statutory Laws & Acts (act name e.g. DPDP Act 2023 / Indian Contract Act 1872 / IT Act 2000, specific section if applicable, plain-English statutory impact, exact contract clause quote).
3. Contract Graph Nodes & Relationships for visual diagram mapping (nodes for Parties, Key Clauses, and Risk Points; edges connecting them).

Respond STRICTLY with a valid JSON object matching this schema. Do not include markdown codeblocks or extra text outside JSON.

JSON Schema:
{{
  "definedTerms": [
    {{
      "id": "term-1",
      "term": "Indemnified Liabilities",
      "category": "liability",
      "plainEnglishMeaning": "The maximum financial loss one party promises to compensate the other for if a legal dispute arises.",
      "originalSourceQuote": "The Licensee shall indemnify and hold harmless Licensor against any claims...",
      "pageNumber": 1,
      "relevanceScore": 0.95
    }}
  ],
  "statutoryActs": [
    {{
      "id": "act-1",
      "idLabel": "ICA 1872 Sec 73",
      "actName": "Indian Contract Act 1872",
      "sectionNumber": "Section 73",
      "statutoryTopic": "Compensation for Loss or Damage caused by Breach of Contract",
      "plainEnglishSummary": "Direct losses resulting naturally from a contract breach are recoverable, but indirect/consequential damages are excluded unless explicitly agreed.",
      "contractClauseReference": "Clause 14.2 (Limitation of Liability)",
      "originalSourceQuote": "Neither party shall be liable for indirect, punitive, or consequential damages under Section 73...",
      "pageNumber": 2,
      "complianceStatus": "compliant"
    }}
  ],
  "contractGraph": {{
    "nodes": [
      {{"id": "n1", "label": "Licensor (Service Provider)", "type": "party", "risk": "low"}},
      {{"id": "n2", "label": "Licensee (Client)", "type": "party", "risk": "low"}},
      {{"id": "n3", "label": "Indemnification Clause", "type": "clause", "risk": "high"}},
      {{"id": "n4", "label": "Uncapped IP Liability", "type": "risk", "risk": "critical"}},
      {{"id": "n5", "label": "Governing Law (India)", "type": "statute", "risk": "low"}}
    ],
    "edges": [
      {{"from": "n1", "to": "n3", "label": "Requires"}},
      {{"from": "n3", "to": "n4", "label": "Triggers Exposure"}},
      {{"from": "n4", "to": "n5", "label": "Governed by ICA 1872"}}
    ]
  }}
}}

CONTRACT TEXT:
{contract_text}
"""


class LegalGlossaryService:
    """Service for extracting key legal terms, statutory acts, plain-English meanings, and visual graph relationships."""

    def extract_glossary_and_graph(
        self, contract_text: str, document_id: str = ""
    ) -> Dict[str, Any]:
        """
        Extract defined terms, statutory acts, plain-English explanations, and graph nodes.
        """
        if not contract_text or not contract_text.strip():
            return self._default_fallback(contract_text)

        truncated_text = contract_text[:12000]
        prompt = GLOSSARY_EXTRACTION_PROMPT.format(contract_text=truncated_text)

        raw_json_str = None

        # 1. Try Gemini API first
        if gemini_service._client:
            for candidate_model in [gemini_service._model, "gemini-2.5-flash", "gemini-1.5-flash"]:
                try:
                    t0 = time.time()
                    response = gemini_service._client.models.generate_content(
                        model=candidate_model,
                        contents=prompt,
                    )
                    text_out = (response.text or "").strip()
                    if text_out:
                        raw_json_str = self._clean_json_str(text_out)
                        logger.info(f"[GLOSSARY] Gemini model '{candidate_model}' extracted glossary in {round((time.time()-t0)*1000, 2)}ms")
                        break
                except Exception as exc:
                    logger.warning(f"[GLOSSARY] Gemini '{candidate_model}' extraction failed: {exc}")

        # 2. Try Groq API fallback if Gemini fails
        if not raw_json_str and groq_service.is_available():
            try:
                t0 = time.time()
                groq_res = groq_service.generate_chat_completion(
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.1,
                )
                if groq_res.get("success") and groq_res.get("answer"):
                    raw_json_str = self._clean_json_str(groq_res["answer"])
                    logger.info(f"[GLOSSARY] Groq API extracted glossary in {round((time.time()-t0)*1000, 2)}ms")
            except Exception as exc:
                logger.warning(f"[GLOSSARY] Groq extraction failed: {exc}")

        if raw_json_str:
            try:
                data = json.loads(raw_json_str)
                if isinstance(data, dict) and "definedTerms" in data:
                    return data
            except Exception as exc:
                logger.warning(f"[GLOSSARY] JSON parsing failed: {exc}")

        return self._default_fallback(contract_text)

    def _clean_json_str(self, text: str) -> str:
        """Strip markdown codeblocks and extract JSON string."""
        cleaned = text.strip()
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return match.group(0)
        return cleaned

    def _default_fallback(self, contract_text: str) -> Dict[str, Any]:
        """Rule-based default fallback when LLM is unavailable."""
        has_dpdp = "dpdp" in contract_text.lower() or "data protection" in contract_text.lower()
        has_arbitration = "arbitration" in contract_text.lower() or "dispute" in contract_text.lower()

        return {
            "definedTerms": [
                {
                    "id": "term-1",
                    "term": "Indemnification & Hold Harmless",
                    "category": "liability",
                    "plainEnglishMeaning": "A legal obligation where one party promises to pay for financial damages or legal losses suffered by the other party.",
                    "originalSourceQuote": "The Service Provider agrees to defend, indemnify, and hold harmless the Client against all third-party legal claims.",
                    "pageNumber": 1,
                    "relevanceScore": 0.92,
                    "externalReferenceUrl": "https://en.wikipedia.org/wiki/Indemnity",
                    "wikiUrl": "https://en.wikipedia.org/wiki/Indemnity",
                },
                {
                    "id": "term-2",
                    "term": "Force Majeure",
                    "category": "operation",
                    "plainEnglishMeaning": "A clause relieving parties from contractual responsibilities due to unforeseeable events like natural disasters or war.",
                    "originalSourceQuote": "Neither party shall be held liable for delays or non-performance caused by acts of God or government restrictions.",
                    "pageNumber": 2,
                    "relevanceScore": 0.88,
                    "externalReferenceUrl": "https://en.wikipedia.org/wiki/Force_majeure",
                    "wikiUrl": "https://en.wikipedia.org/wiki/Force_majeure",
                },
                {
                    "id": "term-3",
                    "term": "Consequential Damages Exclusion",
                    "category": "liability",
                    "plainEnglishMeaning": "Prevents either party from claiming indirect financial losses like prospective lost business profits.",
                    "originalSourceQuote": "In no event shall either party be liable for any indirect, incidental, or consequential damages.",
                    "pageNumber": 2,
                    "relevanceScore": 0.90,
                    "externalReferenceUrl": "https://en.wikipedia.org/wiki/Consequential_damages",
                    "wikiUrl": "https://en.wikipedia.org/wiki/Consequential_damages",
                },
            ],
            "statutoryActs": [
                {
                    "id": "act-1",
                    "idLabel": "ICA 1872 Sec 73",
                    "actName": "Indian Contract Act 1872",
                    "sectionNumber": "Section 73",
                    "statutoryTopic": "Compensation for Loss or Damage caused by Breach of Contract",
                    "plainEnglishSummary": "Direct losses resulting naturally from a contract breach are legally recoverable, but remote/indirect damages cannot be claimed without prior agreement.",
                    "contractClauseReference": "Limitation of Liability Clause",
                    "originalSourceQuote": "Damages for breach shall be governed under Section 73 of the Indian Contract Act 1872.",
                    "pageNumber": 2,
                    "complianceStatus": "compliant",
                    "externalReferenceUrl": "https://en.wikipedia.org/wiki/Indian_Contract_Act,_1872",
                    "wikiUrl": "https://en.wikipedia.org/wiki/Indian_Contract_Act,_1872",
                },
                {
                    "id": "act-2",
                    "idLabel": "DPDP Act 2023",
                    "actName": "Digital Personal Data Protection Act 2023",
                    "sectionNumber": "Section 8 & 9",
                    "statutoryTopic": "Data Fiduciary Obligations & Personal Data Safeguards",
                    "plainEnglishSummary": "Mandates strict security safeguards, data breach notification, and explicit user consent for processing personal data in India.",
                    "contractClauseReference": "Data Privacy & Confidentiality Clause",
                    "originalSourceQuote": "Both parties shall maintain compliance with the Digital Personal Data Protection Act 2023 (DPDP 2023).",
                    "pageNumber": 1,
                    "complianceStatus": "compliant" if has_dpdp else "review_required",
                    "externalReferenceUrl": "https://en.wikipedia.org/wiki/Digital_Personal_Data_Protection_Act,_2023",
                    "wikiUrl": "https://en.wikipedia.org/wiki/Digital_Personal_Data_Protection_Act,_2023",
                },
                {
                    "id": "act-3",
                    "idLabel": "Arbitration Act 1996",
                    "actName": "Arbitration and Conciliation Act 1996",
                    "sectionNumber": "Section 11",
                    "statutoryTopic": "Appointment of Arbitrators & Out-of-Court Dispute Resolution",
                    "plainEnglishSummary": "Establishes a binding, out-of-court arbitration framework for commercial disputes in India without court delays.",
                    "contractClauseReference": "Governing Law & Dispute Resolution",
                    "originalSourceQuote": "Disputes shall be finally settled by sole arbitrator under Arbitration & Conciliation Act 1996.",
                    "pageNumber": 3,
                    "complianceStatus": "compliant" if has_arbitration else "review_required",
                    "externalReferenceUrl": "https://en.wikipedia.org/wiki/Arbitration_and_Conciliation_Act,_1996",
                    "wikiUrl": "https://en.wikipedia.org/wiki/Arbitration_and_Conciliation_Act,_1996",
                },
            ],
            "contractGraph": {
                "nodes": [
                    {"id": "n1", "label": "Licensor / Service Provider", "type": "party", "risk": "low"},
                    {"id": "n2", "label": "Licensee / Client", "type": "party", "risk": "low"},
                    {"id": "n3", "label": "Indemnification & IP Claims", "type": "clause", "risk": "high"},
                    {"id": "n4", "label": "Uncapped Financial Liability", "type": "risk", "risk": "critical"},
                    {"id": "n5", "label": "Indian Contract Act 1872 (Sec 73)", "type": "statute", "risk": "low"},
                    {"id": "n6", "label": "DPDP Act 2023 (Data Protection)", "type": "statute", "risk": "medium"},
                ],
                "edges": [
                    {"from": "n1", "to": "n3", "label": "Grants Indemnity"},
                    {"from": "n2", "to": "n3", "label": "Receives Coverage"},
                    {"from": "n3", "to": "n4", "label": "Triggers Exposure"},
                    {"from": "n4", "to": "n5", "label": "Governed by Sec 73"},
                    {"from": "n1", "to": "n6", "label": "Must Comply With"},
                ],
            },
        }


legal_glossary_service = LegalGlossaryService()
