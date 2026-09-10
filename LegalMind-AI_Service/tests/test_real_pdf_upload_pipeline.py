import unittest
import os
import json
import fitz  # PyMuPDF
from pathlib import Path

from app.schemas.analysis import PipelineAnalysisRequest, PipelineAnalysisResponse
from app.services.pipeline_service import pipeline_service
from app.services.vector_db_service import vector_db_service


class TestRealPdfUploadPipeline(unittest.IsolatedAsyncioTestCase):

    async def test_real_uploaded_pdf_end_to_end(self):
        user_id = "real_test_user_777"
        doc_id = "doc_real_upload_999"
        filename = "real_uploaded_contract.pdf"

        unique_contract_text = (
            "CONFIDENTIAL MASTER SERVICES AGREEMENT 2026\n"
            "This Agreement is entered into by Alpha Enterprise Inc. ('Client') "
            "and Beta Global Solutions LLC ('Vendor').\n\n"
            "1. SERVICES & FEES.\n"
            "Vendor shall perform IT consulting services for a total fee of $150,000 USD.\n\n"
            "2. LIMITATION OF LIABILITY.\n"
            "Total aggregate liability under this agreement shall be capped at $50,000 USD.\n\n"
            "3. GOVERNING LAW.\n"
            "This Agreement shall be governed by the laws of New York State."
        )

        # Generate real PDF bytes dynamically using PyMuPDF
        pdf_doc = fitz.open()
        page = pdf_doc.new_page()
        page.insert_text((50, 50), unique_contract_text)
        pdf_bytes = pdf_doc.tobytes()
        pdf_doc.close()

        req = PipelineAnalysisRequest(
            user_id=user_id,
            doc_id=doc_id,
            filename=filename,
            jurisdiction="US",
        )

        # Execute complete 9-stage analysis pipeline with real binary PDF bytes
        res: PipelineAnalysisResponse = await pipeline_service.execute_full_pipeline(
            req, file_bytes=pdf_bytes
        )

        # 1. Verify Pipeline Status & Preservation of Metadata
        self.assertTrue(res.success)
        self.assertEqual(res.status, "completed")
        self.assertEqual(res.doc_id, doc_id)
        self.assertEqual(res.user_id, user_id)
        self.assertEqual(res.filename, filename)

        # 2. Verify Text Extraction operates on the real PDF bytes
        self.assertIsNotNone(res.extraction)
        extracted = res.extraction.normalized_text or res.extraction.raw_text
        self.assertIn("Alpha Enterprise Inc.", extracted)
        self.assertIn("Beta Global Solutions LLC", extracted)
        self.assertIn("$150,000 USD", extracted)

        # 3. Verify FAISS Vector Store Isolation & Metadata JSON Structure
        doc_dir, index_path, metadata_path = vector_db_service._get_isolated_paths(user_id, doc_id)
        self.assertTrue(index_path.exists(), f"FAISS index file missing at {index_path}")
        self.assertTrue(metadata_path.exists(), f"Metadata JSON file missing at {metadata_path}")

        # Check metadata.json content fields per Step 5 specification
        with open(metadata_path, "r", encoding="utf-8") as f:
            metadata_records = json.load(f)

        self.assertGreater(len(metadata_records), 0)
        first_chunk = metadata_records[0]

        self.assertEqual(first_chunk.get("user_id"), user_id)
        self.assertEqual(first_chunk.get("doc_id"), doc_id)
        self.assertEqual(first_chunk.get("document_id"), doc_id)
        self.assertEqual(first_chunk.get("filename"), filename)
        self.assertIn("page", first_chunk)
        self.assertIn("chunk_id", first_chunk)
        self.assertIn("text", first_chunk)
        self.assertIn("start_char", first_chunk)
        self.assertIn("end_char", first_chunk)
        self.assertIn("Alpha Enterprise Inc.", first_chunk["text"])


if __name__ == "__main__":
    unittest.main()
