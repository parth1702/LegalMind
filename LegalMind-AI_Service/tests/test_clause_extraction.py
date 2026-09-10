import unittest
from app.schemas.clause import ClauseExtractionRequest, ClauseExtractionResponse, LEGAL_DISCLAIMER_TEXT
from app.services.clause_service import clause_service


class TestClauseExtraction(unittest.IsolatedAsyncioTestCase):

    async def test_clause_extraction_all_categories(self):
        contract_text = (
            "SECTION 1. CONFIDENTIALITY.\n"
            "Each party agrees to maintain in strict confidence all proprietary trade secrets and confidential information disclosed hereunder.\n\n"
            "SECTION 2. PAYMENT TERMS.\n"
            "Company shall pay Consultant a fee of $10,000 USD per month. Invoices shall be due and payable within 30 days.\n\n"
            "SECTION 3. TERMINATION.\n"
            "Either party may terminate this Agreement for convenience at any time upon 30 days written notice to the other party.\n\n"
            "SECTION 4. INDEMNIFICATION.\n"
            "Consultant agrees to indemnify, defend, and hold harmless Company from and against any third-party claims or liabilities.\n\n"
            "SECTION 5. LIMITATION OF LIABILITY.\n"
            "In no event shall either party's aggregate liability exceed the total fees paid. Neither party shall be liable for indirect or consequential damages.\n\n"
            "SECTION 6. RENEWAL TERM.\n"
            "This Agreement shall automatically renew for successive 1-year terms unless notice of non-renewal is provided 60 days prior.\n\n"
            "SECTION 7. DISPUTE RESOLUTION.\n"
            "Any dispute arising under this Agreement shall be settled by binding arbitration in accordance with AAA rules in Wilmington, Delaware.\n\n"
            "SECTION 8. GOVERNING LAW.\n"
            "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware.\n\n"
            "SECTION 9. OBLIGATIONS & COMPLIANCE.\n"
            "Consultant covenants and agrees that it shall maintain all required licenses and perform duties in compliance with applicable law."
        )

        req = ClauseExtractionRequest(text=contract_text)
        res: ClauseExtractionResponse = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertEqual(res.disclaimer, LEGAL_DISCLAIMER_TEXT)
        self.assertGreaterEqual(res.total_clauses, 9)
        self.assertEqual(len(res.clauses), res.total_clauses)
        self.assertIsInstance(res.summary, dict)

        categories_found = set(res.summary.keys())
        expected_categories = {
            "Termination",
            "Payment",
            "Confidentiality",
            "Liability",
            "Indemnity",
            "Obligations",
            "Renewal",
            "Dispute Resolution",
            "Governing Law",
        }

        self.assertTrue(expected_categories.issubset(categories_found))

        sample_clause = res.clauses[0]
        self.assertTrue(hasattr(sample_clause, "clause_id"))
        self.assertTrue(hasattr(sample_clause, "category"))
        self.assertTrue(hasattr(sample_clause, "title"))
        self.assertTrue(hasattr(sample_clause, "text"))
        self.assertTrue(hasattr(sample_clause, "location"))
        self.assertGreater(sample_clause.location.paragraph, 0)
        self.assertGreaterEqual(sample_clause.location.start_char, 0)
        self.assertGreater(sample_clause.location.end_char, sample_clause.location.start_char)
        self.assertTrue(hasattr(sample_clause, "importance"))
        self.assertTrue(hasattr(sample_clause, "is_risk_candidate"))
        self.assertTrue(hasattr(sample_clause, "confidence"))

    async def test_risk_candidate_detection(self):
        risky_contract = (
            "SECTION 1. UNCAPPED LIABILITY.\n"
            "Party A agrees that its liability under this agreement shall be uncapped and without limitation for any and all claims.\n\n"
            "SECTION 2. UNILATERAL TERMINATION.\n"
            "Company reserves the right to terminate this contract immediately for convenience without cause."
        )

        req = ClauseExtractionRequest(text=risky_contract)
        res: ClauseExtractionResponse = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        risk_clauses = [c for c in res.clauses if c.is_risk_candidate]

        self.assertGreaterEqual(len(risk_clauses), 2)
        for rc in risk_clauses:
            self.assertIsNotNone(rc.risk_reason)
            self.assertGreater(len(rc.risk_reason), 5)

    async def test_category_filtering(self):
        contract_text = (
            "Party A agrees to pay $5,000 USD monthly fee.\n\n"
            "Either party may terminate upon 30 days notice.\n\n"
            "Governed by laws of California."
        )

        req = ClauseExtractionRequest(text=contract_text, categories=["Payment"])
        res: ClauseExtractionResponse = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        for clause in res.clauses:
            self.assertEqual(clause.category, "Payment")

    async def test_empty_contract_text(self):
        req = ClauseExtractionRequest(text="")
        res: ClauseExtractionResponse = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertEqual(res.total_clauses, 0)
        self.assertEqual(res.clauses, [])
        self.assertEqual(res.disclaimer, LEGAL_DISCLAIMER_TEXT)


if __name__ == "__main__":
    unittest.main()

