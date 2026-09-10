"""
Production Legal Risk Analysis Engine Service.
Evaluates contract vulnerabilities across 9 factor dimensions:
Risky Clauses, Missing Protections, Unusual Obligations, Termination Conditions, Liability,
Indemnification, Payment Conditions, Deadlines, Penalty Language.

Provides 4-tier risk categorization (Low, Medium, High, Critical), exact document evidence traceability,
missing protection identification, and non-authoritative legal disclaimer.
"""
from __future__ import annotations

import re
from typing import List, Dict, Any, Tuple, Optional
from collections import Counter
from app.core.logging import get_logger
from app.schemas.risk import (
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    RiskItem,
    RiskLocation,
    LEGAL_RISK_DISCLAIMER,
)
from app.schemas.clause import ClauseExtractionRequest
from app.services.clause_service import clause_service

logger = get_logger("LegalMind.RiskService")


class RiskService:
    """
    Production Transparent Legal Risk Analysis Engine.
    Grounds all risk scores, factor categories, and recommendations in exact document text evidence.
    """

    def __init__(self) -> None:
        logger.info("Risk Analysis Engine Service initialized.")

    def _check_missing_protections(self, text: str, clauses_summary: Dict[str, int]) -> List[Tuple[str, str, float, str]]:
        """
        Check for missing essential legal safeguards in document text.
        Returns list of (factor, reason, score_impact, recommendation).
        """
        missing: List[Tuple[str, str, float, str]] = []
        text_lower = text.lower()

        # 1. Missing Limitation of Liability Cap
        if "Liability" not in clauses_summary and not any(kw in text_lower for kw in ["limitation of liability", "cap on liability", "maximum liability", "aggregate liability"]):
            missing.append((
                "Missing Protections",
                "Missing Limitation of Liability Clause: Document contains no explicit liability cap or monetary damage ceiling.",
                18.0,
                "Add a mutual Limitation of Liability clause capping total aggregate liability (e.g. to total fees paid in preceding 12 months)."
            ))

        # 2. Missing Confidentiality Obligations
        if "Confidentiality" not in clauses_summary and not any(kw in text_lower for kw in ["confidential", "non-disclosure", "proprietary information"]):
            missing.append((
                "Missing Protections",
                "Missing Confidentiality Terms: Document lacks non-disclosure provisions to protect proprietary information or trade secrets.",
                12.0,
                "Insert mutual NDA and non-disclosure covenants defining confidential information and defining standard 3-5 year secrecy terms."
            ))

        # 3. Missing Governing Law & Jurisdiction
        if "Governing Law" not in clauses_summary and not any(kw in text_lower for kw in ["governing law", "laws of the state", "choice of law"]):
            missing.append((
                "Missing Protections",
                "Missing Governing Law Provision: Document fails to specify governing jurisdiction or choice of law.",
                10.0,
                "Specify clear choice of law jurisdiction (e.g., State of Delaware or State of New York) and venue for dispute resolution."
            ))

        # 4. Missing Force Majeure Protection
        if not any(kw in text_lower for kw in ["force majeure", "act of god", "natural disaster", "unforeseeable event"]):
            missing.append((
                "Missing Protections",
                "Missing Force Majeure Clause: Document provides no relief for performance failures caused by natural disasters or acts of God.",
                6.0,
                "Include a standard Force Majeure provision excusing performance delay caused by events beyond reasonable party control."
            ))

        return missing

    def _evaluate_clause_risk(self, category: str, text: str) -> List[Tuple[str, str, float, str, str]]:
        """
        Evaluate risk factors for an extracted clause text.
        Returns list of (factor, risk_category, score_impact, reason, recommendation).
        """
        text_lower = text.lower()
        risks: List[Tuple[str, str, float, str, str]] = []

        # 1. Liability Risk Factors
        if category == "Liability":
            if any(term in text_lower for term in ["uncapped", "without limitation", "no cap", "exceeding total fees"]):
                risks.append((
                    "Liability",
                    "Critical",
                    25.0,
                    "Uncapped Liability Exposure: Clause exposes party to unlimited monetary damages without any liability ceiling.",
                    "Negotiate a strict monetary liability cap (e.g., equal to 1x annual contract value)."
                ))
            elif "sole remedy" in text_lower or "waive" in text_lower:
                risks.append((
                    "Liability",
                    "High",
                    15.0,
                    "Waiver of Remedies: Clause waives right to seek consequential damages or restricts legal remedies.",
                    "Ensure mutual waiver of consequential damages and maintain statutory legal remedies."
                ))

        # 2. Indemnification Risk Factors
        elif category == "Indemnity":
            if any(term in text_lower for term in ["indemnify", "hold harmless"]) and "gross negligence" not in text_lower:
                risks.append((
                    "Indemnification",
                    "High",
                    18.0,
                    "Broad Indemnification: Unrestricted indemnity obligation without limitation to gross negligence or willful misconduct.",
                    "Qualify indemnity obligations to third-party claims arising solely from gross negligence, fraud, or willful misconduct."
                ))
            elif "defend" in text_lower:
                risks.append((
                    "Indemnification",
                    "Medium",
                    10.0,
                    "Duty to Defend: Obligates party to assume defense costs for third-party lawsuits.",
                    "Cap legal defense cost obligations or require mutual defense cooperation."
                ))

        # 3. Termination Conditions Risk Factors
        elif category == "Termination":
            if "convenience" in text_lower and any(term in text_lower for term in ["without cause", "at any time", "immediate"]):
                risks.append((
                    "Termination Conditions",
                    "Critical",
                    20.0,
                    "Unilateral Termination for Convenience: Allows counterparty to terminate contract immediately at any time without cause.",
                    "Require minimum 30–60 days written notice for convenience termination or require termination fee."
                ))
            elif "immediately" in text_lower or "without notice" in text_lower:
                risks.append((
                    "Termination Conditions",
                    "High",
                    14.0,
                    "Immediate Termination without Cure Period: Contract can be terminated immediately without opportunity to cure default.",
                    "Insert a mandatory 15–30 day written notice and cure period prior to termination for cause."
                ))

        # 4. Penalty Language & Payment Conditions Risk Factors
        elif category == "Payment":
            if any(term in text_lower for term in ["interest rate", "late fee", "1.5%", "2%", "penalty"]):
                risks.append((
                    "Penalty Language",
                    "High",
                    14.0,
                    "Excessive Late Payment Penalty: Late payment interest fees exceed standard commercial rates.",
                    "Cap late payment interest at maximum 1.0% per month or statutory rate."
                ))
            elif "non-refundable" in text_lower or "forfeit" in text_lower:
                risks.append((
                    "Payment Conditions",
                    "Medium",
                    10.0,
                    "Non-Refundable Payment Term: Fees are strictly non-refundable even upon non-performance or breach.",
                    "Specify fee refundability in cases of material breach or early termination for cause by client."
                ))

        # 5. Renewal & Deadlines Risk Factors
        elif category == "Renewal":
            if "automatic" in text_lower or "auto-renew" in text_lower:
                risks.append((
                    "Deadlines",
                    "High",
                    14.0,
                    "Automatic Renewal Trap: Contract auto-renews unless written non-renewal notice is delivered in advance.",
                    "Set calendar reminders for non-renewal notice deadline (typically 30-60 days prior to expiration)."
                ))

        # 6. Dispute Resolution Risk Factors
        elif category in ["Dispute Resolution", "Governing Law"]:
            if "arbitration" in text_lower and any(term in text_lower for term in ["waive", "jury"]):
                risks.append((
                    "Risky Clauses",
                    "Medium",
                    10.0,
                    "Mandatory Binding Arbitration & Jury Waiver: Forces dispute resolution into private arbitration waiving court trial rights.",
                    "Ensure arbitration rules are balanced, venue is convenient, and fee-shifting provisions apply to prevailing party."
                ))

        # 7. Unusual Obligations Risk Factors
        elif category == "Obligations":
            if any(term in text_lower for term in ["non-compete", "exclusive", "sole distributor", "non-solicit"]):
                risks.append((
                    "Unusual Obligations",
                    "High",
                    16.0,
                    "Restrictive Covenant: Contains non-compete, exclusivity, or customer non-solicitation restrictions.",
                    "Narrow scope, geographic region, and duration of restrictive covenants to reasonable business necessity."
                ))
            elif "audit" in text_lower and "any time" in text_lower:
                risks.append((
                    "Unusual Obligations",
                    "Medium",
                    8.0,
                    "Unrestricted Audit Rights: Counterparty retains broad right to audit books and records at any time.",
                    "Restrict audit frequency to once per calendar year upon 15 business days prior written notice during business hours."
                ))

        return risks

    async def analyze_risk(self, request: RiskAnalysisRequest) -> RiskAnalysisResponse:
        text = (request.text or "").strip()
        if not text:
            return RiskAnalysisResponse(
                success=True,
                overall_risk_score=0.0,
                overall_risk_category="Low",
                found_risks=[],
                missing_protections=[],
                factor_breakdown={},
                disclaimer=LEGAL_RISK_DISCLAIMER,
                metadata={"total_words": 0},
            )

        logger.info(f"Analyzing legal risk for text length: {len(text)} chars (Jurisdiction: {request.jurisdiction})")

        # 1. Clause Extraction & Classification
        try:
            clause_res = await clause_service.extract_clauses(
                ClauseExtractionRequest(text=text, min_confidence=request.min_confidence)
            )
            extracted_clauses = clause_res.clauses or []
            clauses_summary = clause_res.summary or {}
        except Exception as exc:
            logger.warning(f"Clause extraction fallback during risk analysis: {exc}")
            extracted_clauses = []
            clauses_summary = {}

        risk_items: List[RiskItem] = []
        risk_counter = 1
        total_risk_score_points = 0.0

        # 2. Evaluate Risks Grounded in Extracted Clause Evidence with Fault Isolation
        for cl in extracted_clauses:
            try:
                clause_risks = self._evaluate_clause_risk(cl.category, cl.text)

                # Determine ML + Rule Concurrence Source Attribution
                rule_matched = getattr(cl, "rule_match", True)
                ml_label = getattr(cl, "ml_label", None)
                ml_conf = getattr(cl, "ml_confidence", getattr(cl, "confidence_score", getattr(cl, "confidence", 0.0)))

                if rule_matched and ml_label and ml_conf >= 0.70:
                    item_source = "hybrid"
                elif ml_label and ml_conf >= 0.75 and not rule_matched:
                    item_source = "ml"
                else:
                    item_source = "rule"

                for factor, cat, score_impact, reason, rec in clause_risks:
                    page_num = cl.location.page if cl.location and cl.location.page else 1

                    risk_items.append(
                        RiskItem(
                            risk_id=f"RISK-{risk_counter:03d}",
                            factor=factor,
                            risk_category=cat,
                            score_impact=score_impact,
                            reason=reason,
                            supporting_clause=cl.text,  # Traceable Document Evidence
                            location=RiskLocation(
                                paragraph=cl.location.paragraph if cl.location else 1,
                                start_char=cl.location.start_char if cl.location else 0,
                                end_char=cl.location.end_char if cl.location else len(cl.text),
                                page=page_num,
                            ),
                            recommendation=rec,
                            confidence=getattr(cl, "confidence_score", cl.confidence),
                            category=factor,
                            severity=cat,
                            score=score_impact,
                            evidence=cl.text,
                            page=page_num,
                            source=item_source,
                        )
                    )
                    risk_counter += 1
                    total_risk_score_points += score_impact
            except Exception as exc:
                logger.warning(f"Error evaluating risk for clause '{getattr(cl, 'category', 'unknown')}': {exc}")
                continue

        # 3. Check for Missing Legal Protections across Document with Fault Isolation
        try:
            missing_protections_raw = self._check_missing_protections(text, clauses_summary)
            missing_protections_titles: List[str] = []

            for factor, reason, score_impact, rec in missing_protections_raw:
                missing_protections_titles.append(reason.split(":")[0])
                risk_items.append(
                    RiskItem(
                        risk_id=f"RISK-{risk_counter:03d}",
                        factor=factor,
                        risk_category="High" if score_impact >= 15.0 else "Medium",
                        score_impact=score_impact,
                        reason=reason,
                        supporting_clause="[MISSING PROTECTION EVIDENCE: No explicit protective clause found in contract text]",
                        location=RiskLocation(paragraph=1, start_char=0, end_char=min(100, len(text)), page=1),
                        recommendation=rec,
                        confidence=0.88,
                        category=factor,
                        severity="High" if score_impact >= 15.0 else "Medium",
                        score=score_impact,
                        evidence="[MISSING PROTECTION EVIDENCE: No explicit protective clause found in contract text]",
                        page=1,
                        source="rule",
                    )
                )
                risk_counter += 1
                total_risk_score_points += score_impact
        except Exception as exc:
            logger.warning(f"Error checking missing protections: {exc}")
            missing_protections_titles = []

        # 4. Aggregated Score & Risk Category Determination (Deterministic & Reproducible)
        overall_risk_score = min(100.0, round(total_risk_score_points, 1))

        # Determine overall category: Low (0-25), Medium (26-50), High (51-75), Critical (76-100)
        critical_count = sum(1 for r in risk_items if r.risk_category == "Critical")

        if overall_risk_score >= 76.0 or critical_count >= 2:
            overall_risk_category = "Critical"
        elif overall_risk_score >= 51.0 or critical_count >= 1:
            overall_risk_category = "High"
        elif overall_risk_score >= 26.0:
            overall_risk_category = "Medium"
        else:
            overall_risk_category = "Low"

        # 5. Factor Breakdown Metrics
        factor_counts = dict(Counter(r.factor for r in risk_items))

        logger.info(
            f"Risk analysis complete: Overall Score={overall_risk_score} ({overall_risk_category}), "
            f"Found Risks={len(risk_items)}, Missing Protections={len(missing_protections_titles)}"
        )

        return RiskAnalysisResponse(
            success=True,
            overall_risk_score=overall_risk_score,
            overall_risk_category=overall_risk_category,
            found_risks=risk_items,
            missing_protections=missing_protections_titles,
            factor_breakdown=factor_counts,
            disclaimer=LEGAL_RISK_DISCLAIMER,
            metadata={
                "total_factors_analyzed": 9,
                "total_risks_flagged": len(risk_items),
                "critical_risks_count": critical_count,
                "jurisdiction_evaluated": request.jurisdiction,
                "hybrid_risk_engine": True,
            },
        )


risk_service = RiskService()

