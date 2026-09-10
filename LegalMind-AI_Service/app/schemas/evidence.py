"""
Evidence & Finding Data Model for LegalMind AI.
Provides strict validation and traceable document evidence grounding for legal risk findings.
Enforces the core contract rule: NO EVIDENCE = NO FINDING.
"""
from __future__ import annotations

from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator, model_validator


class EvidenceFinding(BaseModel):
    """
    Structured Internal Representation for Document Evidence Grounding.
    Every finding MUST reference actual extracted text from the uploaded document.
    """
    document_id: str = Field(..., description="Unique non-empty document identifier")
    user_id: str = Field(..., description="Unique non-empty user identifier for multi-tenant isolation")
    filename: str = Field("document.pdf", description="Original filename of uploaded document")
    category: str = Field(..., description="Legal risk or clause category (e.g., Liability, Indemnity, DPDP)")
    rule_id: str = Field(..., description="Rule or policy identifier (e.g., RULE-INDEMNITY-01)")
    severity: str = Field("Low", description="Severity tier: 'Low', 'Medium', 'High', or 'Critical'")
    finding: str = Field(..., description="Non-empty description of legal risk finding")
    evidence_text: str = Field("", description="Exact text excerpt extracted from document acting as evidence")
    page: int = Field(1, description="1-indexed document page number")
    chunk_id: str = Field(..., description="Non-empty text chunk identifier")
    start_char: int = Field(0, description="Character start offset in contract text")
    end_char: int = Field(0, description="Character end offset in contract text")
    confidence: float = Field(0.90, description="Confidence score between 0.0 and 1.0 inclusive")
    recommendation: str = Field("", description="Actionable legal mitigation guidance")
    status: str = Field("valid", description="Finding status: 'valid', 'not_detected', or 'insufficient_evidence'")

    @field_validator("document_id")
    @classmethod
    def validate_document_id(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("document_id must be a non-empty string")
        return v.strip()

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("user_id must be a non-empty string")
        return v.strip()

    @field_validator("chunk_id")
    @classmethod
    def validate_chunk_id(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("chunk_id must be a non-empty string")
        return v.strip()

    @field_validator("page")
    @classmethod
    def validate_page(cls, v: int) -> int:
        if v < 1:
            raise ValueError("page number must be >= 1")
        return v

    @field_validator("confidence")
    @classmethod
    def validate_confidence(cls, v: float) -> float:
        if v < 0.0 or v > 1.0:
            raise ValueError("confidence must be between 0.0 and 1.0 inclusive")
        return v

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        valid_tiers = ["low", "medium", "high", "critical"]
        if v.lower() not in valid_tiers:
            raise ValueError(f"severity must be one of {valid_tiers}, got '{v}'")
        return v.capitalize()

    @model_validator(mode="after")
    def validate_offsets_and_evidence(self) -> EvidenceFinding:
        # Validate character offsets
        if self.start_char < 0:
            raise ValueError("start_char must be >= 0")
        if self.end_char < self.start_char:
            raise ValueError(f"end_char ({self.end_char}) cannot be less than start_char ({self.start_char})")

        # Enforce Rule: NO EVIDENCE = NO FINDING (Status: not_detected / insufficient_evidence)
        text_clean = (self.evidence_text or "").strip()
        if not text_clean or self.status in ["not_detected", "insufficient_evidence"]:
            if not text_clean:
                object.__setattr__(self, "status", "insufficient_evidence")
                object.__setattr__(self, "evidence_text", "[INSUFFICIENT EVIDENCE: No valid text excerpt extracted]")
            elif self.status in ["not_detected", "insufficient_evidence"]:
                object.__setattr__(self, "status", self.status)

        return self

    @property
    def is_valid_finding(self) -> bool:
        """Returns True only if finding is grounded in valid evidence text."""
        return (
            self.status == "valid"
            and bool(self.evidence_text)
            and not self.evidence_text.startswith("[INSUFFICIENT")
            and not self.evidence_text.startswith("[NOT DETECTED")
        )
