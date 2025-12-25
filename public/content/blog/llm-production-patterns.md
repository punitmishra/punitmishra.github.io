---
title: "LLM Production Patterns: Beyond the Demo"
date: "2024-12-22"
category: "AI/ML"
tags: ["LLM", "Production", "RAG", "Architecture"]
readTime: "14 min read"
---

The gap between an impressive LLM demo and a reliable production system is massive. After deploying multiple LLM-powered applications serving enterprise customers, here are the patterns that actually work in production.

## The Production Reality Check

Your demo works great with carefully crafted prompts. Then real users arrive:

- Prompts are vague, contradictory, or malformed
- Context windows overflow with irrelevant information
- Latency spikes cause user frustration
- Costs spiral out of control
- Outputs occasionally hallucinate critical information

Let's fix each of these.

## Pattern 1: Intelligent Prompt Routing

Not every query needs GPT-4. Route based on complexity:

```python
from typing import Literal
from pydantic import BaseModel

class QueryClassification(BaseModel):
    complexity: Literal["simple", "moderate", "complex"]
    domain: str
    requires_reasoning: bool
    estimated_tokens: int

class IntelligentRouter:
    def __init__(self):
        self.classifier = self._build_classifier()
        self.models = {
            "simple": "gpt-3.5-turbo",      # Fast, cheap
            "moderate": "gpt-4-turbo",       # Balanced
            "complex": "gpt-4",              # Best quality
        }

    async def route(self, query: str, context: dict) -> tuple[str, str]:
        """Route query to appropriate model."""

        # Quick classification using small model
        classification = await self.classify_query(query)

        # Override for specific patterns
        if self._requires_code_generation(query):
            return "gpt-4", "code_gen"

        if self._is_simple_lookup(query, context):
            return "gpt-3.5-turbo", "lookup"

        model = self.models[classification.complexity]
        return model, classification.domain

    async def classify_query(self, query: str) -> QueryClassification:
        """Fast query classification."""

        # Use regex/rules for obvious cases
        if len(query.split()) < 10 and "?" not in query:
            return QueryClassification(
                complexity="simple",
                domain="general",
                requires_reasoning=False,
                estimated_tokens=100
            )

        # Use small model for ambiguous cases
        return await self._ml_classify(query)

    def _requires_code_generation(self, query: str) -> bool:
        code_signals = ["write code", "implement", "function that", "script to"]
        return any(signal in query.lower() for signal in code_signals)
```

**Result**: 60% cost reduction with negligible quality impact.

## Pattern 2: Structured Output Enforcement

LLMs are unreliable at following output formats. Enforce structure:

```python
from pydantic import BaseModel, Field, validator
from typing import List, Optional
import json

class ExtractedEntity(BaseModel):
    name: str
    type: str
    confidence: float = Field(ge=0, le=1)
    source_span: Optional[tuple[int, int]] = None

    @validator('confidence')
    def round_confidence(cls, v):
        return round(v, 3)

class ExtractionResult(BaseModel):
    entities: List[ExtractedEntity]
    summary: str = Field(max_length=500)
    processing_notes: Optional[str] = None

class StructuredExtractor:
    def __init__(self, llm_client, max_retries: int = 3):
        self.llm = llm_client
        self.max_retries = max_retries

    async def extract(self, text: str) -> ExtractionResult:
        """Extract with guaranteed valid output."""

        schema = ExtractionResult.model_json_schema()

        prompt = f"""Extract entities from the following text.

Text:
{text}

You MUST respond with valid JSON matching this schema:
{json.dumps(schema, indent=2)}

Important:
- All confidence scores must be between 0 and 1
- Summary must be under 500 characters
- Include source_span as [start, end] character positions
"""

        for attempt in range(self.max_retries):
            try:
                response = await self.llm.generate(
                    prompt,
                    response_format={"type": "json_object"}
                )

                # Validate against schema
                result = ExtractionResult.model_validate_json(response)
                return result

            except ValidationError as e:
                if attempt < self.max_retries - 1:
                    # Add error feedback for retry
                    prompt += f"\n\nPrevious attempt failed validation: {e}"
                else:
                    # Return safe default
                    return ExtractionResult(
                        entities=[],
                        summary="Extraction failed after retries",
                        processing_notes=str(e)
                    )
```

## Pattern 3: Context Window Management

Running out of context window is the #1 production issue:

```python
import tiktoken
from dataclasses import dataclass
from typing import List

@dataclass
class ContextSegment:
    content: str
    priority: int  # Higher = more important
    tokens: int
    segment_type: str

class ContextWindowManager:
    def __init__(self, model: str, max_context: int = None):
        self.encoder = tiktoken.encoding_for_model(model)
        self.max_context = max_context or self._get_model_limit(model)
        self.reserved_for_output = 1000  # Reserve tokens for response

    def _get_model_limit(self, model: str) -> int:
        limits = {
            "gpt-4": 8192,
            "gpt-4-turbo": 128000,
            "gpt-3.5-turbo": 16384,
            "claude-3-opus": 200000,
        }
        return limits.get(model, 4096)

    def build_context(
        self,
        system_prompt: str,
        user_query: str,
        documents: List[dict],
        conversation_history: List[dict]
    ) -> str:
        """Build optimal context within token limits."""

        available_tokens = self.max_context - self.reserved_for_output

        # Fixed segments (must include)
        segments = [
            ContextSegment(
                content=system_prompt,
                priority=100,
                tokens=self._count_tokens(system_prompt),
                segment_type="system"
            ),
            ContextSegment(
                content=user_query,
                priority=100,
                tokens=self._count_tokens(user_query),
                segment_type="query"
            ),
        ]

        # Add documents by relevance score
        for doc in sorted(documents, key=lambda d: d["score"], reverse=True):
            segments.append(ContextSegment(
                content=doc["content"],
                priority=int(doc["score"] * 50),
                tokens=self._count_tokens(doc["content"]),
                segment_type="document"
            ))

        # Add recent conversation (older = lower priority)
        for i, msg in enumerate(reversed(conversation_history[-10:])):
            segments.append(ContextSegment(
                content=f"{msg['role']}: {msg['content']}",
                priority=30 - i,
                tokens=self._count_tokens(msg["content"]),
                segment_type="history"
            ))

        # Greedy selection by priority
        return self._select_segments(segments, available_tokens)

    def _select_segments(
        self,
        segments: List[ContextSegment],
        budget: int
    ) -> str:
        """Select segments that fit within token budget."""

        # Sort by priority (highest first)
        sorted_segments = sorted(segments, key=lambda s: s.priority, reverse=True)

        selected = []
        used_tokens = 0

        for segment in sorted_segments:
            if used_tokens + segment.tokens <= budget:
                selected.append(segment)
                used_tokens += segment.tokens

        # Reconstruct in logical order
        order = {"system": 0, "history": 1, "document": 2, "query": 3}
        selected.sort(key=lambda s: order.get(s.segment_type, 99))

        return "\n\n".join(s.content for s in selected)

    def _count_tokens(self, text: str) -> int:
        return len(self.encoder.encode(text))
```

## Pattern 4: Streaming with Interruption

Users hate waiting. Stream responses and allow interruption:

```python
import asyncio
from typing import AsyncGenerator, Callable

class StreamingLLMClient:
    def __init__(self, llm_client):
        self.llm = llm_client

    async def stream_with_interruption(
        self,
        prompt: str,
        on_chunk: Callable[[str], None],
        should_stop: Callable[[], bool],
        timeout: float = 30.0
    ) -> tuple[str, bool]:
        """Stream response with interruption support."""

        full_response = ""
        interrupted = False

        try:
            async with asyncio.timeout(timeout):
                async for chunk in self.llm.stream(prompt):
                    # Check for interruption
                    if should_stop():
                        interrupted = True
                        break

                    full_response += chunk
                    on_chunk(chunk)

                    # Yield control to allow interruption checks
                    await asyncio.sleep(0)

        except asyncio.TimeoutError:
            full_response += "\n[Response truncated due to timeout]"
            interrupted = True

        return full_response, interrupted

    async def stream_with_validation(
        self,
        prompt: str,
        validator: Callable[[str], bool],
        max_tokens: int = 2000
    ) -> AsyncGenerator[str, None]:
        """Stream with real-time validation."""

        buffer = ""
        token_count = 0

        async for chunk in self.llm.stream(prompt):
            buffer += chunk
            token_count += len(chunk.split())  # Approximate

            # Validate accumulated response
            if not validator(buffer):
                yield "\n[Response halted: validation failed]"
                break

            if token_count > max_tokens:
                yield "\n[Response truncated: max tokens reached]"
                break

            yield chunk
```

## Pattern 5: Hallucination Detection

Catch hallucinations before they reach users:

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class FactCheck:
    claim: str
    supported: bool
    evidence: Optional[str]
    confidence: float

class HallucinationDetector:
    def __init__(self, llm, embedding_model, vector_store):
        self.llm = llm
        self.embeddings = embedding_model
        self.vector_store = vector_store

    async def check_response(
        self,
        response: str,
        source_documents: List[str],
        query: str
    ) -> tuple[float, List[FactCheck]]:
        """Check response for hallucinations."""

        # Extract claims from response
        claims = await self._extract_claims(response)

        fact_checks = []
        for claim in claims:
            check = await self._verify_claim(claim, source_documents)
            fact_checks.append(check)

        # Calculate overall score
        if not fact_checks:
            return 1.0, []

        supported_count = sum(1 for fc in fact_checks if fc.supported)
        confidence_avg = sum(fc.confidence for fc in fact_checks) / len(fact_checks)

        hallucination_score = 1 - (supported_count / len(fact_checks))

        return hallucination_score, fact_checks

    async def _extract_claims(self, response: str) -> List[str]:
        """Extract factual claims from response."""

        extraction_prompt = f"""Extract all factual claims from this text.
Return as JSON array of strings.

Text: {response}

Claims:"""

        result = await self.llm.generate(
            extraction_prompt,
            response_format={"type": "json_object"}
        )

        return json.loads(result).get("claims", [])

    async def _verify_claim(
        self,
        claim: str,
        sources: List[str]
    ) -> FactCheck:
        """Verify a single claim against sources."""

        # Embed claim and search sources
        claim_embedding = await self.embeddings.embed(claim)

        # Search for supporting evidence
        matches = await self.vector_store.similarity_search(
            claim_embedding,
            k=3
        )

        if not matches or matches[0]["score"] < 0.7:
            return FactCheck(
                claim=claim,
                supported=False,
                evidence=None,
                confidence=0.3
            )

        # Verify with LLM
        verification_prompt = f"""Does this evidence support the claim?

Claim: {claim}

Evidence: {matches[0]['content']}

Answer with JSON: {{"supported": true/false, "confidence": 0-1}}"""

        result = await self.llm.generate(verification_prompt)
        data = json.loads(result)

        return FactCheck(
            claim=claim,
            supported=data["supported"],
            evidence=matches[0]["content"],
            confidence=data["confidence"]
        )
```

## Pattern 6: Cost Control

LLM costs can explode. Implement controls:

```python
from datetime import datetime, timedelta
from collections import defaultdict
import asyncio

class CostController:
    def __init__(
        self,
        daily_budget: float = 100.0,
        per_request_limit: float = 1.0
    ):
        self.daily_budget = daily_budget
        self.per_request_limit = per_request_limit
        self.costs = defaultdict(float)
        self.lock = asyncio.Lock()

    # Model costs per 1K tokens (input/output)
    MODEL_COSTS = {
        "gpt-4": (0.03, 0.06),
        "gpt-4-turbo": (0.01, 0.03),
        "gpt-3.5-turbo": (0.0005, 0.0015),
        "claude-3-opus": (0.015, 0.075),
    }

    async def check_budget(self, model: str, estimated_tokens: int) -> bool:
        """Check if request is within budget."""

        today = datetime.now().strftime("%Y-%m-%d")
        estimated_cost = self._estimate_cost(model, estimated_tokens)

        async with self.lock:
            current_spend = self.costs[today]

            if current_spend + estimated_cost > self.daily_budget:
                return False

            if estimated_cost > self.per_request_limit:
                return False

            return True

    async def record_usage(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int
    ):
        """Record actual usage."""

        today = datetime.now().strftime("%Y-%m-%d")
        cost = self._calculate_cost(model, input_tokens, output_tokens)

        async with self.lock:
            self.costs[today] += cost

    def _estimate_cost(self, model: str, tokens: int) -> float:
        input_cost, output_cost = self.MODEL_COSTS.get(model, (0.01, 0.03))
        # Assume 70% input, 30% output for estimation
        return (tokens * 0.7 * input_cost + tokens * 0.3 * output_cost) / 1000

    def _calculate_cost(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        input_cost, output_cost = self.MODEL_COSTS.get(model, (0.01, 0.03))
        return (input_tokens * input_cost + output_tokens * output_cost) / 1000
```

## Key Takeaways

1. **Route intelligently** - Not every query needs your best model
2. **Enforce structure** - LLMs are unreliable at following formats without enforcement
3. **Manage context** - Context overflow is the #1 production issue
4. **Stream everything** - Users hate waiting
5. **Detect hallucinations** - Critical for enterprise deployments
6. **Control costs** - Set budgets before costs spiral

Production LLM systems require engineering discipline. The patterns above have saved me countless hours of debugging and prevented multiple production incidents. Start with these, then iterate based on your specific failure modes.
