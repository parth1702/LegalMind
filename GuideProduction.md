# 🚀 LegalMind — Production Deployment Guide

> **Author perspective:** Senior DevOps Engineer  
> **Last updated:** October 2026  
> **Stack:** Vercel (Frontend) · Render (Backend + AI Service) · MongoDB Atlas · Docker

---

## 📐 Architecture Overview

Your instinct is **correct and solid**. Here is the recommended architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET / USERS                     │
└───────────────────┬─────────────────────────────────────┘
                    │ HTTPS
          ┌─────────▼──────────┐
          │   Vercel (CDN)     │  ← Already deployed ✅
          │  LegalMind-Frontend│  https://legal-mind-peach.vercel.app
          └─────────┬──────────┘
                    │ REST API calls
          ┌─────────▼──────────┐
          │  Render Web Service│  ← Deploy next (Step A)
          │  LegalMind-Backend │  Node.js / Express
          │     Port 5000      │  + MongoDB Atlas (already cloud)
          └─────────┬──────────┘
                    │ Internal HTTP (AI_SERVICE_URL)
          ┌─────────▼──────────┐
          │  Render Web Service│  ← Deploy first (Step B - do this before Backend)
          │  LegalMind-AI Svc  │  FastAPI / Python / ML Models
          │     Port 8000      │  + FAISS index + Gemini API
          └────────────────────┘
```

### Why this architecture is right ✅

| Decision | Reason |
|---|---|
| **Backend & AI Service separate** | AI Service is Python+ML (heavy), Backend is Node.js (light). Different runtimes, different resource needs. Easier to scale independently. |
| **Render for both** | Free/Starter tier works for students. Native Docker support. No infra management. |
| **Docker for both services** | Reproducible builds, avoids "works on my machine". Critical for ML dependencies like torch, spaCy, FAISS. |
| **MongoDB Atlas stays cloud** | You already have `MONGO_URI` pointing to Atlas — zero change needed. |
| **Frontend on Vercel** | Already deployed and optimal for React/Vite. |

---

## ⚠️ BEFORE YOU START — Security Cleanup (MANDATORY)

> **CRITICAL:** Your `.env` files contain real API keys and secrets. These must **NEVER** be committed to Git. Act on this first.

### Step 1 — Verify `.gitignore` coverage

Open `.gitignore` at the root and ensure these lines exist:

```gitignore
LegalMind-Backend/.env
LegalMind-AI_Service/.env
```

### Step 2 — Rotate all secrets immediately

These keys may already be in your git history. Rotate all of them before deploying:

| Secret | Where to Rotate |
|---|---|
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey → Delete old key → Create new |
| `GROQ_API_KEY` | https://console.groq.com → API Keys → Delete old → Create new |
| `JWT_SECRET` | Generate a new 64-char random string (use `openssl rand -hex 32`) |
| `MONGO_URI` password | MongoDB Atlas → Database Access → Edit user → Change password |

### Step 3 — Check git history for leaked secrets

```bash
# Check if .env was ever committed
git log --all --full-history -- "**/.env"

# If it shows commits, the secrets are in history.
# Use git-filter-repo to purge: https://github.com/newren/git-filter-repo
```

---

## 📦 Phase 1 — Dockerize the Backend (Node.js/Express)

Create these two files inside `LegalMind-Backend/`:

### 1.1 — `LegalMind-Backend/Dockerfile`

```dockerfile
# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ---- Stage 2: Production image ----
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Copy installed packages from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Create uploads directory (required by multer middleware)
RUN mkdir -p uploads

EXPOSE 5000

# Health check using your existing /api/health route
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health || exit 1

CMD ["node", "server.js"]
```

### 1.2 — `LegalMind-Backend/.dockerignore`

```
node_modules
.env
*.log
uploads/*
.git
README.md
```

### 1.3 — Test locally before pushing

```bash
# From the project root
docker build -t legalmind-backend ./LegalMind-Backend

docker run -p 5000:5000 \
  -e PORT=5000 \
  -e NODE_ENV=production \
  -e MONGO_URI="your_atlas_uri_here" \
  -e JWT_SECRET="your_new_secret_here" \
  -e CORS_ORIGIN="https://legal-mind-peach.vercel.app" \
  -e AI_SERVICE_URL="http://localhost:8000" \
  legalmind-backend

# Verify it's running
curl http://localhost:5000/api/health
curl http://localhost:5000/
```

---

## 🤖 Phase 2 — Dockerize the AI Service (FastAPI + ML)

> **Note:** The AI Service has heavy ML dependencies (PyTorch, Transformers, FAISS, EasyOCR, spaCy). The Docker image will be **3–5 GB**. This is normal and expected for ML workloads.

### 2.1 — `LegalMind-AI_Service/Dockerfile`

```dockerfile
# ---- Base: Python slim ----
FROM python:3.11-slim AS base

# System libraries required by ML packages (OpenCV, EasyOCR, etc.)
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

# ---- Install Python dependencies ----
FROM base AS deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Download spaCy language model (must be done explicitly after install)
RUN python -m spacy download en_core_web_sm

# Pre-download HuggingFace ML models into the image (avoids cold-start delay)
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"
RUN python -c "from sentence_transformers import CrossEncoder; CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')"

# ---- Production image ----
FROM deps AS production
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy application source
COPY . .

# Create directory for FAISS index (populated at runtime)
RUN mkdir -p data/faiss_index

EXPOSE 8000

# Longer start period — ML model loading takes time
HEALTHCHECK --interval=60s --timeout=30s --start-period=120s --retries=3 \
  CMD wget -qO- http://localhost:8000/api/v1/health || exit 1

# Single worker for free/starter tier. Increase for paid plans.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
```

### 2.2 — `LegalMind-AI_Service/.dockerignore`

```
venv
__pycache__
*.pyc
*.pyo
*.pyd
.env
.git
data/faiss_index
tests/
docs/
*.log
```

### 2.3 — Test locally before pushing

```bash
# Build (expect 10-20 minutes on first build — downloading ML models)
docker build -t legalmind-ai ./LegalMind-AI_Service

docker run -p 8000:8000 \
  -e DEBUG=False \
  -e GEMINI_API_KEY="your_new_key" \
  -e GEMINI_MODEL="gemini-2.5-flash" \
  -e GROQ_API_KEY="your_new_key" \
  -e BACKEND_CORS_ORIGINS='["http://localhost:5000"]' \
  legalmind-ai

# Verify — FastAPI interactive docs
open http://localhost:8000/docs
curl http://localhost:8000/api/v1/health
```

---

## ☁️ Phase 3 — Push to GitHub

Render deploys directly from your GitHub repository. Make sure everything is pushed.

```bash
# Confirm .env is NOT being tracked
git status    # Should NOT show any .env file

# Stage your new Dockerfiles
git add LegalMind-Backend/Dockerfile
git add LegalMind-Backend/.dockerignore
git add LegalMind-AI_Service/Dockerfile
git add LegalMind-AI_Service/.dockerignore
git add GuideProduction.md

git commit -m "chore: add Dockerfiles for production deployment"
git push -u origin feature/update-project
```

---

## ☁️ Phase 4 — Deploy on Render

> **Order matters:** Deploy AI Service FIRST to get its URL. Then deploy Backend using that URL.

### 4.1 — Deploy AI Service (do this FIRST)

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect GitHub → Select your **LegalMind** repository
4. Fill in configuration:

| Field | Value |
|---|---|
| **Name** | `legalmind-ai-service` |
| **Root Directory** | `LegalMind-AI_Service` |
| **Environment** | `Docker` |
| **Dockerfile Path** | `./Dockerfile` |
| **Instance Type** | `Starter` (1 GB RAM recommended for ML models) |
| **Region** | Oregon (US West) or closest to your users |
| **Auto-Deploy** | Yes (deploys on every `git push`) |

5. Scroll to **Environment Variables** and add:

```
PROJECT_NAME          = LegalMind AI Service
API_V1_STR            = /api/v1
HOST                  = 0.0.0.0
PORT                  = 8000
DEBUG                 = False
LOG_LEVEL             = INFO
EMBEDDING_MODEL_NAME  = all-MiniLM-L6-v2
SPACY_MODEL           = en_core_web_sm
FAISS_INDEX_PATH      = ./data/faiss_index
DEVICE                = cpu
GEMINI_API_KEY        = <your_rotated_gemini_key>
GEMINI_MODEL          = gemini-2.5-flash
GROQ_API_KEY          = <your_rotated_groq_key>
RERANKER_MODEL        = cross-encoder/ms-marco-MiniLM-L-6-v2
BACKEND_CORS_ORIGINS  = ["https://legalmind-backend.onrender.com","https://legal-mind-peach.vercel.app"]
```

6. Click **Create Web Service**
7. Monitor the build logs. First build takes **15–25 minutes** (ML deps + model downloads).
8. ✅ Once deployed, **copy your service URL** → e.g., `https://legalmind-ai-service.onrender.com`

---

### 4.2 — Deploy Backend (after AI Service is live)

1. Go to Render → **New** → **Web Service**
2. Connect same GitHub repo
3. Fill in configuration:

| Field | Value |
|---|---|
| **Name** | `legalmind-backend` |
| **Root Directory** | `LegalMind-Backend` |
| **Environment** | `Docker` |
| **Dockerfile Path** | `./Dockerfile` |
| **Instance Type** | `Free` or `Starter` |
| **Region** | Same as AI Service |
| **Auto-Deploy** | Yes |

4. Set **Environment Variables**:

```
PORT           = 5000
NODE_ENV       = production
MONGO_URI      = <your_mongodb_atlas_connection_string>
JWT_SECRET     = <your_new_strong_64char_secret>
JWT_EXPIRES_IN = 30d
CORS_ORIGIN    = https://legal-mind-peach.vercel.app
AI_SERVICE_URL = https://legalmind-ai-service.onrender.com
```

> `AI_SERVICE_URL` must be the exact URL you copied from Step 4.1.

5. Click **Create Web Service**
6. Build takes **2–5 minutes** for Node.js.
7. ✅ Copy your Backend URL → e.g., `https://legalmind-backend.onrender.com`

---

## 🔗 Phase 5 — Wire Frontend to Backend

Now update your already-deployed Vercel frontend to point to the live backend.

### 5.1 — Add Vercel Environment Variable

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard) → Your **LegalMind** project
2. Go to **Settings** → **Environment Variables**
3. Add the variable (check your frontend code for the exact name — search for `import.meta.env.VITE_`):

```
VITE_API_URL = https://legalmind-backend.onrender.com
```

> If your frontend uses a different variable name (e.g., `VITE_BACKEND_URL`), use that instead.

4. Go to **Deployments** tab → Click **...** on the latest deployment → **Redeploy**
5. Wait for Vercel to rebuild and redeploy (~1-2 minutes)

### 5.2 — Confirm CORS is correct on Backend

The Render Backend must have this exact env var (no trailing slash):
```
CORS_ORIGIN = https://legal-mind-peach.vercel.app
```

And the AI Service `BACKEND_CORS_ORIGINS` must include both services:
```
BACKEND_CORS_ORIGINS = ["https://legalmind-backend.onrender.com","https://legal-mind-peach.vercel.app"]
```

---

## ✅ Phase 6 — Verification Checklist

Run these checks after all deployments are live:

### Backend API Checks
```bash
# Root endpoint
curl https://legalmind-backend.onrender.com/
# Expected: { "message": "LegalMind AI Backend API Operating" }

# Health endpoint
curl https://legalmind-backend.onrender.com/api/health
# Expected: { "status": "ok", ... }
```

### AI Service Checks
```bash
# Health endpoint
curl https://legalmind-ai-service.onrender.com/api/v1/health
# Expected: { "status": "ok", ... }

# FastAPI auto-docs (useful during development/debugging)
# https://legalmind-ai-service.onrender.com/docs
```

### End-to-End Browser Tests
- [ ] Visit `https://legal-mind-peach.vercel.app`
- [ ] **Register** a new user → confirms Frontend → Backend → MongoDB Atlas
- [ ] **Login** → confirms JWT auth flow
- [ ] **Upload a legal document** → confirms Backend → AI Service (document processing)
- [ ] **Chat with the document** → confirms AI Service → Gemini API → response
- [ ] **No CORS errors** in browser DevTools (F12 → Console tab)

---

## 🔧 Render Gotchas & Solutions

### Free Tier Spin-Down
On Render's **free tier**, services **sleep after 15 min of inactivity** and take ~30s to cold-start.

- **For demos:** Use [UptimeRobot](https://uptimerobot.com/) (free) to ping your service every 10 minutes
- **For always-on:** Upgrade to **Starter ($7/month)**

### FAISS Index Does Not Persist Across Deploys
FAISS index lives in `./data/faiss_index` inside the container. Each new deploy creates a fresh container with an empty index.

- **Short-term (student project):** Re-index documents after each deploy
- **Long-term fix:** Migrate to [Pinecone](https://pinecone.io) (free tier) or use Render **Persistent Disks** (paid)

### File Uploads (multer) Do Not Persist
Files uploaded to `uploads/` are lost on redeploy.

- **Short-term:** OK for demo purposes
- **Long-term:** Use [Cloudinary](https://cloudinary.com) (free tier) or AWS S3 for file storage

### MongoDB Atlas — Allow Render IPs
By default, Atlas may block connections from Render's IPs.

1. Go to MongoDB Atlas → **Network Access** → **Add IP Address**
2. For simplicity (student project): Click **Allow Access from Anywhere** (`0.0.0.0/0`)
3. For production: Use Render's static outbound IPs (available on paid plans)

---

## 📊 Cost Estimate

| Service | Platform | Tier | Monthly Cost |
|---|---|---|---|
| LegalMind Frontend | Vercel | Hobby | $0 |
| LegalMind Backend | Render | Free | $0 |
| LegalMind AI Service | Render | Starter (1GB RAM) | ~$7 |
| MongoDB | Atlas | Free M0 | $0 |
| **Total** | | | **~$7/month** |

> The AI Service needs at least 512MB–1GB RAM to load ML models. Free tier (512MB) may work but Starter is recommended for stability.

---

## 🔐 Final Security Checklist

- [ ] `.env` files confirmed NOT in git history
- [ ] `GEMINI_API_KEY` rotated
- [ ] `GROQ_API_KEY` rotated
- [ ] `JWT_SECRET` replaced with strong 64-char random value
- [ ] `MongoDB` user password changed
- [ ] `DEBUG=False` on AI Service in Render
- [ ] `NODE_ENV=production` on Backend in Render
- [ ] `CORS_ORIGIN` set to exact Vercel URL (not `*`)
- [ ] All secrets set via Render's Environment Variables dashboard (never in Dockerfile)
- [ ] MongoDB Atlas Network Access configured

---

## 🗺️ Quick Reference — Deployment Order

```
STEP 1 → Rotate all secrets (Gemini, Groq, JWT, MongoDB password)
STEP 2 → Write Dockerfiles for Backend + AI Service (Phase 1 & 2 above)
STEP 3 → Test both Docker images locally
STEP 4 → Push Dockerfiles to GitHub
STEP 5 → Deploy AI Service on Render → get URL
STEP 6 → Deploy Backend on Render → set AI_SERVICE_URL to Step 5 URL → get URL
STEP 7 → Update VITE_API_URL on Vercel → Redeploy frontend
STEP 8 → Run verification checklist (Phase 6)
```

---

## 📚 Reference Links

| Resource | URL |
|---|---|
| Render Dashboard | https://dashboard.render.com |
| Render Docker Docs | https://render.com/docs/docker |
| MongoDB Atlas | https://cloud.mongodb.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Gemini API Keys | https://aistudio.google.com/apikey |
| Groq Console | https://console.groq.com |
| UptimeRobot (free ping) | https://uptimerobot.com |
| Pinecone (vector DB) | https://pinecone.io |
| git-filter-repo (secret purge) | https://github.com/newren/git-filter-repo |
