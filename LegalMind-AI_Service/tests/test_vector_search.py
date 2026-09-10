import unittest
from app.schemas.embeddings import (
    EmbeddingRequest,
    DocumentIndexRequest,
    VectorSearchRequest,
)
from app.services.embedding_service import embedding_service
from app.services.vector_db_service import vector_db_service


class TestVectorSearchAndEmbeddings(unittest.IsolatedAsyncioTestCase):

    async def test_generate_embeddings(self):
        req = EmbeddingRequest(texts=["This is a test legal contract clause."])
        res = await embedding_service.generate_embeddings(req)

        self.assertTrue(res.success)
        self.assertEqual(res.dimensions, 384)
        self.assertEqual(len(res.embeddings), 1)
        self.assertEqual(len(res.embeddings[0].embedding), 384)

    async def test_document_indexing_and_vector_search_pipeline(self):
        sample_contract = (
            "SECTION 1. CONFIDENTIALITY AND NON-DISCLOSURE.\n"
            "Both parties covenant that all technical information and proprietary trade secrets shared hereunder shall be kept strictly confidential.\n\n"
            "SECTION 2. LIMITATION OF LIABILITY.\n"
            "Neither party shall be liable for indirect, incidental, or consequential damages. Total aggregate liability is capped at $50,000 USD.\n\n"
            "SECTION 3. TERMINATION.\n"
            "Either party may terminate this agreement upon 30 days prior written notice."
        )

        user_id = "test_user_101"
        doc_id = "test_doc_alpha"

        # 1. Index Document
        idx_req = DocumentIndexRequest(
            user_id=user_id,
            doc_id=doc_id,
            raw_text=sample_contract,
            chunk_size=100,
            chunk_overlap=10,
        )
        idx_res = await vector_db_service.index_document(idx_req)

        self.assertTrue(idx_res.success)
        self.assertEqual(idx_res.doc_id, doc_id)
        self.assertEqual(idx_res.user_id, user_id)
        self.assertGreater(idx_res.total_chunks, 0)
        self.assertEqual(idx_res.dimensions, 384)

        # 2. Vector Similarity Search for "liability cap"
        search_req = VectorSearchRequest(
            user_id=user_id,
            doc_id=doc_id,
            query="What is the total aggregate liability cap?",
            top_k=2,
        )
        search_res = await vector_db_service.search_vectors(search_req)

        self.assertTrue(search_res.success)
        self.assertGreater(search_res.total_results, 0)

        top_match = search_res.results[0]
        self.assertEqual(top_match.user_id, user_id)
        self.assertEqual(top_match.doc_id, doc_id)
        self.assertGreaterEqual(top_match.vector_ref, 0)
        self.assertIn("LIABILITY", top_match.text.upper())

    async def test_user_and_document_isolation(self):
        # User A indexes Document A about IP Rights
        idx_a = DocumentIndexRequest(
            user_id="user_A",
            doc_id="doc_A",
            raw_text="Intellectual property rights and patents belong exclusively to Party A.",
        )
        await vector_db_service.index_document(idx_a)

        # User B indexes Document B about Payment Terms
        idx_b = DocumentIndexRequest(
            user_id="user_B",
            doc_id="doc_B",
            raw_text="Payment of $100,000 USD is due on the 1st of every month.",
        )
        await vector_db_service.index_document(idx_b)

        # User A searches User A's index -> Should find IP Rights, NOT User B's Payment Terms
        search_a = VectorSearchRequest(user_id="user_A", doc_id="doc_A", query="patents and IP rights")
        res_a = await vector_db_service.search_vectors(search_a)

        self.assertTrue(res_a.success)
        self.assertEqual(len(res_a.results), 1)
        self.assertEqual(res_a.results[0].doc_id, "doc_A")
        self.assertEqual(res_a.results[0].user_id, "user_A")
        self.assertIn("Intellectual property", res_a.results[0].text)

        # User A searching User B's non-existent doc -> Should return 0 results
        search_cross = VectorSearchRequest(user_id="user_A", doc_id="doc_B", query="patents")
        res_cross = await vector_db_service.search_vectors(search_cross)
        self.assertEqual(len(res_cross.results), 0)


if __name__ == "__main__":
    unittest.main()
