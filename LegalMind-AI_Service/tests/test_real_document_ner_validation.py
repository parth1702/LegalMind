"""
Real Legal Document NER Validation Test Suite (Phase 3.5).

Validates the multi-engine Legal NER pipeline across two distinct real legal documents:
1. Document 1: Master Services Agreement (Commercial Contract)
2. Document 2: Statutory Legal Notice & High Court Citation (Indian Legal Notice / Court Judgment)
"""
import unittest
from app.services.ner_service import ner_service
from app.schemas.ner import NERRequest

# Sample Document 1: Commercial Master Services Agreement
DOC_1_MSA_TEXT = """
MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of this 1st day of January, 2026 ("Effective Date"), 
by and between Acme Corporation, a Delaware corporation having its principal place of business at 100 Corporate Parkway, 
Wilmington, DE 19801 ("Client"), and TechCorp Solutions LLC, a California limited liability company having its office at 
500 Silicon Way, San Francisco, CA 94105 ("Service Provider"). Executive Officers John Doe (Chief Executive Officer of Client) 
and Jane Smith (Managing Director of Service Provider) execute this binding document.

1. FEES AND COMPENSATION
Client agrees to pay Service Provider an aggregate fee of $250,000 USD for professional services rendered hereunder. 
All payments shall be due and payable within thirty (30) days of invoice date. Late payments shall incur interest at 1.5% per month.

2. GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware. 
Any dispute arising hereunder shall be submitted to binding arbitration in New York, NY under AAA rules.
"""

# Sample Document 2: Indian Statutory Notice & High Court Judgment Citation
DOC_2_STATUTORY_TEXT = """
LEGAL NOTICE AND STATUTORY DEMAND

IN THE HIGH COURT OF DELHI AT NEW DELHI
MEMORANDUM OF PROCEEDINGS UNDER SECTION 73 OF THE INDIAN CONTRACT ACT 1872

Notice is hereby served on behalf of Licensor Infosys Tech India Ltd having registered office at Electronic City, Bengaluru, 
to Licensee Global Ventures Pvt Ltd regarding breach of Section 27 non-compete covenants and non-payment under IT Act 2000 Section 66.

1. STATUTORY DEMAND AND DAMAGES
The Licensee is hereby demanded to pay liquidated damages of ₹5,00,000 INR (Rupees Five Lakhs Only) within 15 days of this 
notice issued on this 15th day of August, 2026, pursuant to Digital Personal Data Protection (DPDP) Act 2023 regulations.

2. JURISDICTION AND COURT VENUE
Failing compliance, legal proceedings shall be instituted in the High Court of Delhi at New Delhi. This notice is issued under 
the sole jurisdiction of courts at New Delhi, Republic of India.
"""


class TestRealDocumentNerValidation(unittest.IsolatedAsyncioTestCase):

    async def test_1_doc_1_commercial_contract_validation(self):
        req = NERRequest(text=DOC_1_MSA_TEXT, use_legal_ner=True, use_spacy=True, use_rules=True)
        res = await ner_service.extract_entities(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_entities, 0)

        # Check entity label coverage
        labels = {e.label for e in res.entities}
        self.assertIn("CONTRACT_PARTY", labels)
        self.assertIn("MONEY", labels)
        self.assertIn("DATE", labels)
        self.assertIn("LOCATION", labels)

        # Offset sanity check
        for ent in res.entities:
            self.assertTrue(0 <= ent.start_char < ent.end_char <= len(DOC_1_MSA_TEXT))
            self.assertGreater(ent.confidence, 0.0)

    async def test_2_doc_2_statutory_notice_validation(self):
        req = NERRequest(text=DOC_2_STATUTORY_TEXT, use_legal_ner=True, use_spacy=True, use_rules=True)
        res = await ner_service.extract_entities(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_entities, 0)

        # Check legal reference & money extraction
        labels = {e.label for e in res.entities}
        self.assertIn("LEGAL_REF", labels)
        self.assertIn("MONEY", labels)
        self.assertIn("LOCATION", labels)

        # Check specific legal statutory citations
        legal_refs = [e.text for e in res.entities if e.label == "LEGAL_REF"]
        self.assertTrue(any("Contract Act" in ref or "Section" in ref or "DPDP" in ref for ref in legal_refs))

        # Offset sanity check
        for ent in res.entities:
            self.assertTrue(0 <= ent.start_char < ent.end_char <= len(DOC_2_STATUTORY_TEXT))

    async def test_3_source_distribution_audit(self):
        req1 = NERRequest(text=DOC_1_MSA_TEXT)
        res1 = await ner_service.extract_entities(req1)
        sources1 = {e.source for e in res1.entities}
        self.assertGreater(len(sources1), 0)

        req2 = NERRequest(text=DOC_2_STATUTORY_TEXT)
        res2 = await ner_service.extract_entities(req2)
        sources2 = {e.source for e in res2.entities}
        self.assertGreater(len(sources2), 0)

    async def test_4_deduplication_and_overlap_resolution(self):
        req = NERRequest(text=DOC_1_MSA_TEXT)
        res = await ner_service.extract_entities(req)

        # Ensure no exact duplicate spans exist
        seen_spans = set()
        for ent in res.entities:
            span = (ent.start_char, ent.end_char)
            self.assertNotIn(span, seen_spans, f"Duplicate overlapping span detected: {span} ({ent.text})")
            seen_spans.add(span)

    async def test_5_deterministic_ordering_check(self):
        req = NERRequest(text=DOC_2_STATUTORY_TEXT)
        res = await ner_service.extract_entities(req)

        # Verify sorted start character order
        start_offsets = [e.start_char for e in res.entities]
        self.assertEqual(start_offsets, sorted(start_offsets))

    async def test_6_page_metadata_preservation(self):
        req = NERRequest(text=DOC_1_MSA_TEXT)
        res = await ner_service.extract_entities(req)

        for ent in res.entities:
            self.assertIsNotNone(ent.metadata)
            self.assertIsNotNone(ent.source)


if __name__ == "__main__":
    unittest.main()
