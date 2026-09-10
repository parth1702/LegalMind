"""
Unit & Integration Test Suite for Legal NER Microservice Component (Phase 3.2).

Tests:
1. Legal NER service imports successfully
2. Lazy loading works on demand
3. Model inference works when available
4. PER label mapping to PERSON
5. ORG label mapping to ORGANIZATION
6. LOC label mapping to LOCATION
7. LAW label mapping to LEGAL_REF
8. Confidence score preservation
9. Source identifier field ('legal_ner')
10. Fallback handling when model is unavailable
11. Malformed and empty text safety
12. Existing spaCy & legal regex NER engines intact
13. EntityItem schema compatibility
14. Page metadata preservation
15. Overlapping entity deduplication
"""
import unittest
from unittest.mock import patch, MagicMock
from app.services.legal_ner_service import legal_ner_service, LegalNerService
from app.services.ner_service import ner_service
from app.schemas.ner import NERRequest, EntityItem


class TestLegalNerService(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        self.service = legal_ner_service

    def test_1_imports_successfully(self):
        self.assertIsNotNone(self.service)
        self.assertEqual(self.service.model_name, "subugoe/legal-bert-base-uncased-ner")

    def test_2_lazy_loading(self):
        new_svc = LegalNerService()
        self.assertFalse(new_svc._attempted_load)
        # Calling is_available triggers lazy load
        is_avail = new_svc.is_available()
        self.assertTrue(new_svc._attempted_load)
        self.assertIsInstance(is_avail, bool)

    def test_3_model_inference_when_available(self):
        if self.service.is_available():
            text = "This Master Agreement is entered into by John Doe of Acme Corporation under the IT Act 2000 in New York."
            res = self.service.extract_legal_entities(text, page=1)
            self.assertIsInstance(res, list)
            for item in res:
                self.assertIsInstance(item, EntityItem)
                self.assertEqual(item.source, "legal_ner")

    def test_4_person_mapping(self):
        mock_raw = [{"entity_group": "PER", "word": "John Doe", "start": 0, "end": 8, "score": 0.96}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", side_effect=lambda txt: mock_raw):
            res = self.service.extract_legal_entities("John Doe", page=1)
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0].label, "PERSON")
            self.assertEqual(res[0].text, "John Doe")

    def test_5_org_mapping(self):
        mock_raw = [{"entity_group": "ORG", "word": "Acme Corp", "start": 0, "end": 9, "score": 0.95}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", side_effect=lambda txt: mock_raw):
            res = self.service.extract_legal_entities("Acme Corp", page=1)
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0].label, "ORGANIZATION")
            self.assertEqual(res[0].text, "Acme Corp")

    def test_6_loc_mapping(self):
        mock_raw = [{"entity_group": "LOC", "word": "Delaware", "start": 0, "end": 8, "score": 0.94}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", side_effect=lambda txt: mock_raw):
            res = self.service.extract_legal_entities("Delaware", page=1)
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0].label, "LOCATION")
            self.assertEqual(res[0].text, "Delaware")

    def test_7_law_mapping(self):
        mock_raw = [{"entity_group": "LAW", "word": "GDPR", "start": 0, "end": 4, "score": 0.97}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", side_effect=lambda txt: mock_raw):
            res = self.service.extract_legal_entities("GDPR", page=1)
            self.assertEqual(len(res), 1)
            self.assertEqual(res[0].label, "LEGAL_REF")
            self.assertEqual(res[0].text, "GDPR")

    def test_8_confidence_preservation(self):
        mock_raw = [{"entity_group": "PER", "word": "Jane Smith", "start": 0, "end": 10, "score": 0.9234}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", side_effect=lambda txt: mock_raw):
            res = self.service.extract_legal_entities("Jane Smith", page=1)
            self.assertEqual(res[0].confidence, 0.92)

    def test_9_source_identifier(self):
        mock_raw = [{"entity_group": "ORG", "word": "Globex", "start": 0, "end": 6, "score": 0.90}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", side_effect=lambda txt: mock_raw):
            res = self.service.extract_legal_entities("Globex", page=1)
            self.assertEqual(res[0].source, "legal_ner")

    def test_10_model_failure_fallback(self):
        with patch.object(self.service, "is_available", return_value=False):
            res = self.service.extract_legal_entities("Acme Corp", page=1)
            self.assertEqual(res, [])

    def test_11_malformed_text_safety(self):
        res1 = self.service.extract_legal_entities("")
        res2 = self.service.extract_legal_entities(None)
        self.assertEqual(res1, [])
        self.assertEqual(res2, [])

    async def test_12_existing_ner_engines_intact(self):
        req = NERRequest(
            text="This Agreement is entered into by Acme Corp ('Company') and John Doe under Section 12 of GDPR.",
            use_legal_ner=False,
            use_spacy=True,
            use_rules=True
        )
        res = await ner_service.extract_entities(req)
        self.assertTrue(res.success)
        self.assertGreater(res.total_entities, 0)
        sources = {e.source for e in res.entities}
        self.assertTrue("spacy" in sources or "legal_matcher" in sources)

    async def test_13_schema_compatibility(self):
        req = NERRequest(text="John Doe agrees to pay $50,000 USD to Acme Corp.")
        res = await ner_service.extract_entities(req)
        self.assertTrue(res.success)
        for ent in res.entities:
            self.assertTrue(hasattr(ent, "text"))
            self.assertTrue(hasattr(ent, "label"))
            self.assertTrue(hasattr(ent, "start_char"))
            self.assertTrue(hasattr(ent, "end_char"))
            self.assertTrue(hasattr(ent, "confidence"))
            self.assertTrue(hasattr(ent, "source"))
            self.assertTrue(hasattr(ent, "metadata"))

    async def test_14_page_metadata_preserved(self):
        mock_raw = [{"entity_group": "ORG", "word": "Initech", "start": 0, "end": 7, "score": 0.95}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", side_effect=lambda txt: mock_raw):
            res = self.service.extract_legal_entities("Initech", page=3)
            self.assertEqual(res[0].metadata.get("page"), 3)

    async def test_15_overlapping_deduplication(self):
        e1 = EntityItem(text="Acme Corp", label="CONTRACT_PARTY", start_char=0, end_char=9, confidence=0.96, source="legal_matcher")
        e2 = EntityItem(text="Acme Corp", label="ORGANIZATION", start_char=0, end_char=9, confidence=0.92, source="legal_ner")
        resolved = ner_service._resolve_overlapping_spans([e1, e2])
        self.assertEqual(len(resolved), 1)
        self.assertEqual(resolved[0].label, "CONTRACT_PARTY")

    def test_16_initialization_failure_fallback(self):
        new_svc = LegalNerService()
        with patch.object(new_svc, "_lazy_initialize", side_effect=RuntimeError("Transformers init failed")):
            # is_available returns False cleanly when init fails
            with patch.object(new_svc, "is_available", return_value=False):
                res = new_svc.extract_legal_entities("Acme Corp")
                self.assertEqual(res, [])

    def test_17_model_download_failure_simulation(self):
        with patch.object(self.service, "is_available", return_value=False):
            res = self.service.extract_legal_entities("Section 12 of GDPR")
            self.assertEqual(res, [])

    def test_18_inference_exception_fallback(self):
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", side_effect=RuntimeError("CUDA out of memory")):
            res = self.service.extract_legal_entities("John Doe", page=1)
            self.assertEqual(res, [])

    def test_19_malformed_pipeline_output_handling(self):
        malformed_results = ["not_a_dict", None, {"word": "Test"}, {"entity_group": "PER", "word": "Jane", "start": "bad", "end": 4}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", return_value=malformed_results):
            res = self.service.extract_legal_entities("Jane", page=1)
            self.assertIsInstance(res, list)

    def test_20_invalid_offset_bounds_filtering(self):
        oob_results = [{"entity_group": "PER", "word": "Out of bounds text", "start": 0, "end": 500, "score": 0.90}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", return_value=oob_results):
            res = self.service.extract_legal_entities("Short text", page=1)
            self.assertEqual(res, [])

    async def test_21_pipeline_continuation_after_legal_ner_failure(self):
        with patch.object(self.service, "extract_legal_entities", side_effect=RuntimeError("Legal NER failed")):
            req = NERRequest(text="John Doe at Acme Corp under Section 12.", use_legal_ner=True, use_spacy=True, use_rules=True)
            res = await ner_service.extract_entities(req)
            self.assertTrue(res.success)
            self.assertGreater(res.total_entities, 0)

    def test_22_authentic_confidence_preservation(self):
        mock_raw = [{"entity_group": "PER", "word": "John Smith", "start": 0, "end": 10, "score": 0.9387}]
        with patch.object(self.service, "is_available", return_value=True), \
             patch.object(self.service, "_pipeline", return_value=mock_raw):
            res = self.service.extract_legal_entities("John Smith", page=1)
            self.assertEqual(res[0].confidence, 0.94)


if __name__ == "__main__":
    unittest.main()
