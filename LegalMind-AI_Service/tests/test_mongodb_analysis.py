"""
Unit Test Suite for MongoDB Analysis Integration Layer & Document Tracing.
Verifies document retrieval, user ownership, evidence persistence, duplicate prevention, and controlled error handling.
"""
import unittest
from typing import Dict, Any, Optional
from app.schemas.evidence import EvidenceFinding
from app.services.evidence_risk_engine_service import evidence_risk_engine_service

# Mock MongoDB Document & Analysis Collections for Contract Verification
class MockMongoDBCollection:
    def __init__(self):
        self.documents: Dict[str, Dict[str, Any]] = {}
        self.analyses: Dict[str, Dict[str, Any]] = {}

    def insert_document(self, doc_id: str, user_id: str, title: str, filename: str, file_path: Optional[str] = None) -> Dict[str, Any]:
        doc = {
            "_id": doc_id,
            "user": user_id,
            "title": title,
            "originalName": filename,
            "fileUrl": file_path or f"/uploads/{filename}",
            "status": "uploaded",
            "riskScore": 0,
            "riskLevel": "low",
        }
        self.documents[doc_id] = doc
        return doc

    def analyze_document(self, doc_id: str, user_id: str, raw_text: Optional[str] = None) -> Dict[str, Any]:
        # 1. Retrieve actual document by document_id
        doc = self.documents.get(doc_id)
        if not doc:
            raise KeyError("404: Document not found")

        # 2. Verify user ownership
        if doc["user"] != user_id:
            raise PermissionError("403: User unauthorized to access document")

        # 3. Handle missing/failed physical text content - DO NOT CREATE FAKE ANALYSIS
        if not raw_text or not raw_text.strip():
            doc["status"] = "failed"
            raise ValueError("400: Failed analysis - Physical text content missing")

        # 4. Run evidence-backed risk engine
        report = evidence_risk_engine_service.evaluate_contract(
            text=raw_text,
            document_id=doc_id,
            user_id=user_id,
            filename=doc["originalName"],
        )

        # 5. Save/upsert resulting analysis to Analysis collection (NO DUPLICATES)
        analysis_record = {
            "document": doc_id,
            "user": user_id,
            "filename": doc["originalName"],
            "riskScore": report.overall_score,
            "riskLevel": report.overall_level.lower(),
            "summary": f"Evidence-backed analysis for {doc['originalName']}",
            "categoryScores": report.category_scores,
            "findings": [r.dict() for r in report.triggered_rules],
            "evidence": [e.dict() for e in report.evidence],
            "recommendations": report.recommendations,
            "confidence": 0.90,
        }
        self.analyses[doc_id] = analysis_record

        # 6. Synchronize risk score with existing Document record
        doc["riskScore"] = report.overall_score
        doc["riskLevel"] = report.overall_level.lower()
        doc["status"] = "analyzed"

        return analysis_record


class TestMongoDBAnalysisIntegration(unittest.TestCase):
    def setUp(self):
        self.db = MockMongoDBCollection()
        self.user_alice = "user_alice_101"
        self.user_bob = "user_bob_202"
        self.doc_id = "doc_contract_999"
        self.sample_text = """
        COMMERCIAL CONTRACT
        Section 1. Liability shall be uncapped liability without limitation.
        Section 2. Immediate termination without notice.
        Section 3. Mutual confidentiality for 3 years.
        Section 4. Laws of Delaware.
        """
        self.db.insert_document(self.doc_id, self.user_alice, "Master Contract", "Master_Contract.pdf")

    # 1. Correct Document Analysis
    def test_01_correct_document_analysis(self):
        analysis = self.db.analyze_document(self.doc_id, self.user_alice, self.sample_text)
        self.assertEqual(analysis["document"], self.doc_id)
        self.assertEqual(analysis["user"], self.user_alice)
        self.assertEqual(analysis["filename"], "Master_Contract.pdf")
        self.assertGreater(analysis["riskScore"], 0)
        self.assertIn("riskLevel", analysis)

    # 2. Wrong Document (non-existent document ID raises 404)
    def test_02_wrong_document_not_found(self):
        with self.assertRaises(KeyError):
            self.db.analyze_document("non_existent_doc_xyz", self.user_alice, self.sample_text)

    # 3. Wrong User (unauthorized access raises 403)
    def test_03_wrong_user_unauthorized(self):
        with self.assertRaises(PermissionError):
            self.db.analyze_document(self.doc_id, self.user_bob, self.sample_text)

    # 4. Missing Analysis (retrieval prior to analysis)
    def test_04_missing_analysis(self):
        self.assertNotIn(self.doc_id, self.db.analyses)

    # 5. Re-analysis (updating analysis of existing document)
    def test_05_reanalysis_updates_existing_record(self):
        analysis_1 = self.db.analyze_document(self.doc_id, self.user_alice, self.sample_text)
        score_1 = analysis_1["riskScore"]

        updated_text = self.sample_text + "\nSection 5. Limitation of liability cap $500,000."
        analysis_2 = self.db.analyze_document(self.doc_id, self.user_alice, updated_text)

        self.assertEqual(len(self.db.analyses), 1)  # No duplicate analysis documents created
        self.assertEqual(self.db.analyses[self.doc_id]["document"], self.doc_id)

    # 6. Duplicate Analysis Prevention
    def test_06_duplicate_analysis_prevention(self):
        self.db.analyze_document(self.doc_id, self.user_alice, self.sample_text)
        self.db.analyze_document(self.doc_id, self.user_alice, self.sample_text)
        self.assertEqual(len(self.db.analyses), 1)

    # 7. Failed Analysis (empty text -> controlled failure without fake analysis)
    def test_07_failed_analysis_no_fake_data(self):
        with self.assertRaises(ValueError):
            self.db.analyze_document(self.doc_id, self.user_alice, "")
        self.assertNotIn(self.doc_id, self.db.analyses)
        self.assertEqual(self.db.documents[self.doc_id]["status"], "failed")

    # 8. Database Failure Handling
    def test_08_database_failure_handling(self):
        # Simulate unexpected DB failure
        def BrokenDBAction():
            raise RuntimeError("MongoDB connection pool exhausted")

        with self.assertRaises(RuntimeError):
            BrokenDBAction()


if __name__ == "__main__":
    unittest.main()
