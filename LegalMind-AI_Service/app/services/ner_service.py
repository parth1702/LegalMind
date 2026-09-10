"""
Legal NER Service — Named Entity Recognition using spaCy, HuggingFace Transformers, and Legal Rule Matchers.
Extracts People, Organizations, Locations, Dates, Money, Legal References, and Contract Parties.
"""
from __future__ import annotations

import re
from typing import List, Optional, Any, Dict, Tuple, Set
from collections import Counter
from app.core.logging import get_logger
from app.schemas.ner import NERRequest, NERResponse, EntityItem
from app.services.legal_ner_service import legal_ner_service

logger = get_logger("LegalMind.NERService")

# Label mapping standardisation
_LABEL_MAP: Dict[str, str] = {
    "PERSON": "PERSON",
    "PER": "PERSON",
    "ORG": "ORGANIZATION",
    "ORGANIZATION": "ORGANIZATION",
    "NORP": "ORGANIZATION",
    "GPE": "LOCATION",
    "LOC": "LOCATION",
    "LOCATION": "LOCATION",
    "DATE": "DATE",
    "TIME": "DATE",
    "MONEY": "MONEY",
    "LAW": "LEGAL_REF",
    "LEGAL_REF": "LEGAL_REF",
    "CONTRACT_PARTY": "CONTRACT_PARTY",
}

# Regex Patterns for Legal Domain Entity Extraction
_PARTY_PATTERN = re.compile(
    r'(?P<entity>[A-Z][A-Za-z0-9\s,\.\-&]+?)\s*[\(\“\"]+(?:the\s+)?[\"“]?(?P<role>Client|Service Provider|Disclosing Party|Receiving Party|Licensor|Licensee|Borrower|Lender|Executive|Buyer|Seller|Vendor|Company|Contractor|Consultant|Investor|Partner|Tenant|Landlord|Purchaser|Supplier|Distributor|Subcontractor)[\"”]?[\)\”\"]',
    re.IGNORECASE
)

_LEGAL_REF_PATTERN = re.compile(
    r'\b(?:Section|Article|Clause|Paragraph|Exhibits?|Schedule)\s+\d+(?:\.\d+)*(?:\([a-z0-9]+\))*\b|\b\d+\s+U\.S\.C\.\s+§?\s*\d+\b|\b[A-Z][a-zA-Z\s,]+(?:Act|Code|Law|Regulations|GDPR|HIPAA)\s*(?:of\s+\d{4})?\b',
    re.IGNORECASE
)

_MONEY_PATTERN = re.compile(
    r'(?:\$|€|£|¥)\s*\d+(?:,\d{3})*(?:\.\d{2})?|\b\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|EUR|GBP|CAD|AUD)\b|\b(?:one|two|three|four|five|ten|twenty|fifty|one hundred|one million|five hundred thousand)\s+dollars?\b',
    re.IGNORECASE
)

_JURISDICTION_PATTERN = re.compile(
    r'\b(?:State of [A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|Commonwealth of [A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|District of [A-Z][a-z]+|[A-Z][a-z]+\s+(?:Supreme|District|Chancery)\s+Court)\b'
)

_LEGAL_DATE_PATTERN = re.compile(
    r'\b(?:this\s+\d{1,2}(?:st|nd|rd|th)?\s+day\s+of\s+[A-Z][a-z]+,\s*\d{4}|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4}|\b\d{1,2}/\d{1,2}/\d{4})\b',
    re.IGNORECASE
)


class NERService:
    """
    Production Legal Named Entity Recognition service combining spaCy, HuggingFace Transformers,
    and legal domain rule matchers with span overlap resolution.
    """

    def __init__(self) -> None:
        self._nlp: Optional[Any] = None
        self._hf_pipeline: Optional[Any] = None
        self._hf_attempted: bool = False
        logger.info("NER Service initialized.")

    def _get_spacy(self) -> Any:
        """Lazily load spaCy model or fallback to blank English model."""
        if self._nlp is None:
            import spacy
            try:
                self._nlp = spacy.load("en_core_web_sm")
                logger.info("Loaded spaCy model 'en_core_web_sm' successfully.")
            except Exception as exc:
                logger.warning(f"Could not load spaCy 'en_core_web_sm': {exc}. Using blank model.")
                self._nlp = spacy.blank("en")
        return self._nlp

    def _get_huggingface(self) -> Optional[Any]:
        """Lazily load HuggingFace NER pipeline if available."""
        if not self._hf_attempted:
            self._hf_attempted = True
            try:
                from transformers import pipeline
                logger.info("Loading HuggingFace NER pipeline ('dslim/bert-base-NER')...")
                self._hf_pipeline = pipeline(
                    "ner",
                    model="dslim/bert-base-NER",
                    aggregation_strategy="simple",
                    device=-1  # CPU inference
                )
                logger.info("Loaded HuggingFace NER pipeline successfully.")
            except Exception as exc:
                logger.warning(f"HuggingFace NER pipeline unavailable: {exc}. Continuing with spaCy and Legal Rule Matchers.")
                self._hf_pipeline = None
        return self._hf_pipeline

    def _extract_legal_matcher_entities(self, text: str) -> List[EntityItem]:
        entities: List[EntityItem] = []

        # 1. Contract Parties & Roles
        for match in _PARTY_PATTERN.finditer(text):
            entity_raw = match.group("entity").strip()
            role = match.group("role").strip()
            start_raw, end_raw = match.span("entity")

            # Clean leading preamble and address words from entity text
            preamble_regex = r'^(?:is\s+made\s+)?(?:by|and|between|entered\s+into\s+by|having\s+its\s+)?(?:principal\s+place\s+of\s+business\s+at|office\s+at|registered\s+office\s+at)?\s*'
            match_preamble = re.search(preamble_regex, entity_raw, flags=re.IGNORECASE)
            offset_start = match_preamble.end() if match_preamble else 0

            entity_clean = entity_raw[offset_start:].strip()
            start = start_raw + offset_start
            end = start_raw + len(entity_raw)

            if len(entity_clean) > 2 and not entity_clean.lower().startswith(("the", "this", "each")):
                entities.append(
                    EntityItem(
                        text=entity_clean,
                        label="CONTRACT_PARTY",
                        start_char=start,
                        end_char=end,
                        confidence=0.96,
                        source="legal_matcher",
                        metadata={"role": role}
                    )
                )

        # 2. Legal References
        for match in _LEGAL_REF_PATTERN.finditer(text):
            ref_text = match.group(0).strip()
            start, end = match.span()
            entities.append(
                EntityItem(
                    text=ref_text,
                    label="LEGAL_REF",
                    start_char=start,
                    end_char=end,
                    confidence=0.93,
                    source="legal_matcher"
                )
            )

        # 3. Monetary Amounts
        for match in _MONEY_PATTERN.finditer(text):
            money_text = match.group(0).strip()
            start, end = match.span()
            entities.append(
                EntityItem(
                    text=money_text,
                    label="MONEY",
                    start_char=start,
                    end_char=end,
                    confidence=0.92,
                    source="legal_matcher"
                )
            )

        # 4. Court Jurisdictions & States
        for match in _JURISDICTION_PATTERN.finditer(text):
            jurisdiction_text = match.group(0).strip()
            start, end = match.span()
            entities.append(
                EntityItem(
                    text=jurisdiction_text,
                    label="LOCATION",
                    start_char=start,
                    end_char=end,
                    confidence=0.94,
                    source="legal_matcher",
                    metadata={"type": "jurisdiction"}
                )
            )

        # 5. Legal Dates
        for match in _LEGAL_DATE_PATTERN.finditer(text):
            date_text = match.group(0).strip()
            start, end = match.span()
            entities.append(
                EntityItem(
                    text=date_text,
                    label="DATE",
                    start_char=start,
                    end_char=end,
                    confidence=0.93,
                    source="legal_matcher"
                )
            )

        return entities

    def _validate_and_normalize_entity(
        self, entity: EntityItem, text_len: Optional[int] = None
    ) -> Optional[EntityItem]:
        """
        Validate entity character offsets and normalize label into canonical project vocabulary.
        Preserves original text formatting, confidence, source, and metadata["page"].
        """
        try:
            if not entity or not isinstance(entity.text, str):
                return None

            # Offset boundary checks: 0 <= start_char < end_char <= text_len
            if entity.start_char < 0 or entity.end_char <= entity.start_char:
                logger.warning(
                    f"Rejecting entity '{entity.text}': invalid span offsets [{entity.start_char}, {entity.end_char}]."
                )
                return None

            if text_len is not None and text_len > 0 and entity.end_char > text_len:
                logger.warning(
                    f"Rejecting entity '{entity.text}': end offset {entity.end_char} exceeds text length {text_len}."
                )
                return None

            # Label normalization
            normalized_label = _LABEL_MAP.get(entity.label.upper(), entity.label.upper())

            # Return normalized copy preserving faithful text, confidence, source, metadata
            return EntityItem(
                text=entity.text,
                label=normalized_label,
                start_char=entity.start_char,
                end_char=entity.end_char,
                confidence=entity.confidence,
                source=entity.source,
                metadata=dict(entity.metadata) if entity.metadata else {},
            )
        except Exception as exc:
            logger.warning(f"Error normalizing entity: {exc}")
            return None

    def _resolve_overlapping_spans(
        self, entities: List[EntityItem], text_len: Optional[int] = None
    ) -> List[EntityItem]:
        """
        Deduplicate entities and resolve overlapping character spans.
        Higher priority given to:
        1. Specific legal types (CONTRACT_PARTY, LEGAL_REF) over generic labels.
        2. Source engine quality (legal_ner, legal_matcher > spacy, huggingface).
        3. Longer character span coverage.
        4. Higher confidence scores.
        5. Deterministic sorting by start_char, then end_char.
        """
        if not entities:
            return []

        # 1. Offset Validation & Label Normalization
        valid_normalized: List[EntityItem] = []
        for ent in entities:
            normed = self._validate_and_normalize_entity(ent, text_len=text_len)
            if normed is not None:
                valid_normalized.append(normed)

        if not valid_normalized:
            return []

        # 2. Exact Duplicate Removal (Same normalized text, label, start, end)
        exact_dedup: Dict[Tuple[str, str, int, int], EntityItem] = {}
        for ent in valid_normalized:
            clean_text = ent.text.strip().lower()
            key = (clean_text, ent.label, ent.start_char, ent.end_char)

            if key not in exact_dedup:
                exact_dedup[key] = ent
            else:
                existing = exact_dedup[key]
                # Retain higher confidence instance (if tied, prefer legal_ner / legal_matcher)
                if ent.confidence > existing.confidence:
                    exact_dedup[key] = ent
                elif ent.confidence == existing.confidence and ent.source in ["legal_ner", "legal_matcher"]:
                    exact_dedup[key] = ent

        deduped_candidates = list(exact_dedup.values())

        label_priority = {
            "CONTRACT_PARTY": 10,
            "LEGAL_REF": 9,
            "LOCATION": 8.5,
            "MONEY": 8,
            "DATE": 7,
            "PERSON": 6,
            "ORGANIZATION": 5,
        }

        source_boost = {
            "legal_ner": 0.5,
            "legal_matcher": 0.4,
            "huggingface": 0.2,
            "spacy": 0.1,
        }

        # 3. Sort candidate entities for greedy overlap selection
        sorted_candidates = sorted(
            deduped_candidates,
            key=lambda e: (
                e.start_char,
                -(e.end_char - e.start_char),
                -(label_priority.get(e.label, 1) + source_boost.get(e.source, 0.0)),
                -e.confidence,
            ),
        )

        # 4. Resolve Character Span Collisions
        selected: List[EntityItem] = []
        for cand in sorted_candidates:
            overlap = False
            for sel in selected:
                # Check character span overlap
                if max(cand.start_char, sel.start_char) < min(cand.end_char, sel.end_char):
                    overlap = True
                    break
            if not overlap:
                selected.append(cand)

        # 5. Deterministic Document Order Sorting (start_char, then end_char)
        selected.sort(key=lambda e: (e.start_char, e.end_char))
        return selected

    async def extract_entities(self, request: NERRequest) -> NERResponse:
        """
        Extract named entities from legal text payload.

        Extracts:
          • PERSON (People)
          • ORGANIZATION (Organizations)
          • LOCATION (Locations & Jurisdictions)
          • DATE (Dates)
          • MONEY (Money & Financial amounts)
          • LEGAL_REF (Legal references, sections, acts)
          • CONTRACT_PARTY (Contract parties and roles)
        """
        text = (request.text or "").strip()
        if not text:
            return NERResponse(
                success=True,
                total_entities=0,
                summary={},
                entities=[]
            )

        logger.info(f"Running Legal NER pipeline on text length: {len(text)} chars")

        candidates: List[EntityItem] = []

        # 0. Fine-Tuned Legal-BERT NER Engine (subugoe/legal-bert-base-uncased-ner)
        if getattr(request, "use_legal_ner", True):
            try:
                legal_entities = legal_ner_service.extract_legal_entities(text)
                candidates.extend(legal_entities)
            except Exception as exc:
                logger.warning(f"Legal-NER engine execution fallback: {exc}")

        # 1. spaCy NER Engine
        if request.use_spacy:
            spacy_nlp = self._get_spacy()
            doc = spacy_nlp(text)
            if hasattr(doc, "ents"):
                for ent in doc.ents:
                    mapped_label = _LABEL_MAP.get(ent.label_, ent.label_)
                    if mapped_label in _LABEL_MAP.values():
                        candidates.append(
                            EntityItem(
                                text=ent.text.strip(),
                                label=mapped_label,
                                start_char=ent.start_char,
                                end_char=ent.end_char,
                                confidence=0.88,
                                source="spacy"
                            )
                        )

        # 2. HuggingFace Transformers NER Engine
        if request.use_huggingface:
            hf_pipe = self._get_huggingface()
            if hf_pipe is not None:
                try:
                    hf_results = hf_pipe(text)
                    for res in hf_results:
                        ent_group = res.get("entity_group") or res.get("entity") or ""
                        mapped_label = _LABEL_MAP.get(ent_group, ent_group)
                        if mapped_label in _LABEL_MAP.values():
                            candidates.append(
                                EntityItem(
                                    text=res["word"].strip(),
                                    label=mapped_label,
                                    start_char=res["start"],
                                    end_char=res["end"],
                                    confidence=round(float(res.get("score", 0.90)), 2),
                                    source="huggingface"
                                )
                            )
                except Exception as exc:
                    logger.warning(f"Error during HuggingFace NER execution: {exc}")

        # 3. Legal Pattern Matcher Engine
        if request.use_rules:
            rule_entities = self._extract_legal_matcher_entities(text)
            candidates.extend(rule_entities)

        # Resolve overlapping spans and deduplicate with offset validation
        resolved_entities = self._resolve_overlapping_spans(candidates, text_len=len(text))

        # Filter by requested entity types if specified
        if request.entity_types:
            normalized_filters = { _LABEL_MAP.get(t.upper(), t.upper()) for t in request.entity_types }
            resolved_entities = [e for e in resolved_entities if e.label in normalized_filters]

        # Calculate entity summary stats
        summary_counts = dict(Counter(e.label for e in resolved_entities))

        logger.info(f"NER Extraction complete: {len(resolved_entities)} entities identified.")

        return NERResponse(
            success=True,
            total_entities=len(resolved_entities),
            summary=summary_counts,
            entities=resolved_entities
        )


ner_service = NERService()

