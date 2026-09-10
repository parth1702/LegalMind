from fastapi import APIRouter
from app.api.v1.endpoints import (
    health,
    document,
    ocr,
    preprocessing,
    ner,
    clause,
    summary,
    risk,
    embeddings,
    rag,
    analysis,
)

api_router = APIRouter()

# Mount Endpoint Routers
api_router.include_router(health.router,        prefix="/health",      tags=["Health Check"])
api_router.include_router(document.router,      prefix="/document",    tags=["Document Extraction"])
api_router.include_router(ocr.router,           prefix="/ocr",         tags=["OCR Engine"])
api_router.include_router(preprocessing.router, prefix="/preprocess",  tags=["Text Preprocessing"])
api_router.include_router(ner.router,           prefix="/ner",         tags=["Named Entity Recognition"])
api_router.include_router(clause.router,        prefix="/clause",      tags=["Clause Extraction"])
api_router.include_router(summary.router,       prefix="/summarize",   tags=["Summarization"])
api_router.include_router(risk.router,          prefix="/risk",        tags=["Risk Analysis"])
api_router.include_router(embeddings.router,    prefix="/embeddings",  tags=["Vector Embeddings"])
api_router.include_router(rag.router,           prefix="/rag",         tags=["RAG & QA Engine"])
api_router.include_router(analysis.router,      prefix="/analysis",    tags=["Pipeline Orchestration"])

