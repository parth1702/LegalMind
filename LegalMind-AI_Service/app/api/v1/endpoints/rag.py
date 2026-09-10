from fastapi import APIRouter
from app.schemas.rag import RAGQueryRequest, RAGQueryResponse
from app.services.rag_service import rag_service

router = APIRouter()


@router.post("/query", response_model=RAGQueryResponse, summary="Execute RAG Query")
async def execute_rag_query(request: RAGQueryRequest):
    """
    Performs vector similarity search across FAISS index and synthesizes answers using LangChain RAG pipeline.
    """
    return await rag_service.answer_query(request)
