from __future__ import annotations

import re
from typing import List, Optional, Any
from app.core.logging import get_logger
from app.schemas.preprocessing import PreprocessingRequest, PreprocessingResponse, TextChunk

logger = get_logger("LegalMind.PreprocessingService")


class PreprocessingService:
    """
    Production Legal Document Preprocessing service providing OCR artifact cleanup,
    text normalization, spaCy sentence boundary detection, and semantic chunking.
    """

    def __init__(self) -> None:
        self._nlp: Optional[Any] = None
        logger.info("Initializing Preprocessing Service...")

    def _get_nlp(self) -> Any:
        """Lazily load spaCy model for sentence segmentation."""
        if self._nlp is None:
            import spacy
            try:
                self._nlp = spacy.load("en_core_web_sm", disable=["ner", "tagger", "lemmatizer"])
                if "sentencizer" not in self._nlp.pipe_names:
                    self._nlp.add_pipe("sentencizer")
                logger.info("Loaded spaCy sentencizer pipeline.")
            except Exception as exc:
                logger.warning(f"Could not load spaCy model for preprocessing: {exc}. Using blank model.")
                self._nlp = spacy.blank("en")
                if "sentencizer" not in self._nlp.pipe_names:
                    self._nlp.add_pipe("sentencizer")
        return self._nlp

    def clean_text(self, text: str, normalize_ocr: bool = True) -> str:
        """Clean and normalize legal document text."""
        if not text:
            return ""

        # Normalize line breaks and carriage returns
        cleaned = re.sub(r'\r\n|\r', '\n', text)

        # Remove control characters except newlines and tabs
        cleaned = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', cleaned)

        # Normalize quotes and smart characters
        cleaned = cleaned.replace('“', '"').replace('”', '"').replace('’', "'").replace('‘', "'")
        cleaned = cleaned.replace('\xa0', ' ')

        if normalize_ocr:
            # Rejoin words broken across line wraps (e.g. "agree-\nment" -> "agreement")
            cleaned = re.sub(r'(\b[a-zA-Z]{2,})-\n\s*([a-zA-Z]{2,}\b)', r'\1\2', cleaned)
            # Remove line breaks within sentences (keep double newlines for paragraph breaks)
            cleaned = re.sub(r'(?<!\n)\n(?!\n)', ' ', cleaned)

        # Collapse excessive spaces and newlines
        cleaned = re.sub(r'[ \t]+', ' ', cleaned)
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)

        return cleaned.strip()

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[TextChunk]:
        """Split text into word-based chunks with character offsets."""
        if not text:
            return []

        words = text.split()
        if not words:
            return []

        chunks: List[TextChunk] = []
        chunk_id = 1

        # Calculate word start indices in cleaned text string
        word_spans = []
        curr_pos = 0
        for w in words:
            match = re.search(re.escape(w), text[curr_pos:])
            if match:
                start = curr_pos + match.start()
                end = curr_pos + match.end()
                word_spans.append((start, end))
                curr_pos = end
            else:
                word_spans.append((curr_pos, curr_pos + len(w)))
                curr_pos += len(w)

        start_word_idx = 0
        total_words = len(words)

        while start_word_idx < total_words:
            end_word_idx = min(start_word_idx + chunk_size, total_words)
            chunk_words = words[start_word_idx:end_word_idx]
            chunk_str = " ".join(chunk_words)

            start_char = word_spans[start_word_idx][0] if start_word_idx < len(word_spans) else 0
            end_char = word_spans[end_word_idx - 1][1] if end_word_idx - 1 < len(word_spans) else len(text)

            chunks.append(
                TextChunk(
                    chunk_id=chunk_id,
                    text=chunk_str,
                    word_count=len(chunk_words),
                    char_count=len(chunk_str),
                    start_char=start_char,
                    end_char=end_char,
                )
            )

            chunk_id += 1
            if end_word_idx >= total_words:
                break
            start_word_idx += max(1, chunk_size - overlap)

        return chunks

    async def preprocess(self, request: PreprocessingRequest) -> PreprocessingResponse:
        logger.info(f"Preprocessing text payload length: {len(request.raw_text)} chars")

        raw_text = request.raw_text or ""
        cleaned = self.clean_text(raw_text, normalize_ocr=request.normalize_ocr) if request.clean_whitespace else raw_text

        # Sentencize text using spaCy
        nlp = self._get_nlp()
        doc = nlp(cleaned)
        sentences = list(doc.sents) if hasattr(doc, "sents") else []
        total_sentences = len(sentences) if sentences else (len(re.split(r'[.!?]+', cleaned)) - 1 or 1)

        # Paragraph calculation
        paragraphs = [p for p in cleaned.split('\n\n') if p.strip()]
        total_paragraphs = len(paragraphs) or 1

        # Words calculation
        words = cleaned.split()
        total_words = len(words)

        # Generate chunks
        chunk_size = request.chunk_size or 500
        chunk_overlap = request.chunk_overlap or 50
        chunks = self.chunk_text(cleaned, chunk_size=chunk_size, overlap=chunk_overlap)

        return PreprocessingResponse(
            success=True,
            cleaned_text=cleaned,
            total_characters=len(cleaned),
            total_words=total_words,
            total_sentences=total_sentences,
            total_paragraphs=total_paragraphs,
            chunks=chunks,
            metadata={
                "ocr_normalized": request.normalize_ocr,
                "chunk_size": chunk_size,
                "chunk_overlap": chunk_overlap,
                "avg_words_per_sentence": round(total_words / max(1, total_sentences), 2),
            },
        )


preprocessing_service = PreprocessingService()

