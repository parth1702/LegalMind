"""
Unit Test Suite for LegalMind AI Evidence Finding Model & Validation Engine.
Verifies all 9 mandatory evidence contract rules:
1. Valid evidence
2. Missing evidence
3. Invalid page
4. Invalid chunk ID
5. Empty evidence
6. Wrong document_id
7. Wrong user_id
8. Confidence outside 0–1
9. Malformed evidence
"""
import unittest
from pydantic import ValidationError
from app.schemas.evidence import EvidenceFinding
from app.services.evidence_service import evidence_service


class TestEvidenceModel(unittest.TestCase):
    def setUp(self):
        self.valid_params = {
            "document_id": "doc_test_101",
            "user_id": "user_test_202",
            "filename": "Commercial_Agreement.pdf",
            "category": "Liability",
            "rule_id": "RULE-INDEMNITY-01",
            "severity": "High",
            "finding": "Uncapped indemnification clause flagged in contract text.",
            "evidence_text": "Party A shall indemnify and hold harmless Party B without any monetary limitation.",
            "page": 3,
            "chunk_id": "chunk_003",
            "start_char": 450,
            "end_char": 535,
            "confidence": 0.95,
            "recommendation": "Add a strict liability cap equal to 1x annual fees.",
            "status": "valid",
        }

    # 1. Valid Evidence
    def test_01_valid_evidence(self):
        finding = EvidenceFinding(**self.valid_params)
        self.assertEqual(finding.document_id, "doc_test_101")
        self.assertEqual(finding.user_id, "user_test_202")
        self.assertEqual(finding.status, "valid")
        self.assertTrue(finding.is_valid_finding)
        self.assertEqual(finding.severity, "High")
        self.assertEqual(finding.page, 3)

    # 2. Missing Evidence (explicit status='not_detected' or status='insufficient_evidence')
    def test_02_missing_evidence(self):
        params = self.valid_params.copy()
        params["status"] = "not_detected"
        finding = EvidenceFinding(**params)
        self.assertFalse(finding.is_valid_finding)
        self.assertEqual(finding.status, "not_detected")

    # 3. Invalid Page (page < 1 raises ValidationError)
    def test_03_invalid_page(self):
        params = self.valid_params.copy()
        params["page"] = 0
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

        params["page"] = -5
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

    # 4. Invalid Chunk ID (empty or whitespace raises ValidationError)
    def test_04_invalid_chunk_id(self):
        params = self.valid_params.copy()
        params["chunk_id"] = ""
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

        params["chunk_id"] = "   "
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

    # 5. Empty Evidence (evidence_text="" triggers insufficient_evidence status)
    def test_05_empty_evidence(self):
        params = self.valid_params.copy()
        params["evidence_text"] = ""
        finding = EvidenceFinding(**params)
        self.assertEqual(finding.status, "insufficient_evidence")
        self.assertFalse(finding.is_valid_finding)
        self.assertIn("INSUFFICIENT EVIDENCE", finding.evidence_text)

    # 6. Wrong document_id (empty or whitespace raises ValidationError)
    def test_06_wrong_document_id(self):
        params = self.valid_params.copy()
        params["document_id"] = ""
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

        params["document_id"] = "   "
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

    # 7. Wrong user_id (empty or whitespace raises ValidationError)
    def test_07_wrong_user_id(self):
        params = self.valid_params.copy()
        params["user_id"] = ""
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

        params["user_id"] = "   "
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

    # 8. Confidence outside 0–1 (confidence < 0.0 or > 1.0 raises ValidationError)
    def test_08_confidence_outside_range(self):
        params = self.valid_params.copy()
        params["confidence"] = -0.5
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

        params["confidence"] = 1.5
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

    # 9. Malformed Evidence (start_char < 0 or end_char < start_char raises ValidationError)
    def test_09_malformed_evidence_offsets(self):
        params = self.valid_params.copy()
        params["start_char"] = -10
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)

        params = self.valid_params.copy()
        params["start_char"] = 500
        params["end_char"] = 400  # end_char < start_char
        with self.assertRaises(ValidationError):
            EvidenceFinding(**params)


class TestEvidenceService(unittest.TestCase):
    def test_service_create_finding_valid(self):
        finding = evidence_service.create_finding(
            document_id="doc_svc_1",
            user_id="user_svc_1",
            filename="Test_NDA.pdf",
            category="Confidentiality",
            rule_id="RULE-CONF-01",
            severity="Medium",
            finding="Standard confidentiality duration 5 years.",
            evidence_text="Confidential Information shall remain protected for 5 years.",
            page=2,
            chunk_id="chunk_002",
            start_char=100,
            end_char=160,
            confidence=0.92,
        )
        self.assertTrue(finding.is_valid_finding)
        self.assertEqual(finding.status, "valid")

    def test_service_locate_evidence(self):
        full_text = "Section 14. Limitation of Liability: In no event shall aggregate liability exceed fees paid."
        query = "Limitation of Liability"
        loc = evidence_service.locate_evidence_in_text(full_text, query)
        self.assertIsNotNone(loc)
        self.assertEqual(loc["start_char"], 12)
        self.assertEqual(loc["end_char"], 35)


if __name__ == "__main__":
    unittest.main()
