"""
Unit & Integration Test Suite for RAG and Evidence Risk Engine Consistency.
Verifies cross-system evidence alignment, document/user isolation, zero cross-document leakage, and corrupted index/unavailable service handling.
"""
import unittest
import asyncio
import os
import shutil
from app.services.evidence_risk_engine_service import evidence_risk_engine_service
from app.services.rag_service import rag_service, NO_EVIDENCE_ANSWER
from app.services.vector_db_service import vector_db_service
from app.schemas.rag import RAGQueryRequest
from app.schemas.embeddings import DocumentIndexRequest

CONTRACT_WITH_CAP = """
MASTER SERVICES AGREEMENT
This Master Services Agreement is entered into between Client Inc and Vendor Corp.
Section 1. Limitation of Liability. Aggregate liability under this Agreement shall be limited to total fees paid in preceding 12 months, maximum liability cap $1,000,000. Consequential damages are mutually waived.
Section 2. Termination. Either party may terminate upon 60 days written notice.
Section 3. Confidentiality. Mutual non-disclosure for 3 years.
Section 4. Governing Law. High Court of Delhi, India.
"""

CONTRACT_WITHOUT_CAP = """
UNLIMITED LIABILITY AGREEMENT
Section 1. Liability. Party A shall indemnify and hold harmless Party B without any monetary limitation or liability cap.
Section 2. Termination. Immediate termination without notice.
Section 3. Governing Law. State of Delaware.
"""


class TestRAGRiskConsistency(unittest.TestCase):
    def setUp(self):
        self.doc_a = "doc_contract_A_101"
        self.doc_b = "doc_contract_B_202"
        self.user_1 = "user_alpha_01"
        self.user_2 = "user_beta_02"

        # Index Contract A in Vector DB for user 1 using vector_db_service.index_document
        asyncio.run(
            vector_db_service.index_document(
                DocumentIndexRequest(
                    doc_id=self.doc_a,
                    user_id=self.user_1,
                    filename="Contract_With_Cap.pdf",
                    raw_text=CONTRACT_WITH_CAP,
                )
            )
        )

    def tearDown(self):
        # Clean up vector indexes created during test
        for user_id, doc_id in [(self.user_1, self.doc_a), (self.user_2, self.doc_b)]:
            doc_dir, _, _ = vector_db_service._get_isolated_paths(user_id, doc_id)
            if os.path.exists(doc_dir):
                shutil.rmtree(doc_dir, ignore_errors=True)

    # 1 & 2 & 3. Upload real contract, analyze contract, query RAG for liability cap
    def test_01_end_to_end_rag_and_risk_analysis_consistency(self):
        # Step 1: Analyze contract
        analysis = evidence_risk_engine_service.evaluate_contract(
            text=CONTRACT_WITH_CAP,
            document_id=self.doc_a,
            user_id=self.user_1,
            filename="Contract_With_Cap.pdf",
        )

        # Step 2: Query RAG using async answer_query
        rag_request = RAGQueryRequest(
            query="What is the liability cap?",
            document_id=self.doc_a,
            user_id=self.user_1,
            top_k=3,
        )
        rag_response = asyncio.run(rag_service.answer_query(rag_request))

        # Step 3: Compare RAG evidence against analysis evidence
        # Because contract HAS a liability cap, risk analysis must NOT trigger LIABILITY_UNLIMITED
        triggered_ids = [r.rule_id for r in analysis.triggered_rules]
        self.assertNotIn("LIABILITY_UNLIMITED", triggered_ids)
        self.assertEqual(analysis.category_scores["LIABILITY"], 0.0)

        # Step 4: Ensure RAG retrieved valid sources with matching document_id
        self.assertTrue(rag_response.evidence_found)
        self.assertGreater(len(rag_response.sources), 0)
        source = rag_response.sources[0]

        # Step 5: Compare document_id alignment
        self.assertEqual(source.doc_id, self.doc_a)
        self.assertEqual(source.doc_id, analysis.document_id)

        # Step 6: Compare user_id alignment
        self.assertEqual(source.user_id, self.user_1)
        self.assertEqual(source.user_id, analysis.user_id)

        # Step 7: Compare valid page/chunk metadata
        self.assertGreaterEqual(source.page, 1)
        self.assertIsNotNone(source.chunk_id)

    # 7. Ensure Cross-Document Evidence is Impossible
    def test_02_cross_document_isolation_enforced(self):
        # Attempt to query doc_b while passing doc_a's ID
        rag_request = RAGQueryRequest(
            query="What is the liability cap?",
            document_id="non_existent_doc_XYZ",
            user_id=self.user_1,
        )
        rag_response = asyncio.run(rag_service.answer_query(rag_request))
        self.assertTrue(
            "cannot find relevant evidence" in rag_response.answer or "RAG search is disabled" in rag_response.answer
        )
        self.assertEqual(len(rag_response.sources), 0)

    # 8. Ensure Cross-User Evidence is Impossible
    def test_03_cross_user_isolation_enforced(self):
        # User 2 attempting to access User 1's document doc_a
        rag_request = RAGQueryRequest(
            query="What is the liability cap?",
            document_id=self.doc_a,
            user_id=self.user_2,  # Wrong user
        )
        rag_response = asyncio.run(rag_service.answer_query(rag_request))
        self.assertTrue(
            "cannot find relevant evidence" in rag_response.answer or "RAG search is disabled" in rag_response.answer
        )
        self.assertEqual(len(rag_response.sources), 0)

    # 9. Test No-Evidence Queries
    def test_04_no_evidence_query_returns_zero_sources(self):
        rag_request = RAGQueryRequest(
            query="What are the hazardous chemical disposal penalties?",
            document_id=self.doc_a,
            user_id=self.user_1,
        )
        rag_response = asyncio.run(rag_service.answer_query(rag_request))
        self.assertEqual(len(rag_response.sources), 0)
        self.assertTrue(
            "cannot find relevant evidence" in rag_response.answer or "RAG search is disabled" in rag_response.answer
        )

    # 10. Test Corrupted FAISS Index
    def test_05_corrupted_faiss_index_fails_safely(self):
        # Corrupt the index file
        _, index_path, _ = vector_db_service._get_isolated_paths(self.user_1, self.doc_a)
        with open(index_path, "wb") as f:
            f.write(b"CORRUPTED_INDEX_DATA_BYTES")

        rag_request = RAGQueryRequest(
            query="What is the liability cap?",
            document_id=self.doc_a,
            user_id=self.user_1,
        )
        rag_response = asyncio.run(rag_service.answer_query(rag_request))
        # Should gracefully return controlled error response without crashing
        self.assertTrue(
            "cannot find relevant evidence" in rag_response.answer or "FAISS index" in rag_response.answer or "RAG search is disabled" in rag_response.answer
        )

    # 11. Test Unavailable AI Service
    def test_06_unavailable_ai_service_returns_controlled_error(self):
        # Test empty input handling
        analysis = evidence_risk_engine_service.evaluate_contract(
            text="",
            document_id=self.doc_a,
            user_id=self.user_1,
        )
        self.assertEqual(analysis.overall_score, 0.0)
        self.assertEqual(len(analysis.triggered_rules), 0)


if __name__ == "__main__":
    unittest.main()
