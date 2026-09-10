"""
End-to-End Real Document Validation Test Suite for LegalMind AI Evidence-Backed Risk Engine.

Tests:
1. Low-Risk Contract Evaluation (Score <= 35.0, LOW tier)
2. Medium-Risk Contract Evaluation (Score 36.0 to 50.0, MEDIUM tier)
3. High-Risk Contract Evaluation (Score >= 51.0, HIGH/CRITICAL tier)
4. Repeatability Test (same contract analyzed twice -> 100% identical scores)
5. Content Sensitivity Test (modifying liability clause alters score deterministically)
6. Filename Invariance Test (renaming file preserves score 100%)
"""
import unittest
from app.services.evidence_risk_engine_service import evidence_risk_engine_service

# Legally Distinct Real Document Text Fixtures
LOW_RISK_TEXT = """
STANDARD COMMERCIAL SERVICES AGREEMENT
This Agreement is entered into by and between Client Inc and Vendor Corp.
Section 1. Limitation of Liability. Aggregate monetary liability under this Agreement shall be limited to total fees paid in preceding 12 months. Consequential, indirect, and punitive damages are mutually waived.
Section 2. Indemnification. Parties agree to mutual indemnification against third-party claims arising from gross negligence.
Section 3. Termination. Either party may terminate this Agreement upon 60 days written notice.
Section 4. Confidentiality. Mutual non-disclosure obligations apply for a period of 3 years.
Section 5. Dispute Resolution. High Court of Delhi, New Delhi, India.
"""

MEDIUM_RISK_TEXT = """
MEDIUM EXPOSURE COMMERCIAL AGREEMENT
Section 1. Limitation of Liability. Maximum aggregate liability cap $5,000,000. Consequential damages allowed.
Section 2. Indemnification. Party A shall provide uncapped indemnity and defend Party B against all third-party lawsuits with duty to defend.
Section 3. Termination. Either party may terminate upon 7 days written notice or immediate termination for breach. Automatic renewal for 1 year.
Section 4. Payment Terms. Net 15 days. Late payment fee 1.5% per month interest rate penalty.
Section 5. Confidentiality. Unilateral non-disclosure obligations apply to Vendor only.
Section 6. Intellectual Property. Work for hire assignment of created deliverables.
Section 7. Data Protection. Personal data processing under DPDP Act 2023 without breach timeframe.
"""

HIGH_RISK_TEXT = """
HIGH RISK EXECUTIVE COMMERCIAL AGREEMENT
Section 1. Liability. Liability shall be uncapped liability without limitation. Consequential damages allowed.
Section 2. Indemnification. Vendor shall provide uncapped indemnity and hold harmless Client for all claims with duty to defend.
Section 3. Termination. Company retains sole right to immediate termination without notice. Contract auto-renew for 5 years.
Section 4. Payment. Late payment penalty interest rate 2% per month.
Section 5. Confidentiality. Unilateral NDA secrecy obligations apply to Vendor only.
Section 6. Intellectual Property. All work product assigned to Client as work for hire without pre-existing IP reservation.
Section 7. Data Protection. Personal data processing authorized without 72 hours breach notice.
Section 8. Restrictive Covenants. 24-month post-termination non-compete worldwide.
"""


class TestRealDocumentValidation(unittest.TestCase):
    # 1. Low-Risk Contract Evaluation
    def test_01_low_risk_contract_validation(self):
        doc_id = "doc_low_001"
        user_id = "user_val_101"
        filename = "low_risk_contract.pdf"

        report = evidence_risk_engine_service.evaluate_contract(
            text=LOW_RISK_TEXT,
            document_id=doc_id,
            user_id=user_id,
            filename=filename,
        )

        self.assertEqual(report.document_id, doc_id)
        self.assertEqual(report.user_id, user_id)
        self.assertEqual(report.filename, filename)

        # Low-Risk Criteria: Score <= 35.0 (LOW tier)
        self.assertLessEqual(report.overall_score, 35.0)
        self.assertEqual(report.overall_level, "LOW")
        self.assertEqual(report.category_scores["LIABILITY"], 0.0)

    # 2. Medium-Risk Contract Evaluation
    def test_02_medium_risk_contract_validation(self):
        doc_id = "doc_med_002"
        user_id = "user_val_101"
        filename = "medium_risk_contract.pdf"

        report = evidence_risk_engine_service.evaluate_contract(
            text=MEDIUM_RISK_TEXT,
            document_id=doc_id,
            user_id=user_id,
            filename=filename,
        )

        # Medium-Risk Criteria: Score 36.0 to 50.0 (MEDIUM tier)
        self.assertGreaterEqual(report.overall_score, 36.0)
        self.assertLessEqual(report.overall_score, 50.0)
        self.assertEqual(report.overall_level, "MEDIUM")
        self.assertGreater(len(report.triggered_rules), 0)

    # 3. High-Risk Contract Evaluation
    def test_03_high_risk_contract_validation(self):
        doc_id = "doc_high_003"
        user_id = "user_val_101"
        filename = "high_risk_contract.pdf"

        report = evidence_risk_engine_service.evaluate_contract(
            text=HIGH_RISK_TEXT,
            document_id=doc_id,
            user_id=user_id,
            filename=filename,
        )

        # High-Risk Criteria: Score >= 51.0 (HIGH or CRITICAL tier)
        self.assertGreaterEqual(report.overall_score, 51.0)
        self.assertIn(report.overall_level, ["HIGH", "CRITICAL"])
        self.assertGreaterEqual(report.category_scores["LIABILITY"], 50.0)
        self.assertGreaterEqual(report.category_scores["INDEMNIFICATION"], 50.0)
        self.assertGreaterEqual(report.category_scores["TERMINATION"], 50.0)

    # 4. Repeatability Test (Analyze same PDF twice -> 100% identical scores)
    def test_04_repeatability_validation(self):
        doc_id = "doc_repeat_004"
        user_id = "user_val_101"

        run_1 = evidence_risk_engine_service.evaluate_contract(
            text=HIGH_RISK_TEXT,
            document_id=doc_id,
            user_id=user_id,
            filename="repeat_contract.pdf",
        )
        run_2 = evidence_risk_engine_service.evaluate_contract(
            text=HIGH_RISK_TEXT,
            document_id=doc_id,
            user_id=user_id,
            filename="repeat_contract.pdf",
        )

        # Scores, tiers, category breakdown, and triggered rules MUST be 100% identical
        self.assertEqual(run_1.overall_score, run_2.overall_score)
        self.assertEqual(run_1.overall_level, run_2.overall_level)
        self.assertEqual(run_1.category_scores, run_2.category_scores)
        self.assertEqual(len(run_1.triggered_rules), len(run_2.triggered_rules))
        self.assertEqual([r.rule_id for r in run_1.triggered_rules], [r.rule_id for r in run_2.triggered_rules])

    # 5. Content Sensitivity Test (Change ONLY liability clause -> Liability score changes)
    def test_05_content_sensitivity_validation(self):
        doc_id = "doc_sens_005"
        user_id = "user_val_101"

        # Base low-risk evaluation
        low_report = evidence_risk_engine_service.evaluate_contract(
            text=LOW_RISK_TEXT,
            document_id=doc_id,
            user_id=user_id,
            filename="sensitivity_test.pdf",
        )

        # Modify ONLY liability clause in text
        modified_text = LOW_RISK_TEXT.replace(
            "Section 1. Limitation of Liability. Aggregate monetary liability under this Agreement shall be limited to total fees paid in preceding 12 months. Consequential, indirect, and punitive damages are mutually waived.",
            "Section 1. Liability. Liability shall be uncapped liability without limitation. Consequential damages allowed."
        )

        modified_report = evidence_risk_engine_service.evaluate_contract(
            text=modified_text,
            document_id=doc_id,
            user_id=user_id,
            filename="sensitivity_test.pdf",
        )

        # Liability score MUST increase
        self.assertGreater(modified_report.category_scores["LIABILITY"], low_report.category_scores["LIABILITY"])
        self.assertGreater(modified_report.overall_score, low_report.overall_score)

    # 6. Filename Invariance Test (Same content with two different filenames -> identical analysis)
    def test_06_filename_invariance_validation(self):
        doc_id = "doc_inv_006"
        user_id = "user_val_101"

        report_filename_A = evidence_risk_engine_service.evaluate_contract(
            text=LOW_RISK_TEXT,
            document_id=doc_id,
            user_id=user_id,
            filename="contract_version_alpha.pdf",
        )

        report_filename_B = evidence_risk_engine_service.evaluate_contract(
            text=LOW_RISK_TEXT,
            document_id=doc_id,
            user_id=user_id,
            filename="completely_different_filename_xyz99.pdf",
        )

        # Scores, tiers, and category scores MUST be 100% identical regardless of filename
        self.assertEqual(report_filename_A.overall_score, report_filename_B.overall_score)
        self.assertEqual(report_filename_A.overall_level, report_filename_B.overall_level)
        self.assertEqual(report_filename_A.category_scores, report_filename_B.category_scores)


if __name__ == "__main__":
    unittest.main()
