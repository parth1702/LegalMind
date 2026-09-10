"""
Dataset Evaluation Script for Legal Mind NER & Preprocessing Service.
Evaluates entity extraction against real legal contracts from CUADv1.json and edgar_all_4.csv datasets.
"""
import sys
import os
import json
import asyncio
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.schemas.ner import NERRequest
from app.schemas.preprocessing import PreprocessingRequest
from app.services.ner_service import ner_service
from app.services.preprocessing_service import preprocessing_service


async def evaluate_cuad_dataset(cuad_path: str, max_contracts: int = 5):
    print("=" * 70)
    print(f"EVALUATING NER & PREPROCESSING ON CUAD DATASET: {cuad_path}")
    print("=" * 70)

    if not os.path.exists(cuad_path):
        print(f"Error: Dataset file not found at {cuad_path}")
        return

    with open(cuad_path, "r", encoding="utf-8") as f:
        cuad_data = json.load(f)

    contracts = cuad_data.get("data", [])[:max_contracts]
    total_extracted_entities = 0
    entity_counts_by_type = {}

    for idx, contract in enumerate(contracts, 1):
        doc_title = contract.get("title", f"Contract_{idx}")
        paragraphs = contract.get("paragraphs", [])
        if not paragraphs:
            continue

        # Extract context text from first paragraph
        context_text = paragraphs[0].get("context", "")[:2000]
        print(f"\n--- Contract #{idx}: {doc_title[:60]}... ---")
        print(f"Text Length: {len(context_text)} characters")

        # 1. Preprocessing Test
        prep_req = PreprocessingRequest(raw_text=context_text, chunk_size=300, chunk_overlap=30)
        prep_res = await preprocessing_service.preprocess(prep_req)
        print(f"[Preprocessing] Sentences: {prep_res.total_sentences} | Paragraphs: {prep_res.total_paragraphs} | Chunks: {len(prep_res.chunks)}")

        # 2. Entity Extraction Test
        ner_req = NERRequest(text=context_text, use_huggingface=False, use_spacy=True, use_rules=True)
        ner_res = await ner_service.extract_entities(ner_req)

        print(f"[NER Results] Total Entities: {ner_res.total_entities}")
        print(f"Entity Summary: {ner_res.summary}")

        for ent in ner_res.entities[:8]:  # Display sample entities
            meta_str = f" ({ent.metadata})" if ent.metadata else ""
            print(f"  • [{ent.label}] '{ent.text}' (Conf: {ent.confidence:.2f}, Source: {ent.source}){meta_str}")

        total_extracted_entities += ner_res.total_entities
        for k, v in ner_res.summary.items():
            entity_counts_by_type[k] = entity_counts_by_type.get(k, 0) + v

    print("\n" + "=" * 70)
    print("CUAD DATASET EVALUATION SUMMARY")
    print("=" * 70)
    print(f"Total Contracts Processed: {len(contracts)}")
    print(f"Total Entities Extracted: {total_extracted_entities}")
    print(f"Entities Breakdown: {entity_counts_by_type}")


async def evaluate_edgar_dataset(edgar_path: str, max_lines: int = 500):
    print("\n" + "=" * 70)
    print(f"EVALUATING NER ON EDGAR LEGAL DATASET: {edgar_path}")
    print("=" * 70)

    if not os.path.exists(edgar_path):
        print(f"Error: Dataset file not found at {edgar_path}")
        return

    # Parse token lines into text sentences
    tokens = []
    with open(edgar_path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= max_lines:
                break
            parts = line.strip().split()
            if len(parts) >= 1 and parts[0] != "-DOCSTART-":
                tokens.append(parts[0])

    sample_text = " ".join(tokens)
    print(f"Extracted EDGAR text snippet ({len(sample_text)} chars):")
    print(sample_text[:300] + "...\n")

    ner_req = NERRequest(text=sample_text, use_huggingface=False, use_spacy=True, use_rules=True)
    ner_res = await ner_service.extract_entities(ner_req)

    print(f"[EDGAR NER Results] Total Entities: {ner_res.total_entities}")
    print(f"Entity Summary: {ner_res.summary}")

    for ent in ner_res.entities[:10]:
        print(f"  • [{ent.label}] '{ent.text}' (Conf: {ent.confidence:.2f}, Source: {ent.source})")


async def main():
    root_dir = Path(__file__).resolve().parent.parent.parent
    cuad_path = os.path.join(root_dir, "data", "CUADv1.json")
    edgar_path = os.path.join(root_dir, "edgar_all_4.csv")

    await evaluate_cuad_dataset(cuad_path, max_contracts=3)
    await evaluate_edgar_dataset(edgar_path, max_lines=400)


if __name__ == "__main__":
    asyncio.run(main())
