import unittest
import json
import fitz  # PyMuPDF
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse, RAGSourceReference
from app.schemas.analysis import PipelineAnalysisRequest
from app.schemas.embeddings import DocumentIndexRequest
from app.services.pipeline_service import pipeline_service
from app.services.vector_db_service import vector_db_service
from app.services.rag_service import rag_service, NO_EVIDENCE_ANSWER


class TestRealDocumentRAG(unittest.IsolatedAsyncioTestCase):

    @classmethod
    def setUpClass(cls):
        cls.user_id = "real_rag_user_100"
        cls.doc_id = "real_rag_doc_200"

        cls.realistic_contract = (
            "COMMERCIAL MASTER SERVICES AGREEMENT\n\n"
            "This Agreement is made and effective as of January 15, 2026, by and between "
            "Acme Enterprises Inc. ('Customer') and Zenith Solutions LLC ('Vendor').\n\n"
            "1. PAYMENT TERMS.\n"
            "Customer agrees to pay all undisputed invoices within Net 45 days after invoice receipt.\n\n"
            "2. TERMINATION.\n"
            "Either party may terminate this agreement upon 30 days written notice prior to annual renewal.\n\n"
            "3. LIMITATION OF LIABILITY.\n"
            "Total aggregate liability under this agreement shall be capped at $100,000 USD.\n\n"
            "4. CONFIDENTIALITY.\n"
            "Both parties shall maintain strict confidentiality over proprietary technology for 5 years.\n\n"
            "5. GOVERNING LAW.\n"
            "This Agreement shall be governed by and construed in accordance with the laws of the State of New York."
        )

    async def asyncSetUp(self):
        # Index realistic legal contract document through real pipeline
        idx_req = DocumentIndexRequest(
            doc_id=self.doc_id,
            user_id=self.user_id,
            filename="master_services_agreement_2026.pdf",
            raw_text=self.realistic_contract,
        )
        await vector_db_service.index_document(idx_req)

    # ── TASK 1: REAL DOCUMENT RAG TEST ──────────────────────────────────────────
    async def test_task1_real_document_rag_query(self):
        query_req = RAGQueryRequest(
            user_id=self.user_id,
            document_id=self.doc_id,
            query="What is the limitation of liability cap?",
        )

        res: RAGQueryResponse = await rag_service.answer_query(query_req)

        # 1. Verify RAG returns success=True
        self.assertTrue(res.success)
        self.assertTrue(res.evidence_found)
        self.assertGreater(res.confidence_score, 0.0)

        # 2. Answer based on retrieved document evidence
        self.assertIn("$100,000 USD", res.answer)

        # 3 & 4. Verify document_id and user_id match
        self.assertEqual(res.metadata.get("user_id"), self.user_id)
        self.assertEqual(res.metadata.get("doc_id"), self.doc_id)

        # 5. Returned sources non-empty
        self.assertGreater(len(res.sources), 0)
        self.assertGreater(len(res.retrieved_chunks), 0)

        # 6. Verify source fields
        first_src = res.sources[0]
        self.assertEqual(first_src.doc_id, self.doc_id)
        self.assertEqual(first_src.user_id, self.user_id)
        self.assertGreaterEqual(first_src.page, 1)
        self.assertIsNotNone(first_src.chunk_id)
        self.assertIsNotNone(first_src.text_snippet)
        self.assertGreater(first_src.score, 0.0)

        # 7. Source text contains relevant evidence
        has_evidence = any("100,000" in chunk.text for chunk in res.retrieved_chunks)
        self.assertTrue(has_evidence, "Retrieved chunks should contain liability evidence ($100,000 USD)")

        # 8. Citations refer to retrieved sources ([Source 1])
        self.assertIn("[Source 1]", res.answer)

    # ── TASK 2: CITATION VALIDATION ────────────────────────────────────────────
    async def test_task2_citation_validation(self):
        # Valid citation verification
        sources = [
            RAGSourceReference(
                source_id="[Source 1]",
                doc_id=self.doc_id,
                user_id=self.user_id,
                page=1,
                chunk_id=1,
                score=0.85,
                text_snippet="Total aggregate liability capped at $100,000 USD",
            )
        ]
        valid_ans = "Based on [Source 1], liability is capped at $100,000 USD [Source 1]."
        is_valid, sanitized = rag_service._validate_answer_citations(
            valid_ans, sources, self.user_id, self.doc_id
        )
        self.assertTrue(is_valid)
        self.assertEqual(sanitized, valid_ans)

        # Invalid citation verification ([Source 99] / [Source 999])
        invalid_ans = "Liability is capped at $100,000 USD [Source 99]."
        is_valid_inv, sanitized_inv = rag_service._validate_answer_citations(
            invalid_ans, sources, self.user_id, self.doc_id
        )
        self.assertFalse(is_valid_inv)
        self.assertEqual(sanitized_inv, NO_EVIDENCE_ANSWER)

    # ── TASK 3: NO-EVIDENCE TEST ───────────────────────────────────────────────
    async def test_task3_no_evidence_query(self):
        query_req = RAGQueryRequest(
            user_id=self.user_id,
            document_id=self.doc_id,
            query="What are the hazardous waste disposal penalties?",
        )

        res: RAGQueryResponse = await rag_service.answer_query(query_req)

        self.assertTrue(res.success)
        self.assertFalse(res.evidence_found)
        self.assertEqual(res.confidence_score, 0.0)
        self.assertEqual(res.answer, NO_EVIDENCE_ANSWER)
        self.assertEqual(len(res.sources), 0)
        self.assertEqual(len(res.retrieved_chunks), 0)
        self.assertNotIn("hazardous", res.answer.lower())

    # ── TASK 4: CROSS-DOCUMENT ISOLATION ───────────────────────────────────────
    async def test_task4_cross_document_isolation(self):
        doc_a_id = "doc_iso_A"
        doc_b_id = "doc_iso_B"

        # Index DOC_A
        await vector_db_service.index_document(
            DocumentIndexRequest(
                doc_id=doc_a_id,
                user_id=self.user_id,
                filename="doc_A.pdf",
                raw_text="Contract Alpha annual license fee is $50,000 USD payable quarterly.",
            )
        )

        # Index DOC_B
        await vector_db_service.index_document(
            DocumentIndexRequest(
                doc_id=doc_b_id,
                user_id=self.user_id,
                filename="doc_B.pdf",
                raw_text="Contract Beta annual license fee is $950,000 USD payable upfront.",
            )
        )

        # Query DOC_A while asking for DOC_A fee
        query_req = RAGQueryRequest(
            user_id=self.user_id,
            document_id=doc_a_id,
            query="What is the annual license fee?",
        )

        res: RAGQueryResponse = await rag_service.answer_query(query_req)

        self.assertTrue(res.success)
        self.assertTrue(res.evidence_found)
        self.assertIn("$50,000 USD", res.answer)
        self.assertNotIn("$950,000 USD", res.answer)

        # Verify no DOC_B source appears
        for src in res.sources:
            self.assertEqual(src.doc_id, doc_a_id)

    # ── TASK 5: CROSS-USER ISOLATION ───────────────────────────────────────────
    async def test_task5_cross_user_isolation(self):
        user_a = "user_iso_A"
        user_b = "user_iso_B"
        doc_id = "doc_shared_id"

        await vector_db_service.index_document(
            DocumentIndexRequest(
                doc_id=doc_id,
                user_id=user_a,
                filename="secret_A.pdf",
                raw_text="User A secret security key is AlphaKey99.",
            )
        )

        await vector_db_service.index_document(
            DocumentIndexRequest(
                doc_id=doc_id,
                user_id=user_b,
                filename="secret_B.pdf",
                raw_text="User B secret security key is BetaKey88.",
            )
        )

        # User A query
        res_a: RAGQueryResponse = await rag_service.answer_query(
            RAGQueryRequest(user_id=user_a, document_id=doc_id, query="What is the secret security key?")
        )

        self.assertTrue(res_a.success)
        self.assertIn("AlphaKey99", res_a.answer)
        self.assertNotIn("BetaKey88", res_a.answer)
        for src in res_a.sources:
            self.assertEqual(src.user_id, user_a)

    # ── TASK 6: SOURCE QUALITY FILTERING ───────────────────────────────────────
    def test_task6_source_quality_rejection(self):
        # Construct mock search results with malformed attributes
        class MockResult:
            def __init__(self, doc_id, user_id, page, chunk_id, text, score):
                self.doc_id = doc_id
                self.user_id = user_id
                self.page = page
                self.chunk_id = chunk_id
                self.text = text
                self.score = score

        malformed_results = [
            MockResult(None, "u1", 1, 1, "text", 0.9),          # missing doc_id
            MockResult("d1", None, 1, 1, "text", 0.9),          # missing user_id
            MockResult("d1", "u1", -1, 1, "text", 0.9),         # invalid page
            MockResult("d1", "u1", 1, None, "text", 0.9),       # missing chunk_id
            MockResult("d1", "u1", 1, 1, "   ", 0.9),           # empty text
            MockResult("d1", "u1", 1, 1, "text", -0.5),         # invalid score (<0)
            MockResult("d1", "u1", 1, 1, "text", 1.5),          # invalid score (>1)
            MockResult("d1", "u1", 1, 1, "Valid text", 0.85),   # VALID ITEM
        ]

        context_str, sources, raw_chunks = rag_service._construct_context(malformed_results)

        # Only the single valid item should survive
        self.assertEqual(len(sources), 1)
        self.assertEqual(sources[0].source_id, "[Source 1]")
        self.assertEqual(sources[0].doc_id, "d1")
        self.assertEqual(sources[0].user_id, "u1")
        self.assertEqual(sources[0].text_snippet, "Valid text")

    # ── TASK 7: REAL UPLOADED PDF END-TO-END RAG ──────────────────────────────
    async def test_task7_real_uploaded_pdf_rag(self):
        pdf_user_id = "user_pdf_rag_99"
        pdf_doc_id = "doc_pdf_rag_99"
        filename = "software_license_agreement.pdf"

        pdf_contract_text = (
            "SOFTWARE LICENSE AGREEMENT 2026\n"
            "This Agreement is made by and between TechGiant Inc. ('Licensor') and Enterprise Solutions Ltd. ('Licensee').\n\n"
            "1. SOFTWARE GRANT.\n"
            "Licensor grants Licensee a non-exclusive license to use the Software.\n\n"
            "2. ANNUAL SUBSCRIPTION FEE.\n"
            "Licensee shall pay an annual subscription fee of $250,000 USD.\n\n"
            "3. ARBITRATION VENUE.\n"
            "Any disputes shall be resolved by binding arbitration seated in London, United Kingdom."
        )

        # Generate real binary PDF bytes using PyMuPDF
        pdf_doc = fitz.open()
        page = pdf_doc.new_page()
        page.insert_text((50, 50), pdf_contract_text)
        pdf_bytes = pdf_doc.tobytes()
        pdf_doc.close()

        # Run complete pipeline (Upload -> Extraction -> Preprocessing -> Chunking -> Embeddings -> FAISS)
        pipe_req = PipelineAnalysisRequest(
            user_id=pdf_user_id,
            doc_id=pdf_doc_id,
            filename=filename,
            jurisdiction="UK",
        )
        pipe_res = await pipeline_service.execute_full_pipeline(pipe_req, file_bytes=pdf_bytes)
        self.assertTrue(pipe_res.success)
        self.assertEqual(pipe_res.status, "completed")

        # Now query RAG Co-Pilot without mocking the retrieval layer
        query_req = RAGQueryRequest(
            user_id=pdf_user_id,
            document_id=pdf_doc_id,
            query="What is the annual subscription fee?",
        )

        rag_res: RAGQueryResponse = await rag_service.answer_query(query_req)

        self.assertTrue(rag_res.success)
        self.assertTrue(rag_res.evidence_found)
        self.assertIn("$250,000 USD", rag_res.answer)
        self.assertIn("[Source 1]", rag_res.answer)
        self.assertGreater(len(rag_res.sources), 0)
        self.assertEqual(rag_res.sources[0].doc_id, pdf_doc_id)
        self.assertEqual(rag_res.sources[0].user_id, pdf_user_id)


if __name__ == "__main__":
    unittest.main()
