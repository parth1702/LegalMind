"""
Groq LLM Service Abstraction for LegalMind.
Provides ultra-fast, high-accuracy legal answer generation using Groq API
as a seamless fallback when Gemini API fails or encounters quota/404 issues.
"""
from __future__ import annotations

import os
import json
import re
import time
from typing import List, Dict, Any, Optional
import httpx

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("LegalMind.GroqService")

GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

# Groq candidate models in priority order (verified active Groq models)
GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "groq/compound",
    "groq/compound-mini",
    "qwen/qwen3.8-27b",
]


class GroqService:
    """
    Groq REST API Client supporting high-speed inference, legal RAG synthesis,
    and automatic model failover.
    """

    def __init__(self) -> None:
        self.api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")

    def is_available(self) -> bool:
        """Check if GROQ_API_KEY is configured."""
        self.api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY")
        return bool(self.api_key and self.api_key.strip())

    def generate_chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> Dict[str, Any]:
        """
        Execute chat completion against Groq API with automatic model retry list.
        """
        if not self.is_available():
            logger.warning("[GROQ] Cannot execute request: GROQ_API_KEY not configured in .env.")
            return {"success": False, "answer": None, "error": "GROQ_API_KEY_MISSING"}

        headers = {
            "Authorization": f"Bearer {self.api_key.strip()}",
            "Content-Type": "application/json",
        }

        last_error = None

        for model in GROQ_MODELS:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }

            try:
                t0 = time.time()
                with httpx.Client(timeout=30.0) as client:
                    response = client.post(GROQ_ENDPOINT, headers=headers, json=payload)

                elapsed = round((time.time() - t0) * 1000, 2)

                if response.status_code == 200:
                    data = response.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        text_out = (choices[0]["message"].get("content") or "").strip()
                        if text_out:
                            logger.info(f"[GROQ] Successfully generated response using model='{model}' in {elapsed}ms.")
                            return {
                                "success": True,
                                "answer": text_out,
                                "model_used": model,
                                "error": None,
                            }
                
                err_body = response.text
                logger.warning(f"[GROQ] Model '{model}' returned HTTP {response.status_code}: {err_body[:200]}")
                last_error = f"HTTP {response.status_code}: {err_body[:200]}"
            except Exception as exc:
                last_error = str(exc)
                logger.warning(f"[GROQ] Model '{model}' request failed: {exc}")

        logger.error(f"[GROQ] All candidate Groq models failed. Last error: {last_error}")
        return {"success": False, "answer": None, "error": last_error}


groq_service = GroqService()
