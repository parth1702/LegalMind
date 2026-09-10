from pydantic import BaseModel, Field
from typing import List, Optional


class OCRRequest(BaseModel):
    document_url: Optional[str] = Field(None, description="URL of document to perform OCR on")
    language: str = Field("en", description="Target OCR language code")


class PageOCRResult(BaseModel):
    page_number: int
    text: str
    confidence: float


class OCRResponse(BaseModel):
    success: bool = True
    filename: Optional[str] = None
    file_type: Optional[str] = None
    total_pages: int = 0
    ocr_used: bool = False
    extracted_text: str = ""
    word_count: int = 0
    pages: List[PageOCRResult] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
