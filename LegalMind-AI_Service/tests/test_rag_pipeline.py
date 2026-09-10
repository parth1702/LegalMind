import unittest
from app.schemas.embeddings import DocumentIndexRequest
from app.schemas.rag import RAGQueryRequest, LEGAL_RAG_DISCLAIMER
from app.services.vector_db_service import vector_db_service
from app.services.rag_service import rag_service, NO_EVIDENCE_ANSWER


class TestLegalRAGPipeline(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        self.user_id = "rag_test_user_001"
        self.doc_id = "contract_nda_001"

        self.contract_text = (
            "SECTION 1. CONFIDENTIALITY & TRADE SECRETS.\n"
            "The Receiving Party covenants that all proprietary technical designs, source code, and customer lists "
            "disclosed hereunder shall be maintained in strict confidence for a period of 5 years from disclosure.\n\n"
            "SECTION 2. LIMITATION OF LIABILITY.\n"
            "Neither party shall be liable for indirect, punitive, or consequential damages. Maximum aggregate liability "
            "under this agreement is strictly capped at $100,000 USD.\n\n"
            "SECTION 3. GOVERNING LAW.\n"
            "This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware."
        )

        # Index test document into FAISS vector store
        idx_req = DocumentIndexRequest(
            user_id=self.user_id,
            doc_id=self.doc_id,
            raw_text=self.contract_text,
            chunk_size=100,
            chunk_overlap=10,
        )
        await vector_db_service.index_document(idx_req)

    async def test_successful_rag_query_with_sources(self):
        query_req = RAGQueryRequest(
            user_id=self.user_id,
            document_id=self.doc_id,
            query="What is the maximum monetary liability cap under this contract?",
            top_k=3,
        )

        res = await rag_service.answer_query(query_req)

        self.assertTrue(res.success)
        self.assertTrue(res.evidence_found)
        self.assertEqual(res.disclaimer, LEGAL_RAG_DISCLAIMER)
        self.assertGreater(res.confidence_score, 0.0)
        self.assertIn("[Source 1]", res.answer)
        self.assertGreater(len(res.sources), 0)

        # Verify structured source reference traceability
        first_src = res.sources[0]
        self.assertEqual(first_src.source_id, "[Source 1]")
        self.assertEqual(first_src.doc_id, self.doc_id)
        self.assertEqual(first_src.user_id, self.user_id)
        self.assertGreaterEqual(first_src.page, 1)
        self.assertGreaterEqual(first_src.chunk_id, 1)
        self.assertGreater(len(first_src.text_snippet), 10)

    async def test_no_evidence_fallback_anti_hallucination(self):
        # Query for unrelated topic not present in contract (e.g. employee stock options)
        query_req = RAGQueryRequest(
            user_id=self.user_id,
            document_id=self.doc_id,
            query="What are the vesting terms for employee stock option grants?",
            min_score=0.75,  # High threshold to simulate missing evidence
        )

        res = await rag_service.answer_query(query_req)

        self.assertTrue(res.success)
        self.assertFalse(res.evidence_found)
        self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)
        self.assertEqual(res.confidence_score, 0.0)
        self.assertEqual(res.sources, [])
        self.assertEqual(res.disclaimer, LEGAL_RAG_DISCLAIMER)

    async def test_non_existent_document_rag_query(self):
        query_req = RAGQueryRequest(
            user_id=self.user_id,
            document_id="non_existent_doc_xyz",
            query="What is the contract term length?",
        )

        res = await rag_service.answer_query(query_req)

        self.assertFalse(res.success)
        self.assertFalse(res.evidence_found)
        self.assertIn("disabled", res.answer.lower())
        self.assertEqual(res.sources, [])


if __name__ == "__main__":
    unittest.main()
