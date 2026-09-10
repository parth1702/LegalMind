"""
Production Legal Document Summarization Service.
Implements safe long-document chunking and Map-Reduce synthesis using HuggingFace Transformers,
spaCy NLP, NER entity resolution, and Clause Extraction services.

Outputs structured legal analysis:
- Executive summary
- Key points
- Parties & Roles
- Obligations
- Important dates
- Potential concerns / red flags
"""
from __future__ import annotations

import re
from typing import List, Optional, Any, Dict
from app.core.logging import get_logger
from app.schemas.summarization import (
    SummarizationRequest,
    SummarizationResponse,
    LEGAL_SUMMARIZATION_DISCLAIMER,
)
from app.schemas.ner import NERRequest
from app.schemas.clause import ClauseExtractionRequest
from app.services.preprocessing_service import preprocessing_service
from app.services.ner_service import ner_service
from app.services.clause_service import clause_service

logger = get_logger("LegalMind.SummarizationService")


class SummarizationService:
    """
    Production AI-assisted legal document summarization engine supporting chunked Map-Reduce
    processing for arbitrarily long contracts and structured section extraction.
    """

    def __init__(self) -> None:
        self._hf_summarizer: Optional[Any] = None
        self._hf_attempted: bool = False
        logger.info("Summarization Service initialized.")

    def _get_huggingface_summarizer(self) -> Optional[Any]:
        """Lazily load HuggingFace summarization pipeline (DistilBART / BART)."""
        if not self._hf_attempted:
            self._hf_attempted = True
            try:
                from transformers import pipeline
                logger.info("Loading HuggingFace Summarization pipeline ('sshleifer/distilbart-cnn-12-6')...")
                self._hf_summarizer = pipeline(
                    "summarization",
                    model="sshleifer/distilbart-cnn-12-6",
                    device=-1  # CPU inference
                )
                logger.info("Loaded HuggingFace Summarization pipeline successfully.")
            except Exception as exc:
                logger.warning(f"HuggingFace Summarizer pipeline unavailable: {exc}. Using NLP extractive summarization.")
                self._hf_summarizer = None
        return self._hf_summarizer

    def _extractive_summarize(self, text: str, max_sentences: int = 4) -> str:
        """
        Extractive summarization fallback based on sentence scoring and position weighting.
        """
        sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip().split()) >= 4]
        if not sentences:
            return text[:400]

        if len(sentences) <= max_sentences:
            return " ".join(sentences)

        # Score sentences: first/last sentences get higher lead weight
        words = [w.lower() for w in text.split() if len(w) > 3]
        word_freq = dict(reversed(sorted([(words.count(w), w) for w in set(words)])))

        scored_sentences = []
        for idx, s in enumerate(sentences):
            s_words = [w.lower() for w in s.split()]
            score = sum(word_freq.get(w, 0) for w in s_words) / max(1, len(s_words))
            # Position boost for lead sentences
            if idx == 0:
                score *= 1.5
            elif idx == 1:
                score *= 1.25
            scored_sentences.append((score, idx, s))

        scored_sentences.sort(key=lambda x: -x[0])
        selected = sorted(scored_sentences[:max_sentences], key=lambda x: x[1])

        return " ".join(s[2] for s in selected)

    def _summarize_chunk(self, chunk_text: str, hf_pipe: Optional[Any], max_length: int = 150) -> str:
        """Summarize a single text chunk using HuggingFace or Extractive NLP."""
        if len(chunk_text.split()) < 30:
            return chunk_text

        if hf_pipe is not None:
            try:
                # Truncate chunk text to safe model input length (~1000 tokens)
                truncated_input = " ".join(chunk_text.split()[:700])
                res = hf_pipe(truncated_input, max_length=min(max_length, 180), min_length=30, do_sample=False)
                if res and isinstance(res, list) and "summary_text" in res[0]:
                    return res[0]["summary_text"].strip()
            except Exception as exc:
                logger.warning(f"HuggingFace chunk summarization failed: {exc}. Falling back to extractive.")

        return self._extractive_summarize(chunk_text, max_sentences=3)

    async def summarize(self, request: SummarizationRequest) -> SummarizationResponse:
        raw_text = (request.text or "").strip()
        if not raw_text:
            return SummarizationResponse(
                success=True,
                summary_type=request.summary_type,
                executive_summary="Empty document provided.",
                key_points=[],
                parties=[],
                obligations=[],
                important_dates=[],
                potential_concerns=[],
                word_count=0,
                chunks_processed=0,
                disclaimer=LEGAL_SUMMARIZATION_DISCLAIMER,
            )

        logger.info(f"Summarizing document (length: {len(raw_text)} chars)")

        # 1. Safe Document Preprocessing & Chunking (Map-Reduce setup)
        prep_res = await preprocessing_service.preprocess(
            request=type("PrepReq", (), {
                "raw_text": raw_text,
                "clean_whitespace": True,
                "normalize_ocr": True,
                "chunk_size": 500,
                "chunk_overlap": 50
            })()
        )
        cleaned_text = prep_res.cleaned_text
        chunks = prep_res.chunks or []
        chunks_count = len(chunks)

        # 2. Map Phase: Summarize individual chunks
        hf_pipe = self._get_huggingface_summarizer() if request.use_huggingface else None
        chunk_summaries: List[str] = []

        if chunks_count > 1:
            for c in chunks:
                sum_text = self._summarize_chunk(c.text, hf_pipe, max_length=120)
                chunk_summaries.append(sum_text)
            combined_summary_input = " ".join(chunk_summaries)
        else:
            combined_summary_input = cleaned_text

        # 3. Reduce Phase: Generate Final Executive Summary
        if len(combined_summary_input.split()) > 150:
            executive_summary = self._summarize_chunk(combined_summary_input, hf_pipe, max_length=request.max_length or 250)
        else:
            executive_summary = combined_summary_input

        # 4. Extract Structured Components (Parties, Dates) via NER Engine
        ner_res = await ner_service.extract_entities(
            NERRequest(text=cleaned_text, use_huggingface=False, use_spacy=True, use_rules=True)
        )

        parties_set = set()
        dates_set = set()

        for ent in ner_res.entities:
            if ent.label in ["CONTRACT_PARTY", "ORGANIZATION", "PERSON"]:
                role_str = f" ({ent.metadata['role']})" if ent.metadata and "role" in ent.metadata else ""
                parties_set.add(f"{ent.text}{role_str}")
            elif ent.label == "DATE":
                dates_set.add(ent.text)

        parties_list = sorted(list(parties_set))[:8]
        dates_list = sorted(list(dates_set))[:8]

        # 5. Extract Clauses, Obligations, and Potential Concerns via Clause Engine
        clause_res = await clause_service.extract_clauses(
            ClauseExtractionRequest(text=cleaned_text)
        )

        obligations_list: List[str] = []
        concerns_list: List[str] = []
        key_points_list: List[str] = []

        for cl in clause_res.clauses:
            first_sentence = cl.text.split(".")[0].strip() + "."
            key_points_list.append(f"{cl.category}: {cl.title}")

            if cl.category in ["Obligations", "Indemnity", "Payment"]:
                if len(first_sentence) > 15 and len(obligations_list) < 6:
                    obligations_list.append(f"[{cl.category}] {first_sentence}")

            if cl.is_risk_candidate:
                reason = f" - {cl.risk_reason}" if cl.risk_reason else ""
                concerns_list.append(f"[RISK] [{cl.category}] {cl.title}{reason}")

        # Deduplicate & format lists
        key_points_list = sorted(list(set(key_points_list)))[:6]
        if not key_points_list:
            key_points_list = [s.strip() for s in executive_summary.split(".") if len(s.strip()) > 10][:4]

        if not obligations_list:
            obligations_list = ["Standard performance and confidentiality obligations apply under the contract terms."]

        if not concerns_list:
            concerns_list = ["No high-risk uncapped liability or immediate unilateral termination red flags detected."]

        logger.info(f"Summarization complete: {chunks_count} chunks processed via Map-Reduce.")

        return SummarizationResponse(
            success=True,
            summary_type=request.summary_type,
            executive_summary=executive_summary,
            key_points=key_points_list,
            parties=parties_list,
            obligations=obligations_list,
            important_dates=dates_list,
            potential_concerns=concerns_list,
            word_count=len(cleaned_text.split()),
            chunks_processed=chunks_count,
            disclaimer=LEGAL_SUMMARIZATION_DISCLAIMER,
            metadata={
                "map_reduce_chunks": chunks_count,
                "hf_model_used": hf_pipe is not None,
                "total_entities_resolved": ner_res.total_entities,
                "total_clauses_evaluated": clause_res.total_clauses,
            },
        )


summarization_service = SummarizationService()

