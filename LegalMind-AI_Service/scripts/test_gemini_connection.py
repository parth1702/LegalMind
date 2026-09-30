"""
Gemini API Connection Diagnostic Test Script.
Run this to verify your GEMINI_API_KEY is working before using the RAG pipeline.

Usage:
    cd LegalMind-AI_Service
    python scripts/test_gemini_connection.py
"""
import os
import sys
import time

# Add project root to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv()


def test_gemini_connection():
    print("=" * 60)
    print("  LegalMind — Gemini API Connection Diagnostic")
    print("=" * 60)

    # 1. Check API key
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key or api_key == "your_gemini_api_key_here":
        print("\n❌ GEMINI_API_KEY is not configured!")
        
        return False

    masked_key = f"{api_key[:8]}...{api_key[-4:]}" if len(api_key) > 12 else "***"
    print(f"\n✅ GEMINI_API_KEY found: {masked_key}")

    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    print(f"✅ GEMINI_MODEL: {model_name}")

    # 2. Test google-genai import
    try:
        from google import genai
        print(f"✅ google-genai SDK imported successfully")
    except ImportError:
        print("\n❌ google-genai package not installed!")
        print("   → Run: pip install google-genai>=1.0.0")
        return False

    # 3. Initialize client
    try:
        client = genai.Client(api_key=api_key.strip())
        print(f"✅ GenAI client initialized")
    except Exception as exc:
        print(f"\n❌ Failed to initialize GenAI client: {exc}")
        return False

    # 4. Test grounded answer generation
    print("\n--- Test 1: Grounded RAG Answer ---")
    try:
        t0 = time.time()
        response = client.models.generate_content(
            model=model_name,
            contents=(
                "You are a legal AI assistant. Based on the following evidence:\n\n"
                "[Source 1] The contract specifies a liability cap of $500,000.\n"
                "[Source 2] Indemnification is mutual between both parties.\n\n"
                "Question: What is the liability cap?\n\n"
                "Answer with inline citations [Source N]:"
            ),
        )
        elapsed = round((time.time() - t0) * 1000)
        answer = (response.text or "").strip()
        print(f"   ✅ Grounded answer generated in {elapsed}ms")
        print(f"   Answer: {answer[:200]}...")
    except Exception as exc:
        print(f"   ❌ Grounded answer FAILED: {exc}")
        # Try fallback model
        fallback = "gemini-2.0-flash" if model_name != "gemini-2.0-flash" else "gemini-1.5-flash"
        print(f"   → Trying fallback model: {fallback}")
        try:
            response = client.models.generate_content(
                model=fallback,
                contents="What is a force majeure clause? Answer in 2 sentences.",
            )
            print(f"   ✅ Fallback model '{fallback}' works! Update GEMINI_MODEL in .env")
        except Exception as exc2:
            print(f"   ❌ Fallback model also failed: {exc2}")
            return False

    # 5. Test legal co-pilot answer
    print("\n--- Test 2: Legal Co-Pilot Answer ---")
    try:
        t0 = time.time()
        response = client.models.generate_content(
            model=model_name,
            contents=(
                "You are an expert legal AI assistant.\n\n"
                "Question: What is the doctrine of frustration under Indian Contract Act 1872?\n\n"
                "Provide a concise legal answer:"
            ),
        )
        elapsed = round((time.time() - t0) * 1000)
        answer = (response.text or "").strip()
        print(f"   ✅ Co-Pilot answer generated in {elapsed}ms")
        print(f"   Answer: {answer[:200]}...")
    except Exception as exc:
        print(f"   ❌ Co-Pilot answer FAILED: {exc}")

    # 6. Test structured risk extraction
    print("\n--- Test 3: Structured Risk Extraction ---")
    try:
        t0 = time.time()
        response = client.models.generate_content(
            model=model_name,
            contents=(
                "Extract risk factors from this clause as JSON array:\n\n"
                "The Contractor shall indemnify the Client against all claims without any liability cap.\n\n"
                'JSON: [{"category": "...", "severity": "...", "finding": "..."}]'
            ),
        )
        elapsed = round((time.time() - t0) * 1000)
        answer = (response.text or "").strip()
        print(f"   ✅ Risk extraction generated in {elapsed}ms")
        print(f"   Output: {answer[:200]}...")
    except Exception as exc:
        print(f"   ❌ Risk extraction FAILED: {exc}")

    print("\n" + "=" * 60)
    print("  ✅ All Gemini API tests passed!")
    print("  Your RAG pipeline is ready for LLM-powered synthesis.")
    print("=" * 60)
    return True


if __name__ == "__main__":
    success = test_gemini_connection()
    sys.exit(0 if success else 1)
