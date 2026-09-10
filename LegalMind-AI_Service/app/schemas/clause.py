from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

LEGAL_DISCLAIMER_TEXT = (
    "This is an AI-assisted analysis system, not a replacement for a lawyer. "
    "The analysis provided does not claim legal certainty and should be reviewed by qualified legal counsel."
)


class ClauseLocation(BaseModel):
    paragraph: int = Field(1, description="1-indexed paragraph number")
    start_char: int = Field(0, description="Character start offset in contract")
    end_char: int = Field(0, description="Character end offset in contract")
    page: Optional[int] = Field(1, description="Estimated document page number")


class ExtractedClause(BaseModel):
    clause_id: str = Field(..., description="Unique clause identifier")
    category: str = Field(
        ...,
        description="Clause category: Termination, Payment, Confidentiality, Liability, Indemnity, Obligations, Renewal, Dispute Resolution, Governing Law",
    )
    title: str = Field(..., description="Clause heading title or generated summary")
    text: str = Field(..., description="Full clause text content")
    location: ClauseLocation = Field(..., description="Clause location metadata in document")
    importance: str = Field("medium", description="Clause importance level: 'high', 'medium', or 'low'")
    is_risk_candidate: bool = Field(False, description="Flag indicating if clause poses a legal or financial risk")
    risk_reason: Optional[str] = Field(None, description="Explanation of identified risk factor")
    confidence: float = Field(0.90, ge=0.0, le=1.0, description="Classification confidence score")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional clause context metadata")


class ClauseExtractionRequest(BaseModel):
    text: str = Field(..., description="Raw legal contract text")
    categories: Optional[List[str]] = Field(
        None,
        description="Optional filter for specific categories (e.g. ['Termination', 'Liability', 'Indemnity'])",
    )
    min_confidence: float = Field(0.50, ge=0.0, le=1.0, description="Minimum confidence threshold for clauses")


class ClauseExtractionResponse(BaseModel):
    success: bool = True
    disclaimer: str = Field(
        default=LEGAL_DISCLAIMER_TEXT,
        description="Mandatory legal disclaimer clarifying system is AI-assisted and not a lawyer",
    )
    total_clauses: int = Field(..., description="Total number of extracted clauses")
    summary: Dict[str, int] = Field(
        default_factory=dict,
        description="Count of extracted clauses by category",
    )
    clauses: List[ExtractedClause] = Field(default_factory=list, description="Array of extracted clauses")

