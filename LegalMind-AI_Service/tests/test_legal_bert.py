"""
Unit & Integration Test Suite for Legal-BERT Microservice Component.

Tests:
1. Normal legal document clause text
2. Empty text input
3. Very short text snippet
4. Long text truncation (> 1000 words)
5. Fallback behavior when model is unavailable
6. Invalid input handling
7. Repeated classification requests
8. Integration boundary with clause_service.py
"""
import unittest
from unittest.mock import patch
from app.services.legal_bert_service import legal_bert_service, LegalBertService
from app.services.clause_service import clause_service
from app.schemas.clause import ClauseExtractionRequest


class TestLegalBertService(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.service = legal_bert_service

    def test_1_normal_legal_document_clause(self):
        text = "Either party may terminate this Master Services Agreement upon 30 days prior written notice for material breach."
        res = self.service.classify_clause(text)

        self.assertIn("label", res)
        self.assertIn("confidence", res)
        self.assertIn("model", res)
        self.assertIn("available", res)

        if res["available"]:
            self.assertEqual(res["label"], "Termination")
            self.assertGreaterEqual(res["confidence"], 0.50)

    def test_2_empty_text(self):
        res = self.service.classify_clause("")
        self.assertEqual(res["confidence"], 0.0)
        self.assertEqual(res["label"], "General")

    def test_3_very_short_text(self):
        res = self.service.classify_clause("Payment terms.")
        self.assertIn("label", res)
        self.assertGreaterEqual(res["confidence"], 0.0)

    def test_4_long_text_truncation(self):
        long_clause = ("Section 14.2 Limitation of Liability. In no event shall either party be liable for any indirect, "
                       "incidental, consequential, special, or punitive damages arising out of or in connection with this agreement. ") * 50
        res = self.service.classify_clause(long_clause)
        self.assertIn("label", res)
        if res["available"]:
            self.assertEqual(res["label"], "Liability")

    def test_5_model_unavailable_fallback(self):
        with patch.object(self.service, 'is_available', return_value=False):
            res = self.service.classify_clause("This contract is governed by the laws of the State of Delaware.")
            self.assertFalse(res["available"])
            self.assertEqual(res["label"], "Unknown")
            self.assertEqual(res["confidence"], 0.0)

    def test_6_invalid_input(self):
        res = self.service.classify_clause(None)
        self.assertEqual(res["confidence"], 0.0)
        self.assertEqual(res["label"], "General")

    def test_7_repeated_requests(self):
        text = "The Receiving Party shall maintain confidentiality of Disclosing Party's Proprietary Information."
        res1 = self.service.classify_clause(text)
        res2 = self.service.classify_clause(text)

        self.assertEqual(res1["label"], res2["label"])
        self.assertEqual(res1["confidence"], res2["confidence"])

    async def test_8_clause_service_hybrid_integration(self):
        req = ClauseExtractionRequest(
            text="Section 14.2 Liability Cap. Uncapped liability exposure waiving consequential damages recovery."
        )
        res = await clause_service.extract_clauses(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_clauses, 0)
        top_clause = res.clauses[0]
        self.assertEqual(top_clause.category, "Liability")
        self.assertGreaterEqual(top_clause.confidence, 0.85)


if __name__ == "__main__":
    unittest.main()
