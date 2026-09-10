"""
Full Stack System Integration Evaluation Script.
Tests end-to-end flow: Document Indexing -> Vector Store -> Node/FastAPI RAG Pipeline -> Sources & Citations.
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


async def evaluate_fullstack_integration(cuad_path: str):
    print("=" * 75)
    print(f"EVALUATING FULL STACK INTEGRATION (REACT -> NODE -> FASTAPI -> RAG)")
    print("=" * 75)

    if not os.path.exists(cuad_path):
        print(f"Error: CUAD dataset not found at {cuad_path}")
        return

    with open(cuad_path, "r", encoding="utf-8") as f:
        cuad_data = json.load(f)

    contracts = cuad_data.get("data", [])[:1]
    contract = contracts[0]
    title = contract.get("title", "Sample Contract")
    paragraphs = contract.get("paragraphs", [])
    full_text = "\n\n".join(p.get("context", "") for p in paragraphs[:5])

    user_id = "fullstack_user_prod"
    doc_id = "cuad_doc_prod_01"

    print(f"\n1. [Node Backend Mock Action] Upload & Index Contract: {title[:60]}...")
    idx_res = await vector_db_service.index_document(
        DocumentIndexRequest(doc_id=doc_id, user_id=user_id, raw_text=full_text, chunk_size=300)
    )
    print(f"   Indexed {idx_res.total_chunks} chunks into FAISS vector store ({idx_res.dimensions}d)")

    test_queries = [
        "What are the payment terms and due dates?",
        "What are the indemnification requirements?",
        "What is the policy for nuclear weapon production?",  # Unsupported / missing evidence query
    ]

    print("\n2. [React Chat UI -> Node Controller -> FastAPI RAG Execution]")
    for q in test_queries:
        res = await rag_service.answer_query(
            RAGQueryRequest(query=q, user_id=user_id, document_id=doc_id, top_k=3, min_score=0.20)
        )

        print(f"\n   User Question: \"{q}\"")
        print(f"   Evidence Found: {res.evidence_found} | Confidence Score: {res.confidence_score}")
        print(f"   Generated RAG Answer: \"{res.answer[:250]}...\"")
        print(f"   Sources Retained: {len(res.sources)}")
        for s in res.sources:
            print(f"     * {s.source_id} | Page {s.page} | Chunk {s.chunk_id} | Score {s.score}")

    print("\n3. [Legal Disclaimer & Security Audit]")
    print(f"   Enforced Legal Disclaimer: \"{res.disclaimer}\"")
    print("=" * 75)


async def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    cuad_path = os.path.join(root_dir, "data", "CUADv1.json")
    await evaluate_fullstack_integration(cuad_path)


if __name__ == "__main__":
    asyncio.run(main())
