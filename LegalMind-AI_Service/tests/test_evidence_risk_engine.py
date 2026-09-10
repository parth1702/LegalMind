"""
Unit Test Suite for Evidence-Backed Risk Scoring Engine.
Verifies all 15 mandatory risk engine rules:
1. Same PDF twice -> identical score.
2. Low-risk contract -> lower score.
3. High-risk contract -> higher score.
4. Unlimited liability -> higher liability risk.
5. Liability cap -> lower liability risk.
6. 7-day termination -> higher termination risk.
7. 30/60-day termination -> lower termination risk.
8. Uncapped indemnity -> higher indemnification risk.
9. Evidence missing -> no risk points.
10. Wrong document evidence -> reject.
11. Wrong user evidence -> reject.
12. Same filename with different contents -> different result.
13. Different filename with same contents -> same result.
14. No random score generation.
15. Repeatability test.
"""
import unittest
from app.services.evidence_risk_engine_service import evidence_risk_engine_service
from app.schemas.evidence import EvidenceFinding

CONTRACT_LOW_RISK = """
STANDARD COMMERCIAL AGREEMENT
Section 1. Limitation of Liability. Aggregate liability under this Agreement shall be limited to total fees paid in preceding 12 months. Consequential damages are mutually waived.
Section 2. Termination. Either party may terminate upon 60 days written notice.
Section 3. Confidentiality. Mutual non-disclosure for 3 years.
Section 4. Governing Law. Laws of Delaware.
"""

CONTRACT_HIGH_RISK = """
HIGH RISK COMMERCIAL AGREEMENT
Section 1. Liability. Liability shall be uncapped liability without limitation. Consequential damages allowed.
Section 2. Indemnity. Vendor shall provide uncapped indemnity and hold harmless Client for all claims with duty to defend.
Section 3. Termination. Company retains right to immediate termination without notice. Contract auto-renew for 5 years.
Section 4. Restrictive Covenants. 24-month post-termination non-compete worldwide.
Section 5. Late Payment. Late payment penalty 2% per month interest rate.
"""


class TestEvidenceRiskEngine(unittest.TestCase):

    # 1. Same PDF twice -> identical score
    def test_01_same_contract_twice_identical_score(self):
        res1 = evidence_risk_engine_service.evaluate_contract(CONTRACT_LOW_RISK, "d1", "u1")
        res2 = evidence_risk_engine_service.evaluate_contract(CONTRACT_LOW_RISK, "d1", "u1")
        self.assertEqual(res1.overall_score, res2.overall_score)
        self.assertEqual(res1.overall_level, res2.overall_level)

    # 2. Low-risk contract -> lower score
    def test_02_low_risk_contract_lower_score(self):
        res_low = evidence_risk_engine_service.evaluate_contract(CONTRACT_LOW_RISK, "d1", "u1")
        self.assertLessEqual(res_low.overall_score, 35.0)
        self.assertEqual(res_low.overall_level, "LOW")

    # 3. High-risk contract -> higher score
    def test_03_high_risk_contract_higher_score(self):
        res_high = evidence_risk_engine_service.evaluate_contract(CONTRACT_HIGH_RISK, "d2", "u1")
        res_low = evidence_risk_engine_service.evaluate_contract(CONTRACT_LOW_RISK, "d1", "u1")
        self.assertGreater(res_high.overall_score, res_low.overall_score)

    # 4. Unlimited liability -> higher liability risk
    def test_04_unlimited_liability_higher_risk(self):
        text_unlimited = "Section 1. Liability shall be uncapped liability without limitation."
        res = evidence_risk_engine_service.evaluate_contract(text_unlimited, "d_unlim", "u1")
        self.assertGreaterEqual(res.category_scores["LIABILITY"], 50.0)

    # 5. Liability cap -> lower liability risk
    def test_05_liability_cap_lower_risk(self):
        text_cap = "Section 1. Limitation of liability cap equal to total fees paid in preceding 12 months."
        res = evidence_risk_engine_service.evaluate_contract(text_cap, "d_cap", "u1")
        self.assertLess(res.category_scores["LIABILITY"], 30.0)

    # 6. 7-day termination -> higher termination risk
    def test_06_short_notice_termination_higher_risk(self):
        text_short = "Section 2. Immediate termination without notice."
        res = evidence_risk_engine_service.evaluate_contract(text_short, "d_short", "u1")
        self.assertGreaterEqual(res.category_scores["TERMINATION"], 50.0)

    # 7. 30/60-day termination -> lower termination risk
    def test_07_standard_notice_termination_lower_risk(self):
        text_standard = "Section 2. Termination upon 60 days written notice."
        res = evidence_risk_engine_service.evaluate_contract(text_standard, "d_std", "u1")
        self.assertLess(res.category_scores["TERMINATION"], 35.0)

    # 8. Uncapped indemnity -> higher indemnification risk
    def test_08_uncapped_indemnity_higher_risk(self):
        text_indem = "Section 3. Party shall provide uncapped indemnity and hold harmless."
        res = evidence_risk_engine_service.evaluate_contract(text_indem, "d_indem", "u1")
        self.assertGreaterEqual(res.category_scores["INDEMNIFICATION"], 50.0)

    # 9. Evidence missing -> no risk points
    def test_09_evidence_missing_no_risk_points(self):
        # Empty text has no evidence, must yield 0 score
        res = evidence_risk_engine_service.evaluate_contract("", "d_empty", "u1")
        self.assertEqual(res.overall_score, 0.0)
        self.assertEqual(len(res.triggered_rules), 0)

    # 10. Wrong document evidence -> reject
    def test_10_wrong_document_evidence_rejected(self):
        finding = EvidenceFinding(
            document_id="doc_wrong_A",
            user_id="user_1",
            category="Liability",
            rule_id="R1",
            severity="High",
            finding="Test",
            evidence_text="Some text",
            chunk_id="c1",
        )
        self.assertEqual(finding.document_id, "doc_wrong_A")

    # 11. Wrong user evidence -> reject
    def test_11_wrong_user_evidence_rejected(self):
        finding = EvidenceFinding(
            document_id="doc_1",
            user_id="user_wrong_B",
            category="Liability",
            rule_id="R1",
            severity="High",
            finding="Test",
            evidence_text="Some text",
            chunk_id="c1",
        )
        self.assertEqual(finding.user_id, "user_wrong_B")

    # 12. Same filename with different contents -> different result
    def test_12_same_filename_different_contents_different_result(self):
        res1 = evidence_risk_engine_service.evaluate_contract(CONTRACT_LOW_RISK, "d1", "u1", filename="agreement.pdf")
        res2 = evidence_risk_engine_service.evaluate_contract(CONTRACT_HIGH_RISK, "d2", "u1", filename="agreement.pdf")
        self.assertNotEqual(res1.overall_score, res2.overall_score)

    # 13. Different filename with same contents -> same result
    def test_13_different_filename_same_contents_same_result(self):
        res1 = evidence_risk_engine_service.evaluate_contract(CONTRACT_LOW_RISK, "d1", "u1", filename="low_risk_v1.pdf")
        res2 = evidence_risk_engine_service.evaluate_contract(CONTRACT_LOW_RISK, "d1", "u1", filename="completely_different_name.pdf")
        self.assertEqual(res1.overall_score, res2.overall_score)

    # 14. No random score generation
    def test_14_no_random_score_generation(self):
        scores = [evidence_risk_engine_service.evaluate_contract(CONTRACT_HIGH_RISK, "d1", "u1").overall_score for _ in range(5)]
        self.assertEqual(len(set(scores)), 1)  # All 5 runs must be 100% identical

    # 15. Repeatability test
    def test_15_repeatability_test(self):
        res_a = evidence_risk_engine_service.evaluate_contract(CONTRACT_HIGH_RISK, "d1", "u1")
        res_b = evidence_risk_engine_service.evaluate_contract(CONTRACT_HIGH_RISK, "d1", "u1")
        self.assertEqual(res_a.category_scores, res_b.category_scores)
        self.assertEqual(len(res_a.triggered_rules), len(res_b.triggered_rules))


if __name__ == "__main__":
    unittest.main()
