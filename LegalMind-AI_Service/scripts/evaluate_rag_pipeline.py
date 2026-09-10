"""
Dataset Evaluation Script for Legal Mind RAG Pipeline.
Evaluates Question -> FAISS Retrieval -> Context Construction -> Grounded Answer Synthesis -> Source Reference Tracking on CUAD contracts.
"""
import sys
import os
import json
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.schemas.embeddings import DocumentIndexRequest
from app.schemas.rag import RAGQueryRequest
from app.services.vector_db_service import vector_db_service
from app.services.rag_service import rag_service


async def evaluate_cuad_rag_pipeline(cuad_path: str, max_contracts: int = 2):
    print("=" * 75)
    print(f"EVALUATING LEGAL RAG PIPELINE ON CUAD DATASET: {cuad_path}")
    print("=" * 75)

    if not os.path.exists(cuad_path):
        print(f"Error: CUAD dataset not found at {cuad_path}")
        return

    with open(cuad_path, "r", encoding="utf-8") as f:
        cuad_data = json.load(f)

    contracts = cuad_data.get("data", [])[:max_contracts]

    user_id = "eval_rag_lawyer"

    for idx, contract in enumerate(contracts, 1):
        doc_id = f"cuad_rag_doc_{idx}"
        title = contract.get("title", f"Contract_{idx}")
        paragraphs = contract.get("paragraphs", [])
        if not paragraphs:
            continue

        full_text = "\n\n".join(p.get("context", "") for p in paragraphs[:5])
        print(f"\n--- Indexing Contract #{idx} ({doc_id}): {title[:65]}... ---")

        # 1. Index Document into FAISS
        await vector_db_service.index_document(
            DocumentIndexRequest(doc_id=doc_id, user_id=user_id, raw_text=full_text, chunk_size=300)
        )

        # 2. Test Grounded Queries & Unsupported Questions
        queries = [
            "What are the confidentiality obligations and trade secret protections?",
            "Under what conditions can this contract be terminated for convenience?",
            "What are the governing law and jurisdiction venue provisions?",
            "What is the maximum penalty rate for intellectual property patent infringement?",  # May not be present
        ]

        print("\n[Executing Grounded RAG Queries]")
        for q in queries:
            res = await rag_service.answer_query(
                RAGQueryRequest(query=q, user_id=user_id, document_id=doc_id, top_k=3, min_score=0.25)
            )

            print(f"\n  Q: \"{q}\"")
            print(f"  Evidence Found: {res.evidence_found} | Confidence: {res.confidence_score}")
            print(f"  Answer: \"{res.answer}\"")

            if res.sources:
                print(f"  Source Citations ({len(res.sources)}):")
                for s in res.sources:
                    print(f"    * {s.source_id} (Doc: {s.doc_id}, Page: {s.page}, Chunk: {s.chunk_id}, Score: {s.score})")

        print("-" * 75)

    print("\n[Disclaimer Verification]")
    print(f"  RAG Output Disclaimer: \"{res.disclaimer}\"")


async def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    cuad_path = os.path.join(root_dir, "data", "CUADv1.json")
    await evaluate_cuad_rag_pipeline(cuad_path, max_contracts=2)


if __name__ == "__main__":
    asyncio.run(main())
