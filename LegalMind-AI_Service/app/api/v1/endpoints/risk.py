from fastapi import APIRouter
from app.schemas.risk import RiskAnalysisRequest, RiskAnalysisResponse
from app.services.risk_service import risk_service

router = APIRouter()


@router.post("/analyze", response_model=RiskAnalysisResponse, summary="Analyze Legal Risks")
async def analyze_legal_risk(request: RiskAnalysisRequest):
    """
    Evaluates potential contract liabilities, score risks, and provides legal mitigation recommendations.
    """
    return await risk_service.analyze_risk(request)
