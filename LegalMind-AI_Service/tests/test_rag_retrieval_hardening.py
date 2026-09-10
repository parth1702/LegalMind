"""
Unit & Integration Test Suite for RAG Retrieval Hardening (Phase 5.2).

Tests:
1. Exact duplicate chunk deduplication
2. Same chunk_id retrieved multiple times deduplication
3. Overlapping chunk deduplication (>80% overlap)
4. Legitimate adjacent chunk preservation
5. Metadata preservation (doc_id, user_id, page, chunk_id, score, text)
6. Real page metadata preservation
7. Missing page metadata fallback
8. Deterministic score sorting (score desc, start_char asc)
9. Malformed metadata item skipping
10. FAISS read error graceful fallback
"""
import unittest
from unittest.mock import patch
from app.services.vector_db_service import vector_db_service
from app.schemas.embeddings import VectorSearchResult, DocumentIndexRequest
from app.schemas.rag import RAGQueryRequest
from app.services.rag_service import rag_service, NO_EVIDENCE_ANSWER


class TestRagRetrievalHardening(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.service = vector_db_service

    def test_1_exact_duplicate_chunk_deduplication(self):
        r1 = VectorSearchResult(vector_ref=0, score=0.88, doc_id="doc1", user_id="u1", page=1, chunk_id=1, text="Limitation of liability is capped at $50,000 USD.")
        r2 = VectorSearchResult(vector_ref=1, score=0.92, doc_id="doc1", user_id="u1", page=1, chunk_id=1, text="Limitation of liability is capped at $50,000 USD.")

        deduped = self.service._deduplicate_and_sort_results([r1, r2])
        self.assertEqual(len(deduped), 1)
        self.assertEqual(deduped[0].score, 0.92)

    def test_2_same_chunk_id_retrieved_multiple_times(self):
        r1 = VectorSearchResult(vector_ref=0, score=0.75, doc_id="doc1", user_id="u1", page=2, chunk_id=3, text="Confidentiality covenants expire in 3 years.")
        r2 = VectorSearchResult(vector_ref=0, score=0.85, doc_id="doc1", user_id="u1", page=2, chunk_id=3, text="Confidentiality covenants expire in 3 years.")

        deduped = self.service._deduplicate_and_sort_results([r1, r2])
        self.assertEqual(len(deduped), 1)
        self.assertEqual(deduped[0].score, 0.85)

    def test_3_overlapping_chunk_deduplication(self):
        r1 = VectorSearchResult(vector_ref=0, score=0.90, doc_id="doc1", user_id="u1", page=1, chunk_id=1, text="Indemnification shall cover third party claims arising from gross negligence.")
        r1.start_char = 0
        r1.end_char = 80

        r2 = VectorSearchResult(vector_ref=1, score=0.82, doc_id="doc1", user_id="u1", page=1, chunk_id=2, text="Indemnification shall cover third party claims arising from gross negligence.")
        r2.start_char = 5
        r2.end_char = 80

        deduped = self.service._deduplicate_and_sort_results([r1, r2])
        self.assertEqual(len(deduped), 1)
        self.assertEqual(deduped[0].score, 0.90)

    def test_4_legitimate_adjacent_chunks_preserved(self):
        r1 = VectorSearchResult(vector_ref=0, score=0.88, doc_id="doc1", user_id="u1", page=1, chunk_id=1, text="Section 1. Confidentiality obligations apply for 5 years.")
        r1.start_char = 0
        r1.end_char = 50

        r2 = VectorSearchResult(vector_ref=1, score=0.85, doc_id="doc1", user_id="u1", page=1, chunk_id=2, text="Section 2. Governing law shall be the State of Delaware.")
        r2.start_char = 45
        r2.end_char = 100

        deduped = self.service._deduplicate_and_sort_results([r1, r2])
        self.assertEqual(len(deduped), 2)
        self.assertEqual(deduped[0].score, 0.88)
        self.assertEqual(deduped[1].score, 0.85)

    def test_5_metadata_preservation(self):
        r = VectorSearchResult(vector_ref=5, score=0.91, doc_id="doc_meta", user_id="user_meta", page=4, chunk_id=12, text="Arbitration venue shall be New York, NY.")
        res = self.service._deduplicate_and_sort_results([r])
        self.assertEqual(res[0].doc_id, "doc_meta")
        self.assertEqual(res[0].user_id, "user_meta")
        self.assertEqual(res[0].page, 4)
        self.assertEqual(res[0].chunk_id, 12)
        self.assertEqual(res[0].score, 0.91)

    async def test_6_real_page_metadata_preservation(self):
        idx_req = DocumentIndexRequest(
            user_id="user_page_test",
            doc_id="doc_page_test",
            raw_text="Sample text for real page test.",
            chunk_size=100,
            pages=[5],
        )
        res = await self.service.index_document(idx_req)
        self.assertTrue(res.success)
        self.assertEqual(res.total_chunks, 1)

        _, idx_p, meta_p = self.service._get_isolated_paths("user_page_test", "doc_page_test")
        _, metadata = self.service._load_index_and_metadata(idx_p, meta_p)
        self.assertEqual(metadata[0]["page"], 5)

    async def test_7_missing_page_metadata_fallback(self):
        idx_req = DocumentIndexRequest(
            user_id="user_fallback_test",
            doc_id="doc_fallback_test",
            raw_text="Sample fallback text without page array.",
            chunk_size=100,
        )
        res = await self.service.index_document(idx_req)
        self.assertTrue(res.success)

        _, idx_p, meta_p = self.service._get_isolated_paths("user_fallback_test", "doc_fallback_test")
        _, metadata = self.service._load_index_and_metadata(idx_p, meta_p)
        self.assertEqual(metadata[0]["page"], 1)

    def test_8_deterministic_ordering(self):
        r1 = VectorSearchResult(vector_ref=0, score=0.70, doc_id="doc1", user_id="u1", page=1, chunk_id=1, text="Chunk A")
        r1.start_char = 0
        r2 = VectorSearchResult(vector_ref=1, score=0.95, doc_id="doc1", user_id="u1", page=1, chunk_id=2, text="Chunk B")
        r2.start_char = 100
        r3 = VectorSearchResult(vector_ref=2, score=0.85, doc_id="doc1", user_id="u1", page=1, chunk_id=3, text="Chunk C")
        r3.start_char = 200

        deduped = self.service._deduplicate_and_sort_results([r1, r2, r3])
        self.assertEqual([x.text for x in deduped], ["Chunk B", "Chunk C", "Chunk A"])

    async def test_9_malformed_metadata_item_skipping(self):
        malformed_metadata = ["invalid_str_item", None, {"doc_id": "doc1", "user_id": "u1", "page": 1, "chunk_id": 1, "text": "Valid text chunk."}]

        with patch.object(self.service, "_load_index_and_metadata", return_value=(unittest.mock.MagicMock(ntotal=3, search=lambda q, k: ([[0.90, 0.80, 0.70]], [[0, 1, 2]])), malformed_metadata)):
            res = await self.service.search_vectors(
                unittest.mock.MagicMock(query="Test", user_id="u1", doc_id="doc1", top_k=3, min_score=0.20)
            )
            self.assertTrue(res.success)
            self.assertEqual(len(res.results), 1)
            self.assertEqual(res.results[0].text, "Valid text chunk.")

    async def test_10_faiss_read_error_graceful_fallback(self):
        with patch.object(self.service, "_load_index_and_metadata", side_effect=RuntimeError("FAISS disk corruption")):
            rag_req = RAGQueryRequest(user_id="u1", document_id="doc_corrupt", query="What is the liability cap?")
            res = await rag_service.answer_query(rag_req)
            self.assertFalse(res.success)
            self.assertFalse(res.evidence_found)
            self.assertIn("disabled", res.answer.lower())


if __name__ == "__main__":
    unittest.main()
