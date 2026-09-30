"""
Cross-Encoder Reranker Service for LegalMind Advanced RAG Pipeline.

After initial retrieval (dense + BM25 → RRF fusion), this service re-scores each
(query, chunk) pair using a cross-encoder model for precise relevance scoring.

Why reranking? Bi-encoders (embedding similarity) are fast but approximate — they encode
query and passage independently. Cross-encoders jointly attend to both query and passage
tokens simultaneously, producing far more accurate relevance scores.

This is the single biggest quality improvement possible in a RAG pipeline.

Model: cross-encoder/ms-marco-MiniLM-L-6-v2 (fast, ~22ms per pair on CPU)
"""
from __future__ import annotations

from typing import List, Optional, Any
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("LegalMind.RerankerService")


class RerankerService:
    """
    Cross-encoder reranker that re-scores (query, passage) pairs with full attention.
    Lazy-loads the cross-encoder model on first use to avoid startup overhead.
    """

    def __init__(self) -> None:
        self.model_name = settings.RERANKER_MODEL or "cross-encoder/ms-marco-MiniLM-L-6-v2"
        self._model: Optional[Any] = None
        self._attempted_load: bool = False
        self._is_available: bool = False
        logger.info(f"Reranker Service initialized (Model: {self.model_name} — Lazy Load).")

    def is_available(self) -> bool:
        """Check if cross-encoder model is loaded and available."""
        if not self._attempted_load:
            self._lazy_initialize()
        return self._is_available

    def _lazy_initialize(self) -> None:
        """Lazily load the cross-encoder model on first use."""
        if self._attempted_load:
            return

        self._attempted_load = True
        logger.info(f"Loading cross-encoder reranker model '{self.model_name}'...")

        try:
            from sentence_transformers import CrossEncoder
            self._model = CrossEncoder(self.model_name, max_length=512)
            self._is_available = True
            logger.info(f"Cross-encoder reranker '{self.model_name}' loaded successfully.")
        except Exception as exc:
            logger.warning(
                f"Cross-encoder reranker '{self.model_name}' failed to load: {exc}. "
                "Reranking will be skipped (using retrieval scores only)."
            )
            self._model = None
            self._is_available = False

    def rerank(self, query: str, chunks: List[Any], top_k: int = 4) -> List[Any]:
        """
        Re-score and re-rank retrieved chunks using cross-encoder relevance scoring.

        Parameters:
            query: The user's search query
            chunks: List of RetrievedChunk objects from hybrid retrieval
            top_k: Number of top-ranked chunks to return

        Returns:
            Top-K chunks sorted by cross-encoder relevance score (descending)
        """
        if not chunks:
            return []

        if not self.is_available():
            logger.info("Reranker unavailable, returning chunks with original retrieval scores.")
            return chunks[:top_k]

        try:
            # Create (query, passage) pairs for cross-encoder scoring
            pairs = []
            valid_chunks = []
            for chunk in chunks:
                text = getattr(chunk, "text", "")
                if text and text.strip():
                    pairs.append([query, text.strip()])
                    valid_chunks.append(chunk)

            if not pairs:
                return chunks[:top_k]

            # Score all pairs with cross-encoder
            scores = self._model.predict(pairs)

            # Normalize cross-encoder scores to 0-1 range using sigmoid-like mapping
            import numpy as np
            # Cross-encoder scores can be negative; apply min-max normalization
            min_score = float(np.min(scores))
            max_score = float(np.max(scores))
            score_range = max_score - min_score if max_score > min_score else 1.0

            for chunk, score in zip(valid_chunks, scores):
                # Normalize to 0-1 range
                normalized = (float(score) - min_score) / score_range
                chunk.score = round(max(0.0, min(1.0, normalized)), 4)

            # Sort by reranked score descending
            valid_chunks.sort(key=lambda x: -x.score)

            logger.info(
                f"Reranked {len(valid_chunks)} chunks: "
                f"top score={valid_chunks[0].score if valid_chunks else 0}, "
                f"bottom score={valid_chunks[-1].score if valid_chunks else 0}"
            )

            return valid_chunks[:top_k]

        except Exception as exc:
            logger.warning(f"Reranking failed: {exc}. Returning original retrieval scores.")
            return chunks[:top_k]


reranker_service = RerankerService()
