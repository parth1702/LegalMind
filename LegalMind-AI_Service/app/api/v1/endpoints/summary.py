from fastapi import APIRouter
from app.schemas.summarization import SummarizationRequest, SummarizationResponse
from app.services.summarization_service import summarization_service

router = APIRouter()


@router.post("", response_model=SummarizationResponse, summary="Summarize Legal Text")
async def summarize_document(request: SummarizationRequest):
    """
    Generates executive, bullet-point, or detailed summaries of contracts using HuggingFace & LangChain models.
    """
    return await summarization_service.summarize(request)
