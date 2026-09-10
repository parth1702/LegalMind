"""
Unit & Integration Test Suite for Legal NER Entity Normalization & Deduplication (Phase 3.3).

Tests:
1. Label normalization into canonical vocabulary
2. Exact duplicate removal (same text, label, start, end)
3. Whitespace & casing comparison duplicate handling
4. Overlapping entity span resolution
5. Offset validation bounds (0 <= start < end <= len(text))
6. Invalid span handling (negative offsets / inverted spans)
7. Model confidence score preservation
8. Engine source field preservation ('legal_ner', 'spacy', 'huggingface', 'legal_matcher')
9. Page metadata preservation (metadata["page"])
10. Deterministic document ordering (start_char, then end_char)
11. Legal NER + spaCy duplicate handling
12. Legal NER + Regex matcher duplicate handling
13. Non-overlapping entities remain untouched
14. Malformed entity item crash prevention
15. EntityItem schema contract compatibility
"""
import unittest
from app.services.ner_service import ner_service
from app.schemas.ner import EntityItem, NERRequest


class TestNerNormalizationAndDeduplication(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.service = ner_service

    def test_1_label_normalization(self):
        e1 = EntityItem(text="John", label="PER", start_char=0, end_char=4, confidence=0.90, source="legal_ner")
        norm = self.service._validate_and_normalize_entity(e1, text_len=100)
        self.assertIsNotNone(norm)
        self.assertEqual(norm.label, "PERSON")

        e2 = EntityItem(text="GDPR", label="LAW", start_char=5, end_char=9, confidence=0.95, source="legal_ner")
        norm2 = self.service._validate_and_normalize_entity(e2, text_len=100)
        self.assertEqual(norm2.label, "LEGAL_REF")

    def test_2_exact_duplicate_removal(self):
        e1 = EntityItem(text="Acme Corp", label="ORGANIZATION", start_char=10, end_char=19, confidence=0.90, source="spacy")
        e2 = EntityItem(text="Acme Corp", label="ORGANIZATION", start_char=10, end_char=19, confidence=0.95, source="legal_ner")
        res = self.service._resolve_overlapping_spans([e1, e2], text_len=100)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0].confidence, 0.95)
        self.assertEqual(res[0].source, "legal_ner")

    def test_3_whitespace_casing_duplicate_comparison(self):
        e1 = EntityItem(text="  Acme Corp  ", label="ORGANIZATION", start_char=10, end_char=19, confidence=0.88, source="spacy")
        e2 = EntityItem(text="acme corp", label="ORGANIZATION", start_char=10, end_char=19, confidence=0.95, source="legal_ner")
        res = self.service._resolve_overlapping_spans([e1, e2], text_len=100)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0].confidence, 0.95)

    def test_4_overlapping_span_resolution(self):
        e1 = EntityItem(text="Acme Corp", label="CONTRACT_PARTY", start_char=10, end_char=19, confidence=0.96, source="legal_matcher")
        e2 = EntityItem(text="Acme", label="ORGANIZATION", start_char=10, end_char=14, confidence=0.88, source="spacy")
        res = self.service._resolve_overlapping_spans([e1, e2], text_len=100)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0].label, "CONTRACT_PARTY")

    def test_5_offset_validation_bounds(self):
        e1 = EntityItem(text="Valid Text", label="ORGANIZATION", start_char=0, end_char=10, confidence=0.90, source="spacy")
        norm = self.service._validate_and_normalize_entity(e1, text_len=100)
        self.assertIsNotNone(norm)

    def test_6_invalid_span_handling(self):
        e_neg = EntityItem(text="Invalid", label="PERSON", start_char=-5, end_char=5, confidence=0.90, source="spacy")
        norm_neg = self.service._validate_and_normalize_entity(e_neg, text_len=100)
        self.assertIsNone(norm_neg)

        e_inv = EntityItem(text="Inverted", label="PERSON", start_char=10, end_char=5, confidence=0.90, source="spacy")
        norm_inv = self.service._validate_and_normalize_entity(e_inv, text_len=100)
        self.assertIsNone(norm_inv)

        e_oob = EntityItem(text="Out of bounds", label="PERSON", start_char=90, end_char=120, confidence=0.90, source="spacy")
        norm_oob = self.service._validate_and_normalize_entity(e_oob, text_len=100)
        self.assertIsNone(norm_oob)

    def test_7_confidence_preservation(self):
        e = EntityItem(text="Section 4", label="LEGAL_REF", start_char=0, end_char=9, confidence=0.9712, source="legal_matcher")
        res = self.service._resolve_overlapping_spans([e], text_len=100)
        self.assertEqual(res[0].confidence, 0.9712)

    def test_8_source_preservation(self):
        e = EntityItem(text="John Doe", label="PERSON", start_char=0, end_char=8, confidence=0.92, source="legal_ner")
        res = self.service._resolve_overlapping_spans([e], text_len=100)
        self.assertEqual(res[0].source, "legal_ner")

    def test_9_page_metadata_preservation(self):
        e = EntityItem(text="Jane Smith", label="PERSON", start_char=0, end_char=10, confidence=0.90, source="legal_ner", metadata={"page": 4, "role": "Executive"})
        res = self.service._resolve_overlapping_spans([e], text_len=100)
        self.assertEqual(res[0].metadata["page"], 4)
        self.assertEqual(res[0].metadata["role"], "Executive")

    def test_10_deterministic_ordering(self):
        e1 = EntityItem(text="Third", label="ORGANIZATION", start_char=30, end_char=35, confidence=0.90, source="spacy")
        e2 = EntityItem(text="First", label="PERSON", start_char=0, end_char=5, confidence=0.90, source="spacy")
        e3 = EntityItem(text="Second", label="LOCATION", start_char=15, end_char=21, confidence=0.90, source="spacy")

        res = self.service._resolve_overlapping_spans([e1, e2, e3], text_len=100)
        self.assertEqual([e.text for e in res], ["First", "Second", "Third"])

    def test_11_legal_ner_and_spacy_deduplication(self):
        e_spacy = EntityItem(text="New York", label="GPE", start_char=0, end_char=8, confidence=0.88, source="spacy")
        e_legal = EntityItem(text="New York", label="LOC", start_char=0, end_char=8, confidence=0.94, source="legal_ner")
        res = self.service._resolve_overlapping_spans([e_spacy, e_legal], text_len=100)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0].label, "LOCATION")
        self.assertEqual(res[0].confidence, 0.94)

    def test_12_legal_ner_and_regex_deduplication(self):
        e_regex = EntityItem(text="Section 14.2", label="LEGAL_REF", start_char=0, end_char=12, confidence=0.93, source="legal_matcher")
        e_legal = EntityItem(text="Section 14.2", label="LAW", start_char=0, end_char=12, confidence=0.96, source="legal_ner")
        res = self.service._resolve_overlapping_spans([e_regex, e_legal], text_len=100)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0].label, "LEGAL_REF")
        self.assertEqual(res[0].confidence, 0.96)

    def test_13_non_overlapping_untouched(self):
        e1 = EntityItem(text="Alice", label="PERSON", start_char=0, end_char=5, confidence=0.90, source="spacy")
        e2 = EntityItem(text="Bob", label="PERSON", start_char=10, end_char=13, confidence=0.90, source="spacy")
        e3 = EntityItem(text="Charlie", label="PERSON", start_char=20, end_char=27, confidence=0.90, source="spacy")
        res = self.service._resolve_overlapping_spans([e1, e2, e3], text_len=100)
        self.assertEqual(len(res), 3)

    def test_14_malformed_entity_crash_prevention(self):
        malformed = None
        res = self.service._resolve_overlapping_spans([malformed], text_len=100)
        self.assertEqual(res, [])

    async def test_15_full_pipeline_schema_compatibility(self):
        req = NERRequest(text="Client Acme Corp agrees to pay $10,000 USD to Service Provider John Doe under Section 5.")
        res = await ner_service.extract_entities(req)
        self.assertTrue(res.success)
        self.assertGreater(res.total_entities, 0)
        for ent in res.entities:
            self.assertTrue(0 <= ent.start_char < ent.end_char <= len(req.text))
            self.assertIn(ent.label, ["PERSON", "ORGANIZATION", "LOCATION", "DATE", "MONEY", "LEGAL_REF", "CONTRACT_PARTY"])


if __name__ == "__main__":
    unittest.main()
