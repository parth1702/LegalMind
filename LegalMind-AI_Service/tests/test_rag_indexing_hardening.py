"""
Comprehensive Unit & Integration Test Suite for RAG Indexing & Grounding Hardening.
Tests:
1. Successful Indexing & Status Transitions (UPLOADED -> PROCESSING -> PROCESSED -> INDEXING -> INDEXED) & Metadata exposure.
2. Empty Document Handling (Transitions to FAILED; RAG Query rejected).
3. Corrupted / Unparseable Input (Transitions to FAILED; RAG Query rejected).
4. FAISS Unavailable / Failure Mock (Transitions to FAILED; RAG Query rejected).
5. Embedding Model Unavailable / Failure Mock (Transitions to FAILED; RAG Query rejected).
6. Application Restart Simulation (In-memory cache clear, disk reload verification).
7. Multi-Tenant User Isolation (user_A vs user_B document separation).
8. Multi-Document Isolation for Same User (doc_1 vs doc_2 retrieval separation).
"""
import unittest
import asyncio
import os
import shutil
import tempfile
from pathlib import Path
from unittest.mock import patch, MagicMock

from app.schemas.document_status import DocumentStatus
from app.schemas.analysis import PipelineAnalysisRequest
from app.schemas.embeddings import DocumentIndexRequest
from app.schemas.rag import RAGQueryRequest
from app.services.document_status_service import document_status_service
from app.services.vector_db_service import vector_db_service
from app.services.pipeline_service import pipeline_service
from app.services.rag_service import rag_service


class TestRAGIndexingHardening(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.original_storage = document_status_service.base_storage_dir
        document_status_service.base_storage_dir = Path(self.temp_dir)
        vector_db_service.base_storage_dir = Path(self.temp_dir)
        document_status_service.clear_memory()

        self.sample_text = (
            "This Agreement is made by and between Party A and Party B. "
            "1. Confidentiality: Either party shall maintain strictly confidential all proprietary information. "
            "2. Limitation of Liability: Neither party shall be liable for indirect or consequential damages. "
            "3. Governing Law: This contract is governed by the laws of the State of California."
        )

    def tearDown(self):
        document_status_service.base_storage_dir = self.original_storage
        vector_db_service.base_storage_dir = self.original_storage
        document_status_service.clear_memory()
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_01_successful_indexing_status_transitions_and_metadata(self):
        """Scenario 1: Standard valid text document processed -> status transitions & full source metadata."""
        user_id = "user_test_01"
        doc_id = "doc_test_01"

        # Execute full analysis pipeline
        req = PipelineAnalysisRequest(
            doc_id=doc_id,
            user_id=user_id,
            filename="contract.pdf",
            raw_text=self.sample_text,
        )
        pipeline_res = asyncio.run(pipeline_service.execute_full_pipeline(req))

        self.assertTrue(pipeline_res.success)
        self.assertEqual(pipeline_res.status, "completed")

        # Verify Document Status in Service & Disk
        status_info = document_status_service.get_status(user_id, doc_id)
        self.assertEqual(status_info.status, DocumentStatus.INDEXED)
        self.assertGreater(status_info.total_chunks, 0)
        self.assertIsNone(status_info.error_message)

        # Verify disk doc_status.json existence
        _, status_file = document_status_service._get_status_file_path(user_id, doc_id)
        self.assertTrue(status_file.exists())

        # Test RAG query execution
        rag_req = RAGQueryRequest(
            query="What state's laws govern this contract?",
            user_id=user_id,
            document_id=doc_id,
        )
        rag_res = asyncio.run(rag_service.answer_query(rag_req))

        self.assertTrue(rag_res.success)
        self.assertTrue(rag_res.evidence_found)
        self.assertGreater(len(rag_res.sources), 0)

        # Expose all 5 required source metadata attributes
        src = rag_res.sources[0]
        self.assertIsNotNone(src.document_id)
        self.assertIsNotNone(src.doc_id)
        self.assertIsNotNone(src.chunk_id)
        self.assertIsNotNone(src.page)
        self.assertIsNotNone(src.text_snippet)
        self.assertIsNotNone(src.text)
        self.assertIsNotNone(src.similarity_score)
        self.assertIsNotNone(src.score)

    def test_02_empty_document_handling(self):
        """Scenario 2: Empty document/whitespace -> transitions to FAILED, RAG query rejected with controlled error."""
        user_id = "user_test_02"
        doc_id = "doc_test_02"

        idx_req = DocumentIndexRequest(
            doc_id=doc_id,
            user_id=user_id,
            raw_text="   \n\t  ",
        )
        idx_res = asyncio.run(vector_db_service.index_document(idx_req))

        self.assertFalse(idx_res.success)
        self.assertEqual(idx_res.status, DocumentStatus.FAILED)
        self.assertEqual(idx_res.total_chunks, 0)

        status_info = document_status_service.get_status(user_id, doc_id)
        self.assertEqual(status_info.status, DocumentStatus.FAILED)

        # RAG query must be rejected
        rag_req = RAGQueryRequest(
            query="What is the governing law?",
            user_id=user_id,
            document_id=doc_id,
        )
        rag_res = asyncio.run(rag_service.answer_query(rag_req))

        self.assertFalse(rag_res.success)
        self.assertFalse(rag_res.evidence_found)
        self.assertIn("FAILED", rag_res.answer)
        self.assertIn("disabled", rag_res.answer.lower())

    def test_03_corrupted_input_handling(self):
        """Scenario 3: Corrupted / unparseable input -> transitions to FAILED, RAG query rejected."""
        user_id = "user_test_03"
        doc_id = "doc_test_03"

        req = PipelineAnalysisRequest(
            doc_id=doc_id,
            user_id=user_id,
            filename="corrupt.pdf",
            raw_text="",
        )
        pipeline_res = asyncio.run(pipeline_service.execute_full_pipeline(req))

        self.assertFalse(pipeline_res.success)
        self.assertEqual(pipeline_res.status, "failed")

        status_info = document_status_service.get_status(user_id, doc_id)
        self.assertEqual(status_info.status, DocumentStatus.FAILED)

        # RAG query on corrupt doc
        rag_req = RAGQueryRequest(
            query="What are the terms?",
            user_id=user_id,
            document_id=doc_id,
        )
        rag_res = asyncio.run(rag_service.answer_query(rag_req))
        self.assertFalse(rag_res.success)
        self.assertIn("FAILED", rag_res.answer)

    def test_04_faiss_unavailable_failure_mock(self):
        """Scenario 4: Mock FAISS failure -> status set to FAILED, RAG query rejected."""
        user_id = "user_test_04"
        doc_id = "doc_test_04"

        idx_req = DocumentIndexRequest(
            doc_id=doc_id,
            user_id=user_id,
            raw_text=self.sample_text,
        )

        with patch("faiss.IndexFlatIP", side_effect=Exception("FAISS memory error allocation failure")):
            idx_res = asyncio.run(vector_db_service.index_document(idx_req))

        self.assertFalse(idx_res.success)
        self.assertEqual(idx_res.status, DocumentStatus.FAILED)

        status_info = document_status_service.get_status(user_id, doc_id)
        self.assertEqual(status_info.status, DocumentStatus.FAILED)

        rag_req = RAGQueryRequest(
            query="What is the liability policy?",
            user_id=user_id,
            document_id=doc_id,
        )
        rag_res = asyncio.run(rag_service.answer_query(rag_req))
        self.assertFalse(rag_res.success)
        self.assertIn("FAILED", rag_res.answer)

    def test_05_embedding_model_unavailable_failure_mock(self):
        """Scenario 5: Mock Embedding service failure -> status set to FAILED, RAG query rejected."""
        from app.services.embedding_service import embedding_service
        user_id = "user_test_05"
        doc_id = "doc_test_05"

        idx_req = DocumentIndexRequest(
            doc_id=doc_id,
            user_id=user_id,
            raw_text=self.sample_text,
        )

        with patch.object(embedding_service, "encode_texts", side_effect=RuntimeError("Embedding model offline")):
            idx_res = asyncio.run(vector_db_service.index_document(idx_req))

        self.assertFalse(idx_res.success)
        self.assertEqual(idx_res.status, DocumentStatus.FAILED)

        status_info = document_status_service.get_status(user_id, doc_id)
        self.assertEqual(status_info.status, DocumentStatus.FAILED)

        rag_req = RAGQueryRequest(
            query="Who are the parties?",
            user_id=user_id,
            document_id=doc_id,
        )
        rag_res = asyncio.run(rag_service.answer_query(rag_req))
        self.assertFalse(rag_res.success)
        self.assertIn("FAILED", rag_res.answer)

    def test_06_restart_application_persistence(self):
        """Scenario 6: Clear in-memory status registry; verify status and RAG readiness reload accurately from disk."""
        user_id = "user_test_06"
        doc_id = "doc_test_06"

        idx_req = DocumentIndexRequest(
            doc_id=doc_id,
            user_id=user_id,
            raw_text=self.sample_text,
        )
        idx_res = asyncio.run(vector_db_service.index_document(idx_req))
        self.assertTrue(idx_res.success)

        # Clear in-memory cache to simulate server restart
        document_status_service.clear_memory()

        # Retrieve status after restart simulation
        status_info = document_status_service.get_status(user_id, doc_id)
        self.assertEqual(status_info.status, DocumentStatus.INDEXED)
        self.assertGreater(status_info.total_chunks, 0)

        # Verify RAG readiness after restart
        is_ready, _ = document_status_service.verify_rag_readiness(user_id, doc_id)
        self.assertTrue(is_ready)

        # RAG query after restart simulation
        rag_req = RAGQueryRequest(
            query="What is the governing law?",
            user_id=user_id,
            document_id=doc_id,
        )
        rag_res = asyncio.run(rag_service.answer_query(rag_req))
        self.assertTrue(rag_res.success)
        self.assertTrue(rag_res.evidence_found)

    def test_07_multiple_users_isolation(self):
        """Scenario 7: Test distinct users (user_A vs user_B). Verify strict tenant isolation."""
        user_a = "user_A"
        doc_a = "doc_A"
        text_a = "Party A agrees to pay Secret Bounty of 100,000 USD to Agent Alpha."

        user_b = "user_B"
        doc_b = "doc_B"
        text_b = "Party B agrees to supply 500 widgets to Client Beta."

        asyncio.run(vector_db_service.index_document(DocumentIndexRequest(doc_id=doc_a, user_id=user_a, raw_text=text_a)))
        asyncio.run(vector_db_service.index_document(DocumentIndexRequest(doc_id=doc_b, user_id=user_b, raw_text=text_b)))

        # User B queries User A's document ID -> should be blocked or return no evidence
        rag_req = RAGQueryRequest(
            query="What is the secret bounty amount?",
            user_id=user_b,
            document_id=doc_a,
        )
        rag_res = asyncio.run(rag_service.answer_query(rag_req))
        # Readiness check for (user_b, doc_a) will return false or vector search won't leak
        self.assertFalse(rag_res.evidence_found)

    def test_08_multiple_documents_same_user_isolation(self):
        """Scenario 8: Test single user with multiple documents (doc_1, doc_2). Verify querying doc_1 returns chunks strictly from doc_1."""
        user_id = "user_multi_doc"
        doc_1 = "doc_1_employment"
        text_1 = "Employment Agreement: Annual salary is 120,000 USD with equity options."

        doc_2 = "doc_2_lease"
        text_2 = "Lease Agreement: Monthly rent is 2,500 USD payable on the 1st of every month."

        asyncio.run(vector_db_service.index_document(DocumentIndexRequest(doc_id=doc_1, user_id=user_id, raw_text=text_1)))
        asyncio.run(vector_db_service.index_document(DocumentIndexRequest(doc_id=doc_2, user_id=user_id, raw_text=text_2)))

        # Query doc_1 specifically for salary
        rag_req_1 = RAGQueryRequest(
            query="What is the annual salary?",
            user_id=user_id,
            document_id=doc_1,
        )
        rag_res_1 = asyncio.run(rag_service.answer_query(rag_req_1))
        self.assertTrue(rag_res_1.evidence_found)
        for src in rag_res_1.sources:
            self.assertEqual(src.doc_id, doc_1)

        # Query doc_2 specifically for rent
        rag_req_2 = RAGQueryRequest(
            query="What is the monthly rent?",
            user_id=user_id,
            document_id=doc_2,
        )
        rag_res_2 = asyncio.run(rag_service.answer_query(rag_req_2))
        self.assertTrue(rag_res_2.evidence_found)
        for src in rag_res_2.sources:
            self.assertEqual(src.doc_id, doc_2)


if __name__ == "__main__":
    unittest.main()
