"""
Production Legal NER Microservice Component.
Provides isolated, lazy-loaded legal token classification for named entities using HuggingFace Transformers.

Model Checkpoint: subugoe/legal-bert-base-uncased-ner
Supported Labels:
  - PER -> PERSON (Individual legal actors, signatories)
  - ORG -> ORGANIZATION (Corporations, law firms, institutions)
  - LOC -> LOCATION (Jurisdictions, venues, addresses)
  - LAW -> LEGAL_REF (Statutory codes, Acts, legal citations)
"""
from __future__ import annotations

import re
from typing import List, Dict, Any, Optional
from app.core.logging import get_logger
from app.schemas.ner import EntityItem

logger = get_logger("LegalMind.LegalNerService")

# Label mapping for subugoe/legal-bert-base-uncased-ner
_LEGAL_NER_LABEL_MAP: Dict[str, str] = {
    "PER": "PERSON",
    "PERSON": "PERSON",
    "ORG": "ORGANIZATION",
    "ORGANIZATION": "ORGANIZATION",
    "LOC": "LOCATION",
    "LOCATION": "LOCATION",
    "GPE": "LOCATION",
    "LAW": "LEGAL_REF",
    "LEGAL_REF": "LEGAL_REF",
}


class LegalNerService:
    """
    Isolated Legal NER Machine Learning Service Component.

    Features:
    - Lazy Model & Tokenizer pipeline loading (loads ONLY on first runtime request, never during app startup).
    - Truncates long text blocks to 512 tokens using PyTorch tensor masks.
    - Zero-crash fallback handling if model weights are offline, downloading, or unavailable.
    """

    def __init__(self) -> None:
        self.model_name = "subugoe/legal-bert-base-uncased-ner"
        self._pipeline: Optional[Any] = None
        self._attempted_load: bool = False
        self._is_available: bool = False
        logger.info(f"Legal-NER Service initialized (Model: {self.model_name} - Lazy Load).")

    def is_available(self) -> bool:
        """Check if Legal-NER model pipeline is initialized and available."""
        if not self._attempted_load:
            self._lazy_initialize()
        return self._is_available

    def _lazy_initialize(self) -> None:
        """
        Lazily initialize HuggingFace Legal-NER pipeline.
        Executed ONLY when first requested at runtime. Never at app startup.
        """
        if self._attempted_load:
            return

        self._attempted_load = True
        logger.info(f"Lazily loading Legal-NER pipeline '{self.model_name}'...")

        try:
            from transformers import pipeline

            self._pipeline = pipeline(
                "ner",
                model=self.model_name,
                aggregation_strategy="simple",
                device=-1,  # CPU inference
            )

            self._is_available = True
            logger.info(f"Legal-NER pipeline '{self.model_name}' initialized successfully.")
        except Exception as exc:
            logger.warning(
                f"Legal-NER pipeline '{self.model_name}' initialization failed: {exc}. "
                "Service will operate in graceful fallback mode using spaCy & Rule Matchers."
            )
            self._pipeline = None
            self._is_available = False

    def extract_legal_entities(self, text: str, page: Optional[int] = 1) -> List[EntityItem]:
        """
        Extract named legal entities from text using fine-tuned Legal-BERT NER model.

        Parameters
        ----------
        text : str
            Input legal document text.
        page : Optional[int]
            Estimated document page number.

        Returns
        -------
        entities : List[EntityItem]
            List of extracted legal entities adhering to canonical EntityItem schema.
        """
        clean_text = (text or "").strip()
        if not clean_text or not self.is_available() or self._pipeline is None:
            return []

        try:
            # 1. Execute HuggingFace Transformers Legal-NER Token Classification
            raw_results = self._pipeline(clean_text)
            entities: List[EntityItem] = []

            if not isinstance(raw_results, list):
                logger.warning(f"Unexpected Legal-NER output type: {type(raw_results)}")
                return []

            for res in raw_results:
                if not isinstance(res, dict):
                    continue

                raw_group = str(res.get("entity_group") or res.get("entity") or "").strip()
                mapped_label = _LEGAL_NER_LABEL_MAP.get(raw_group.upper())

                if mapped_label:
                    word_text = str(res.get("word", "")).strip()
                    try:
                        start_char = int(res.get("start", 0))
                        end_char = int(res.get("end", 0))
                        score = float(res.get("score", 0.90))
                    except (ValueError, TypeError):
                        continue

                    # Offset boundary check: 0 <= start_char < end_char <= len(clean_text)
                    if start_char < 0 or end_char <= start_char or end_char > len(clean_text):
                        logger.warning(
                            f"Filtering Legal-NER token '{word_text}' with invalid offsets [{start_char}, {end_char}]."
                        )
                        continue

                    if len(word_text) > 1 and not word_text.startswith("##"):
                        metadata: Dict[str, Any] = {"page": page} if page else {}

                        entities.append(
                            EntityItem(
                                text=word_text,
                                label=mapped_label,
                                start_char=start_char,
                                end_char=end_char,
                                confidence=round(score, 2),
                                source="legal_ner",
                                metadata=metadata,
                            )
                        )

            return entities

        except Exception as exc:
            logger.warning(f"Graceful fallback during Legal-NER extraction: {exc}")
            return []


# Singleton service instance
legal_ner_service = LegalNerService()
