"""
Unit Test Suite for Legal Fact Extraction Engine.
Tests extraction across 3 distinct contract fixtures with deliberately different legal clauses.
Verifies that changing document content changes extracted facts deterministically.
"""
import unittest
from app.services.fact_extraction_service import fact_extraction_service


FIXTURE_A_MASTER_SERVICES_AGREEMENT = """
MASTER SERVICES AGREEMENT
This Master Services Agreement ("Agreement") is entered into by and between Vendor Inc. and Client Corp.

Section 8. Limitation of Liability.
In no event shall either party's aggregate liability under this Agreement exceed total fees paid in preceding 12 months ($1,000,000 maximum liability cap).
Neither party shall be liable for indirect or consequential damages, except in cases of gross negligence or willful misconduct.

Section 12. Term and Termination.
Either party may terminate this Agreement for convenience upon 30 days written notice.
Contract shall automatically renew for 1 year terms unless non-renewal notice is provided 60 days prior.

Section 14. Confidentiality.
Each party agrees to maintain mutual confidentiality for 3 years following termination.

Section 18. Governing Law.
This Agreement shall be governed by the laws of the State of Delaware.
"""

FIXTURE_B_EMPLOYMENT_AGREEMENT = """
EXECUTIVE EMPLOYMENT AGREEMENT
This Employment Agreement is between TechCorp Ltd. ("Company") and Jane Doe ("Executive").

Section 5. Restrictive Covenants and Non-Compete.
During employment and for a period of 12 months post-termination, Executive agrees to a non-compete covenant within the State of California.
Executive shall not solicit employees or customers of Company.

Section 7. Intellectual Property Assignment.
Executive agrees that all work product, patents, and copyrights created during employment shall be work for hire and assigned exclusively to Company.

Section 9. Immediate Termination.
Company retains the right to terminate Executive immediately without notice for cause or material breach.
Liability remains uncapped for gross negligence or statutory breaches.
"""

FIXTURE_C_DATA_PROCESSING_AGREEMENT = """
DIGITAL PERSONAL DATA PROCESSING AGREEMENT (DPDP 2023)
This Data Processing Agreement is by and between Data Controller and Data Processor.

Section 3. Data Protection and Personal Data Processing.
Data Processor shall process personal data solely upon explicit consent of Data Principal under the DPDP Act 2023.
In the event of a security breach, Data Processor shall notify Data Controller within 72 hours.

Section 6. Payment & Invoicing.
Payment period shall be Net 45 days. Late payment fee of 1.5% per month interest rate shall apply to overdue balances.

Section 10. Dispute Resolution & Arbitration.
Any dispute shall be referred to binding arbitration with arbitration seat in the High Court of Delhi.
"""


class TestLegalFactExtraction(unittest.TestCase):

    def test_fixture_a_master_services_agreement(self):
        res = fact_extraction_service.extract_facts(
            text=FIXTURE_A_MASTER_SERVICES_AGREEMENT,
            document_id="doc_msa_001",
            user_id="user_corp_1",
            filename="MSA_Agreement.pdf",
        )

        self.assertTrue(res.liability.liability_clause_present)
        self.assertTrue(res.liability.liability_cap_present)
        self.assertIn("12 months", res.liability.cap_amount)

        self.assertTrue(res.termination.termination_for_convenience)
        self.assertIn("30 days", res.termination.notice_period)

        self.assertTrue(res.confidentiality.confidentiality_present)
        self.assertEqual(res.confidentiality.nature, "mutual")
        self.assertEqual(res.confidentiality.duration, "3 years")

        self.assertIn("Delaware", res.governing_law_dispute.governing_law)

    def test_fixture_b_employment_agreement(self):
        res = fact_extraction_service.extract_facts(
            text=FIXTURE_B_EMPLOYMENT_AGREEMENT,
            document_id="doc_emp_002",
            user_id="user_exec_2",
            filename="Employment_Agreement.pdf",
        )

        self.assertTrue(res.non_compete_restrictions.non_compete_present)
        self.assertEqual(res.non_compete_restrictions.duration, "12 months")

        self.assertIsNotNone(res.intellectual_property.work_product_ownership)
        self.assertTrue(res.termination.termination_for_cause)

    def test_fixture_c_data_processing_agreement(self):
        res = fact_extraction_service.extract_facts(
            text=FIXTURE_C_DATA_PROCESSING_AGREEMENT,
            document_id="doc_dpa_003",
            user_id="user_dpo_3",
            filename="DPDP_Agreement.pdf",
        )

        self.assertTrue(res.data_protection.personal_data_processing)
        self.assertEqual(res.data_protection.breach_notification_timeframe, "72 hours")

        self.assertTrue(res.payment.late_payment_fee_present)
        self.assertEqual(res.payment.interest_rate, "1.5% per month")

        self.assertTrue(res.governing_law_dispute.arbitration_clause_present)
        self.assertEqual(res.governing_law_dispute.arbitration_seat, "High Court of Delhi")

    def test_facts_change_when_document_changes(self):
        res_a = fact_extraction_service.extract_facts(FIXTURE_A_MASTER_SERVICES_AGREEMENT, "d1", "u1")
        res_b = fact_extraction_service.extract_facts(FIXTURE_B_EMPLOYMENT_AGREEMENT, "d2", "u1")
        res_c = fact_extraction_service.extract_facts(FIXTURE_C_DATA_PROCESSING_AGREEMENT, "d3", "u1")

        # Verify Fixture A has Delaware law, Fixture C has Delhi arbitration
        self.assertNotEqual(res_a.governing_law_dispute.governing_law, res_c.governing_law_dispute.governing_law)
        # Verify Fixture B has non-compete, Fixture A does not
        self.assertTrue(res_b.non_compete_restrictions.non_compete_present)
        self.assertFalse(res_a.non_compete_restrictions.non_compete_present or False)
        # Verify Fixture C has 72 hours breach notice, Fixture A does not
        self.assertEqual(res_c.data_protection.breach_notification_timeframe, "72 hours")
        self.assertIsNone(res_a.data_protection.breach_notification_timeframe)


if __name__ == "__main__":
    unittest.main()
