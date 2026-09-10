"""
Unit & Integration Test Suite for Hybrid ML + Rule Clause Extraction (Phase 2).

Tests:
1. Termination clause extraction & metadata payload
2. Confidentiality clause extraction
3. Liability clause extraction & risk tagging
4. Payment & Compensation clause extraction
5. Intellectual Property & Non-Compete clause extraction
6. Unrelated paragraph (skipped / low confidence)
7. Ambiguous clause resolution
8. Fallback behavior when Legal-BERT is offline
"""
import unittest
from unittest.mock import patch
from app.services.clause_service import clause_service
from app.services.legal_bert_service import legal_bert_service
from app.schemas.clause import ClauseExtractionRequest


class TestHybridClauseExtraction(unittest.IsolatedAsyncioTestCase):

    async def test_1_termination_clause(self):
        text = "Either party may terminate this agreement upon thirty (30) days prior written notice for convenience or material breach."
        req = ClauseExtractionRequest(text=text)
        res = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_clauses, 0)
        c0 = res.clauses[0]
        self.assertEqual(c0.category, "Termination")
        self.assertIn("rule_match", c0.metadata)
        self.assertIn("ml_label", c0.metadata)
        self.assertIn("final_label", c0.metadata)
        self.assertIn("evidence", c0.metadata)

    async def test_2_confidentiality_clause(self):
        text = "The Receiving Party agrees to protect all Confidential Information with the same degree of care it uses for its own trade secrets."
        req = ClauseExtractionRequest(text=text)
        res = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_clauses, 0)
        c0 = res.clauses[0]
        self.assertEqual(c0.category, "Confidentiality")
        self.assertTrue(c0.metadata["rule_match"])

    async def test_3_liability_clause(self):
        text = "In no event shall either party's aggregate liability under this agreement exceed the total fees paid in the 12 months preceding the claim. Uncapped liability waived."
        req = ClauseExtractionRequest(text=text)
        res = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_clauses, 0)
        c0 = res.clauses[0]
        self.assertEqual(c0.category, "Liability")
        self.assertTrue(c0.is_risk_candidate)

    async def test_4_payment_and_compensation(self):
        text = "Client shall pay all undisputed invoices within net 30 days of receipt. Executive base salary compensation shall be payable monthly."
        req = ClauseExtractionRequest(text=text)
        res = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_clauses, 0)
        categories = [c.category for c in res.clauses]
        self.assertTrue("Payment" in categories or "Compensation" in categories)

    async def test_5_ip_and_non_compete(self):
        text = "All intellectual property and work made for hire shall be assigned to Company. Employee shall not engage in any competing business or non-compete restraint for 12 months."
        req = ClauseExtractionRequest(text=text)
        res = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_clauses, 0)
        categories = [c.category for c in res.clauses]
        self.assertTrue("Intellectual Property" in categories or "Non-Compete" in categories)

    async def test_6_unrelated_paragraph(self):
        text = "The quick brown fox jumps over the lazy dog. Today is a sunny morning for a walk in the park."
        req = ClauseExtractionRequest(text=text)
        res = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertEqual(res.total_clauses, 0)

    async def test_7_ambiguous_clause(self):
        text = "Notice of dispute shall be delivered in writing prior to commencing litigation or requesting fee reimbursement."
        req = ClauseExtractionRequest(text=text)
        res = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertGreaterEqual(res.total_clauses, 1)

    async def test_8_fallback_when_legal_bert_offline(self):
        with patch.object(legal_bert_service, 'is_available', return_value=False):
            text = "Either party may terminate this agreement upon 30 days notice."
            req = ClauseExtractionRequest(text=text)
            res = await clause_service.extract_clauses(req)

            self.assertTrue(res.success)
            self.assertGreater(res.total_clauses, 0)
            c0 = res.clauses[0]
            self.assertEqual(c0.category, "Termination")
            self.assertEqual(c0.metadata["ml_label"], "Unavailable")
            self.assertTrue(c0.metadata["rule_match"])


if __name__ == "__main__":
    unittest.main()
