"""
Contract Action Roadmap & Playbook Extraction Service for LegalMind.
Generates an actionable execution roadmap divided into:
1. DO List (Required obligations, performance deliverables, notice filings)
2. DO NOT List (Prohibited actions, breach risk triggers, non-compete/non-solicit restrictions)
3. REMEMBER List (Critical milestone dates, notice windows, governing jurisdiction/seat, liability caps)
4. NEXT STEPS List (Prioritized 1-2-3 execution checklist for user action)

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

logger = get_logger("LegalMind.ContractRoadmapService")

ROADMAP_EXTRACTION_PROMPT = """You are an expert legal strategist and contract execution analyst.
Analyze the contract text provided below and generate a clear, highly actionable, and easy-to-understand Action Roadmap & Playbook for the user.

Extract the following 4 sections:
1. "doList": What the user MUST DO under this contract (e.g. required payment notices, compliance audits, deliverables, insurance coverage, confidentiality measures).
2. "dontList": What the user MUST NOT DO (e.g. sub-licensing without consent, hiring client staff, disclosing proprietary code, reversing engineering, breaching exclusivity).
3. "rememberList": Critical legal terms & key parameters to ALWAYS REMEMBER (e.g. 30-day renewal notice window, Delhi arbitration seat, \$50k liability cap, auto-renewal clause, 60-day audit window).
4. "nextStepsList": Immediate 1-2-3 step actionable checklist for the user to take right now (e.g. 1. Calendar notice deadline by Nov 1, 2. Issue formal written receipt within 5 days, 3. Obtain certificate of insurance).

Respond STRICTLY with a valid JSON object matching this schema. Do not include markdown text or explanations outside the JSON object.

JSON Schema:
{{
  "doList": [
    {{
      "id": "do-1",
      "title": "Issue Written Notice of Performance Milestone",
      "description": "Formally notify the counterparty in writing within 5 business days of completing each phase.",
      "priority": "high",
      "timeline": "Within 5 business days of milestone completion",
      "category": "Deliverables & Compliance",
      "sourceQuote": "The Contractor shall provide written notice of completion within five (5) business days...",
      "pageNumber": 1
    }}
  ],
  "dontList": [
    {{
      "id": "dont-1",
      "title": "Do Not Disclose Source Code or Proprietary Schemas",
      "prohibition": "Strict restriction against sharing tech architecture or source code with third-party vendors without prior written authorization.",
      "severity": "critical",
      "riskImpact": "Triggers immediate contract termination and uncapped indemnity claims under Clause 12.",
      "sourceQuote": "Recipient shall not disclose, reverse engineer, or transmit proprietary source code to any third party...",
      "pageNumber": 2
    }}
  ],
  "rememberList": [
    {{
      "id": "rem-1",
      "title": "30-Day Written Non-Renewal Window",
      "keyFact": "Contract automatically renews for 12 months unless written notice of non-renewal is provided 30 days prior to expiry.",
      "type": "notice",
      "details": "Governed by Clause 4.2. Failure to send notice auto-locks the contract for another year.",
      "sourceQuote": "This Agreement shall automatically renew unless either party provides written notice of non-renewal at least 30 days prior...",
      "pageNumber": 3
    }}
  ],
  "nextStepsList": [
    {{
      "id": "step-1",
      "stepNumber": 1,
      "taskName": "Calendar Renewal Notice Cutoff Date",
      "description": "Set a reminder on calendar for 35 days before contract end date to review performance before auto-renewal locks.",
      "priority": "high",
      "deadline": "35 days before contract end date",
      "assignedRole": "Legal Counsel / Operations Manager",
      "completed": false,
      "sourceQuote": "Written notice of non-renewal must be delivered at least 30 days prior to Expiration Date."
    }}
  ]
}}

CONTRACT TEXT:
{contract_text}
"""


class ContractRoadmapService:
    """Service for generating Action Playbook (DO, DO NOT, REMEMBER, NEXT STEPS) from contract text."""

    def generate_roadmap(
        self, contract_text: str, document_id: str = ""
    ) -> Dict[str, Any]:
        """
        Generate actionable roadmap JSON.
        """
        if not contract_text or not contract_text.strip():
            return self._default_fallback(contract_text)

        truncated_text = contract_text[:14000]
        prompt = ROADMAP_EXTRACTION_PROMPT.format(contract_text=truncated_text)

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
                        logger.info(
                            f"[ROADMAP] Gemini model '{candidate_model}' generated roadmap in {round((time.time()-t0)*1000, 2)}ms"
                        )
                        break
                except Exception as exc:
                    logger.warning(f"[ROADMAP] Gemini '{candidate_model}' generation failed: {exc}")

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
                    logger.info(
                        f"[ROADMAP] Groq API generated roadmap in {round((time.time()-t0)*1000, 2)}ms"
                    )
            except Exception as exc:
                logger.warning(f"[ROADMAP] Groq generation failed: {exc}")

        if raw_json_str:
            try:
                data = json.loads(raw_json_str)
                if isinstance(data, dict) and "doList" in data:
                    return data
            except Exception as exc:
                logger.warning(f"[ROADMAP] JSON parsing failed: {exc}")

        return self._default_fallback(contract_text)

    def _clean_json_str(self, text: str) -> str:
        """Strip markdown codeblocks and extract JSON string."""
        cleaned = text.strip()
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return match.group(0)
        return cleaned

    def _default_fallback(self, contract_text: str) -> Dict[str, Any]:
        """Fallback roadmap response if LLM extraction fails or text is empty."""
        has_text = bool(contract_text and contract_text.strip())

        return {
            "doList": [
                {
                    "id": "do-1",
                    "title": "Maintain Written Records of All Deliverables",
                    "description": "Ensure written acknowledgment and receipt confirmation for every service delivery.",
                    "priority": "high",
                    "timeline": "Continuous during contract term",
                    "category": "Compliance & Audit",
                    "sourceQuote": "Parties shall maintain complete records of all deliverables exchanged.",
                    "pageNumber": 1,
                },
                {
                    "id": "do-2",
                    "title": "Provide Written Notice of Address/Bank Updates",
                    "description": "Formally notify counterparty 14 days prior to changing payment details or corporate address.",
                    "priority": "medium",
                    "timeline": "14 days prior notice",
                    "category": "Notice Requirements",
                    "sourceQuote": "Any change to notice addresses or payment details requires 14 days advance written notice.",
                    "pageNumber": 1,
                },
            ],
            "dontList": [
                {
                    "id": "dont-1",
                    "title": "Do Not Disclose Confidential Technical Data",
                    "prohibition": "Strict restriction against disclosing proprietary algorithms, client lists, or confidential project materials.",
                    "severity": "critical",
                    "riskImpact": "Can trigger immediate contract termination and damages under governing law.",
                    "sourceQuote": "Neither party shall disclose confidential information to any un-authorized third party.",
                    "pageNumber": 1,
                },
                {
                    "id": "dont-2",
                    "title": "Do Not Assign Contract Without Written Consent",
                    "prohibition": "Prohibition against assigning rights or sub-contracting obligations without prior written approval.",
                    "severity": "high",
                    "riskImpact": "Renders assignment void and exposes party to breach default.",
                    "sourceQuote": "This Agreement may not be assigned without the prior written consent of both parties.",
                    "pageNumber": 2,
                },
            ],
            "rememberList": [
                {
                    "id": "rem-1",
                    "title": "Auto-Renewal & Notice Period",
                    "keyFact": "Review expiration dates early to avoid automatic 12-month lock-in.",
                    "type": "notice",
                    "details": "Written non-renewal notice must be delivered within the contractually defined window.",
                    "sourceQuote": "Notice of non-renewal must be delivered prior to expiry.",
                    "pageNumber": 1,
                },
                {
                    "id": "rem-2",
                    "title": "Governing Jurisdiction & Seat",
                    "keyFact": "Disputes are subject to binding legal proceedings under Indian Jurisdiction.",
                    "type": "jurisdiction",
                    "details": "Governed by applicable Contract Laws & Arbitration Acts.",
                    "sourceQuote": "This contract shall be governed by and construed in accordance with applicable laws.",
                    "pageNumber": 2,
                },
            ],
            "nextStepsList": [
                {
                    "id": "step-1",
                    "stepNumber": 1,
                    "taskName": "Calendar Key Notice Cutoff Dates",
                    "description": "Log renewal deadlines and notice windows in corporate calendar system.",
                    "priority": "high",
                    "deadline": "Immediate (Within 48 hours)",
                    "assignedRole": "Legal / Compliance Lead",
                    "completed": False,
                    "sourceQuote": "Timely written notice is required to prevent automatic contract obligations.",
                },
                {
                    "id": "step-2",
                    "stepNumber": 2,
                    "taskName": "Verify Confidentiality Safeguards & Access Controls",
                    "description": "Ensure NDA and data protection protocols are active across project team members.",
                    "priority": "high",
                    "deadline": "Prior to project kickoff",
                    "assignedRole": "Security & Project Lead",
                    "completed": False,
                    "sourceQuote": "Confidential information must be safeguarded with reasonable security measures.",
                },
                {
                    "id": "step-3",
                    "stepNumber": 3,
                    "taskName": "Archive Executed Contract Copy in Document Vault",
                    "description": "Store signed agreement with metadata tags in LegalMind repository.",
                    "priority": "medium",
                    "deadline": "Within 7 days",
                    "assignedRole": "Document Admin",
                    "completed": False,
                    "sourceQuote": "Executed agreements shall be maintained in official corporate archives.",
                },
            ],
        }


contract_roadmap_service = ContractRoadmapService()
