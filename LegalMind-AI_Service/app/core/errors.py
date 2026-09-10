from typing import Any, Dict, Optional
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.logging import get_logger
from app.core.config import settings


logger = get_logger("LegalMind.Errors")


class LegalMindException(Exception):
    """Base exception class for LegalMind AI Service."""
    def __init__(
        self,
        message: str,
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(message)


class OCRProcessingError(LegalMindException):
    """Exception raised during OCR execution."""
    def __init__(self, message: str = "Failed to process document with OCR", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, details=details)


class ModelLoadError(LegalMindException):
    """Exception raised when an AI model fails to load."""
    def __init__(self, message: str = "AI Model failed to initialize", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=status.HTTP_503_SERVICE_UNAVAILABLE, details=details)


class VectorDBError(LegalMindException):
    """Exception raised during Vector Database operations."""
    def __init__(self, message: str = "Vector Database operation error", details: Optional[Dict[str, Any]] = None):
        super().__init__(message, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, details=details)


def setup_exception_handlers(app: FastAPI) -> None:
    """Registers exception handlers with FastAPI application instance."""

    @app.exception_handler(LegalMindException)
    async def legalmind_exception_handler(request: Request, exc: LegalMindException) -> JSONResponse:
        logger.error(f"LegalMindException [{exc.status_code}]: {exc.message} | Details: {exc.details}")
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "type": exc.__class__.__name__,
                    "message": exc.message,
                    "details": exc.details,
                }
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        logger.warning(f"Validation Error on {request.url.path}: {exc.errors()}")
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "type": "ValidationError",
                    "message": "Invalid request payload",
                    "details": exc.errors(),
                }
            }
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        logger.exception(f"Unhandled Exception on {request.url.path}: {str(exc)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "type": "InternalServerError",
                    "message": "An unexpected error occurred in the AI Service.",
                    "details": str(exc) if settings.DEBUG else None

                }
            }
        )
