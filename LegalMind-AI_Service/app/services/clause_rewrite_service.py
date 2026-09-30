"""
One-Click Legal Clause Negotiation & Rewrite Engine for LegalMind.
Generates 3 tailored counter-clause versions for any risky or legal contract text:
1. Protective (Pro-Client): Maximum legal protection & strict caps.
2. Balanced (Industry Standard): Fair, neutral wording accepted by both parties.
3. Minimal Friction: Subtle edits designed to pass vendor review quickly.

Includes legal negotiation rationale and dual-engine fallback (Gemini API with Groq API failover).
"""
from __future__ import annotations

import json
import re
import time
from typing import Dict, Any

from app.services.gemini_service import gemini_service
from app.services.groq_service import groq_service
from app.core.logging import get_logger

logger = get_logger("LegalMind.ClauseRewriteService")

CLAUSE_REWRITE_PROMPT = """You are a senior contract negotiation attorney and legal drafting expert.
Analyze the original contract clause text provided below and generate 3 professional, legally sound counter-clause options designed to mitigate risk:

1. "protective": A pro-client counter-clause that maximizes protection (e.g. strict liability cap, mutual obligations, narrow definitions, required written consent).
2. "balanced": An industry-standard, neutral counter-clause fair to both parties and routinely accepted in commercial transactions.
3. "minimalFriction": Subtle, minimal adjustments to the original wording to mitigate the core risk while maintaining a high likelihood of fast approval by the counterparty.

Respond STRICTLY with a valid JSON object matching this schema. Do not include markdown codeblocks or extra text outside JSON.

JSON Schema:
{{
  "originalClause": "{original_clause}",
  "riskTopic": "{risk_topic}",
  "rewrites": {{
    "protective": {{
      "title": "Protective (Pro-Client)",
      "clauseText": "Full text of pro-client counter clause...",
      "rationale": "Key reason why this version protects the client (e.g. caps financial exposure to 1x contract value).",
      "negotiationTip": "Use when you have high bargaining leverage or the vendor carries major operational risk."
    }},
    "balanced": {{
      "title": "Balanced (Industry Standard)",
      "clauseText": "Full text of balanced neutral counter clause...",
      "rationale": "Establishes mutual standards and reasonable commercial boundaries.",
      "negotiationTip": "Recommended default for standard vendor negotiations."
    }},
    "minimalFriction": {{
      "title": "Minimal Friction (Fast Approval)",
      "clauseText": "Full text of subtle adjustment counter clause...",
      "rationale": "Leaves main structure intact while adding key protective qualification (e.g., 'to the extent permitted by law').",
      "negotiationTip": "Best when deal speed is critical or vendor refuses major rewrites."
    }}
  }}
}}

ORIGINAL CLAUSE TEXT:
{original_clause}

RISK TOPIC / CONTEXT:
{risk_topic}
"""


class ClauseRewriteService:
    """Service for generating 3-tiered legal counter-clauses and negotiation strategies."""

    def rewrite_clause(
        self, original_clause: str, risk_topic: str = "General Legal Risk"
    ) -> Dict[str, Any]:
        """
        Generate protective, balanced, and minimal friction rewrites.
        """
        if not original_clause or not original_clause.strip():
            return self._default_fallback(original_clause, risk_topic)

        truncated_clause = original_clause[:4000]
        prompt = CLAUSE_REWRITE_PROMPT.format(
            original_clause=truncated_clause, risk_topic=risk_topic or "Contract Risk Mitigation"
        )

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
                            f"[REWRITE] Gemini model '{candidate_model}' generated rewrites in {round((time.time()-t0)*1000, 2)}ms"
                        )
                        break
                except Exception as exc:
                    logger.warning(f"[REWRITE] Gemini '{candidate_model}' generation failed: {exc}")

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
                        f"[REWRITE] Groq API generated rewrites in {round((time.time()-t0)*1000, 2)}ms"
                    )
            except Exception as exc:
                logger.warning(f"[REWRITE] Groq generation failed: {exc}")

        if raw_json_str:
            try:
                data = json.loads(raw_json_str)
                if isinstance(data, dict) and "rewrites" in data:
                    return data
            except Exception as exc:
                logger.warning(f"[REWRITE] JSON parsing failed: {exc}")

        return self._default_fallback(original_clause, risk_topic)

    def _clean_json_str(self, text: str) -> str:
        """Strip markdown codeblocks and extract JSON string."""
        cleaned = text.strip()
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return match.group(0)
        return cleaned

    def _default_fallback(self, original_clause: str, risk_topic: str) -> Dict[str, Any]:
        """Fallback counter-clause options if LLM extraction fails."""
        clause_clean = original_clause if original_clause else "The Licensee shall indemnify Licensor against any and all claims without limitation."

        return {
            "originalClause": clause_clean,
            "riskTopic": risk_topic or "Uncapped Liability & Indemnity",
            "rewrites": {
                "protective": {
                    "title": "Protective (Pro-Client)",
                    "clauseText": f"Neither party's total aggregate liability arising out of or related to this Agreement shall exceed the total fees paid by Client under this Agreement in the twelve (12) months preceding the incident. {clause_clean} Provided, however, that indemnity shall be strictly limited to direct, proven damages and conditioned upon prompt written notice.",
                    "rationale": "Inserts a hard financial liability cap (12 months of fees) and restricts indemnity claims strictly to direct proven damages.",
                    "negotiationTip": "Use as your opening counter-offer to establish firm financial boundaries.",
                },
                "balanced": {
                    "title": "Balanced (Industry Standard)",
                    "clauseText": f"Each party agrees to indemnify, defend, and hold harmless the other party from and against third-party claims arising from gross negligence or willful misconduct. {clause_clean} Liability under this clause shall be subject to Section 14 (Limitation of Liability).",
                    "rationale": "Makes indemnity mutual and conditions liability on proven gross negligence or willful misconduct rather than simple default.",
                    "negotiationTip": "Standard commercial baseline easily accepted by enterprise legal teams.",
                },
                "minimalFriction": {
                    "title": "Minimal Friction (Fast Approval)",
                    "clauseText": f"{clause_clean} To the maximum extent permitted by applicable law, neither party shall be liable for indirect, punitive, or consequential damages.",
                    "rationale": "Preserves existing text while adding standard statutory exclusions for indirect and punitive damages.",
                    "negotiationTip": "High acceptance rate when deal closing timeline is tight.",
                },
            },
        }


clause_rewrite_service = ClauseRewriteService()
