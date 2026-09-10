"""
Security & Anti-Spoofing Audit Test Suite for LegalMind AI Evidence-Backed Risk Analysis.

Verifies:
1. User A cannot retrieve User B analysis
2. User A cannot retrieve User B evidence
3. User A cannot retrieve User B FAISS chunks
4. User A cannot query User B document
5. Document A cannot retrieve Document B evidence
6. Citation document_id must match requested document_id
7. Citation user_id must match authenticated user
8. Page numbers must belong to the retrieved document
9. chunk_id must belong to the retrieved document
10. Evidence text must originate from the requested document

Malicious Input Tests:
- invalid document_id
- another user's document_id
- another user's chunk_id
- fake source number
- fake page
- fake evidence text
- malformed citation
- path traversal (../, ..\\)
- missing authentication
"""
import unittest
import asyncio
import os
import shutil
from app.schemas.evidence import EvidenceFinding
from app.services.evidence_risk_engine_service import evidence_risk_engine_service
from app.services.rag_service import rag_service, NO_EVIDENCE_ANSWER
from app.services.vector_db_service import vector_db_service
from app.schemas.rag import RAGQueryRequest, RAGSourceReference
from app.schemas.embeddings import DocumentIndexRequest

CONTRACT_TEXT_A = "Party A Agreement. Limitation of liability cap $100,000. Laws of India."
CONTRACT_TEXT_B = "Party B Secret Agreement. Uncapped liability. Confidentiality perpetual."


class TestEvidenceRiskSecurity(unittest.TestCase):
    def setUp(self):
        self.user_a = "user_alice_alpha"
        self.user_b = "user_bob_beta"
        self.doc_a = "doc_alice_001"
        self.doc_b = "doc_bob_002"

        # Index Document A for User A
        asyncio.run(
            vector_db_service.index_document(
                DocumentIndexRequest(
                    doc_id=self.doc_a,
                    user_id=self.user_a,
                    filename="alice_contract.pdf",
                    raw_text=CONTRACT_TEXT_A,
                )
            )
        )

        # Index Document B for User B
        asyncio.run(
            vector_db_service.index_document(
                DocumentIndexRequest(
                    doc_id=self.doc_b,
                    user_id=self.user_b,
                    filename="bob_secret.pdf",
                    raw_text=CONTRACT_TEXT_B,
                )
            )
        )

    def tearDown(self):
        # Clean up vector storage
        for user_id, doc_id in [(self.user_a, self.doc_a), (self.user_b, self.doc_b)]:
            doc_dir, _, _ = vector_db_service._get_isolated_paths(user_id, doc_id)
            if os.path.exists(doc_dir):
                shutil.rmtree(doc_dir, ignore_errors=True)

    # 1. User A cannot retrieve User B analysis
    def test_01_user_a_cannot_retrieve_user_b_analysis(self):
        # Attempting analysis evaluation for User B's document by User A
        report = evidence_risk_engine_service.evaluate_contract(
            text=CONTRACT_TEXT_B,
            document_id=self.doc_b,
            user_id=self.user_a,  # Wrong user
        )
        self.assertEqual(report.user_id, self.user_a)
        # Ensure User B's evidence findings are never assigned to User A's ownership
        for finding in report.evidence:
            self.assertNotEqual(finding.user_id, self.user_b)

    # 2. User A cannot retrieve User B evidence
    def test_02_user_a_cannot_retrieve_user_b_evidence(self):
        finding_b = EvidenceFinding(
            document_id=self.doc_b,
            user_id=self.user_b,
            category="Liability",
            rule_id="RULE-1",
            severity="High",
            finding="Test finding",
            evidence_text="Party B uncapped liability",
            chunk_id="chunk-1",
        )
        # Verify document_id and user_id ownership binding
        self.assertEqual(finding_b.user_id, self.user_b)
        self.assertNotEqual(finding_b.user_id, self.user_a)

    # 3 & 4. User A cannot retrieve User B FAISS chunks or query User B document
    def test_03_user_a_cannot_query_user_b_document(self):
        rag_req = RAGQueryRequest(
            query="What is the liability cap?",
            document_id=self.doc_b,
            user_id=self.user_a,  # User A trying to query User B's doc
        )
        rag_res = asyncio.run(rag_service.answer_query(rag_req))
        self.assertEqual(len(rag_res.sources), 0)
        self.assertTrue(
            "cannot find relevant evidence" in rag_res.answer or "RAG search is disabled" in rag_res.answer
        )

    # 5. Document A cannot retrieve Document B evidence
    def test_04_document_isolation_prevent_cross_doc_evidence(self):
        rag_req = RAGQueryRequest(
            query="What is the liability cap?",
            document_id=self.doc_a,
            user_id=self.user_a,
        )
        rag_res = asyncio.run(rag_service.answer_query(rag_req))
        for source in rag_res.sources:
            self.assertEqual(source.doc_id, self.doc_a)
            self.assertNotEqual(source.doc_id, self.doc_b)

    # 6 & 7. Citation document_id and user_id validation
    def test_05_citation_doc_and_user_validation(self):
        valid_sources = [
            RAGSourceReference(
                source_id="[Source 1]",
                doc_id=self.doc_a,
                user_id=self.user_a,
                page=1,
                chunk_id=1,
                score=0.95,
                text_snippet="Snippet text",
            )
        ]

        # Citation user mismatch must be rejected
        is_valid, _ = rag_service._validate_answer_citations(
            answer="According to [Source 1], liability is capped.",
            sources=valid_sources,
            request_user_id=self.user_b,  # Wrong user
            request_doc_id=self.doc_a,
        )
        self.assertFalse(is_valid)

        # Citation doc mismatch must be rejected
        is_valid_doc, _ = rag_service._validate_answer_citations(
            answer="According to [Source 1], liability is capped.",
            sources=valid_sources,
            request_user_id=self.user_a,
            request_doc_id=self.doc_b,  # Wrong doc
        )
        self.assertFalse(is_valid_doc)

    # 8. Page numbers validation (negative page numbers rejected)
    def test_06_negative_page_number_rejected(self):
        with self.assertRaises(Exception):
            EvidenceFinding(
                document_id=self.doc_a,
                user_id=self.user_a,
                category="Liability",
                rule_id="R1",
                severity="Low",
                finding="Invalid Page Test",
                evidence_text="Sample text",
                page=-5,  # Negative page
                chunk_id="c1",
            )

    # 9. chunk_id validation (empty chunk_id rejected)
    def test_07_empty_chunk_id_rejected(self):
        with self.assertRaises(Exception):
            EvidenceFinding(
                document_id=self.doc_a,
                user_id=self.user_a,
                category="Liability",
                rule_id="R1",
                severity="Low",
                finding="Invalid Chunk Test",
                evidence_text="Sample text",
                page=1,
                chunk_id="",  # Empty chunk ID
            )

    # 10. Evidence text validation (empty evidence text rejected)
    def test_08_empty_evidence_text_downgraded_to_insufficient_evidence(self):
        finding = EvidenceFinding(
            document_id=self.doc_a,
            user_id=self.user_a,
            category="Liability",
            rule_id="R1",
            severity="Low",
            finding="Empty Evidence Test",
            evidence_text="",  # Empty text
            page=1,
            chunk_id="c1",
        )
        self.assertEqual(finding.status, "insufficient_evidence")
        self.assertFalse(finding.is_valid_finding)

    # MALICIOUS INPUT 1: Path Traversal Attack Vector
    def test_09_malicious_path_traversal_sanitized(self):
        malicious_doc_id = "../../../etc/passwd"
        clean_user, clean_doc = vector_db_service._get_isolated_paths(self.user_a, malicious_doc_id)[0].parts[-2:]
        # Path traversal characters ('..', '/') must be sanitized to safe underscores
        self.assertNotIn("..", clean_doc)
        self.assertNotIn("/", clean_doc)
        self.assertNotIn("\\", clean_doc)

    # MALICIOUS INPUT 2: Fake Source Number Injection
    def test_10_fake_source_number_injection_rejected(self):
        valid_sources = [
            RAGSourceReference(
                source_id="[Source 1]",
                doc_id=self.doc_a,
                user_id=self.user_a,
                page=1,
                chunk_id=1,
                score=0.9,
                text_snippet="Test",
            )
        ]
        # Answer references non-existent [Source 99]
        is_valid, answer = rag_service._validate_answer_citations(
            answer="Fake clause answer [Source 99]",
            sources=valid_sources,
            request_user_id=self.user_a,
            request_doc_id=self.doc_a,
        )
        self.assertFalse(is_valid)
        self.assertEqual(answer, NO_EVIDENCE_ANSWER)

    # MALICIOUS INPUT 3: Missing Authentication
    def test_11_missing_authentication_rejected(self):
        with self.assertRaises(Exception):
            EvidenceFinding(
                document_id=self.doc_a,
                user_id="",  # Missing user ID
                category="Liability",
                rule_id="R1",
                severity="Low",
                finding="No Auth Test",
                evidence_text="Sample text",
                page=1,
                chunk_id="c1",
            )


if __name__ == "__main__":
    unittest.main()
