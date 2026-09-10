"""
NER Schemas for LegalMind AI Service.
Defines entity extraction request and response data structures.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class EntityItem(BaseModel):
    text: str = Field(..., description="Extracted entity text")
    label: str = Field(
        ...,
        description="Entity label type: PERSON, ORGANIZATION, LOCATION, DATE, MONEY, LEGAL_REF, CONTRACT_PARTY",
    )
    start_char: int = Field(..., description="Character start offset in text")
    end_char: int = Field(..., description="Character end offset in text")
    confidence: float = Field(default=0.90, description="Extraction confidence score (0.0 - 1.0)")
    source: str = Field(default="spacy", description="Extraction engine source: 'spacy', 'huggingface', or 'legal_matcher'")
    metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Additional context metadata (e.g. role, currency, jurisdiction)"
    )


class NERRequest(BaseModel):
    text: str = Field(..., description="Raw legal text to process for entity extraction")
    entity_types: Optional[List[str]] = Field(
        default=None,
        description="Optional filter for specific entity types (e.g. ['PERSON', 'ORGANIZATION', 'CONTRACT_PARTY', 'DATE', 'MONEY', 'LOCATION', 'LEGAL_REF'])",
    )
    use_legal_ner: bool = Field(True, description="Enable fine-tuned Legal-BERT NER model if available")
    use_huggingface: bool = Field(True, description="Enable HuggingFace Transformers NER model if available")
    use_spacy: bool = Field(True, description="Enable spaCy NLP NER engine")
    use_rules: bool = Field(True, description="Enable Legal Regex & Matcher engine")


class NERResponse(BaseModel):
    success: bool = True
    total_entities: int = Field(..., description="Total number of extracted entities")
    summary: Dict[str, int] = Field(
        default_factory=dict,
        description="Count of extracted entities grouped by category label",
    )
    entities: List[EntityItem] = Field(default_factory=list, description="Array of extracted entities")

