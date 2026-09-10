import unittest
from unittest.mock import patch
import json
import fitz  # PyMuPDF

from app.schemas.rag import RAGQueryRequest, RAGQueryResponse, RAGSourceReference, SearchResultChunk
from app.schemas.analysis import PipelineAnalysisRequest
from app.schemas.embeddings import DocumentIndexRequest
from app.services.pipeline_service import pipeline_service
from app.services.vector_db_service import vector_db_service
from app.services.rag_service import rag_service, NO_EVIDENCE_ANSWER


class TestFullstackRAGChat(unittest.IsolatedAsyncioTestCase):

    @classmethod
    def setUpClass(cls):
        cls.user_a = "user_fullstack_A"
        cls.user_b = "user_fullstack_B"
        cls.doc_a = "doc_fullstack_A"
        cls.doc_b = "doc_fullstack_B"

        cls.doc_a_contract = (
            "ENTERPRISE CLOUD SERVICES AGREEMENT 2026\n"
            "This Agreement is between Acme Corp ('Client') and CloudTech Inc ('Vendor').\n\n"
            "1. LIABILITY CAP.\n"
            "Total aggregate liability under this agreement shall be capped at $1,000,000 USD.\n\n"
            "2. TERMINATION PERIOD.\n"
            "Either party may terminate this agreement upon 60 days prior written notice.\n\n"
            "3. GOVERNING LAW.\n"
            "This Agreement shall be governed by the laws of California."
        )

        cls.doc_b_contract = (
            "VENDOR CONSULTING AGREEMENT 2026\n"
            "This Agreement is between Beta Corp ('Client') and DevServices Ltd ('Vendor').\n\n"
            "1. LIABILITY CAP.\n"
            "Total aggregate liability under this agreement shall be capped at $50,000 USD.\n\n"
            "2. TERMINATION PERIOD.\n"
            "Either party may terminate this agreement upon 14 days prior written notice."
        )

    async def asyncSetUp(self):
        # Index DOC_A for USER_A
        await vector_db_service.index_document(
            DocumentIndexRequest(
                doc_id=self.doc_a,
                user_id=self.user_a,
                filename="cloud_agreement.pdf",
                raw_text=self.doc_a_contract,
            )
        )

        # Index DOC_B for USER_A
        await vector_db_service.index_document(
            DocumentIndexRequest(
                doc_id=self.doc_b,
                user_id=self.user_a,
                filename="vendor_consulting.pdf",
                raw_text=self.doc_b_contract,
            )
        )

    # ── 1. REAL DOCUMENT QUESTION ──────────────────────────────────────────────
    async def test_1_real_document_questions(self):
        # Question 1: Liability Cap
        req1 = RAGQueryRequest(
            user_id=self.user_a,
            document_id=self.doc_a,
            query="What is the liability cap?",
        )
        res1: RAGQueryResponse = await rag_service.answer_query(req1)

        self.assertTrue(res1.success)
        self.assertTrue(res1.evidence_found)
        self.assertIn("$1,000,000 USD", res1.answer)

        # Question 2: Termination Period
        req2 = RAGQueryRequest(
            user_id=self.user_a,
            document_id=self.doc_a,
            query="What is the termination period?",
        )
        res2: RAGQueryResponse = await rag_service.answer_query(req2)

        self.assertTrue(res2.success)
        self.assertTrue(res2.evidence_found)
        self.assertIn("60 days", res2.answer)

    # ── 2. CITATION PROPAGATION ────────────────────────────────────────────────
    async def test_2_citation_propagation(self):
        req = RAGQueryRequest(
            user_id=self.user_a,
            document_id=self.doc_a,
            query="What is the liability cap?",
        )
        res: RAGQueryResponse = await rag_service.answer_query(req)

        self.assertTrue(res.success)
        self.assertIn("[Source 1]", res.answer)
        self.assertGreater(len(res.sources), 0)

        src = res.sources[0]
        self.assertEqual(src.doc_id, self.doc_a)
        self.assertEqual(src.user_id, self.user_a)
        self.assertGreaterEqual(src.page, 1)
        self.assertIsNotNone(src.chunk_id)
        self.assertIsNotNone(src.text_snippet)
        self.assertGreater(src.score, 0.0)

    # ── 3. NO EVIDENCE ─────────────────────────────────────────────────────────
    async def test_3_no_evidence(self):
        req = RAGQueryRequest(
            user_id=self.user_a,
            document_id=self.doc_a,
            query="What are the hazardous waste disposal penalties?",
        )
        res: RAGQueryResponse = await rag_service.answer_query(req)

        self.assertTrue(res.success)
        self.assertFalse(res.evidence_found)
        self.assertEqual(res.confidence_score, 0.0)
        self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)
        self.assertEqual(len(res.sources), 0)
        self.assertEqual(len(res.retrieved_chunks), 0)

    # ── 4. DOCUMENT ISOLATION ──────────────────────────────────────────────────
    async def test_4_document_isolation(self):
        # Query DOC_A -> must return $1,000,000 USD, never $50,000 USD
        req_a = RAGQueryRequest(user_id=self.user_a, document_id=self.doc_a, query="What is the liability cap?")
        res_a: RAGQueryResponse = await rag_service.answer_query(req_a)

        self.assertIn("$1,000,000 USD", res_a.answer)
        self.assertNotIn("$50,000 USD", res_a.answer)
        for s in res_a.sources:
            self.assertEqual(s.doc_id, self.doc_a)

        # Query DOC_B -> must return $50,000 USD, never $1,000,000 USD
        req_b = RAGQueryRequest(user_id=self.user_a, document_id=self.doc_b, query="What is the liability cap?")
        res_b: RAGQueryResponse = await rag_service.answer_query(req_b)

        self.assertIn("$50,000 USD", res_b.answer)
        self.assertNotIn("$1,000,000 USD", res_b.answer)
        for s in res_b.sources:
            self.assertEqual(s.doc_id, self.doc_b)

    # ── 5. USER ISOLATION ──────────────────────────────────────────────────────
    async def test_5_user_isolation(self):
        # Index DOC_B for USER_B with secret key
        await vector_db_service.index_document(
            DocumentIndexRequest(
                doc_id="doc_secret_B",
                user_id=self.user_b,
                filename="secret_user_B.pdf",
                raw_text="User B secret security token is SecretTokenB_999.",
            )
        )

        # USER_A queries doc_secret_B -> isolated storage path enforces no cross-tenant leakage
        req_a_for_b = RAGQueryRequest(
            user_id=self.user_a,
            document_id="doc_secret_B",
            query="What is the secret security token?",
        )
        res_a_for_b: RAGQueryResponse = await rag_service.answer_query(req_a_for_b)

        self.assertFalse(res_a_for_b.evidence_found)
        self.assertNotIn("SecretTokenB_999", res_a_for_b.answer)
        self.assertEqual(len(res_a_for_b.sources), 0)

    # ── 6. INVALID DOCUMENT HANDLING ───────────────────────────────────────────
    async def test_6_invalid_document_handling(self):
        req = RAGQueryRequest(
            user_id=self.user_a,
            document_id="non_existent_doc_xyz_999",
            query="What is the term?",
        )
        res: RAGQueryResponse = await rag_service.answer_query(req)

        self.assertFalse(res.success)
        self.assertFalse(res.evidence_found)
        self.assertIn("RAG search is disabled", res.answer)

    # ── 7. UNAUTHORIZED ACCESS ─────────────────────────────────────────────────
    async def test_7_unauthorized_access(self):
        # Attempt citation validation with mismatched user_id
        sources = [
            RAGSourceReference(
                source_id="[Source 1]",
                doc_id=self.doc_a,
                user_id=self.user_b,  # Mismatched user!
                page=1,
                chunk_id=1,
                score=0.90,
                text_snippet="California law applies",
            )
        ]
        is_valid, sanitized = rag_service._validate_answer_citations(
            "According to [Source 1], California law applies [Source 1].",
            sources,
            self.user_a,
            self.doc_a,
        )
        self.assertFalse(is_valid)
        self.assertEqual(sanitized, NO_EVIDENCE_ANSWER)

    # ── 8. UNAVAILABLE AI SERVICE FALLBACK ─────────────────────────────────────
    async def test_8_unavailable_ai_service_fallback(self):
        with patch.object(vector_db_service, "search_vectors", side_effect=RuntimeError("Vector database engine timeout")):
            req = RAGQueryRequest(user_id=self.user_a, document_id=self.doc_a, query="What is the term?")
            res: RAGQueryResponse = await rag_service.answer_query(req)

            self.assertTrue(res.success)
            self.assertFalse(res.evidence_found)
            self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)
            self.assertEqual(len(res.sources), 0)

    # ── 9. MALFORMED RESPONSE REJECTION ────────────────────────────────────────
    async def test_9_malformed_response_rejection(self):
        sources = [
            RAGSourceReference(
                source_id="[Source 1]",
                doc_id=self.doc_a,
                user_id=self.user_a,
                page=1,
                chunk_id=1,
                score=0.85,
                text_snippet="60 days termination notice",
            )
        ]
        # Answer references non-existent [Source 99]
        malformed_answer = "Termination notice is 60 days [Source 99]."
        is_valid, sanitized = rag_service._validate_answer_citations(
            malformed_answer, sources, self.user_a, self.doc_a
        )
        self.assertFalse(is_valid)
        self.assertEqual(sanitized, NO_EVIDENCE_ANSWER)

    # ── 10. CONVERSATION / DOCUMENT ISOLATION ──────────────────────────────────
    async def test_10_conversation_document_isolation(self):
        # Query DOC_A
        res_a: RAGQueryResponse = await rag_service.answer_query(
            RAGQueryRequest(user_id=self.user_a, document_id=self.doc_a, query="What is the termination period?")
        )
        # Query DOC_B
        res_b: RAGQueryResponse = await rag_service.answer_query(
            RAGQueryRequest(user_id=self.user_a, document_id=self.doc_b, query="What is the termination period?")
        )

        self.assertIn("60 days", res_a.answer)
        self.assertIn("14 days", res_b.answer)
        self.assertEqual(res_a.sources[0].doc_id, self.doc_a)
        self.assertEqual(res_b.sources[0].doc_id, self.doc_b)


if __name__ == "__main__":
    unittest.main()
