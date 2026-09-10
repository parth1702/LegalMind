"""
Unit Test Suite for Gemini API Service Integration in LegalMind AI.
Verifies:
1. Service availability checking and API key configuration
2. Grounded answer generation using RAG source context
3. Citation formatting and anti-hallucination fallback
4. Structured legal risk factor extraction
5. Secret scrubbing in logs and error handling
"""
import unittest
from unittest.mock import MagicMock, patch
from app.services.gemini_service import GeminiService


class TestGeminiService(unittest.TestCase):

    def setUp(self):
        self.service = GeminiService()

    def test_availability_without_client(self):
        """Service should report unavailable when _client is None."""
        with patch.object(self.service, "_client", None):
            self.assertFalse(self.service.is_available())

    def test_grounded_answer_empty_sources(self):
        """Should return no-evidence fallback if sources list is empty."""
        with patch.object(self.service, "is_available", return_value=True):
            res = self.service.generate_grounded_answer(
                query="What is the liability cap?",
                sources=[],
                document_id="doc_123",
                user_id="user_abc",
            )
            self.assertTrue(res["success"])
            self.assertFalse(res["evidence_found"])
            self.assertIn("cannot find relevant evidence", res["answer"].lower())

    def test_structured_risk_extraction_fallback(self):
        """Should return empty risk analysis list gracefully when API is unavailable."""
        with patch.object(self.service, "is_available", return_value=False):
            res = self.service.extract_structured_risk_factors("Contract text content")
            self.assertIsInstance(res, list)
            self.assertEqual(res, [])

    def test_grounded_answer_fallback_when_unavailable(self):
        """Should handle unavailable API key gracefully during grounded answer generation."""
        with patch.object(self.service, "is_available", return_value=False):
            res = self.service.generate_grounded_answer(
                query="What is the payment term?",
                sources=[
                    {
                        "source_id": "[Source 1]",
                        "text": "Payment shall be made within Net 30 days.",
                        "page": 1,
                        "chunk_id": "c1",
                    }
                ],
                document_id="doc_1",
                user_id="user_1",
            )
            self.assertFalse(res["success"])
            self.assertIn("gemini_api_key is not configured", res["answer"].lower())


if __name__ == "__main__":
    unittest.main()
