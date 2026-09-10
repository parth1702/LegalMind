import unittest
from app.schemas.analysis import (
    PipelineAnalysisRequest,
    PipelineAnalysisResponse,
    LEGAL_ANALYSIS_DISCLAIMER,
)
from app.services.pipeline_service import pipeline_service


class TestCompleteLegalAnalysisPipeline(unittest.IsolatedAsyncioTestCase):

    async def test_complete_9_stage_pipeline_execution(self):
        contract_text = (
            "THIS DISTRIBUTOR AGREEMENT is made this 10th day of March, 2026, by and between "
            "TechCorp Inc. (“Company”) and Global Distribution LLC (“Distributor”).\n\n"
            "1. GRANT & EXCLUSIVITY.\n"
            "Company hereby appoints Distributor as exclusive distributor for the territory of North America.\n\n"
            "2. CONFIDENTIALITY.\n"
            "Both parties shall maintain strict confidentiality over proprietary technical documentation for 5 years.\n\n"
            "3. UNCAPPED LIABILITY & INDEMNIFICATION.\n"
            "Distributor agrees to indemnify Company against third-party claims. Party liability under this agreement shall be uncapped.\n\n"
            "4. TERMINATION.\n"
            "Company reserves the right to terminate this contract immediately for convenience without cause.\n\n"
            "5. GOVERNING LAW.\n"
            "This Agreement is governed by the laws of the State of Delaware."
        )

        req = PipelineAnalysisRequest(
            user_id="user_pipeline_test_100",
            doc_id="doc_pipeline_alpha",
            raw_text=contract_text,
            filename="commercial_agreement.pdf",
            jurisdiction="US",
        )

        res: PipelineAnalysisResponse = await pipeline_service.execute_full_pipeline(req)

        # 1. Pipeline Status & Metrics Verification
        self.assertTrue(res.success)
        self.assertEqual(res.status, "completed")
        self.assertEqual(res.doc_id, "doc_pipeline_alpha")
        self.assertEqual(res.user_id, "user_pipeline_test_100")
        self.assertGreater(res.metrics.total_pipeline_ms, 0.0)

        # 2. Stage Extraction Results Verification
        self.assertIsNotNone(res.preprocessing)
        self.assertIsNotNone(res.ner)
        self.assertIsNotNone(res.clauses)
        self.assertIsNotNone(res.summarization)
        self.assertIsNotNone(res.risk_analysis)
        self.assertIsNotNone(res.faiss_indexing)

        # 3. High-Level Metrics Verification
        self.assertGreater(res.total_clauses_extracted, 0)
        self.assertGreater(res.total_entities_extracted, 0)
        self.assertGreater(res.total_chunks_indexed, 0)
        self.assertIn(res.overall_risk_category, ["High", "Critical"])
        self.assertGreaterEqual(res.overall_risk_score, 50.0)

        # 4. Disclaimer Verification
        self.assertEqual(res.disclaimer, LEGAL_ANALYSIS_DISCLAIMER)

    async def test_empty_document_error_handling(self):
        req = PipelineAnalysisRequest(
            user_id="user_test",
            doc_id="doc_empty",
            raw_text="",
            filename="empty.txt",
        )

        res: PipelineAnalysisResponse = await pipeline_service.execute_full_pipeline(req)

        self.assertFalse(res.success)
        self.assertEqual(res.status, "failed")
        self.assertIsNotNone(res.error_message)
        self.assertIn("readable text", res.error_message.lower())


if __name__ == "__main__":
    unittest.main()
