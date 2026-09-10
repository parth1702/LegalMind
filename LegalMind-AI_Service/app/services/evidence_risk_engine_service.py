"""
Evidence-Backed Legal Risk Scoring Engine Service for LegalMind AI.
Calculates contract risk derived strictly from structured legal facts grounded in verifiable text evidence.

Core Rule: NO EVIDENCE -> NO FINDING -> NO RISK POINTS.

Category Weights (100% Total):
- LIABILITY = 20%
- INDEMNIFICATION = 15%
- TERMINATION = 15%
- PAYMENT = 10%
- CONFIDENTIALITY = 10%
- INTELLECTUAL PROPERTY = 10%
- DATA PROTECTION = 10%
- GOVERNING LAW / DISPUTE = 5%
- NON-COMPETE / RESTRICTIONS = 5%

Risk Thresholds:
- 0 to 35: LOW
- 36 to 50: MEDIUM
- 51 to 75: HIGH
- 76 to 100: CRITICAL
"""
from __future__ import annotations

from typing import List, Dict, Any, Optional
from app.core.logging import get_logger
from app.schemas.evidence import EvidenceFinding
from app.schemas.fact_extraction import DocumentFactExtractionResult
from app.schemas.evidence_risk_engine import (
    TriggeredRiskRule,
    CategoryRiskBreakdown,
    EvidenceRiskAnalysisReport,
)
from app.services.fact_extraction_service import fact_extraction_service

logger = get_logger("LegalMind.EvidenceRiskEngineService")


CATEGORY_WEIGHTS: Dict[str, float] = {
    "LIABILITY": 0.20,
    "INDEMNIFICATION": 0.15,
    "TERMINATION": 0.15,
    "PAYMENT": 0.10,
    "CONFIDENTIALITY": 0.10,
    "INTELLECTUAL PROPERTY": 0.10,
    "DATA PROTECTION": 0.10,
    "GOVERNING LAW / DISPUTE": 0.05,
    "NON-COMPETE / RESTRICTIONS": 0.05,
}


class EvidenceRiskEngineService:
    """
    Deterministic Evidence-Backed Legal Risk Engine.
    Calculates weighted category scores and overall contract risk strictly grounded in document text.
    """

    def __init__(self) -> None:
        logger.info("Evidence Risk Engine Service initialized.")

    def evaluate_contract(
        self,
        text: str,
        document_id: str,
        user_id: str,
        filename: str = "document.pdf",
    ) -> EvidenceRiskAnalysisReport:
        """
        Main entry point for evidence-backed risk analysis.
        First extracts structured facts, then evaluates triggered rules per category.
        """
        raw_text = (text or "").strip()
        if not raw_text:
            return EvidenceRiskAnalysisReport(
                success=True,
                document_id=document_id,
                user_id=user_id,
                filename=filename,
                overall_score=0.0,
                overall_level="LOW",
                category_scores={cat: 0.0 for cat in CATEGORY_WEIGHTS},
                category_breakdown=[
                    CategoryRiskBreakdown(
                        category_name=cat,
                        weight_percentage=weight * 100,
                        raw_category_score=0.0,
                        weighted_score_contribution=0.0,
                        triggered_rules_count=0,
                    )
                    for cat, weight in CATEGORY_WEIGHTS.items()
                ],
                triggered_rules=[],
                evidence=[],
                recommendations=[],
            )

        # Step 1: Extract Grounded Facts
        facts: DocumentFactExtractionResult = fact_extraction_service.extract_facts(
            text=raw_text,
            document_id=document_id,
            user_id=user_id,
            filename=filename,
        )

        all_triggered_rules: List[TriggeredRiskRule] = []
        all_evidence: List[EvidenceFinding] = []
        recommendations: List[str] = []

        # Step 2: Evaluate Each Category Independently (0–100 scale)
        category_scores: Dict[str, float] = {}
        category_breakdowns: List[CategoryRiskBreakdown] = []

        # 1. LIABILITY (20%)
        liab_score, liab_rules = self._eval_liability(facts.liability)
        category_scores["LIABILITY"] = liab_score
        all_triggered_rules.extend(liab_rules)
        if facts.liability.evidence and facts.liability.evidence.is_valid_finding:
            all_evidence.append(facts.liability.evidence)

        # 2. INDEMNIFICATION (15%)
        indem_score, indem_rules = self._eval_indemnification(facts.indemnification)
        category_scores["INDEMNIFICATION"] = indem_score
        all_triggered_rules.extend(indem_rules)
        if facts.indemnification.evidence and facts.indemnification.evidence.is_valid_finding:
            all_evidence.append(facts.indemnification.evidence)

        # 3. TERMINATION (15%)
        term_score, term_rules = self._eval_termination(facts.termination)
        category_scores["TERMINATION"] = term_score
        all_triggered_rules.extend(term_rules)
        if facts.termination.evidence and facts.termination.evidence.is_valid_finding:
            all_evidence.append(facts.termination.evidence)

        # 4. PAYMENT (10%)
        pay_score, pay_rules = self._eval_payment(facts.payment)
        category_scores["PAYMENT"] = pay_score
        all_triggered_rules.extend(pay_rules)
        if facts.payment.evidence and facts.payment.evidence.is_valid_finding:
            all_evidence.append(facts.payment.evidence)

        # 5. CONFIDENTIALITY (10%)
        conf_score, conf_rules = self._eval_confidentiality(facts.confidentiality)
        category_scores["CONFIDENTIALITY"] = conf_score
        all_triggered_rules.extend(conf_rules)
        if facts.confidentiality.evidence and facts.confidentiality.evidence.is_valid_finding:
            all_evidence.append(facts.confidentiality.evidence)

        # 6. INTELLECTUAL PROPERTY (10%)
        ip_score, ip_rules = self._eval_ip(facts.intellectual_property)
        category_scores["INTELLECTUAL PROPERTY"] = ip_score
        all_triggered_rules.extend(ip_rules)
        if facts.intellectual_property.evidence and facts.intellectual_property.evidence.is_valid_finding:
            all_evidence.append(facts.intellectual_property.evidence)

        # 7. DATA PROTECTION (10%)
        dp_score, dp_rules = self._eval_data_protection(facts.data_protection)
        category_scores["DATA PROTECTION"] = dp_score
        all_triggered_rules.extend(dp_rules)
        if facts.data_protection.evidence and facts.data_protection.evidence.is_valid_finding:
            all_evidence.append(facts.data_protection.evidence)

        # 8. GOVERNING LAW / DISPUTE (5%)
        gov_score, gov_rules = self._eval_governing_law(facts.governing_law_dispute)
        category_scores["GOVERNING LAW / DISPUTE"] = gov_score
        all_triggered_rules.extend(gov_rules)
        if facts.governing_law_dispute.evidence and facts.governing_law_dispute.evidence.is_valid_finding:
            all_evidence.append(facts.governing_law_dispute.evidence)

        # 9. NON-COMPETE / RESTRICTIONS (5%)
        nc_score, nc_rules = self._eval_non_compete(facts.non_compete_restrictions)
        category_scores["NON-COMPETE / RESTRICTIONS"] = nc_score
        all_triggered_rules.extend(nc_rules)
        if facts.non_compete_restrictions.evidence and facts.non_compete_restrictions.evidence.is_valid_finding:
            all_evidence.append(facts.non_compete_restrictions.evidence)

        # Step 3: Compute Overall Weighted Score
        weighted_sum = 0.0
        for cat_name, weight in CATEGORY_WEIGHTS.items():
            c_score = category_scores.get(cat_name, 0.0)
            contrib = c_score * weight
            weighted_sum += contrib
            matching_rules_cnt = sum(1 for r in all_triggered_rules if r.category == cat_name)
            category_breakdowns.append(
                CategoryRiskBreakdown(
                    category_name=cat_name,
                    weight_percentage=weight * 100.0,
                    raw_category_score=round(c_score, 1),
                    weighted_score_contribution=round(contrib, 2),
                    triggered_rules_count=matching_rules_cnt,
                )
            )

        # Round ONLY at the final stage
        final_overall_score = min(100.0, max(0.0, round(weighted_sum, 1)))

        # Risk Level Mapping:
        # 0–35 = LOW
        # 36–50 = MEDIUM
        # 51–75 = HIGH
        # 76–100 = CRITICAL
        if final_overall_score >= 76.0:
            overall_level = "CRITICAL"
        elif final_overall_score >= 51.0:
            overall_level = "HIGH"
        elif final_overall_score >= 36.0:
            overall_level = "MEDIUM"
        else:
            overall_level = "LOW"

        # Generate Actionable Recommendations
        for rule in all_triggered_rules:
            if rule.recommendation and rule.recommendation not in recommendations:
                recommendations.append(rule.recommendation)

        logger.info(
            f"Evidence risk evaluation complete for '{document_id}': Overall Score={final_overall_score} ({overall_level}), "
            f"Triggered Rules={len(all_triggered_rules)}, Grounded Evidence Items={len(all_evidence)}"
        )

        return EvidenceRiskAnalysisReport(
            success=True,
            document_id=document_id,
            user_id=user_id,
            filename=filename,
            overall_score=final_overall_score,
            overall_level=overall_level,
            category_scores=category_scores,
            category_breakdown=category_breakdowns,
            triggered_rules=all_triggered_rules,
            evidence=all_evidence,
            recommendations=recommendations,
        )

    # ------------------- CATEGORY EVALUATORS -------------------

    # 1. LIABILITY
    def _eval_liability(self, fact) -> Tuple[float, List[TriggeredRiskRule]]:
        rules = []
        score = 0.0
        ev = fact.evidence

        # Rule: NO EVIDENCE -> NO FINDING -> NO RISK POINTS
        if not ev or not ev.is_valid_finding:
            return 0.0, []

        if fact.unlimited_liability or fact.liability_cap_present is False:
            rules.append(
                TriggeredRiskRule(
                    rule_id="LIABILITY_UNLIMITED",
                    category="LIABILITY",
                    severity="CRITICAL",
                    score_points=60.0,
                    finding="Uncapped Monetary Liability Exposure: Contract contains unlimited monetary damage exposure.",
                    evidence_text=ev.evidence_text,
                    page=ev.page,
                    chunk_id=ev.chunk_id,
                    start_char=ev.start_char,
                    end_char=ev.end_char,
                    confidence=ev.confidence,
                    recommendation="Negotiate a mutual liability cap (e.g., equal to 12 months of fees paid).",
                )
            )
            score += 60.0
        elif fact.liability_cap_present is True and not fact.unlimited_liability:
            # Liability cap present provides protection, zero score added for cap rule
            score = 0.0

        if fact.consequential_damages_waived is False and (fact.unlimited_liability or "consequential" in ev.evidence_text.lower()):
            rules.append(
                TriggeredRiskRule(
                    rule_id="LIABILITY_CONSEQUENTIAL_NOT_WAIVED",
                    category="LIABILITY",
                    severity="HIGH",
                    score_points=30.0,
                    finding="Consequential Damages Unrestricted: Allows claims for indirect or lost profit damages.",
                    evidence_text=ev.evidence_text,
                    page=ev.page,
                    chunk_id=ev.chunk_id,
                    start_char=ev.start_char,
                    end_char=ev.end_char,
                    confidence=ev.confidence,
                    recommendation="Insert a mutual waiver of indirect, consequential, and punitive damages.",
                )
            )
            score += 30.0

        return min(100.0, score), rules

    # 2. INDEMNIFICATION
    def _eval_indemnification(self, fact) -> Tuple[float, List[TriggeredRiskRule]]:
        rules = []
        score = 0.0
        ev = fact.evidence

        if not ev or not ev.is_valid_finding:
            return 0.0, []

        if fact.uncapped_indemnity or fact.indemnity_present:
            if fact.uncapped_indemnity:
                rules.append(
                    TriggeredRiskRule(
                        rule_id="INDEMNITY_UNCAPPED",
                        category="INDEMNIFICATION",
                        severity="CRITICAL",
                        score_points=65.0,
                        finding="Uncapped Indemnification Obligations: Indemnity is not subject to liability cap.",
                        evidence_text=ev.evidence_text,
                        page=ev.page,
                        chunk_id=ev.chunk_id,
                        start_char=ev.start_char,
                        end_char=ev.end_char,
                        confidence=ev.confidence,
                        recommendation="Cap indemnity obligations or restrict to third-party gross negligence claims.",
                    )
                )
                score += 65.0

            if fact.defense_control_provisions:
                rules.append(
                    TriggeredRiskRule(
                        rule_id="INDEMNITY_DUTY_TO_DEFEND",
                        category="INDEMNIFICATION",
                        severity="MEDIUM",
                        score_points=25.0,
                        finding="Unilateral Duty to Defend: Obligates party to assume defense costs for third-party lawsuits.",
                        evidence_text=ev.evidence_text,
                        page=ev.page,
                        chunk_id=ev.chunk_id,
                        start_char=ev.start_char,
                        end_char=ev.end_char,
                        confidence=ev.confidence,
                        recommendation="Limit defense obligations to prevailing party fee-shifting or mutual defense.",
                    )
                )
                score += 25.0

        return min(100.0, score), rules

    # 3. TERMINATION
    def _eval_termination(self, fact) -> Tuple[float, List[TriggeredRiskRule]]:
        rules = []
        score = 0.0
        ev = fact.evidence

        if not ev or not ev.is_valid_finding:
            return 0.0, []

        if fact.immediate_termination:
            rules.append(
                TriggeredRiskRule(
                    rule_id="TERMINATION_IMMEDIATE",
                    category="TERMINATION",
                    severity="HIGH",
                    score_points=50.0,
                    finding="Immediate Termination without Notice/Cure: Contract can be cancelled immediately without cure period.",
                    evidence_text=ev.evidence_text,
                    page=ev.page,
                    chunk_id=ev.chunk_id,
                    start_char=ev.start_char,
                    end_char=ev.end_char,
                    confidence=ev.confidence,
                    recommendation="Require a mandatory 15-to-30 day written cure notice period.",
                )
            )
            score += 50.0

        if fact.automatic_renewal:
            rules.append(
                TriggeredRiskRule(
                    rule_id="TERMINATION_AUTO_RENEWAL_TRAP",
                    category="TERMINATION",
                    severity="MEDIUM",
                    score_points=30.0,
                    finding="Automatic Renewal Trap: Contract auto-renews unless written notice is delivered in advance.",
                    evidence_text=ev.evidence_text,
                    page=ev.page,
                    chunk_id=ev.chunk_id,
                    start_char=ev.start_char,
                    end_char=ev.end_char,
                    confidence=ev.confidence,
                    recommendation="Set calendar alerts 60 days prior to term expiration for non-renewal notice.",
                )
            )
            score += 30.0

        return min(100.0, score), rules

    # 4. PAYMENT
    def _eval_payment(self, fact) -> Tuple[float, List[TriggeredRiskRule]]:
        rules = []
        score = 0.0
        ev = fact.evidence

        if not ev or not ev.is_valid_finding:
            return 0.0, []

        if fact.interest_rate or fact.late_payment_fee_present:
            rules.append(
                TriggeredRiskRule(
                    rule_id="PAYMENT_EXCESSIVE_LATE_FEE",
                    category="PAYMENT",
                    severity="MEDIUM",
                    score_points=40.0,
                    finding="Excessive Late Payment Fee / Interest Penalty.",
                    evidence_text=ev.evidence_text,
                    page=ev.page,
                    chunk_id=ev.chunk_id,
                    start_char=ev.start_char,
                    end_char=ev.end_char,
                    confidence=ev.confidence,
                    recommendation="Cap late payment interest at maximum 1.0% per month or statutory rate.",
                )
            )
            score += 40.0

        return min(100.0, score), rules

    # 5. CONFIDENTIALITY
    def _eval_confidentiality(self, fact) -> Tuple[float, List[TriggeredRiskRule]]:
        rules = []
        score = 0.0
        ev = fact.evidence

        if not ev or not ev.is_valid_finding:
            return 0.0, []

        if fact.nature == "unilateral":
            rules.append(
                TriggeredRiskRule(
                    rule_id="CONFIDENTIALITY_UNILATERAL",
                    category="CONFIDENTIALITY",
                    severity="MEDIUM",
                    score_points=35.0,
                    finding="Unilateral Non-Disclosure Covenant: Secrecy obligations apply to one party only.",
                    evidence_text=ev.evidence_text,
                    page=ev.page,
                    chunk_id=ev.chunk_id,
                    start_char=ev.start_char,
                    end_char=ev.end_char,
                    confidence=ev.confidence,
                    recommendation="Make confidentiality covenants mutual to protect both parties' proprietary data.",
                )
            )
            score += 35.0

        return min(100.0, score), rules

    # 6. INTELLECTUAL PROPERTY
    def _eval_ip(self, fact) -> Tuple[float, List[TriggeredRiskRule]]:
        rules = []
        score = 0.0
        ev = fact.evidence

        if not ev or not ev.is_valid_finding:
            return 0.0, []

        if fact.assignment:
            rules.append(
                TriggeredRiskRule(
                    rule_id="IP_UNILATERAL_ASSIGNMENT",
                    category="INTELLECTUAL PROPERTY",
                    severity="MEDIUM",
                    score_points=40.0,
                    finding="Broad IP Assignment of Rights.",
                    evidence_text=ev.evidence_text,
                    page=ev.page,
                    chunk_id=ev.chunk_id,
                    start_char=ev.start_char,
                    end_char=ev.end_char,
                    confidence=ev.confidence,
                    recommendation="Ensure pre-existing background IP is explicitly carved out from assignment.",
                )
            )
            score += 40.0

        return min(100.0, score), rules

    # 7. DATA PROTECTION
    def _eval_data_protection(self, fact) -> Tuple[float, List[TriggeredRiskRule]]:
        rules = []
        score = 0.0
        ev = fact.evidence

        if not ev or not ev.is_valid_finding:
            return 0.0, []

        if fact.personal_data_processing:
            if not fact.breach_notification_timeframe:
                rules.append(
                    TriggeredRiskRule(
                        rule_id="DATA_NO_BREACH_NOTICE",
                        category="DATA PROTECTION",
                        severity="HIGH",
                        score_points=45.0,
                        finding="Missing Security Breach Notification Timeframe under DPDP Act 2023.",
                        evidence_text=ev.evidence_text,
                        page=ev.page,
                        chunk_id=ev.chunk_id,
                        start_char=ev.start_char,
                        end_char=ev.end_char,
                        confidence=ev.confidence,
                        recommendation="Mandate 72-hour written notice for any data security breach.",
                    )
                )
                score += 45.0

        return min(100.0, score), rules

    # 8. GOVERNING LAW / DISPUTE
    def _eval_governing_law(self, fact) -> Tuple[float, List[TriggeredRiskRule]]:
        rules = []
        score = 0.0
        ev = fact.evidence

        if not ev or not ev.is_valid_finding:
            return 0.0, []

        if fact.arbitration_clause_present:
            rules.append(
                TriggeredRiskRule(
                    rule_id="DISPUTE_BINDING_ARBITRATION",
                    category="GOVERNING LAW / DISPUTE",
                    severity="LOW",
                    score_points=25.0,
                    finding="Mandatory Binding Arbitration Clause.",
                    evidence_text=ev.evidence_text,
                    page=ev.page,
                    chunk_id=ev.chunk_id,
                    start_char=ev.start_char,
                    end_char=ev.end_char,
                    confidence=ev.confidence,
                    recommendation="Ensure arbitration venue is convenient and prevailing party fee-shifting applies.",
                )
            )
            score += 25.0

        return min(100.0, score), rules

    # 9. NON-COMPETE / RESTRICTIONS
    def _eval_non_compete(self, fact) -> Tuple[float, List[TriggeredRiskRule]]:
        rules = []
        score = 0.0
        ev = fact.evidence

        if not ev or not ev.is_valid_finding:
            return 0.0, []

        if fact.non_compete_present:
            rules.append(
                TriggeredRiskRule(
                    rule_id="NON_COMPETE_RESTRICTIVE",
                    category="NON-COMPETE / RESTRICTIONS",
                    severity="HIGH",
                    score_points=55.0,
                    finding="Restrictive Post-Termination Non-Compete Covenant.",
                    evidence_text=ev.evidence_text,
                    page=ev.page,
                    chunk_id=ev.chunk_id,
                    start_char=ev.start_char,
                    end_char=ev.end_char,
                    confidence=ev.confidence,
                    recommendation="Narrow duration, geographic scope, and competitive business definition.",
                )
            )
            score += 55.0

        return min(100.0, score), rules


evidence_risk_engine_service = EvidenceRiskEngineService()
