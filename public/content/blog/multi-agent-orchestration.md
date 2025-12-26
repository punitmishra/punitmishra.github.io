---
title: "Multi-Agent AI Systems: Patterns and Pitfalls"
date: "2024-12-05"
category: "AI/ML"
tags: ["LangGraph", "Agents", "LLM", "Architecture"]
readTime: "12 min read"
---

Multi-agent systems are transforming how we build AI applications. Instead of monolithic prompts, we're now orchestrating specialized agents that collaborate to solve complex problems. After building several production multi-agent systems, here's what I've learned about what works—and what doesn't.

## Why Multi-Agent?

Single LLM calls hit limits quickly:
- Context windows overflow
- Single prompts can't handle complex reasoning
- No specialization means mediocre results everywhere

Multi-agent systems solve this by decomposition:

```
Complex Task
    ├── Research Agent → gathers information
    ├── Analysis Agent → evaluates findings
    ├── Writing Agent → produces output
    └── Review Agent → validates quality
```

## Real Project: Enterprise Document Intelligence

I recently built a document processing system that handles contracts, invoices, and compliance documents. Here's how the multi-agent architecture works:

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List, Optional
from pydantic import BaseModel

class DocumentState(TypedDict):
    document_id: str
    raw_text: str
    document_type: Optional[str]
    extracted_entities: List[dict]
    compliance_flags: List[dict]
    summary: Optional[str]
    confidence_score: float

class DocumentIntelligenceGraph:
    def __init__(self, llm, embeddings, vector_store):
        self.llm = llm
        self.embeddings = embeddings
        self.vector_store = vector_store
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(DocumentState)

        # Add specialized agents as nodes
        workflow.add_node("classifier", self.classify_document)
        workflow.add_node("extractor", self.extract_entities)
        workflow.add_node("compliance_checker", self.check_compliance)
        workflow.add_node("summarizer", self.generate_summary)
        workflow.add_node("validator", self.validate_output)

        # Define the flow
        workflow.set_entry_point("classifier")
        workflow.add_edge("classifier", "extractor")
        workflow.add_edge("extractor", "compliance_checker")
        workflow.add_edge("compliance_checker", "summarizer")
        workflow.add_edge("summarizer", "validator")

        # Conditional routing based on validation
        workflow.add_conditional_edges(
            "validator",
            self._should_retry,
            {
                "retry": "extractor",  # Low confidence → retry extraction
                "complete": END
            }
        )

        return workflow.compile()
```

### Agent 1: Document Classifier

```python
async def classify_document(self, state: DocumentState) -> DocumentState:
    """Classify document type with high accuracy."""

    classification_prompt = """Analyze this document and classify it.

Document text (first 2000 chars):
{text}

Respond with JSON:
{{
    "document_type": "contract|invoice|compliance|memo|other",
    "confidence": 0.0-1.0,
    "key_indicators": ["list", "of", "indicators"]
}}"""

    response = await self.llm.generate(
        classification_prompt.format(text=state["raw_text"][:2000])
    )

    result = json.loads(response)

    return {
        **state,
        "document_type": result["document_type"],
        "confidence_score": result["confidence"]
    }
```

### Agent 2: Entity Extractor

This is where it gets interesting. Different document types need different extraction strategies:

```python
async def extract_entities(self, state: DocumentState) -> DocumentState:
    """Extract entities based on document type."""

    extraction_schemas = {
        "contract": ContractSchema,
        "invoice": InvoiceSchema,
        "compliance": ComplianceSchema,
    }

    schema = extraction_schemas.get(
        state["document_type"],
        GenericSchema
    )

    # Use structured output for reliable extraction
    extraction_prompt = f"""Extract information from this {state["document_type"]}.

Document:
{state["raw_text"]}

Extract according to this schema:
{schema.model_json_schema()}

Return valid JSON matching the schema exactly."""

    response = await self.llm.generate(
        extraction_prompt,
        response_format={"type": "json_object"}
    )

    entities = schema.model_validate_json(response)

    return {
        **state,
        "extracted_entities": entities.model_dump()
    }

# Pydantic schemas for structured extraction
class ContractSchema(BaseModel):
    parties: List[str]
    effective_date: Optional[str]
    termination_date: Optional[str]
    contract_value: Optional[str]
    key_obligations: List[str]
    governing_law: Optional[str]

class InvoiceSchema(BaseModel):
    vendor_name: str
    invoice_number: str
    invoice_date: str
    due_date: Optional[str]
    line_items: List[dict]
    total_amount: str
    payment_terms: Optional[str]
```

### Agent 3: Compliance Checker

```python
async def check_compliance(self, state: DocumentState) -> DocumentState:
    """Check document against compliance rules."""

    # Retrieve relevant compliance rules from vector store
    doc_embedding = await self.embeddings.embed(state["raw_text"][:1000])
    relevant_rules = await self.vector_store.similarity_search(
        doc_embedding,
        filter={"category": "compliance_rules"},
        k=10
    )

    compliance_prompt = f"""Review this document for compliance issues.

Document Type: {state["document_type"]}
Extracted Entities: {json.dumps(state["extracted_entities"], indent=2)}

Relevant Compliance Rules:
{self._format_rules(relevant_rules)}

Identify any compliance concerns. Return JSON:
{{
    "flags": [
        {{"rule_id": "...", "severity": "high|medium|low", "description": "..."}}
    ],
    "compliant": true/false,
    "recommendations": ["..."]
}}"""

    response = await self.llm.generate(compliance_prompt)
    result = json.loads(response)

    return {
        **state,
        "compliance_flags": result["flags"]
    }
```

## Parallel Agent Execution

Not everything needs to be sequential. For independent tasks, run agents in parallel:

```python
from langgraph.graph import StateGraph
import asyncio

class ParallelAnalysisGraph:
    def _build_graph(self):
        workflow = StateGraph(AnalysisState)

        # These agents can run in parallel
        workflow.add_node("sentiment_analyzer", self.analyze_sentiment)
        workflow.add_node("topic_extractor", self.extract_topics)
        workflow.add_node("entity_recognizer", self.recognize_entities)
        workflow.add_node("aggregator", self.aggregate_results)

        workflow.set_entry_point("parallel_start")

        # Fan-out to parallel agents
        workflow.add_node("parallel_start", self.parallel_dispatch)
        workflow.add_edge("parallel_start", "sentiment_analyzer")
        workflow.add_edge("parallel_start", "topic_extractor")
        workflow.add_edge("parallel_start", "entity_recognizer")

        # Fan-in to aggregator
        workflow.add_edge("sentiment_analyzer", "aggregator")
        workflow.add_edge("topic_extractor", "aggregator")
        workflow.add_edge("entity_recognizer", "aggregator")

        workflow.add_edge("aggregator", END)

        return workflow.compile()

    async def parallel_dispatch(self, state):
        """Dispatch to parallel agents."""
        # LangGraph handles the parallel execution automatically
        return state

    async def aggregate_results(self, state):
        """Combine results from parallel agents."""
        return {
            **state,
            "final_analysis": {
                "sentiment": state.get("sentiment"),
                "topics": state.get("topics"),
                "entities": state.get("entities"),
                "processed_at": datetime.utcnow().isoformat()
            }
        }
```

## Error Handling and Retries

Production systems need robust error handling:

```python
class ResilientAgentExecutor:
    def __init__(self, agent, max_retries=3, backoff_factor=2):
        self.agent = agent
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor

    async def execute(self, state: dict) -> dict:
        last_error = None

        for attempt in range(self.max_retries):
            try:
                result = await asyncio.wait_for(
                    self.agent(state),
                    timeout=30.0  # 30 second timeout
                )

                # Validate output
                if not self._validate_output(result):
                    raise InvalidOutputError("Agent produced invalid output")

                return result

            except asyncio.TimeoutError:
                last_error = TimeoutError(f"Agent timed out on attempt {attempt + 1}")
                await asyncio.sleep(self.backoff_factor ** attempt)

            except RateLimitError as e:
                last_error = e
                await asyncio.sleep(self.backoff_factor ** attempt * 5)

            except InvalidOutputError as e:
                last_error = e
                # Modify prompt for retry
                state = self._add_retry_context(state, str(e))

            except Exception as e:
                last_error = e
                logger.error(f"Agent failed: {e}")
                break

        # Return fallback or raise
        return self._fallback_response(state, last_error)

    def _add_retry_context(self, state, error_msg):
        """Add context about previous failure to help agent correct."""
        return {
            **state,
            "_retry_context": f"Previous attempt failed: {error_msg}. Please try again with more care."
        }
```

## Monitoring and Observability

You can't improve what you can't measure:

```python
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode
import time

tracer = trace.get_tracer(__name__)

class TracedAgent:
    def __init__(self, agent, name: str):
        self.agent = agent
        self.name = name

    async def __call__(self, state: dict) -> dict:
        with tracer.start_as_current_span(f"agent.{self.name}") as span:
            start_time = time.time()

            span.set_attribute("agent.name", self.name)
            span.set_attribute("input.keys", list(state.keys()))

            try:
                result = await self.agent(state)

                duration_ms = (time.time() - start_time) * 1000
                span.set_attribute("duration_ms", duration_ms)
                span.set_attribute("output.keys", list(result.keys()))
                span.set_status(Status(StatusCode.OK))

                # Log metrics
                metrics.histogram(
                    "agent.duration",
                    duration_ms,
                    tags={"agent": self.name}
                )

                return result

            except Exception as e:
                span.set_status(Status(StatusCode.ERROR, str(e)))
                span.record_exception(e)

                metrics.increment(
                    "agent.error",
                    tags={"agent": self.name, "error_type": type(e).__name__}
                )
                raise
```

## Common Pitfalls to Avoid

### 1. Over-Engineering Agent Hierarchies

```
# BAD: Too many layers
Orchestrator
  └── SubOrchestrator
        └── AgentGroup
              └── IndividualAgent

# GOOD: Flat and simple
Coordinator → [Agent1, Agent2, Agent3] → Aggregator
```

### 2. Ignoring Context Window Limits

```python
# BAD: Passing entire context everywhere
state["full_document"] = huge_document  # 50K tokens

# GOOD: Pass only what each agent needs
def prepare_context(state, agent_type):
    if agent_type == "classifier":
        return state["document"][:2000]  # First 2K chars
    elif agent_type == "summarizer":
        return state["extracted_entities"]  # Just the entities
```

### 3. No Fallbacks

```python
# BAD: Assuming agents always succeed
result = await agent.execute(state)  # What if this fails?

# GOOD: Always have fallbacks
try:
    result = await agent.execute(state)
except AgentError:
    result = await fallback_agent.execute(state)
except Exception:
    result = default_response(state)
```

## Cost Optimization

Multi-agent systems can get expensive. Strategies:

1. **Use smaller models for simple tasks** - Classification doesn't need GPT-4
2. **Cache common queries** - Same document type classification can be cached
3. **Batch where possible** - Process multiple items together
4. **Short-circuit** - Exit early when confidence is high

```python
async def smart_routing(state: DocumentState) -> str:
    """Route to appropriate pipeline based on complexity."""

    # Simple documents → fast path
    if state["confidence_score"] > 0.95 and state["document_type"] == "invoice":
        return "simple_extraction"  # Use regex/rules, no LLM

    # Complex documents → full agent pipeline
    return "full_pipeline"
```

## Key Takeaways

1. **Start simple** - One or two agents, add more only when needed
2. **Use structured outputs** - Pydantic schemas, not free text
3. **Handle failures explicitly** - Every agent can and will fail
4. **Monitor everything** - Trace flows, measure latency, track costs
5. **Parallelize independent work** - Don't serialize everything
6. **Optimize for cost** - Right-size models, cache, batch

Multi-agent systems are powerful but complex. Build incrementally, test thoroughly, and always have fallbacks.

## References

- [LangGraph Documentation](https://python.langchain.com/docs/langgraph) - Multi-agent orchestration
- [AutoGen](https://microsoft.github.io/autogen/) - Microsoft multi-agent framework
- [CrewAI](https://docs.crewai.com/) - Agent collaboration framework
- [LangSmith](https://docs.smith.langchain.com/) - LLM observability and tracing
- [OpenTelemetry](https://opentelemetry.io/) - Distributed tracing standards
- [Multi-Agent Systems Book](https://www.masfoundations.org/) - Academic foundations
