import unittest
from app.schemas.risk import (
    RiskAnalysisRequest,
    RiskAnalysisResponse,
    LEGAL_RISK_DISCLAIMER,
)
from app.services.risk_service import risk_service


class TestLegalRiskAnalysis(unittest.IsolatedAsyncioTestCase):

    async def test_critical_and_high_risk_analysis(self):
        critical_contract = (
            "SECTION 1. UNCAPPED LIABILITY.\n"
            "Party A agrees that its liability under this agreement shall be uncapped and without limitation for any and all claims.\n\n"
            "SECTION 2. UNILATERAL TERMINATION.\n"
            "Company reserves the right to terminate this contract immediately for convenience without cause.\n\n"
            "SECTION 3. INDEMNIFICATION.\n"
            "Consultant agrees to indemnify and hold harmless Company against all third-party claims.\n\n"
            "SECTION 4. LATE PAYMENT PENALTY.\n"
            "Late payments shall accrue an interest rate penalty of 2% per month compounding."
        )

        req = RiskAnalysisRequest(text=critical_contract)
        res: RiskAnalysisResponse = await risk_service.analyze_risk(req)

        self.assertTrue(res.success)
        self.assertEqual(res.disclaimer, LEGAL_RISK_DISCLAIMER)
        self.assertIn(res.overall_risk_category, ["High", "Critical"])
        self.assertGreaterEqual(res.overall_risk_score, 50.0)
        self.assertGreater(len(res.found_risks), 0)

        # Verify evidence traceability for identified risks
        first_risk = res.found_risks[0]
        self.assertTrue(hasattr(first_risk, "risk_id"))
        self.assertTrue(hasattr(first_risk, "factor"))
        self.assertTrue(hasattr(first_risk, "risk_category"))
        self.assertTrue(hasattr(first_risk, "score_impact"))
        self.assertTrue(hasattr(first_risk, "reason"))
        self.assertTrue(hasattr(first_risk, "supporting_clause"))  # Document evidence
        self.assertTrue(hasattr(first_risk, "location"))
        self.assertTrue(hasattr(first_risk, "recommendation"))

        self.assertGreater(len(first_risk.supporting_clause), 5)
        self.assertGreater(len(first_risk.reason), 5)

    async def test_missing_protections_detection(self):
        bare_contract = "Party A agrees to sell 100 units of Product X to Party B for $1,000 USD."

        req = RiskAnalysisRequest(text=bare_contract)
        res: RiskAnalysisResponse = await risk_service.analyze_risk(req)

        self.assertTrue(res.success)
        self.assertGreater(len(res.missing_protections), 0)

        # Verify missing protection items in found_risks
        missing_risk_items = [r for r in res.found_risks if r.factor == "Missing Protections"]
        self.assertGreater(len(missing_risk_items), 0)

    async def test_low_risk_balanced_contract(self):
        balanced_contract = (
            "SECTION 1. CONFIDENTIALITY.\n"
            "Both parties shall maintain strict confidentiality over trade secrets for a period of 3 years.\n\n"
            "SECTION 2. LIMITATION OF LIABILITY.\n"
            "Each party's maximum aggregate liability shall be capped at total fees paid in the preceding 12 months.\n\n"
            "SECTION 3. TERMINATION.\n"
            "Either party may terminate upon 30 days written notice prior to expiration.\n\n"
            "SECTION 4. GOVERNING LAW.\n"
            "This Agreement is governed by the laws of the State of Delaware."
        )

        req = RiskAnalysisRequest(text=balanced_contract)
        res: RiskAnalysisResponse = await risk_service.analyze_risk(req)

        self.assertTrue(res.success)
        self.assertIn(res.overall_risk_category, ["Low", "Medium"])
        self.assertLess(res.overall_risk_score, 60.0)

    async def test_empty_input_text(self):
        req = RiskAnalysisRequest(text="")
        res: RiskAnalysisResponse = await risk_service.analyze_risk(req)

        self.assertTrue(res.success)
        self.assertEqual(res.overall_risk_score, 0.0)
        self.assertEqual(res.overall_risk_category, "Low")
        self.assertEqual(res.found_risks, [])
        self.assertEqual(res.disclaimer, LEGAL_RISK_DISCLAIMER)


if __name__ == "__main__":
    unittest.main()
