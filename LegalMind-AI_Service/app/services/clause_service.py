"""
Production Legal Clause Extraction Service.
Segments contract documents into clauses and classifies them into legal categories:
Termination, Payment, Confidentiality, Liability, Indemnity, Obligations, Renewal, Dispute Resolution, Governing Law.
Evaluates clause importance, identifies risk candidates, and provides location tracking.
"""
from __future__ import annotations

import re
from typing import List, Dict, Any, Tuple, Optional
from collections import Counter
from app.core.logging import get_logger
from app.schemas.clause import (
    ClauseExtractionRequest,
    ClauseExtractionResponse,
    ExtractedClause,
    ClauseLocation,
    LEGAL_DISCLAIMER_TEXT,
)
from app.services.legal_bert_service import legal_bert_service

logger = get_logger("LegalMind.ClauseService")

# Section heading regex pattern
_SECTION_HEADER_PATTERN = re.compile(
    r'^(?:(?:SECTION|ARTICLE|CLAUSE|PARAGRAPH)\s+\d+(?:\.\d+)*[:\.\s\-]*|[0-9]+\.[0-9\.]*\s+)?(?P<title>[A-Z][A-Za-z0-9\s,\.\-&]{2,60})(?::|\n|\.$)',
    re.MULTILINE
)

# Category pattern matchers
_CATEGORY_PATTERNS: Dict[str, re.Pattern] = {
    "Termination": re.compile(
        r'\b(?:terminate|termination|cancellation|cancel|expire|expiration|notice to terminate|right to terminate|post-termination|terminate for convenience|termination for cause)\b',
        re.IGNORECASE,
    ),
    "Payment": re.compile(
        r'\b(?:payment|fee|price|invoice|billing|reimburse|reimbursement|due and payable|currency|milestone payment|installment)\b',
        re.IGNORECASE,
    ),
    "Compensation": re.compile(
        r'\b(?:compensation|salary|bonus|remuneration|consideration|royalty|stipend|equity grant|stock option|base salary)\b',
        re.IGNORECASE,
    ),
    "Confidentiality": re.compile(
        r'\b(?:confidential|confidentiality|non-disclosure|proprietary|trade secret|secrecy|disclose|nondisclosure|confidential information)\b',
        re.IGNORECASE,
    ),
    "Liability": re.compile(
        r'\b(?:liability|limitation of liability|cap on liability|indirect damages|consequential damages|punitive damages|maximum liability|uncapped liability|aggregate liability)\b',
        re.IGNORECASE,
    ),
    "Indemnity": re.compile(
        r'\b(?:indemnify|indemnification|hold harmless|defend|indemnitor|indemnitee|defend and hold harmless|indemnifying party)\b',
        re.IGNORECASE,
    ),
    "Indemnification": re.compile(
        r'\b(?:indemnify|indemnification|hold harmless|defend|indemnitor|indemnitee|defend and hold harmless|indemnifying party)\b',
        re.IGNORECASE,
    ),
    "Intellectual Property": re.compile(
        r'\b(?:intellectual property|ip rights|patent|copyright|trademark|work made for hire|source code|software license|proprietary rights|assigns all right)\b',
        re.IGNORECASE,
    ),
    "Obligations": re.compile(
        r'\b(?:shall|covenant|obligation|covenants|duty|duties|audit rights|insurance|comply|compliance|must maintain|representation and warranty|warranties)\b',
        re.IGNORECASE,
    ),
    "Renewal": re.compile(
        r'\b(?:renewal|renew|automatic renewal|auto-renew|extension|renewed|extension term|renewal term|notice period to terminate renewal)\b',
        re.IGNORECASE,
    ),
    "Notice": re.compile(
        r'\b(?:written notice|advance notice|notice period|deliver notice|formal notice|registered mail|notice requirement)\b',
        re.IGNORECASE,
    ),
    "Non-Compete": re.compile(
        r'\b(?:non-compete|non-solicitation|restraint of trade|competing business|restrictive covenant|solicit employees|solicit clients)\b',
        re.IGNORECASE,
    ),
    "Dispute Resolution": re.compile(
        r'\b(?:dispute|dispute resolution|arbitration|arbitrator|mediation|venue|jurisdiction|litigation|court|AAA rules|claims|lawsuit|choice of forum)\b',
        re.IGNORECASE,
    ),
    "Governing Law": re.compile(
        r'\b(?:governing law|choice of law|laws of|jurisdiction|state of|construed in accordance with|governed by and construed|laws of the state)\b',
        re.IGNORECASE,
    ),
}

# Category priority weights for multi-category matches
_CATEGORY_PRIORITY = {
    "Liability": 12,
    "Indemnity": 11,
    "Indemnification": 11,
    "Termination": 10,
    "Intellectual Property": 9,
    "Non-Compete": 8,
    "Confidentiality": 7,
    "Compensation": 6,
    "Payment": 6,
    "Renewal": 5,
    "Notice": 4,
    "Dispute Resolution": 3,
    "Governing Law": 2,
    "Obligations": 1,
}


class ClauseService:
    """
    Production Legal Clause Extraction service providing contract segmentation,
    multi-category classification, importance scoring, and risk candidate identification.
    """

    def __init__(self) -> None:
        logger.info("Clause Extraction Service initialized.")

    def _segment_text_into_blocks(self, text: str) -> List[Tuple[str, int, int, int]]:
        """
        Segment contract text into paragraphs / section blocks with start/end character offsets.
        Returns list of (block_text, paragraph_idx, start_char, end_char).
        """
        blocks: List[Tuple[str, int, int, int]] = []
        raw_paragraphs = text.split("\n\n")

        curr_pos = 0
        para_idx = 1

        for raw_p in raw_paragraphs:
            p_str = raw_p.strip()
            p_len = len(raw_p)

            if p_str and len(p_str.split()) >= 4:  # Minimum clause length threshold
                start_char = text.find(p_str, curr_pos)
                if start_char == -1:
                    start_char = curr_pos
                end_char = start_char + len(p_str)

                blocks.append((p_str, para_idx, start_char, end_char))
                para_idx += 1

            curr_pos += p_len + 2  # +2 for \n\n split

        # Fallback if no double-newline paragraphs found
        if not blocks and text.strip():
            blocks.append((text.strip(), 1, 0, len(text.strip())))

        return blocks

    def _extract_header_title(self, block_text: str, category: str) -> str:
        """Extract or generate section heading title."""
        lines = block_text.split("\n")
        first_line = lines[0].strip()

        if len(first_line) <= 80 and any(kw in first_line.upper() for kw in ["SECTION", "ARTICLE", "CLAUSE", "PARAGRAPH", "1.", "2.", "3.", "4.", "5.", "6.", "7.", "8.", "9."]):
            return first_line.rstrip(".:;")

        match = _SECTION_HEADER_PATTERN.search(block_text)
        if match:
            return match.group(0).strip().rstrip(".:;")

        # Fallback generated title
        first_few_words = " ".join(block_text.split()[:6])
        return f"{category}: {first_few_words}..."

    def _evaluate_risk_and_importance(
        self, category: str, text: str
    ) -> Tuple[str, bool, Optional[str]]:
        """
        Evaluate clause importance level and identify risk candidates.
        Returns (importance, is_risk_candidate, risk_reason).
        """
        text_lower = text.lower()
        is_risk = False
        risk_reason: Optional[str] = None
        importance = "medium"

        if category == "Liability":
            importance = "high"
            if any(term in text_lower for term in ["uncapped", "without limitation", "no cap", "exceeding total fees"]):
                is_risk = True
                risk_reason = "Clause contains uncapped or unlimited liability exposure."
            elif "sole remedy" in text_lower or "waive" in text_lower:
                is_risk = True
                risk_reason = "Clause restricts legal remedies or waives consequential damage recovery."

        elif category == "Indemnity":
            importance = "high"
            if any(term in text_lower for term in ["indemnify", "hold harmless"]) and "gross negligence" not in text_lower:
                is_risk = True
                risk_reason = "Broad indemnification obligation without explicit limitation to gross negligence or willful misconduct."

        elif category == "Termination":
            importance = "high"
            if "convenience" in text_lower and any(term in text_lower for term in ["without cause", "at any time", "immediate"]):
                is_risk = True
                risk_reason = "Unilateral right to terminate for convenience without cause."
            elif "liquidated damages" in text_lower:
                is_risk = True
                risk_reason = "Termination clause contains financial liquidated damages penalty."

        elif category == "Renewal":
            importance = "medium"
            if "automatic" in text_lower or "auto-renew" in text_lower:
                is_risk = True
                risk_reason = "Automatic renewal provision. Requires calendar tracking for opt-out notice window."

        elif category == "Payment":
            importance = "medium"
            if any(term in text_lower for term in ["interest rate", "late fee", "1.5%", "penalty"]):
                is_risk = True
                risk_reason = "High late payment penalty or compounding interest fee."

        elif category in ["Dispute Resolution", "Governing Law"]:
            importance = "medium"
            if "arbitration" in text_lower and "waive" in text_lower:
                is_risk = True
                risk_reason = "Mandatory arbitration clause waiving jury trial rights."

        elif category == "Confidentiality":
            importance = "medium"
            if "perpetual" in text_lower or "forever" in text_lower:
                importance = "high"
                risk_reason = "Indefinite or perpetual confidentiality duration."

        return importance, is_risk, risk_reason

    def _classify_block_hybrid(self, text: str) -> List[Dict[str, Any]]:
        """
        Classify text block into matching categories using Hybrid (Rule-Based + Legal-BERT ML) detection.
        Returns list of hybrid result dicts containing:
        {
          "category": str,
          "confidence": float,
          "rule_match": bool,
          "rule_category": str,
          "ml_label": str,
          "ml_confidence": float,
          "final_label": str,
          "evidence": str
        }
        """
        rule_matches: Dict[str, float] = {}

        # 1. Rule-Based Pattern Matcher
        for category, pattern in _CATEGORY_PATTERNS.items():
            hit_count = len(pattern.findall(text))
            if hit_count > 0:
                base_confidence = 0.85 + min(0.12, (hit_count - 1) * 0.04)
                rule_matches[category] = round(base_confidence, 2)

        # 2. Legal-BERT ML Sequence Classifier
        bert_pred = legal_bert_service.classify_clause(text)
        ml_available = bert_pred.get("available", False)
        ml_label = bert_pred.get("label", "Unknown") if ml_available else "Unavailable"
        ml_conf = float(bert_pred.get("confidence", 0.0)) if ml_available else 0.0

        hybrid_results: List[Dict[str, Any]] = []

        # Process Rule Matches first
        for rule_cat, rule_conf in rule_matches.items():
            is_consensus = (ml_available and ml_label == rule_cat)
            if is_consensus:
                final_conf = round(min(0.98, max(rule_conf, ml_conf + 0.10)), 2)
                evidence = f"Consensus: Rule pattern matched '{rule_cat}' and Legal-BERT predicted '{ml_label}' (conf: {ml_conf})."
            else:
                final_conf = rule_conf
                evidence = f"Rule Priority: Matched rule pattern '{rule_cat}'. Legal-BERT predicted '{ml_label}' (conf: {ml_conf})."

            hybrid_results.append({
                "category": rule_cat,
                "confidence": final_conf,
                "rule_match": True,
                "rule_category": rule_cat,
                "ml_label": ml_label,
                "ml_confidence": ml_conf,
                "final_label": rule_cat,
                "evidence": evidence,
            })

        # Process ML Signal Discovery when Rule Match missed
        if ml_available and ml_label in _CATEGORY_PATTERNS and ml_label not in rule_matches:
            if ml_conf >= 0.70:
                hybrid_results.append({
                    "category": ml_label,
                    "confidence": round(ml_conf, 2),
                    "rule_match": False,
                    "rule_category": "None",
                    "ml_label": ml_label,
                    "ml_confidence": round(ml_conf, 2),
                    "final_label": ml_label,
                    "evidence": f"ML Discovery: Legal-BERT sequence classifier identified '{ml_label}' with {ml_conf} confidence.",
                })

        hybrid_results.sort(key=lambda r: (-r["confidence"], -_CATEGORY_PRIORITY.get(r["category"], 0)))
        return hybrid_results

    def _classify_block(self, text: str) -> List[Tuple[str, float]]:
        """Backward compatibility wrapper returning (category, confidence)."""
        hybrid_res = self._classify_block_hybrid(text)
        return [(r["category"], r["confidence"]) for r in hybrid_res]

    async def extract_clauses(self, request: ClauseExtractionRequest) -> ClauseExtractionResponse:
        text = (request.text or "").strip()
        if not text:
            return ClauseExtractionResponse(
                success=True,
                disclaimer=LEGAL_DISCLAIMER_TEXT,
                total_clauses=0,
                summary={},
                clauses=[],
            )

        logger.info(f"Extracting clauses from text (length: {len(text)} chars)")

        blocks = self._segment_text_into_blocks(text)
        extracted_clauses: List[ExtractedClause] = []
        clause_counter = 1

        for block_text, para_idx, start_char, end_char in blocks:
            hybrid_matches = self._classify_block_hybrid(block_text)

            if not hybrid_matches:
                continue

            # Process top matching categories for this block
            for match in hybrid_matches:
                category = match["category"]
                confidence = match["confidence"]

                if confidence < request.min_confidence:
                    continue

                if request.categories and category not in request.categories:
                    continue

                title = self._extract_header_title(block_text, category)
                importance, is_risk, risk_reason = self._evaluate_risk_and_importance(category, block_text)
                estimated_page = (start_char // 2500) + 1  # Standard 2500 chars per page estimate

                extracted_clauses.append(
                    ExtractedClause(
                        clause_id=f"clause_{clause_counter:03d}",
                        category=category,
                        title=title,
                        text=block_text,
                        location=ClauseLocation(
                            paragraph=para_idx,
                            start_char=start_char,
                            end_char=end_char,
                            page=estimated_page,
                        ),
                        importance=importance,
                        is_risk_candidate=is_risk,
                        risk_reason=risk_reason,
                        confidence=confidence,
                        metadata={
                            "rule_match": match["rule_match"],
                            "rule_category": match["rule_category"],
                            "ml_label": match["ml_label"],
                            "ml_confidence": match["ml_confidence"],
                            "final_label": match["final_label"],
                            "evidence": match["evidence"],
                            "page": estimated_page,
                            "word_count": len(block_text.split()),
                            "char_count": len(block_text),
                        },
                    )
                )
                clause_counter += 1

        # Calculate category counts summary
        cat_summary = dict(Counter(c.category for c in extracted_clauses))

        logger.info(f"Clause extraction complete: {len(extracted_clauses)} clauses identified across {len(cat_summary)} categories.")

        return ClauseExtractionResponse(
            success=True,
            disclaimer=LEGAL_DISCLAIMER_TEXT,
            total_clauses=len(extracted_clauses),
            summary=cat_summary,
            clauses=extracted_clauses,
        )


clause_service = ClauseService()
