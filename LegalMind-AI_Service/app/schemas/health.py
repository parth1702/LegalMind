from pydantic import BaseModel, Field
from typing import Dict, Any


class ComponentHealth(BaseModel):
    status: str = Field(..., example="healthy")
    message: str = Field(..., example="Service operational")


class HealthResponse(BaseModel):
    status: str = Field(..., example="ok")
    service: str = Field(..., example="LegalMind AI Service")
    version: str = Field(..., example="1.0.0")
    environment: str = Field(..., example="development")
    components: Dict[str, ComponentHealth] = Field(default_factory=dict)
