"""
Dataset Evaluation Script for Legal Mind Document Summarization Service.
Evaluates safe long-document Map-Reduce summarization on full-length contracts from CUADv1.json.
"""
import sys
import os
import json
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.schemas.summarization import SummarizationRequest
from app.services.summarization_service import summarization_service


async def evaluate_cuad_summaries(cuad_path: str, max_contracts: int = 3):
    print("=" * 75)
    print(f"EVALUATING MAP-REDUCE SUMMARIZATION ON CUAD DATASET: {cuad_path}")
    print("=" * 75)

    if not os.path.exists(cuad_path):
        print(f"Error: CUAD dataset not found at {cuad_path}")
        return

    with open(cuad_path, "r", encoding="utf-8") as f:
        cuad_data = json.load(f)

    contracts = cuad_data.get("data", [])[:max_contracts]

    for idx, contract in enumerate(contracts, 1):
        title = contract.get("title", f"Contract_{idx}")
        paragraphs = contract.get("paragraphs", [])
        if not paragraphs:
            continue

        # Combine contract paragraphs for full document evaluation
        full_text = "\n\n".join(p.get("context", "") for p in paragraphs[:5])
        print(f"\n--- Contract #{idx}: {title[:65]}... ---")
        print(f"Full Document Length: {len(full_text)} characters | ~{len(full_text.split())} words")

        req = SummarizationRequest(text=full_text, use_huggingface=False)
        res = await summarization_service.summarize(req)

        print(f"[Map-Reduce Stats] Chunks Processed: {res.chunks_processed} | Total Words: {res.word_count}")
        print(f"\n[Executive Summary]\n{res.executive_summary[:300]}...")

        print("\n[Key Points]")
        for kp in res.key_points[:4]:
            print(f"  • {kp}")

        print("\n[Parties Identified]")
        for party in res.parties[:4]:
            print(f"  * Party: {party}")

        print("\n[Primary Obligations]")
        for obl in res.obligations[:3]:
            print(f"  * Obligation: {obl[:100]}...")

        print("\n[Important Dates]")
        for dt in res.important_dates[:4]:
            print(f"  * Date: {dt}")

        print("\n[Potential Concerns & Red Flags]")
        for con in res.potential_concerns[:3]:
            print(f"  {con}")

        print("-" * 75)

    print("\n[Disclaimer Verification]")
    print(f"  Output Disclaimer: \"{res.disclaimer}\"")


async def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    cuad_path = os.path.join(root_dir, "data", "CUADv1.json")
    await evaluate_cuad_summaries(cuad_path, max_contracts=3)


if __name__ == "__main__":
    asyncio.run(main())
