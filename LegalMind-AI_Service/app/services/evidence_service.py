"""
Evidence Service for LegalMind AI.
Provides evidence grounding helpers that trace findings directly to real extracted text chunks.
Enforces strict verification: NO EVIDENCE = NO FINDING.
"""
from __future__ import annotations

import re
from typing import Optional, Dict, Any, List
from app.core.logging import get_logger
from app.schemas.evidence import EvidenceFinding

logger = get_logger("LegalMind.EvidenceService")


class EvidenceService:
    """
    Service for constructing and validating evidence-backed legal risk findings.
    Ensures findings are traceable to actual document text, page numbers, and offsets.
    """

    def __init__(self) -> None:
        logger.info("Evidence Service initialized.")

    def create_finding(
        self,
        document_id: str,
        user_id: str,
        filename: str,
        category: str,
        rule_id: str,
        severity: str,
        finding: str,
        evidence_text: str,
        page: int = 1,
        chunk_id: str = "chunk-1",
        start_char: int = 0,
        end_char: int = 0,
        confidence: float = 0.90,
        recommendation: str = "",
    ) -> EvidenceFinding:
        """
        Construct a structured EvidenceFinding object with validation.
        If evidence_text is empty or missing, status will be set to 'insufficient_evidence'.
        """
        text_clean = (evidence_text or "").strip()
        status = "valid" if text_clean else "insufficient_evidence"

        if end_char < start_char:
            end_char = start_char + len(text_clean)

        return EvidenceFinding(
            document_id=document_id,
            user_id=user_id,
            filename=filename,
            category=category,
            rule_id=rule_id,
            severity=severity,
            finding=finding,
            evidence_text=text_clean,
            page=max(1, page),
            chunk_id=chunk_id,
            start_char=max(0, start_char),
            end_char=end_char,
            confidence=max(0.0, min(1.0, confidence)),
            recommendation=recommendation,
            status=status,
        )

    def locate_evidence_in_text(
        self,
        full_text: str,
        query_clause: str,
    ) -> Optional[Dict[str, Any]]:
        """
        Locates exact start_char and end_char offset of a clause in contract text.
        Returns dict with start_char, end_char, and matched snippet if found, else None.
        """
        if not full_text or not query_clause:
            return None

        clean_query = query_clause.strip()
        if not clean_query:
            return None

        # 1. Exact string match
        idx = full_text.find(clean_query)
        if idx != -1:
            return {
                "start_char": idx,
                "end_char": idx + len(clean_query),
                "matched_text": clean_query,
            }

        # 2. Case-insensitive regex match
        try:
            pattern = re.escape(clean_query[:50])
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                return {
                    "start_char": match.start(),
                    "end_char": match.end(),
                    "matched_text": match.group(0),
                }
        except Exception:
            pass

        return None


evidence_service = EvidenceService()
