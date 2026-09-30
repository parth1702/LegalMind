from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.services.agentic_rag_service import agentic_rag_service
from app.services.legal_glossary_service import legal_glossary_service
from app.services.contract_roadmap_service import contract_roadmap_service
from app.services.clause_rewrite_service import clause_rewrite_service

router = APIRouter()


class GlossaryRequest(BaseModel):
    document_id: Optional[str] = Field(default="", description="Document ID")
    contract_text: Optional[str] = Field(default="", description="Extracted document text")


class ClauseRewriteRequest(BaseModel):
    original_clause: str = Field(..., description="Original legal clause text to rewrite")
    risk_topic: Optional[str] = Field(default="Contract Risk Mitigation", description="Risk topic or context")


@router.post("/query", response_model=RAGQueryResponse, summary="Execute Advanced Agentic RAG Query")
async def execute_rag_query(request: RAGQueryRequest):
    """
    Advanced Agentic RAG Pipeline:
    Intent Classification → Query Enhancement → Hybrid Retrieval (FAISS + BM25)
    → RRF Fusion → Cross-Encoder Reranking → Confidence-Gated LLM Synthesis → Citation Validation
    """
    return await agentic_rag_service.execute(request)


@router.post("/glossary-and-diagram", summary="Extract Legal Glossary, Statutory Acts & Visual Contract Graph")
async def get_glossary_and_diagram(request: GlossaryRequest):
    """
    Extracts key legal terms, plain-English meanings, referenced statutory acts,
    original source quotes, and visual contract node graph data.
    """
    return legal_glossary_service.extract_glossary_and_graph(
        contract_text=request.contract_text or "",
        document_id=request.document_id or ""
    )


@router.post("/action-roadmap", summary="Generate Action Roadmap & Playbook (DO, DO NOT, REMEMBER, NEXT STEPS)")
async def get_action_roadmap(request: GlossaryRequest):
    """
    Generates actionable legal execution playbook defining:
    1. DO (Required obligations & compliance)
    2. DO NOT (Prohibitions & breach triggers)
    3. REMEMBER (Key legal milestones & seat/jurisdiction)
    4. NEXT STEPS (Actionable user checklist)
    """
    return contract_roadmap_service.generate_roadmap(
        contract_text=request.contract_text or "",
        document_id=request.document_id or ""
    )


@router.post("/rewrite-clause", summary="Generate 3-Tiered Legal Counter-Clauses & Negotiation Rationale")
async def rewrite_clause(request: ClauseRewriteRequest):
    """
    Generates 3 counter-clause alternatives:
    1. Protective (Pro-Client)
    2. Balanced (Industry Standard)
    3. Minimal Friction (Fast Approval)
    """
    return clause_rewrite_service.rewrite_clause(
        original_clause=request.original_clause,
        risk_topic=request.risk_topic or "Contract Risk Mitigation"
    )
