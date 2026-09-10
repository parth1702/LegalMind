# Phase 8.1 Legal Fact Extraction Layer Implementation Document

## 1. Executive Summary & Core Rules

This document details the implementation of the **Legal Fact Extraction Layer** for LegalMind AI.

### Architectural Directives
1. **NO GUESSING**: If a fact cannot be reliably determined from document text, return `null` / `None` / `insufficient_evidence`.
2. **NO RANDOM NUMBERS**: Factual extraction relies exclusively on deterministic text matching and regex parser patterns.
3. **GROUNDED IN EVIDENCE**: Every extracted fact references a traceable `EvidenceFinding` object containing `document_id`, `user_id`, `filename`, `page`, `chunk_id`, character offsets, and exact extracted text.
4. **NO RISK SCORE ASSIGNMENT**: Fact extraction isolates factual extraction from risk scoring.

---

## 2. 9 Target Extraction Categories

Location: `LegalMind-AI_Service/app/schemas/fact_extraction.py` & `app/services/fact_extraction_service.py`

### Category 1: LIABILITY
- `liability_clause_present`: `bool`
- `liability_cap_present`: `Optional[bool]`
- `cap_amount`: `Optional[str]` (e.g. `"$1,000,000"`, `"total fees paid in preceding 12 months"`)
- `cap_basis`: `Optional[str]` (`"fees paid"`, `"fixed monetary"`)
- `cap_period`: `Optional[str]` (`"12 months"`)
- `unlimited_liability`: `Optional[bool]`
- `consequential_damages_waived`: `Optional[bool]`
- `exceptions_to_cap`: `Optional[List[str]]` (`["gross negligence", "willful misconduct"]`)
- `evidence`: `Optional[EvidenceFinding]`

### Category 2: INDEMNIFICATION
- `indemnity_present`: `bool`
- `indemnifying_party`: `Optional[str]` (`"Vendor"`, `"Contractor"`, `"Party A"`)
- `protected_party`: `Optional[str]` (`"Client"`, `"Company"`, `"Party B"`)
- `scope`: `Optional[str]` (`"third-party claims"`)
- `monetary_cap`: `Optional[str]`
- `uncapped_indemnity`: `Optional[bool]`
- `third_party_claims_covered`: `Optional[bool]`
- `defense_control_provisions`: `Optional[str]` (`"duty to defend"`)
- `evidence`: `Optional[EvidenceFinding]`

### Category 3: TERMINATION
- `termination_for_convenience`: `Optional[bool]`
- `termination_for_cause`: `Optional[bool]`
- `notice_period`: `Optional[str]` (`"30 days"`)
- `immediate_termination`: `Optional[bool]`
- `renewal_type`: `Optional[str]` (`"automatic"`, `"manual"`)
- `automatic_renewal`: `Optional[bool]`
- `evidence`: `Optional[EvidenceFinding]`

### Category 4: PAYMENT
- `payment_period`: `Optional[str]` (`"NET 30"`, `"Net 45"`)
- `late_payment_fee_present`: `Optional[bool]`
- `interest_rate`: `Optional[str]` (`"1.5% per month"`)
- `penalties`: `Optional[str]`
- `milestone_conditions`: `Optional[str]`
- `evidence`: `Optional[EvidenceFinding]`

### Category 5: CONFIDENTIALITY
- `confidentiality_present`: `bool`
- `nature`: `Optional[str]` (`"mutual"`, `"unilateral"`)
- `duration`: `Optional[str]` (`"3 years"`, `"5 years"`, `"perpetual"`)
- `exclusions`: `Optional[List[str]]` (`["publicly known information", "prior knowledge"]`)
- `permitted_disclosure`: `Optional[str]` (`"required by law"`)
- `evidence`: `Optional[EvidenceFinding]`

### Category 6: INTELLECTUAL PROPERTY
- `ip_ownership`: `Optional[str]` (`"Client"`, `"Vendor"`, `"Work for Hire"`)
- `license_type`: `Optional[str]` (`"non-exclusive"`, `"exclusive"`)
- `assignment`: `Optional[str]` (`"assignment of rights"`)
- `pre_existing_ip`: `Optional[str]` (`"retained by originating party"`)
- `work_product_ownership`: `Optional[str]`
- `evidence`: `Optional[EvidenceFinding]`

### Category 7: DATA PROTECTION
- `personal_data_processing`: `Optional[bool]`
- `consent_notice_provisions`: `Optional[str]` (`"explicit consent mandated"`)
- `processor_controller_role`: `Optional[str]` (`"Data Controller"`, `"Data Processor"`, `"DPDP Compliance"`)
- `security_obligations`: `Optional[str]` (`"technical and organizational measures"`)
- `breach_notification_timeframe`: `Optional[str]` (`"72 hours"`)
- `retention_period`: `Optional[str]`
- `cross_border_transfer_allowed`: `Optional[bool]`
- `evidence`: `Optional[EvidenceFinding]`

### Category 8: GOVERNING LAW / DISPUTE
- `governing_law`: `Optional[str]` (`"Laws Of Delaware"`, `"Laws of India"`)
- `jurisdiction_venue`: `Optional[str]` (`"High Court of Delhi"`, `"State of Delaware"`)
- `arbitration_clause_present`: `Optional[bool]`
- `arbitration_seat`: `Optional[str]` (`"High Court of Delhi"`)
- `dispute_mechanism`: `Optional[str]` (`"Binding Arbitration"`, `"Court Litigation"`)
- `evidence`: `Optional[EvidenceFinding]`

### Category 9: NON-COMPETE / RESTRICTIONS
- `non_compete_present`: `Optional[bool]`
- `non_solicitation_present`: `Optional[bool]`
- `duration`: `Optional[str]` (`"12 months"`)
- `geographic_scope`: `Optional[str]` (`"Worldwide"`, `"National"`)
- `evidence`: `Optional[EvidenceFinding]`

---

## 3. Test Fixtures & Multi-Contract Verification (`tests/test_legal_fact_extraction.py`)

Verified across 3 distinct contract fixtures:
1. `FIXTURE_A_MASTER_SERVICES_AGREEMENT`: Master Services Agreement containing liability cap ($1,000,000), 30-day notice for convenience termination, 3-year mutual confidentiality, and Delaware governing law.
2. `FIXTURE_B_EMPLOYMENT_AGREEMENT`: Executive Employment Agreement containing 12-month non-compete in California, work for hire IP assignment, and immediate termination for cause.
3. `FIXTURE_C_DATA_PROCESSING_AGREEMENT`: Data Processing Agreement containing DPDP Act 2023 consent provisions, 72-hour breach notification, Net 45 payment terms with 1.5% late fee interest rate, and High Court of Delhi arbitration seat.

### Multi-Fixture Differential Verification
Confirmed that modifying contract text alters extracted facts deterministically (e.g. Delaware law in Fixture A vs Delhi arbitration in Fixture C; California non-compete in Fixture B vs absent in Fixture A).
