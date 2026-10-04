# ---- Stage 1: Base — system-level dependencies ----
FROM python:3.11-slim AS base

# System libraries required by ML packages (OpenCV, EasyOCR, torch, etc.)
RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxrender1 \
    libxext6 \
    libgl1 \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Stage 2: Install Python dependencies ----
FROM base AS deps
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Download spaCy language model (must be done explicitly after install)
RUN python -m spacy download en_core_web_sm

# Pre-download HuggingFace ML models into the image (avoids cold-start delay on Render)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
RUN python -c "from sentence_transformers import CrossEncoder; CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')"

# ---- Stage 3: Production image ----
FROM deps AS production
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy application source code
COPY . .

# Create directory for FAISS index (populated at runtime when documents are indexed)
RUN mkdir -p data/faiss_index

EXPOSE 8000

# Longer start period — ML model loading takes time on first boot
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=3 \
  CMD wget -qO- http://localhost:8000/health || exit 1

# Single worker for free/starter tier. Increase --workers for paid plans.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
