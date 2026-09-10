from pydantic import BaseModel, Field
from typing import List, Optional


class PageExtraction(BaseModel):
    """Result for a single page within a multi-page document."""
    page_number: int = Field(..., description="1-indexed page number")
    text: str = Field(..., description="Extracted text content for this page")
    ocr_used: bool = Field(False, description="Whether OCR was applied to this page")
    char_count: int = Field(0, description="Character count for this page")


class DocumentExtractionResponse(BaseModel):
    """Unified response for all document extraction paths."""
    success: bool = True
    filename: str
    file_type: str = Field(..., description="Detected file type: pdf | docx | txt | image")
    total_pages: int = 0
    ocr_used: bool = Field(False, description="True if any page required OCR")
    raw_text: str = Field("", description="Raw concatenated extracted text")
    normalized_text: str = Field("", description="Whitespace-normalised and cleaned text")
    word_count: int = 0
    char_count: int = 0
    pages: List[PageExtraction] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list, description="Non-fatal issues encountered during extraction")
