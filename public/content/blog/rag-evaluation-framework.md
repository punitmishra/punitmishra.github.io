---
title: "RAG Evaluation Framework: Measuring Quality Beyond BLEU"
date: "2026-02-08"
category: "AI/ML"
tags: ["RAG", "Evaluation", "LLM", "Retrieval", "Metrics"]
readTime: "11 min read"
featured: true
---

# RAG Evaluation Framework: Measuring Quality Beyond BLEU

If you are shipping retrieval-augmented generation (RAG), you need evaluation that matches production reality. Token-level metrics do not capture groundedness, citation quality, or retrieval quality. This is the framework I use to track quality and prevent silent regressions.

## 1. Separate Retrieval From Generation

Evaluate these independently:

- **Retrieval**: Are we fetching the right documents?
- **Generation**: Does the model answer correctly using the evidence?

When you mix them, you do not know what actually broke.

## 2. Retrieval Metrics That Matter

Use:

- **Precision@K**: How many of the top K are relevant?
- **Recall@K**: How often is the correct doc in the top K?
- **MRR**: Is the best result near the top?

Track these by query class. Long-tail queries behave differently.

```python
def precision_at_k(relevant_ids, retrieved_ids, k=5):
    top_k = retrieved_ids[:k]
    hits = sum(1 for doc_id in top_k if doc_id in relevant_ids)
    return hits / max(k, 1)

def recall_at_k(relevant_ids, retrieved_ids, k=5):
    top_k = retrieved_ids[:k]
    hits = sum(1 for doc_id in top_k if doc_id in relevant_ids)
    return hits / max(len(relevant_ids), 1)
```

## 3. Groundedness and Citation Quality

For each response:

- Is every claim supported by a cited document?
- Are citations pointing to the right source?
- Does the answer fabricate anything?

This is the single most important metric for enterprise use cases.

```python
def groundedness_score(answer, citations):
    # Simple heuristic: fraction of claims with a matching citation
    claims = extract_claims(answer)
    supported = 0
    for claim in claims:
        if any(is_supported(claim, c.text) for c in citations):
            supported += 1
    return supported / max(len(claims), 1)
```

## 4. Human Review Loop

Pick a small weekly sample and review it:

- Mark false positives
- Capture missing sources
- Log prompts that confuse the system

Even 20 samples per week creates a strong signal over time.

```python
def sample_for_review(dataset, n=20):
    high_risk = [x for x in dataset if x["category"] in ("Legal", "Security")]
    random_pick = random.sample(dataset, k=min(n - len(high_risk), len(dataset)))
    return high_risk + random_pick
```

## 5. Guardrails for Production

If groundedness drops, degrade gracefully:

- “I could not find evidence” responses
- Partial answers with clear citations
- Escalate to a human in high-risk cases

```python
def should_fallback(scores):
    return scores["groundedness"] < 0.7 or scores["retrieval_recall"] < 0.5
```

## Closing Thoughts

RAG quality is measurable if you split the pipeline and enforce groundedness. Build the evaluation harness early and it will save you from bad surprises in production.

