# 🚀 LegalMind — Run Instructions

## 📁 Project Structure

```
LegalMind/
├── LegalMind-Backend/       # Node.js + Express API   (Port 5000)
├── LegalMind-Frontend/      # React + Vite App         (Port 5173)
└── LegalMind-AI_Service/    # Python + FastAPI Service  (Port 8000)
```

> ⚠️ **You need 3 separate terminal windows** — one for each service.

---

## 1️⃣ Backend (Node.js / Express) — Port `5000`

### Step 1 — Navigate to the backend directory

```bash
cd LegalMind-Backend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Set up environment variables

Copy the example `.env` file and fill in your values:

```bash
copy .env.example .env
```

Edit `.env` with your actual credentials:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xmtaq3x.mongodb.net/legalmind?retryWrites=true&w=majority
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=30d
AI_SERVICE_URL=http://localhost:8000
```

### Step 4 — Run the backend server

**Development mode** (auto-restarts on file changes):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

### ✅ Verify

Open your browser or use curl:

```
http://localhost:5000/api/health
```

---

## 2️⃣ Frontend (React + Vite) — Port `5173`

### Step 1 — Navigate to the frontend directory

```bash
cd LegalMind-Frontend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Run the development server

```bash
npm run dev
```

### ✅ Verify

Open your browser:

```
http://localhost:5173
```

### Optional — Build for production

```bash
npm run build
npm run preview
```

---

## 3️⃣ AI Service (Python / FastAPI) — Port `8000`

### Step 1 — Navigate to the AI service directory

```bash
cd LegalMind-AI_Service
```

### Step 2 — Create a Python virtual environment

```bash
python -m venv venv
```

### Step 3 — Activate the virtual environment

**Windows (PowerShell):**

```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (CMD):**

```cmd
.\venv\Scripts\activate.bat
```

**macOS / Linux:**

```bash
source venv/bin/activate
```

### Step 4 — Install Python dependencies

```bash
pip install -r requirements.txt
```

### Step 5 — Download the spaCy language model

```bash
python -m spacy download en_core_web_sm
```

### Step 6 — Set up environment variables

Copy the example `.env` file and update if needed:

```bash
copy .env.example .env
```

Default `.env` values:

```env
PROJECT_NAME="LegalMind AI Service"
API_V1_STR="/api/v1"
HOST="0.0.0.0"
PORT=8000
DEBUG=True
LOG_LEVEL="INFO"
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:5000","http://localhost:5173"]
EMBEDDING_MODEL_NAME="all-MiniLM-L6-v2"
SPACY_MODEL="en_core_web_sm"
FAISS_INDEX_PATH="./data/faiss_index"
DEVICE="cpu"
```

### Step 7 — Run the AI service

```bash
python main.py
```

### ✅ Verify

Open your browser:

```
http://localhost:8000/docs
```

This will show the FastAPI Swagger UI with all available AI endpoints.

---


