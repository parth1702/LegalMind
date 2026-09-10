from fastapi import APIRouter
from app.schemas.clause import ClauseExtractionRequest, ClauseExtractionResponse
from app.services.clause_service import clause_service

router = APIRouter()


@router.post("/extract", response_model=ClauseExtractionResponse, summary="Extract Legal Clauses")
async def extract_clauses(request: ClauseExtractionRequest):
    """
    Identifies, segments, and classifies legal contract clauses (Indemnification, Liability, Termination, etc.).
    """
    return await clause_service.extract_clauses(request)
