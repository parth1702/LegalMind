"""
Evidence-Backed Risk Engine Schemas for LegalMind AI.
Defines schemas for triggered rules, category risk breakdown, and evidence-grounded risk report outputs.
"""
from __future__ import annotations

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.schemas.evidence import EvidenceFinding


class TriggeredRiskRule(BaseModel):
    rule_id: str = Field(..., description="Unique rule identifier (e.g. LIABILITY_UNLIMITED)")
    category: str = Field(..., description="Risk category dimension")
    severity: str = Field(..., description="Risk severity tier: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'")
    score_points: float = Field(..., ge=0.0, le=100.0, description="Raw category score impact points")
    finding: str = Field(..., description="Transparent description of legal risk finding")
    evidence_text: str = Field(..., description="Exact text snippet extracted from document acting as evidence")
    page: int = Field(1, description="1-indexed document page number")
    chunk_id: str = Field("chunk-1", description="Chunk sequence identifier")
    start_char: int = Field(0, description="Character start offset")
    end_char: int = Field(0, description="Character end offset")
    confidence: float = Field(0.90, ge=0.0, le=1.0, description="Evidence verification confidence score")
    recommendation: str = Field("", description="Actionable legal mitigation strategy")


class CategoryRiskBreakdown(BaseModel):
    category_name: str
    weight_percentage: float  # e.g. 20.0 for 20%
    raw_category_score: float  # 0.0 to 100.0
    weighted_score_contribution: float  # raw_category_score * weight
    triggered_rules_count: int = 0


class EvidenceRiskAnalysisReport(BaseModel):
    success: bool = True
    document_id: str
    user_id: str
    filename: str
    overall_score: float = Field(..., ge=0.0, le=100.0, description="Overall weighted contract risk score")
    overall_level: str = Field(..., description="Overall risk tier: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'")
    category_scores: Dict[str, float] = Field(default_factory=dict, description="Raw 0-100 score per category")
    category_breakdown: List[CategoryRiskBreakdown] = Field(default_factory=list, description="Weighted breakdown")
    triggered_rules: List[TriggeredRiskRule] = Field(default_factory=list, description="Array of grounded rules")
    evidence: List[EvidenceFinding] = Field(default_factory=list, description="Array of verifiable text evidence items")
    recommendations: List[str] = Field(default_factory=list, description="List of actionable recommendations")
    disclaimer: str = Field(
        "This legal risk analysis is an AI-assisted tool derived exclusively from verifiable document text evidence. "
        "It does not constitute formal legal advice from a licensed attorney."
    )
