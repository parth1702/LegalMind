import unittest
from app.schemas.summarization import (
    SummarizationRequest,
    SummarizationResponse,
    LEGAL_SUMMARIZATION_DISCLAIMER,
)
from app.services.summarization_service import summarization_service


class TestLegalSummarization(unittest.IsolatedAsyncioTestCase):

    async def test_short_document_summarization(self):
        short_contract = (
            "THIS SERVICES AGREEMENT is made this 15th day of January, 2024, by and between "
            "Acme Corp. (“Client”) and Beta Consulting LLC (“Service Provider”).\n\n"
            "1. SERVICES & FEES.\n"
            "Service Provider shall provide IT architecture services for a total monthly fee of $25,000 USD.\n\n"
            "2. CONFIDENTIALITY.\n"
            "Both parties shall maintain strict confidentiality over proprietary technical documentation.\n\n"
            "3. TERM & TERMINATION.\n"
            "This Agreement shall expire on December 31, 2025. Either party may terminate immediately for cause."
        )

        req = SummarizationRequest(text=short_contract, use_huggingface=False)
        res: SummarizationResponse = await summarization_service.summarize(req)

        self.assertTrue(res.success)
        self.assertEqual(res.disclaimer, LEGAL_SUMMARIZATION_DISCLAIMER)
        self.assertGreater(len(res.executive_summary), 10)
        self.assertIsInstance(res.key_points, list)
        self.assertIsInstance(res.parties, list)
        self.assertIsInstance(res.obligations, list)
        self.assertIsInstance(res.important_dates, list)
        self.assertIsInstance(res.potential_concerns, list)

        # Verify structured outputs
        self.assertGreater(len(res.parties), 0)
        self.assertGreater(len(res.important_dates), 0)

    async def test_long_document_map_reduce_chunking(self):
        # Construct a long legal document (~1500 words across 5 sections)
        section_text = (
            "SECTION {idx}. CONTRACT PROVISIONS & OBLIGATIONS.\n"
            "The Disclosing Party hereby agrees to disclose confidential business information to Receiving Party. "
            "Receiving Party covenants that it shall maintain confidentiality for a period of 5 years. "
            "Client shall pay Vendor an annual fee of $100,000 USD due on March 1st of each calendar year. "
            "Neither party shall be liable for indirect or consequential damages. "
            "This Agreement shall automatically renew on December 31, 2026 unless notice is given 30 days prior. "
            "Governed by the laws of the State of New York.\n\n"
        )
        long_contract = "".join(section_text.format(idx=i) for i in range(1, 15))

        req = SummarizationRequest(text=long_contract, use_huggingface=False)
        res: SummarizationResponse = await summarization_service.summarize(req)

        self.assertTrue(res.success)
        self.assertGreaterEqual(res.chunks_processed, 2)  # Verifies Map-Reduce chunking
        self.assertGreater(res.word_count, 500)
        self.assertGreater(len(res.executive_summary), 20)
        self.assertGreater(len(res.key_points), 0)
        self.assertGreater(len(res.obligations), 0)

    async def test_empty_text_summarization(self):
        req = SummarizationRequest(text="")
        res: SummarizationResponse = await summarization_service.summarize(req)

        self.assertTrue(res.success)
        self.assertEqual(res.word_count, 0)
        self.assertEqual(res.chunks_processed, 0)
        self.assertEqual(res.disclaimer, LEGAL_SUMMARIZATION_DISCLAIMER)


if __name__ == "__main__":
    unittest.main()
