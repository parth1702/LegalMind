"""
Dataset Evaluation Script for Legal Mind Risk Analysis Engine.
Evaluates transparent risk scoring, factor breakdown, missing protections, and evidence traceability on CUADv1 contracts.
"""
import sys
import os
import json
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.schemas.risk import RiskAnalysisRequest
from app.services.risk_service import risk_service


async def evaluate_cuad_risks(cuad_path: str, max_contracts: int = 4):
    print("=" * 75)
    print(f"EVALUATING RISK ANALYSIS ENGINE ON CUAD DATASET: {cuad_path}")
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

        context_text = "\n\n".join(p.get("context", "") for p in paragraphs[:4])
        print(f"\n--- Contract #{idx}: {title[:65]}... ---")
        print(f"Text Length: {len(context_text)} characters")

        req = RiskAnalysisRequest(text=context_text, jurisdiction="US")
        res = await risk_service.analyze_risk(req)

        print(f"[Risk Score] Overall Score: {res.overall_risk_score}/100 | Risk Category: {res.overall_risk_category}")
        print(f"Factor Breakdown: {res.factor_breakdown}")
        print(f"Missing Protections Identified: {len(res.missing_protections)}")

        for mp in res.missing_protections:
            print(f"  * [MISSING SAFEGUARD] {mp}")

        print(f"\n[Traceable Risk Evidence (Top 5 Flagged)]")
        for r in res.found_risks[:5]:
            evidence_snippet = r.supporting_clause[:100].replace('\n', ' ')
            print(f"\n  * [{r.risk_category.upper()}] [{r.factor}] {r.reason}")
            print(f"    Evidence: \"{evidence_snippet}...\" (Para: {r.location.paragraph}, Page: {r.location.page})")
            print(f"    Mitigation: {r.recommendation}")

        print("-" * 75)

    print("\n[Disclaimer Verification]")
    print(f"  System Output Disclaimer: \"{res.disclaimer}\"")


async def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    cuad_path = os.path.join(root_dir, "data", "CUADv1.json")
    await evaluate_cuad_risks(cuad_path, max_contracts=4)


if __name__ == "__main__":
    asyncio.run(main())
