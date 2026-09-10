import unittest
from app.schemas.embeddings import DocumentIndexRequest
from app.schemas.rag import RAGQueryRequest, LEGAL_RAG_DISCLAIMER
from app.services.vector_db_service import vector_db_service
from app.services.rag_service import rag_service, NO_EVIDENCE_ANSWER


class TestFullstackChatIntegration(unittest.IsolatedAsyncioTestCase):

    async def asyncSetUp(self):
        self.user_id = "fullstack_lawyer_user_99"
        self.doc_id = "msa_contract_2026"

        self.contract_text = (
            "1. TERM AND RENEWAL.\n"
            "This Agreement shall commence on January 1, 2026 and continue for 2 years. "
            "It shall automatically renew for additional 1-year terms unless notice of non-renewal is given 60 days prior.\n\n"
            "2. PAYMENT TERMS.\n"
            "Invoices are payable within 30 days of receipt. Late payments shall accrue interest at 1.0% per month.\n\n"
            "3. INDEMNIFICATION.\n"
            "Vendor agrees to defend and indemnify Client against third-party patent infringement claims."
        )

        idx_req = DocumentIndexRequest(
            user_id=self.user_id,
            doc_id=self.doc_id,
            raw_text=self.contract_text,
            chunk_size=120,
        )
        await vector_db_service.index_document(idx_req)

    async def test_fullstack_rag_chat_execution(self):
        query_req = RAGQueryRequest(
            user_id=self.user_id,
            document_id=self.doc_id,
            query="What is the automatic renewal notice window requirement?",
            top_k=2,
        )

        res = await rag_service.answer_query(query_req)

        self.assertTrue(res.success)
        self.assertTrue(res.evidence_found)
        self.assertIn("[Source 1]", res.answer)
        self.assertGreater(len(res.sources), 0)
        self.assertEqual(res.disclaimer, LEGAL_RAG_DISCLAIMER)

    async def test_unsupported_query_anti_hallucination(self):
        query_req = RAGQueryRequest(
            user_id=self.user_id,
            document_id=self.doc_id,
            query="What are the hazardous waste disposal penalties?",
            min_score=0.70,
        )

        res = await rag_service.answer_query(query_req)

        self.assertTrue(res.success)
        self.assertFalse(res.evidence_found)
        self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)
        self.assertEqual(res.sources, [])

    async def test_empty_query_handling(self):
        query_req = RAGQueryRequest(
            user_id=self.user_id,
            document_id=self.doc_id,
            query="",
        )

        res = await rag_service.answer_query(query_req)

        self.assertTrue(res.success)
        self.assertFalse(res.evidence_found)
        self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)


if __name__ == "__main__":
    unittest.main()
