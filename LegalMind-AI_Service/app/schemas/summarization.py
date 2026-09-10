from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

LEGAL_SUMMARIZATION_DISCLAIMER = (
    "This AI-assisted summarization is provided for informational and preliminary review purposes only "
    "and does not constitute formal legal advice or legal certainty."
)


class SummarizationRequest(BaseModel):
    text: str = Field(..., description="Raw legal contract or document text to summarize")
    summary_type: str = Field("executive", description="Options: 'executive', 'bullet_points', 'detailed'")
    max_length: Optional[int] = Field(300, description="Target word count for executive summary text")
    use_huggingface: bool = Field(True, description="Enable HuggingFace Transformers summarizer pipeline if available")


class SummarizationResponse(BaseModel):
    success: bool = True
    summary_type: str = Field(..., description="Summary type requested")
    executive_summary: str = Field(..., description="High-level executive summary of contract purpose and scope")
    key_points: List[str] = Field(default_factory=list, description="Bullet points of key contract provisions")
    parties: List[str] = Field(default_factory=list, description="Identified contract parties and roles")
    obligations: List[str] = Field(default_factory=list, description="Primary affirmative and negative legal obligations")
    important_dates: List[str] = Field(default_factory=list, description="Key execution, effective, expiration, and renewal dates")
    potential_concerns: List[str] = Field(default_factory=list, description="Potential legal risks, uncapped liabilities, or red flags")
    word_count: int = Field(..., description="Total word count of processed text")
    chunks_processed: int = Field(1, description="Number of text chunks processed during Map-Reduce summarization")
    disclaimer: str = Field(
        default=LEGAL_SUMMARIZATION_DISCLAIMER,
        description="Legal disclaimer clarifying AI system nature",
    )
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional document processing metadata")

