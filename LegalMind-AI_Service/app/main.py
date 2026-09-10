from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.errors import setup_exception_handlers
from app.api.v1.router import api_router

# Initialize structured logging
setup_logging()
logger = get_logger("LegalMind.Main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application startup and shutdown events lifecycle manager.
    """
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    logger.info(f"API Documentation available at: http://{settings.HOST}:{settings.PORT}/docs")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}...")


def create_application() -> FastAPI:
    """
    FastAPI Application Factory.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description="LegalMind AI Microservice for Document Processing, OCR, NER, Risk Analysis, Clause Extraction & RAG",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )

    # CORS Middleware Setup
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Register Exception Handlers
    setup_exception_handlers(app)

    # Mount API v1 Router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    # Top-level Health endpoint for easy load balancer access
    from app.api.v1.endpoints.health import router as health_router
    app.include_router(health_router, prefix="/health", tags=["Root Health Check"])

    return app


app = create_application()
