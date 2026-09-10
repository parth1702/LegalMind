"""
Dataset Evaluation Script for Legal Mind Vector Search & FAISS Indexing Pipeline.
Evaluates document chunking, 384d embedding generation, FAISS IndexFlatIP indexing,
separate JSON metadata storage, and similarity search queries on CUAD contracts.
"""
import sys
import os
import json
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.schemas.embeddings import DocumentIndexRequest, VectorSearchRequest
from app.services.vector_db_service import vector_db_service


async def evaluate_cuad_vector_search(cuad_path: str, max_contracts: int = 2):
    print("=" * 75)
    print(f"EVALUATING FAISS VECTOR SEARCH & PIPELINE ON CUAD DATASET: {cuad_path}")
    print("=" * 75)

    if not os.path.exists(cuad_path):
        print(f"Error: CUAD dataset not found at {cuad_path}")
        return

    with open(cuad_path, "r", encoding="utf-8") as f:
        cuad_data = json.load(f)

    contracts = cuad_data.get("data", [])[:max_contracts]

    user_id = "eval_lawyer_user"

    for idx, contract in enumerate(contracts, 1):
        doc_id = f"cuad_doc_{idx}"
        title = contract.get("title", f"Contract_{idx}")
        paragraphs = contract.get("paragraphs", [])
        if not paragraphs:
            continue

        full_text = "\n\n".join(p.get("context", "") for p in paragraphs[:5])
        print(f"\n--- Indexing Contract #{idx} ({doc_id}): {title[:65]}... ---")
        print(f"Full Text Length: {len(full_text)} characters")

        # 1. Pipeline: Text -> Chunking -> Embeddings -> FAISS -> Metadata
        idx_req = DocumentIndexRequest(
            doc_id=doc_id,
            user_id=user_id,
            raw_text=full_text,
            chunk_size=300,
            chunk_overlap=30,
        )
        idx_res = await vector_db_service.index_document(idx_req)

        print(f"[Pipeline Success] Indexed {idx_res.total_chunks} chunks into FAISS ({idx_res.dimensions}d)")
        print(f"  Isolated Index Saved Path: {idx_res.index_saved_path}")

        # 2. Similarity Search Queries
        test_queries = [
            "What are the confidentiality and non-disclosure obligations?",
            "What are the termination conditions and notice periods?",
            "What are the indemnification requirements and liabilities?",
        ]

        print("\n[Executing Vector Similarity Queries]")
        for q in test_queries:
            search_req = VectorSearchRequest(
                query=q,
                user_id=user_id,
                doc_id=doc_id,
                top_k=2,
            )
            search_res = await vector_db_service.search_vectors(search_req)

            print(f"\n  Query: \"{q}\"")
            print(f"  Matches Found: {search_res.total_results}")

            for match in search_res.results:
                text_snippet = match.text[:120].replace('\n', ' ')
                print(f"    -> [Score: {match.score}] VectorRef: {match.vector_ref} | Chunk: {match.chunk_id} | Page: {match.page}")
                print(f"       Snippet: \"{text_snippet}...\"")

        print("-" * 75)


async def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    cuad_path = os.path.join(root_dir, "data", "CUADv1.json")
    await evaluate_cuad_vector_search(cuad_path, max_contracts=2)


if __name__ == "__main__":
    asyncio.run(main())
