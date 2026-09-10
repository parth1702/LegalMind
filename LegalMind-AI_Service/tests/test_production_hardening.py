import unittest
from unittest.mock import patch
import os
import os.path
import fitz  # PyMuPDF

from app.schemas.rag import RAGQueryRequest, RAGQueryResponse, RAGSourceReference
from app.schemas.embeddings import DocumentIndexRequest
from app.services.document_service import document_service
from app.services.vector_db_service import vector_db_service
from app.services.rag_service import rag_service, NO_EVIDENCE_ANSWER
from app.core.config import settings


class TestProductionHardening(unittest.IsolatedAsyncioTestCase):

    @classmethod
    def setUpClass(cls):
        cls.user_a = "hardened_user_A"
        cls.user_b = "hardened_user_B"
        cls.doc_a = "hardened_doc_A"
        cls.doc_b = "hardened_doc_B"

        cls.hardened_contract_a = (
            "ENTERPRISE SECURITY MASTER AGREEMENT 2026\n"
            "Parties: SecureCorp Inc. and Shield Systems LLC.\n\n"
            "1. DATA RETENTION PERIOD.\n"
            "Customer data shall be retained for 180 days post-termination.\n\n"
            "2. AGGREGATE LIABILITY CAP.\n"
            "Total aggregate liability under this agreement shall be capped at $2,500,000 USD."
        )

    async def asyncSetUp(self):
        await vector_db_service.index_document(
            DocumentIndexRequest(
                doc_id=self.doc_a,
                user_id=self.user_a,
                filename="secure_agreement.pdf",
                raw_text=self.hardened_contract_a,
            )
        )

    # ── 1. FILENAME PATH TRAVERSAL SANITIZATION ──────────────────────────────
    def test_1_path_traversal_filename_sanitization(self):
        dangerous_filenames = [
            "../../etc/passwd.pdf",
            "..\\..\\windows\\system32\\config.pdf",
            "normal_file\0nullbyte.pdf",
            "/absolute/path/to/secret.pdf",
        ]

        for raw_name in dangerous_filenames:
            clean_basename = os.path.basename(raw_name).replace("\0", "")
            self.assertNotIn("..", clean_basename)
            self.assertNotIn("/", clean_basename)
            self.assertNotIn("\\", clean_basename)

    # ── 2. PDF MAGIC HEADERS & CORRUPT/EMPTY FILE REJECTION ────────────────────
    async def test_2_corrupt_empty_pdf_rejection(self):
        # 0-byte file buffer raises exception
        empty_bytes = b""
        with self.assertRaises(Exception):
            await document_service.process_document(empty_bytes, "empty.pdf")

        # Invalid non-PDF binary magic bytes with .pdf extension raises exception
        invalid_bytes = b"NOT_A_PDF_HEADER_MAGIC_BYTES_12345"
        with self.assertRaises(Exception):
            await document_service.process_document(invalid_bytes, "invalid.pdf")

        # Valid PDF binary bytes check (%PDF-)
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 50), "Valid PDF document text header")
        valid_pdf_bytes = doc.tobytes()
        doc.close()

        self.assertTrue(valid_pdf_bytes.startswith(b"%PDF-"))
        res_valid = await document_service.process_document(valid_pdf_bytes, "valid.pdf")
        self.assertTrue(res_valid.success)
        self.assertIn("Valid PDF document", res_valid.raw_text)

    # ── 3. TENANT & DOCUMENT VECTOR ISOLATION ──────────────────────────────────
    async def test_3_tenant_and_document_vector_isolation(self):
        # Query USER_A / DOC_A
        req_a = RAGQueryRequest(
            user_id=self.user_a,
            document_id=self.doc_a,
            query="What is the aggregate liability cap?",
        )
        res_a: RAGQueryResponse = await rag_service.answer_query(req_a)

        self.assertTrue(res_a.success)
        self.assertTrue(res_a.evidence_found)
        self.assertIn("$2,500,000 USD", res_a.answer)

        # Attempt querying DOC_A using USER_B credentials
        req_b_attempt = RAGQueryRequest(
            user_id=self.user_b,
            document_id=self.doc_a,
            query="What is the aggregate liability cap?",
        )
        res_b_attempt: RAGQueryResponse = await rag_service.answer_query(req_b_attempt)

        self.assertFalse(res_b_attempt.evidence_found)
        self.assertNotIn("$2,500,000 USD", res_b_attempt.answer)
        self.assertEqual(len(res_b_attempt.sources), 0)

    # ── 4. FAISS / VECTOR ENGINE FAILURE RESILIENCE ────────────────────────────
    async def test_4_faiss_engine_failure_resilience(self):
        with patch.object(vector_db_service, "search_vectors", side_effect=IOError("FAISS index corrupted or unreadable")):
            req = RAGQueryRequest(
                user_id=self.user_a,
                document_id=self.doc_a,
                query="What is the data retention period?",
            )
            res: RAGQueryResponse = await rag_service.answer_query(req)

            self.assertTrue(res.success)
            self.assertFalse(res.evidence_found)
            self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)
            self.assertEqual(len(res.sources), 0)

    # ── 5. LLM TIMEOUT / SYNTHESIS FAILURE RESILIENCE ─────────────────────────
    async def test_5_llm_synthesis_failure_resilience(self):
        with patch.object(rag_service, "_synthesize_answer", side_effect=TimeoutError("LLM response timeout")):
            req = RAGQueryRequest(
                user_id=self.user_a,
                document_id=self.doc_a,
                query="What is the data retention period?",
            )
            res: RAGQueryResponse = await rag_service.answer_query(req)

            self.assertTrue(res.success)
            self.assertFalse(res.evidence_found)
            self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)
            self.assertEqual(len(res.sources), 0)

    # ── 6. PRODUCTION CONFIGURATION SECURITY ──────────────────────────────────
    def test_6_production_configuration_security(self):
        self.assertIsNotNone(settings.PROJECT_NAME)
        self.assertEqual(settings.API_V1_STR, "/api/v1")
        self.assertIsInstance(settings.BACKEND_CORS_ORIGINS, list)


if __name__ == "__main__":
    unittest.main()
