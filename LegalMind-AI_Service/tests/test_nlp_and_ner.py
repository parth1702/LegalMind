import unittest
from app.schemas.preprocessing import PreprocessingRequest, PreprocessingResponse
from app.schemas.ner import NERRequest, NERResponse
from app.services.preprocessing_service import preprocessing_service
from app.services.ner_service import ner_service


class TestNLPAndNER(unittest.IsolatedAsyncioTestCase):

    async def test_preprocessing_cleaning_and_chunking(self):
        raw_legal_text = (
            "THIS AGREEMENT is entered into on January 15, 2024, by and between "
            "Acme Corp., a Delaware corporation (“Disclosing Party”), and Beta LLC (“Receiving Party”).\n\n"
            "Section 1.1 Confidential Information.\n"
            "The Receiving Party agrees not to disclose confidential information for a period of 5 years.\n"
            "The total penalty for breach shall be $500,000 USD, enforceable in the State of California."
        )

        req = PreprocessingRequest(
            raw_text=raw_legal_text,
            clean_whitespace=True,
            normalize_ocr=True,
            chunk_size=20,
            chunk_overlap=5,
        )

        res: PreprocessingResponse = await preprocessing_service.preprocess(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_characters, 0)
        self.assertGreater(res.total_words, 0)
        self.assertGreaterEqual(res.total_sentences, 3)
        self.assertGreaterEqual(res.total_paragraphs, 2)
        self.assertGreater(len(res.chunks), 0)
        self.assertEqual(res.chunks[0].chunk_id, 1)
        self.assertGreater(res.chunks[0].word_count, 0)
        self.assertGreater(res.chunks[0].char_count, 0)

    async def test_ner_all_entity_categories(self):
        sample_legal_contract = (
            "THIS SERVICES AGREEMENT (the “Agreement”) is made this 12th day of March, 2024, "
            "by and between John Doe, an individual (“Consultant”), and Global Tech Inc. (“Company”).\n"
            "Consultant agrees to provide software consulting services in San Francisco, State of California in accordance with Section 4.2 of Article IV.\n"
            "In consideration for the Services, Company shall pay Consultant a total fee of $150,000 USD.\n"
            "This Agreement shall be governed by the laws of the State of New York and subject to federal jurisdiction under 15 U.S.C. § 78a."
        )

        req = NERRequest(
            text=sample_legal_contract,
            use_huggingface=False,
            use_spacy=True,
            use_rules=True,
        )

        res: NERResponse = await ner_service.extract_entities(req)

        self.assertTrue(res.success)
        self.assertGreater(res.total_entities, 0)
        self.assertEqual(len(res.entities), res.total_entities)
        self.assertIsInstance(res.summary, dict)

        extracted_labels = {ent.label for ent in res.entities}

        self.assertTrue("PERSON" in extracted_labels or "CONTRACT_PARTY" in extracted_labels)
        self.assertTrue("ORGANIZATION" in extracted_labels or "CONTRACT_PARTY" in extracted_labels)
        self.assertIn("DATE", extracted_labels)
        self.assertIn("MONEY", extracted_labels)
        self.assertIn("LEGAL_REF", extracted_labels)
        self.assertIn("LOCATION", extracted_labels)
        self.assertIn("CONTRACT_PARTY", extracted_labels)

        first_ent = res.entities[0]
        self.assertTrue(hasattr(first_ent, "text"))
        self.assertTrue(hasattr(first_ent, "label"))
        self.assertTrue(hasattr(first_ent, "start_char"))
        self.assertTrue(hasattr(first_ent, "end_char"))
        self.assertTrue(hasattr(first_ent, "confidence"))
        self.assertTrue(hasattr(first_ent, "source"))

    async def test_ner_type_filtering(self):
        sample_text = "Acme Corp. agrees to pay John Doe $50,000 on January 1, 2025 pursuant to Section 2."
        req = NERRequest(
            text=sample_text,
            entity_types=["MONEY", "DATE"],
            use_huggingface=False,
        )

        res: NERResponse = await ner_service.extract_entities(req)

        self.assertTrue(res.success)
        for ent in res.entities:
            self.assertIn(ent.label, ["MONEY", "DATE"])

    async def test_ner_empty_input(self):
        req = NERRequest(text="")
        res: NERResponse = await ner_service.extract_entities(req)

        self.assertTrue(res.success)
        self.assertEqual(res.total_entities, 0)
        self.assertEqual(res.entities, [])
        self.assertEqual(res.summary, {})


if __name__ == "__main__":
    unittest.main()

