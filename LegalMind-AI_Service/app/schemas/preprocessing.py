from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class PreprocessingRequest(BaseModel):
    raw_text: str = Field(..., description="Raw text extracted from legal document")
    clean_whitespace: bool = Field(True, description="Remove redundant spaces/newlines")
    normalize_ocr: bool = Field(True, description="Fix hyphenations, line breaks, and OCR artifacts")
    chunk_size: Optional[int] = Field(500, description="Word limit per text chunk")
    chunk_overlap: Optional[int] = Field(50, description="Overlap between consecutive chunks")


class TextChunk(BaseModel):
    chunk_id: int = Field(..., description="1-indexed chunk identifier")
    text: str = Field(..., description="Cleaned chunk text content")
    word_count: int = Field(..., description="Number of words in chunk")
    char_count: int = Field(..., description="Number of characters in chunk")
    start_char: int = Field(0, description="Start character offset in cleaned document")
    end_char: int = Field(0, description="End character offset in cleaned document")


class PreprocessingResponse(BaseModel):
    success: bool = True
    cleaned_text: str = Field(..., description="Fully preprocessed and normalized legal text")
    total_characters: int = Field(..., description="Total character count of cleaned text")
    total_words: int = Field(..., description="Total word count of cleaned text")
    total_sentences: int = Field(..., description="Total sentence count determined by NLP sentencizer")
    total_paragraphs: int = Field(..., description="Total paragraph count")
    chunks: List[TextChunk] = Field(default_factory=list, description="Array of text chunks for downstream processing")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional document preprocessing metadata")

