from fastapi import APIRouter
from app.schemas.ner import NERRequest, NERResponse
from app.services.ner_service import ner_service

router = APIRouter()


@router.post("/analyze", response_model=NERResponse, summary="Extract Named Entities")
async def analyze_ner(request: NERRequest):
    """
    Extracts legal named entities (Parties, Dates, Amounts, Jurisdictions) using spaCy and Transformer models.
    """
    return await ner_service.extract_entities(request)
