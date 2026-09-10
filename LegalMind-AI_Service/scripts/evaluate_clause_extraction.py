"""
Dataset Evaluation Script for Legal Mind Clause Extraction Service.
Evaluates clause extraction, classification, and risk flagging on real contracts from CUADv1.json dataset.
"""
import sys
import os
import json
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.schemas.clause import ClauseExtractionRequest
from app.services.clause_service import clause_service


async def evaluate_cuad_clauses(cuad_path: str, max_contracts: int = 4):
    print("=" * 75)
    print(f"EVALUATING CLAUSE EXTRACTION ON CUAD DATASET: {cuad_path}")
    print("=" * 75)

    if not os.path.exists(cuad_path):
        print(f"Error: CUAD dataset not found at {cuad_path}")
        return

    with open(cuad_path, "r", encoding="utf-8") as f:
        cuad_data = json.load(f)

    contracts = cuad_data.get("data", [])[:max_contracts]
    total_extracted_clauses = 0
    total_risk_candidates = 0
    category_totals = {}

    for idx, contract in enumerate(contracts, 1):
        title = contract.get("title", f"Contract_{idx}")
        paragraphs = contract.get("paragraphs", [])
        if not paragraphs:
            continue

        context_text = paragraphs[0].get("context", "")[:4000]
        print(f"\n--- Contract #{idx}: {title[:65]}... ---")
        print(f"Text Length: {len(context_text)} characters")

        req = ClauseExtractionRequest(text=context_text)
        res = await clause_service.extract_clauses(req)

        print(f"[Results] Total Clauses Extracted: {res.total_clauses}")
        print(f"Category Summary: {res.summary}")

        risk_candidates = [c for c in res.clauses if c.is_risk_candidate]
        print(f"Risk Candidates Flagged: {len(risk_candidates)}")

        for clause in res.clauses[:6]:
            risk_flag = " [RISK CANDIDATE]" if clause.is_risk_candidate else ""
            print(f"\n  * [{clause.category}] '{clause.title}' (Para: {clause.location.paragraph}, Page: {clause.location.page}){risk_flag}")
            print(f"     Excerpt: \"{clause.text[:120]}...\"")
            if clause.is_risk_candidate and clause.risk_reason:
                print(f"     Risk Factor: {clause.risk_reason}")

        total_extracted_clauses += res.total_clauses
        total_risk_candidates += len(risk_candidates)
        for cat, cnt in res.summary.items():
            category_totals[cat] = category_totals.get(cat, 0) + cnt

    print("\n" + "=" * 75)
    print("CUAD CLAUSE EXTRACTION SUMMARY")
    print("=" * 75)
    print(f"Total Contracts Evaluated  : {len(contracts)}")
    print(f"Total Clauses Extracted    : {total_extracted_clauses}")
    print(f"Total Risk Candidates Found: {total_risk_candidates}")
    print(f"Category Breakdown         : {category_totals}")
    print("\n[Legal Disclaimer Verification]")
    print(f"  System Disclaimer Output: \"{res.disclaimer}\"")


async def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    cuad_path = os.path.join(root_dir, "data", "CUADv1.json")
    await evaluate_cuad_clauses(cuad_path, max_contracts=4)


if __name__ == "__main__":
    asyncio.run(main())
