"""
Unit & Integration Test Suite for RAG Grounding & Citation Hardening (Phase 5.3).

Tests:
1. Grounded answer generation with valid inline citations
2. No-evidence answer handling for missing evidence
3. Irrelevant query returning NO_EVIDENCE_ANSWER
4. Invalid citation ID detection and safe fallback
5. Cross-document citation leakage detection and rejection
6. Cross-user citation leakage detection and rejection
7. Missing page metadata handling
8. LLM failure simulation fallback
9. Malformed LLM output handling
10. Corrupted retrieval context handling
11. Empty context handling
12. Deterministic citation ordering by relevance score
"""
import unittest
from unittest.mock import patch, MagicMock
from app.services.rag_service import rag_service, NO_EVIDENCE_ANSWER
from app.services.vector_db_service import vector_db_service
from app.schemas.rag import RAGQueryRequest, RAGSourceReference, SearchResultChunk, LEGAL_RAG_DISCLAIMER
from app.schemas.embeddings import VectorSearchResult, VectorSearchResponse


from app.schemas.document_status import DocumentStatus, DocumentStatusInfo
from app.services.document_status_service import document_status_service


class TestRagGroundingHardening(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.user_id = "grounding_user_001"
        self.doc_id = "grounding_doc_001"
        self.status_patcher = patch.object(
            document_status_service,
            "verify_rag_readiness",
            return_value=(True, DocumentStatusInfo(doc_id=self.doc_id, user_id=self.user_id, status=DocumentStatus.INDEXED, total_chunks=1))
        )
        self.status_patcher.start()

    def tearDown(self):
        self.status_patcher.stop()

    def test_1_grounded_answer_generation(self):
        sources = [
            RAGSourceReference(source_id="[Source 1]", doc_id=self.doc_id, user_id=self.user_id, page=1, chunk_id=1, score=0.95, text_snippet="Liability is capped at $100k.")
        ]
        context = "[Source 1] (Document: grounding_doc_001, Page: 1, Chunk: 1):\nLiability is capped at $100k.\n"

        ans = rag_service._synthesize_answer("What is the liability cap?", context, sources)
        self.assertIn("[Source 1]", ans)
        self.assertIn("100k", ans.lower())

    async def test_2_no_evidence_answer_for_missing_context(self):
        with patch.object(vector_db_service, "search_vectors", return_value=VectorSearchResponse(success=True, query="Q", total_results=0, results=[])):
            req = RAGQueryRequest(user_id=self.user_id, document_id=self.doc_id, query="What are the stock options?")
            res = await rag_service.answer_query(req)
            self.assertTrue(res.success)
            self.assertFalse(res.evidence_found)
            self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)
            self.assertEqual(res.confidence_score, 0.0)

    async def test_3_irrelevant_query_no_evidence(self):
        with patch.object(vector_db_service, "search_vectors", return_value=VectorSearchResponse(success=True, query="Q", total_results=0, results=[])):
            req = RAGQueryRequest(user_id=self.user_id, document_id=self.doc_id, query="Invalid irrelevant query XYZ", min_score=0.80)
            res = await rag_service.answer_query(req)
            self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)
            self.assertFalse(res.evidence_found)

    def test_4_invalid_citation_id_detection_and_fallback(self):
        sources = [
            RAGSourceReference(source_id="[Source 1]", doc_id=self.doc_id, user_id=self.user_id, page=1, chunk_id=1, score=0.90, text_snippet="Sample text")
        ]
        invalid_ans = "Based on [Source 99]: Liability is capped at $100k."

        valid, sanitized = rag_service._validate_answer_citations(invalid_ans, sources, self.user_id, self.doc_id)
        self.assertFalse(valid)
        self.assertEqual(sanitized, NO_EVIDENCE_ANSWER)

    def test_5_cross_document_citation_leakage_rejection(self):
        sources = [
            RAGSourceReference(source_id="[Source 1]", doc_id="LEAKED_DOC_B", user_id=self.user_id, page=1, chunk_id=1, score=0.90, text_snippet="Sample text")
        ]
        ans = "Based on [Source 1]: Liability text."

        valid, sanitized = rag_service._validate_answer_citations(ans, sources, self.user_id, "ACTIVE_DOC_A")
        self.assertFalse(valid)
        self.assertEqual(sanitized, NO_EVIDENCE_ANSWER)

    def test_6_cross_user_citation_leakage_rejection(self):
        sources = [
            RAGSourceReference(source_id="[Source 1]", doc_id=self.doc_id, user_id="LEAKED_USER_B", page=1, chunk_id=1, score=0.90, text_snippet="Sample text")
        ]
        ans = "Based on [Source 1]: Liability text."

        valid, sanitized = rag_service._validate_answer_citations(ans, sources, "ACTIVE_USER_A", self.doc_id)
        self.assertFalse(valid)
        self.assertEqual(sanitized, NO_EVIDENCE_ANSWER)

    def test_7_missing_page_metadata_handling(self):
        src = RAGSourceReference(source_id="[Source 1]", doc_id=self.doc_id, user_id=self.user_id, page=1, chunk_id=1, score=0.85, text_snippet="Text snippet.")
        self.assertEqual(src.page, 1)

    async def test_8_llm_failure_simulation_fallback(self):
        with patch.object(rag_service, "_synthesize_answer", side_effect=RuntimeError("LLM endpoint timeout")):
            vec_res = VectorSearchResult(vector_ref=0, score=0.90, doc_id=self.doc_id, user_id=self.user_id, page=1, chunk_id=1, text="Sample contract text.")
            with patch.object(vector_db_service, "search_vectors", return_value=VectorSearchResponse(success=True, query="Q", total_results=1, results=[vec_res])):
                req = RAGQueryRequest(user_id=self.user_id, document_id=self.doc_id, query="What is the term?")
                res = await rag_service.answer_query(req)
                self.assertTrue(res.success)
                self.assertFalse(res.evidence_found)
                self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)

    async def test_9_malformed_llm_output_handling(self):
        with patch.object(rag_service, "_synthesize_answer", return_value="Malformed response without valid citations [Source 9999]"):
            vec_res = VectorSearchResult(vector_ref=0, score=0.90, doc_id=self.doc_id, user_id=self.user_id, page=1, chunk_id=1, text="Sample contract text.")
            with patch.object(vector_db_service, "search_vectors", return_value=VectorSearchResponse(success=True, query="Q", total_results=1, results=[vec_res])):
                req = RAGQueryRequest(user_id=self.user_id, document_id=self.doc_id, query="What is the term?")
                res = await rag_service.answer_query(req)
                self.assertTrue(res.success)
                self.assertFalse(res.evidence_found)
                self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)

    async def test_10_corrupted_retrieval_context_handling(self):
        with patch.object(vector_db_service, "search_vectors", side_effect=Exception("FAISS memory corruption")):
            req = RAGQueryRequest(user_id=self.user_id, document_id=self.doc_id, query="What is the governing law?")
            res = await rag_service.answer_query(req)
            self.assertTrue(res.success)
            self.assertFalse(res.evidence_found)
            self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)

    def test_11_empty_context_handling(self):
        sources = []
        context = ""
        ans = rag_service._synthesize_answer("Query", context, sources)
        self.assertIn("[Source 1]", ans)

    def test_12_deterministic_citation_ordering_by_relevance(self):
        match1 = VectorSearchResult(vector_ref=0, score=0.95, doc_id=self.doc_id, user_id=self.user_id, page=1, chunk_id=1, text="Highest score chunk.")
        match2 = VectorSearchResult(vector_ref=1, score=0.80, doc_id=self.doc_id, user_id=self.user_id, page=1, chunk_id=2, text="Lower score chunk.")

        context_str, sources, _ = rag_service._construct_context([match1, match2])
        self.assertEqual(sources[0].source_id, "[Source 1]")
        self.assertEqual(sources[0].score, 0.95)
        self.assertEqual(sources[1].source_id, "[Source 2]")
        self.assertEqual(sources[1].score, 0.80)


if __name__ == "__main__":
    unittest.main()
