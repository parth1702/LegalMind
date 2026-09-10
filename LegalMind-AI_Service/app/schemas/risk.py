from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

LEGAL_RISK_DISCLAIMER = (
    "This risk analysis is an AI-assisted tool designed to highlight potential legal vulnerabilities. "
    "It is not legally authoritative and does not constitute a replacement for a licensed attorney."
)


class RiskLocation(BaseModel):
    paragraph: int = Field(1, description="1-indexed paragraph number")
    start_char: int = Field(0, description="Character start offset in contract")
    end_char: int = Field(0, description="Character end offset in contract")
    page: Optional[int] = Field(1, description="Estimated document page number")


class RiskItem(BaseModel):
    risk_id: str = Field(..., description="Unique risk item identifier (e.g. RISK-001)")
    factor: str = Field(
        ...,
        description="Risk factor dimension: Risky Clauses, Missing Protections, Unusual Obligations, Termination Conditions, Liability, Indemnification, Payment Conditions, Deadlines, Penalty Language",
    )
    risk_category: str = Field(..., description="Risk tier category: 'Low', 'Medium', 'High', or 'Critical'")
    score_impact: float = Field(..., ge=0.0, le=100.0, description="Score impact points added to overall risk")
    reason: str = Field(..., description="Transparent explanation of why this risk was flagged")
    supporting_clause: str = Field(..., description="Exact text excerpt from contract acting as document evidence")
    location: RiskLocation = Field(..., description="Location of supporting document evidence")
    recommendation: str = Field(..., description="Actionable legal mitigation strategy")
    confidence: float = Field(0.90, ge=0.0, le=1.0, description="Confidence score of risk identification")

    # Phase 4 Hybrid Risk Engine Output Contracts
    category: Optional[str] = Field(None, description="Risk factor category")
    severity: Optional[str] = Field(None, description="Risk severity tier ('Low', 'Medium', 'High', 'Critical')")
    score: Optional[float] = Field(None, description="Numerical score impact of risk item")
    evidence: Optional[str] = Field(None, description="Exact text excerpt acting as evidence")
    page: Optional[int] = Field(1, description="Document page number")
    source: str = Field("rule", description="Risk detection source: 'rule', 'ml', or 'hybrid'")

    def __init__(self, **data: Any) -> None:
        if "category" not in data or data["category"] is None:
            data["category"] = data.get("factor", "General")
        if "severity" not in data or data["severity"] is None:
            data["severity"] = data.get("risk_category", "Low")
        if "score" not in data or data["score"] is None:
            data["score"] = data.get("score_impact", 0.0)
        if "evidence" not in data or data["evidence"] is None:
            data["evidence"] = data.get("supporting_clause", "")
        if "page" not in data or data["page"] is None:
            loc = data.get("location")
            if hasattr(loc, "page"):
                data["page"] = loc.page
            elif isinstance(loc, dict):
                data["page"] = loc.get("page", 1)
            else:
                data["page"] = 1
        super().__init__(**data)


class RiskAnalysisRequest(BaseModel):
    text: str = Field(..., description="Raw legal document text for risk evaluation")
    jurisdiction: Optional[str] = Field("US", description="Legal jurisdiction governing context")
    min_confidence: float = Field(0.50, ge=0.0, le=1.0, description="Minimum confidence threshold")


class RiskAnalysisResponse(BaseModel):
    success: bool = True
    overall_risk_score: float = Field(..., ge=0.0, le=100.0, description="Aggregated risk score from 0 (Safe) to 100 (Extreme Risk)")
    overall_risk_category: str = Field(..., description="Overall document risk category: 'Low', 'Medium', 'High', or 'Critical'")
    found_risks: List[RiskItem] = Field(default_factory=list, description="Array of identified risk items grounded in text evidence")
    missing_protections: List[str] = Field(default_factory=list, description="List of essential legal safeguards missing from contract")
    factor_breakdown: Dict[str, int] = Field(default_factory=dict, description="Count of identified risks grouped by risk factor")
    disclaimer: str = Field(
        default=LEGAL_RISK_DISCLAIMER,
        description="Non-authoritative AI legal disclaimer",
    )
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional analysis metadata")

