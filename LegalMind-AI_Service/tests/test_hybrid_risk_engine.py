"""
Unit & Integration Test Suite for Hybrid Legal Risk Engine (Phase 4).

Tests:
1. Low-risk document evaluation
2. High-risk document evaluation
3. Document containing uncapped liability
4. Document containing immediate termination
5. Document with no obvious risk
6. Malformed document handling
7. ML unavailable fallback evaluation
"""
import unittest
from unittest.mock import patch
from app.services.risk_service import risk_service
from app.schemas.risk import RiskAnalysisRequest
from app.services.clause_service import clause_service

LOW_RISK_DOC = """
CONFIDENTIALITY AND SERVICES AGREEMENT
1. Confidentiality: Each party shall maintain all proprietary information in strict confidence for 3 years.
2. Governing Law: This Agreement shall be governed by the laws of the State of Delaware.
3. Limitation of Liability: Total aggregate liability under this Agreement shall be limited to total fees paid in the preceding 12 months.
4. Termination: Either party may terminate this agreement upon 30 days prior written notice.
"""

HIGH_RISK_DOC = """
SERVICES AND INDEMNIFICATION AGREEMENT
1. Uncapped Liability: Neither party's liability under this Agreement shall be capped or limited in any manner whatsoever.
2. Immediate Termination: Counterparty reserves the right to terminate this contract immediately at any time without notice and without cause.
3. Indemnification: Client shall defend, indemnify, and hold harmless Service Provider against any and all claims without limitation.
4. Late Payment Interest: Late payments shall accrue interest at 2.5% per month non-refundable.
"""

UNCAPPED_LIABILITY_DOC = """
LIABILITY AGREEMENT
Section 4. Limitation of Liability: The Customer agrees that Service Provider's liability shall be uncapped and without limitation for any indirect, consequential, or general damages.
"""

IMMEDIATE_TERMINATION_DOC = """
TERMINATION CLAUSE
Section 8. Termination: Either party may terminate this Agreement immediately without cause and without prior notice.
"""

CLEAN_SAFE_DOC = """
MUTUAL NON-DISCLOSURE AGREEMENT
1. Purpose: The parties wish to explore a business opportunity.
2. Confidentiality: Recipient agrees to protect Discloser's confidential information using reasonable care for a period of 5 years.
3. Limitation of Liability: Aggregate liability under this Agreement is capped at $50,000 USD.
4. Governing Law: Governed by laws of Delaware.
5. Term: This Agreement expires in 2 years.
6. Force Majeure: Neither party shall be liable for delay caused by natural disasters or acts of God.
"""


class TestHybridRiskEngine(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.service = risk_service

    async def test_1_low_risk_document_evaluation(self):
        req = RiskAnalysisRequest(text=LOW_RISK_DOC)
        res = await self.service.analyze_risk(req)
        self.assertTrue(res.success)
        self.assertEqual(res.overall_risk_category, "Low")
        self.assertLessEqual(res.overall_risk_score, 25.0)

    async def test_2_high_risk_document_evaluation(self):
        req = RiskAnalysisRequest(text=HIGH_RISK_DOC)
        res = await self.service.analyze_risk(req)
        self.assertTrue(res.success)
        self.assertIn(res.overall_risk_category, ["High", "Critical"])
        self.assertGreaterEqual(res.overall_risk_score, 50.0)

        # Check required schema fields on every risk item
        for r in res.found_risks:
            self.assertIsNotNone(r.category)
            self.assertIsNotNone(r.severity)
            self.assertIsNotNone(r.score)
            self.assertIsNotNone(r.evidence)
            self.assertIsNotNone(r.page)
            self.assertIn(r.source, ["rule", "ml", "hybrid"])

    async def test_3_uncapped_liability_detection(self):
        req = RiskAnalysisRequest(text=UNCAPPED_LIABILITY_DOC)
        res = await self.service.analyze_risk(req)
        self.assertTrue(res.success)

        uncapped_risks = [r for r in res.found_risks if "Uncapped Liability" in r.reason or r.severity == "Critical"]
        self.assertGreater(len(uncapped_risks), 0)
        self.assertEqual(uncapped_risks[0].score, 25.0)

    async def test_4_immediate_termination_detection(self):
        req = RiskAnalysisRequest(text=IMMEDIATE_TERMINATION_DOC)
        res = await self.service.analyze_risk(req)
        self.assertTrue(res.success)

        term_risks = [r for r in res.found_risks if "Termination" in r.factor or r.severity == "Critical"]
        self.assertGreater(len(term_risks), 0)

    async def test_5_clean_document_no_obvious_risk(self):
        req = RiskAnalysisRequest(text=CLEAN_SAFE_DOC)
        res = await self.service.analyze_risk(req)
        self.assertTrue(res.success)
        self.assertEqual(res.overall_risk_category, "Low")
        self.assertEqual(len(res.missing_protections), 0)

    async def test_6_malformed_document_handling(self):
        req_empty = RiskAnalysisRequest(text="")
        res_empty = await self.service.analyze_risk(req_empty)
        self.assertTrue(res_empty.success)
        self.assertEqual(res_empty.overall_risk_score, 0.0)

        req_whitespace = RiskAnalysisRequest(text="   \n\t  ")
        res_ws = await self.service.analyze_risk(req_whitespace)
        self.assertTrue(res_ws.success)
        self.assertEqual(res_ws.overall_risk_score, 0.0)

    async def test_7_ml_unavailable_fallback_evaluation(self):
        with patch.object(clause_service, "extract_clauses", side_effect=RuntimeError("ML engine offline")):
            req = RiskAnalysisRequest(text=HIGH_RISK_DOC)
            res = await self.service.analyze_risk(req)
            self.assertTrue(res.success)
            self.assertIsInstance(res.found_risks, list)
            for r in res.found_risks:
                self.assertEqual(r.source, "rule")


if __name__ == "__main__":
    unittest.main()
