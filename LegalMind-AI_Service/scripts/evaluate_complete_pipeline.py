"""
Dataset Evaluation Script for Complete LegalMind Legal Document Analysis Pipeline.
Evaluates complete 9-stage workflow on CUAD contracts:
Text Extraction -> OCR -> Preprocessing -> NER -> Clause Extraction -> Summarization -> Risk Analysis -> Embeddings -> FAISS Indexing.
"""
import sys
import os
import json
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.schemas.analysis import PipelineAnalysisRequest
from app.services.pipeline_service import pipeline_service


async def evaluate_complete_cuad_pipeline(cuad_path: str, max_contracts: int = 2):
    print("=" * 75)
    print(f"EVALUATING COMPLETE 9-STAGE PIPELINE ON CUAD DATASET: {cuad_path}")
    print("=" * 75)

    if not os.path.exists(cuad_path):
        print(f"Error: CUAD dataset not found at {cuad_path}")
        return

    with open(cuad_path, "r", encoding="utf-8") as f:
        cuad_data = json.load(f)

    contracts = cuad_data.get("data", [])[:max_contracts]
    user_id = "eval_partner_counsel"

    for idx, contract in enumerate(contracts, 1):
        doc_id = f"pipeline_cuad_doc_{idx}"
        title = contract.get("title", f"Contract_{idx}")
        paragraphs = contract.get("paragraphs", [])
        if not paragraphs:
            continue

        full_text = "\n\n".join(p.get("context", "") for p in paragraphs[:5])
        print(f"\n--- Running Full Pipeline on Contract #{idx} ({doc_id}): {title[:60]}... ---")
        print(f"Input Document Size: {len(full_text)} characters | ~{len(full_text.split())} words")

        req = PipelineAnalysisRequest(
            user_id=user_id,
            doc_id=doc_id,
            raw_text=full_text,
            filename=f"{title[:25]}.pdf",
            jurisdiction="US",
        )

        res = await pipeline_service.execute_full_pipeline(req)

        print(f"\n[Pipeline Execution Status]: {res.status.upper()} (Success={res.success})")
        print(f"  Total Processing Time: {res.metrics.total_pipeline_ms}ms")
        print(f"  Stage Breakdown:")
        print(f"    - Extraction & OCR: {res.metrics.extraction_ms}ms")
        print(f"    - Preprocessing: {res.metrics.preprocessing_ms}ms")
        print(f"    - NER Entities: {res.metrics.ner_ms}ms (Found {res.total_entities_extracted} entities)")
        print(f"    - Clause Extraction: {res.metrics.clause_extraction_ms}ms (Extracted {res.total_clauses_extracted} clauses)")
        print(f"    - Summarization: {res.metrics.summarization_ms}ms")
        print(f"    - Risk Analysis: {res.metrics.risk_analysis_ms}ms (Score: {res.overall_risk_score}/100 [{res.overall_risk_category}])")
        print(f"    - FAISS Indexing: {res.metrics.faiss_indexing_ms}ms (Indexed {res.total_chunks_indexed} vectors)")

        print(f"\n[Executive Summary Snippet]")
        if res.summarization:
            print(f"  \"{res.summarization.executive_summary[:250]}...\"")

        print(f"\n[Identified Contract Risks (Top 3)]")
        if res.risk_analysis and res.risk_analysis.found_risks:
            for r in res.risk_analysis.found_risks[:3]:
                print(f"  * [{r.risk_category.upper()}] [{r.factor}] {r.reason}")

        print("-" * 75)

    print("\n[Disclaimer Verification]")
    print(f"  Enforced Legal Disclaimer: \"{res.disclaimer}\"")


async def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    cuad_path = os.path.join(root_dir, "data", "CUADv1.json")
    await evaluate_complete_cuad_pipeline(cuad_path, max_contracts=2)


if __name__ == "__main__":
    asyncio.run(main())
