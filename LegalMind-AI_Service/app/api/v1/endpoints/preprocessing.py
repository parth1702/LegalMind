from fastapi import APIRouter
from app.schemas.preprocessing import PreprocessingRequest, PreprocessingResponse
from app.services.preprocessing_service import preprocessing_service

router = APIRouter()


@router.post("", response_model=PreprocessingResponse, summary="Clean & Chunk Text")
async def preprocess_text(request: PreprocessingRequest):
    """
    Cleans raw document text, normalizes formatting, and splits into optimal tokens/chunks for embeddings.
    """
    return await preprocessing_service.preprocess(request)
