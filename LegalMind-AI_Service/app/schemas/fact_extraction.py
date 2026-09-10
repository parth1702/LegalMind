"""
Legal Fact Extraction Data Schemas for LegalMind AI.
Provides structured factual representations across 9 legal categories grounded in document evidence.
"""
from __future__ import annotations

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.evidence import EvidenceFinding


class LiabilityFact(BaseModel):
    liability_clause_present: bool = False
    liability_cap_present: Optional[bool] = None
    cap_amount: Optional[str] = None
    cap_basis: Optional[str] = None
    cap_period: Optional[str] = None
    unlimited_liability: Optional[bool] = None
    consequential_damages_waived: Optional[bool] = None
    exceptions_to_cap: Optional[List[str]] = None
    evidence: Optional[EvidenceFinding] = None


class IndemnificationFact(BaseModel):
    indemnity_present: bool = False
    indemnifying_party: Optional[str] = None
    protected_party: Optional[str] = None
    scope: Optional[str] = None
    monetary_cap: Optional[str] = None
    uncapped_indemnity: Optional[bool] = None
    third_party_claims_covered: Optional[bool] = None
    defense_control_provisions: Optional[str] = None
    evidence: Optional[EvidenceFinding] = None


class TerminationFact(BaseModel):
    termination_for_convenience: Optional[bool] = None
    termination_for_cause: Optional[bool] = None
    notice_period: Optional[str] = None
    immediate_termination: Optional[bool] = None
    renewal_type: Optional[str] = None
    automatic_renewal: Optional[bool] = None
    evidence: Optional[EvidenceFinding] = None


class PaymentFact(BaseModel):
    payment_period: Optional[str] = None
    late_payment_fee_present: Optional[bool] = None
    interest_rate: Optional[str] = None
    penalties: Optional[str] = None
    milestone_conditions: Optional[str] = None
    evidence: Optional[EvidenceFinding] = None


class ConfidentialityFact(BaseModel):
    confidentiality_present: bool = False
    nature: Optional[str] = None  # 'mutual', 'unilateral'
    duration: Optional[str] = None
    exclusions: Optional[List[str]] = None
    permitted_disclosure: Optional[str] = None
    evidence: Optional[EvidenceFinding] = None


class IntellectualPropertyFact(BaseModel):
    ip_ownership: Optional[str] = None
    license_type: Optional[str] = None
    assignment: Optional[str] = None
    pre_existing_ip: Optional[str] = None
    work_product_ownership: Optional[str] = None
    evidence: Optional[EvidenceFinding] = None


class DataProtectionFact(BaseModel):
    personal_data_processing: Optional[bool] = None
    consent_notice_provisions: Optional[str] = None
    processor_controller_role: Optional[str] = None
    security_obligations: Optional[str] = None
    breach_notification_timeframe: Optional[str] = None
    retention_period: Optional[str] = None
    cross_border_transfer_allowed: Optional[bool] = None
    evidence: Optional[EvidenceFinding] = None


class GoverningLawDisputeFact(BaseModel):
    governing_law: Optional[str] = None
    jurisdiction_venue: Optional[str] = None
    arbitration_clause_present: Optional[bool] = None
    arbitration_seat: Optional[str] = None
    dispute_mechanism: Optional[str] = None
    evidence: Optional[EvidenceFinding] = None


class NonCompeteRestrictionsFact(BaseModel):
    non_compete_present: Optional[bool] = None
    non_solicitation_present: Optional[bool] = None
    duration: Optional[str] = None
    geographic_scope: Optional[str] = None
    evidence: Optional[EvidenceFinding] = None


class DocumentFactExtractionResult(BaseModel):
    success: bool = True
    document_id: str
    user_id: str
    filename: str
    liability: LiabilityFact = Field(default_factory=LiabilityFact)
    indemnification: IndemnificationFact = Field(default_factory=IndemnificationFact)
    termination: TerminationFact = Field(default_factory=TerminationFact)
    payment: PaymentFact = Field(default_factory=PaymentFact)
    confidentiality: ConfidentialityFact = Field(default_factory=ConfidentialityFact)
    intellectual_property: IntellectualPropertyFact = Field(default_factory=IntellectualPropertyFact)
    data_protection: DataProtectionFact = Field(default_factory=DataProtectionFact)
    governing_law_dispute: GoverningLawDisputeFact = Field(default_factory=GoverningLawDisputeFact)
    non_compete_restrictions: NonCompeteRestrictionsFact = Field(default_factory=NonCompeteRestrictionsFact)
    total_facts_extracted: int = 0
