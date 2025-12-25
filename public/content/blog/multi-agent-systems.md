---
title: "Building Secure Multi-Agent Systems with LangGraph"
date: "2025-01-10"
author: "Punit Mishra"
category: "AI/ML"
tags: ["AI", "LangGraph", "Multi-Agent", "Security", "Python"]
readTime: "15 min"
featured: true
---

# Building Secure Multi-Agent Systems with LangGraph

> A deep dive into architecting secure, scalable multi-agent systems using LangGraph and modern AI infrastructure patterns.

## Introduction

After two years of building LLM-powered applications at enterprise scale, I've learned that the real challenge isn't getting AI to work—it's getting it to work *securely* at *scale*. Multi-agent systems amplify both the capabilities and the risks of AI. In this article, I'll share the patterns and practices that have proven effective in production environments.

## The Evolution of AI Architectures

When we first started integrating LLMs into our enterprise applications, the architecture was straightforward: a single model, a single prompt, a single response. But real-world problems rarely fit into a single-turn interaction.

```
Simple LLM Call:
User → Prompt → LLM → Response → User

Multi-Agent System:
User → Orchestrator → [Agent A, Agent B, Agent C] → Synthesizer → User
                           ↓         ↓         ↓
                        Memory    Tools    External APIs
```

The shift to multi-agent systems happened when we realized that complex tasks benefit from specialized agents working together, much like a team of experts.

## Core Architecture Patterns

### 1. The Orchestrator Pattern

The orchestrator pattern is the foundation of our multi-agent systems. A central orchestrator manages the workflow, delegating tasks to specialized agents.

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, List
import operator

class AgentState(TypedDict):
    messages: Annotated[List[str], operator.add]
    current_agent: str
    task_complete: bool
    security_context: dict

def create_orchestrator():
    workflow = StateGraph(AgentState)

    # Define specialized agents
    workflow.add_node("researcher", research_agent)
    workflow.add_node("analyzer", analysis_agent)
    workflow.add_node("synthesizer", synthesis_agent)
    workflow.add_node("validator", security_validator)

    # Define the orchestration logic
    workflow.add_conditional_edges(
        "researcher",
        should_continue,
        {
            "analyze": "analyzer",
            "validate": "validator",
            "end": END
        }
    )

    workflow.add_edge("analyzer", "synthesizer")
    workflow.add_edge("synthesizer", "validator")
    workflow.add_edge("validator", END)

    workflow.set_entry_point("researcher")

    return workflow.compile()
```

### 2. Security-First Design

Every agent interaction must be validated. We implement a security layer that:

- **Validates inputs** before they reach agents
- **Sanitizes outputs** before they're returned to users
- **Monitors for anomalies** in agent behavior
- **Enforces rate limits** and access controls

```python
class SecurityValidator:
    def __init__(self, config: SecurityConfig):
        self.config = config
        self.anomaly_detector = AnomalyDetector()
        self.rate_limiter = RateLimiter(
            requests_per_minute=config.rpm_limit
        )

    async def validate_input(self, input_data: dict) -> ValidationResult:
        """Validate and sanitize input before agent processing."""

        # Check for prompt injection attempts
        if self._detect_injection(input_data.get("content", "")):
            return ValidationResult(
                valid=False,
                reason="Potential prompt injection detected",
                severity="HIGH"
            )

        # Validate against schema
        if not self._validate_schema(input_data):
            return ValidationResult(
                valid=False,
                reason="Invalid input schema",
                severity="MEDIUM"
            )

        # Check rate limits
        if not await self.rate_limiter.check(input_data.get("user_id")):
            return ValidationResult(
                valid=False,
                reason="Rate limit exceeded",
                severity="LOW"
            )

        return ValidationResult(valid=True)

    def _detect_injection(self, content: str) -> bool:
        """Detect common prompt injection patterns."""
        injection_patterns = [
            r"ignore previous instructions",
            r"system:\s*",
            r"<\|.*\|>",
            r"###\s*instruction",
        ]

        for pattern in injection_patterns:
            if re.search(pattern, content, re.IGNORECASE):
                return True
        return False
```

### 3. Memory Management

Agents need memory to maintain context, but memory is also a security surface. We use encrypted, scoped memory with automatic expiration.

```python
class SecureMemoryManager:
    def __init__(self, redis_client, encryption_key: bytes):
        self.redis = redis_client
        self.cipher = Fernet(encryption_key)
        self.ttl = 3600  # 1 hour default TTL

    async def store(
        self,
        agent_id: str,
        key: str,
        value: dict,
        scope: MemoryScope = MemoryScope.SESSION
    ) -> None:
        """Store encrypted memory with scope isolation."""

        # Serialize and encrypt
        serialized = json.dumps(value).encode()
        encrypted = self.cipher.encrypt(serialized)

        # Create scoped key
        scoped_key = self._create_scoped_key(agent_id, key, scope)

        # Store with TTL
        await self.redis.setex(
            scoped_key,
            self.ttl,
            encrypted
        )

        # Log for audit trail
        await self._log_memory_access(
            agent_id=agent_id,
            operation="STORE",
            key=key,
            scope=scope
        )

    async def retrieve(
        self,
        agent_id: str,
        key: str,
        scope: MemoryScope = MemoryScope.SESSION
    ) -> Optional[dict]:
        """Retrieve and decrypt memory."""

        scoped_key = self._create_scoped_key(agent_id, key, scope)
        encrypted = await self.redis.get(scoped_key)

        if not encrypted:
            return None

        # Decrypt and deserialize
        decrypted = self.cipher.decrypt(encrypted)
        return json.loads(decrypted.decode())
```

## Real-World Implementation: The Research Assistant

Let me walk you through a real implementation we built—a research assistant that helps analysts gather and synthesize information from multiple sources.

### Agent Definitions

```python
from langchain_openai import ChatOpenAI
from langchain.tools import Tool

class ResearchAgent:
    """Agent specialized in gathering information from various sources."""

    def __init__(self, llm: ChatOpenAI, tools: List[Tool]):
        self.llm = llm
        self.tools = tools
        self.system_prompt = """You are a research agent. Your role is to:
        1. Gather relevant information from provided sources
        2. Verify facts across multiple sources
        3. Flag any conflicting information
        4. Cite all sources used

        IMPORTANT: Never fabricate information. If you cannot find
        reliable information, explicitly state this."""

    async def research(self, query: str, context: dict) -> ResearchResult:
        """Execute research task with source verification."""

        # Use tools to gather information
        raw_results = await self._gather_from_sources(query)

        # Cross-reference and verify
        verified_results = await self._verify_facts(raw_results)

        # Synthesize findings
        synthesis = await self._synthesize(verified_results)

        return ResearchResult(
            findings=synthesis,
            sources=verified_results.sources,
            confidence=self._calculate_confidence(verified_results),
            conflicts=verified_results.conflicts
        )


class AnalysisAgent:
    """Agent specialized in analyzing and interpreting data."""

    def __init__(self, llm: ChatOpenAI):
        self.llm = llm
        self.system_prompt = """You are an analysis agent. Your role is to:
        1. Identify patterns and trends in data
        2. Provide statistical insights where applicable
        3. Highlight potential biases or limitations
        4. Offer multiple interpretations when appropriate

        Always quantify uncertainty and avoid overconfident claims."""

    async def analyze(
        self,
        data: dict,
        analysis_type: AnalysisType
    ) -> AnalysisResult:
        """Perform analysis with bias detection."""

        # Run primary analysis
        primary_analysis = await self._run_analysis(data, analysis_type)

        # Check for potential biases
        bias_report = await self._detect_bias(data, primary_analysis)

        # Generate alternative interpretations
        alternatives = await self._generate_alternatives(
            data,
            primary_analysis
        )

        return AnalysisResult(
            primary=primary_analysis,
            bias_report=bias_report,
            alternatives=alternatives,
            confidence_intervals=self._calculate_ci(primary_analysis)
        )
```

### The Complete Workflow

```python
def create_research_workflow():
    """Create the complete research assistant workflow."""

    workflow = StateGraph(ResearchState)

    # Initialize agents
    research_agent = ResearchAgent(
        llm=ChatOpenAI(model="gpt-4-turbo"),
        tools=[web_search, document_search, database_query]
    )

    analysis_agent = AnalysisAgent(
        llm=ChatOpenAI(model="gpt-4-turbo")
    )

    synthesis_agent = SynthesisAgent(
        llm=ChatOpenAI(model="gpt-4-turbo")
    )

    security_validator = SecurityValidator(
        config=SecurityConfig(
            rpm_limit=60,
            max_tokens_per_request=8000,
            enable_pii_detection=True
        )
    )

    # Define nodes
    async def research_node(state: ResearchState) -> ResearchState:
        # Validate input
        validation = await security_validator.validate_input(state)
        if not validation.valid:
            return {**state, "error": validation.reason}

        # Execute research
        result = await research_agent.research(
            state["query"],
            state["context"]
        )

        return {
            **state,
            "research_results": result,
            "current_stage": "analysis"
        }

    async def analysis_node(state: ResearchState) -> ResearchState:
        result = await analysis_agent.analyze(
            state["research_results"],
            AnalysisType.COMPREHENSIVE
        )

        return {
            **state,
            "analysis_results": result,
            "current_stage": "synthesis"
        }

    async def synthesis_node(state: ResearchState) -> ResearchState:
        result = await synthesis_agent.synthesize(
            research=state["research_results"],
            analysis=state["analysis_results"],
            format=state.get("output_format", OutputFormat.REPORT)
        )

        # Final security check on output
        sanitized = await security_validator.sanitize_output(result)

        return {
            **state,
            "final_output": sanitized,
            "current_stage": "complete"
        }

    # Add nodes to workflow
    workflow.add_node("research", research_node)
    workflow.add_node("analysis", analysis_node)
    workflow.add_node("synthesis", synthesis_node)

    # Define edges
    workflow.add_edge("research", "analysis")
    workflow.add_edge("analysis", "synthesis")
    workflow.add_edge("synthesis", END)

    workflow.set_entry_point("research")

    return workflow.compile()
```

## Performance Optimization

Multi-agent systems can be slow if not optimized. Here are the techniques we use:

### 1. Parallel Execution

When agents don't depend on each other's output, run them in parallel:

```python
async def parallel_research(queries: List[str]) -> List[ResearchResult]:
    """Execute multiple research tasks in parallel."""

    tasks = [
        research_agent.research(query, {})
        for query in queries
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Handle any failures gracefully
    successful_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"Research failed for query {i}: {result}")
            successful_results.append(ResearchResult.empty())
        else:
            successful_results.append(result)

    return successful_results
```

### 2. Caching

Cache expensive operations to reduce latency and costs:

```python
class IntelligentCache:
    """Cache with semantic similarity matching."""

    def __init__(self, embedding_model, similarity_threshold: float = 0.95):
        self.embedding_model = embedding_model
        self.threshold = similarity_threshold
        self.cache = {}
        self.embeddings = {}

    async def get_or_compute(
        self,
        key: str,
        compute_fn: Callable
    ) -> Any:
        """Get from cache or compute if not found."""

        # Generate embedding for key
        key_embedding = await self.embedding_model.embed(key)

        # Check for semantically similar cached entries
        for cached_key, cached_embedding in self.embeddings.items():
            similarity = cosine_similarity(key_embedding, cached_embedding)
            if similarity > self.threshold:
                logger.info(f"Cache hit with similarity {similarity:.3f}")
                return self.cache[cached_key]

        # Compute and cache
        result = await compute_fn()
        self.cache[key] = result
        self.embeddings[key] = key_embedding

        return result
```

### 3. Streaming Responses

For long-running operations, stream responses to improve perceived latency:

```python
async def stream_synthesis(
    state: ResearchState
) -> AsyncGenerator[str, None]:
    """Stream the synthesis output token by token."""

    prompt = create_synthesis_prompt(
        state["research_results"],
        state["analysis_results"]
    )

    async for chunk in llm.astream(prompt):
        # Validate each chunk for security
        if security_validator.is_safe_chunk(chunk.content):
            yield chunk.content
        else:
            yield "[REDACTED]"
```

## Monitoring and Observability

You can't secure what you can't see. We implement comprehensive monitoring:

```python
class AgentObserver:
    """Observability layer for multi-agent systems."""

    def __init__(self, metrics_client, trace_client):
        self.metrics = metrics_client
        self.tracer = trace_client

    @contextmanager
    def observe_agent(self, agent_id: str, operation: str):
        """Context manager for agent observation."""

        span = self.tracer.start_span(
            f"agent.{agent_id}.{operation}"
        )
        start_time = time.time()

        try:
            yield span

            # Record success metrics
            self.metrics.increment(
                "agent.operation.success",
                tags={"agent": agent_id, "operation": operation}
            )

        except Exception as e:
            # Record failure metrics
            self.metrics.increment(
                "agent.operation.failure",
                tags={
                    "agent": agent_id,
                    "operation": operation,
                    "error_type": type(e).__name__
                }
            )
            span.set_status(Status(StatusCode.ERROR))
            raise

        finally:
            duration = time.time() - start_time
            self.metrics.histogram(
                "agent.operation.duration",
                duration,
                tags={"agent": agent_id, "operation": operation}
            )
            span.end()
```

## Lessons Learned

After two years of building these systems, here are my key takeaways:

### 1. Start Simple, Add Complexity Gradually

Don't build a 10-agent system on day one. Start with a single agent, validate it works, then add more. Each additional agent increases complexity exponentially.

### 2. Security is Not Optional

Every security shortcut you take will come back to haunt you. Build security in from the start—it's much harder to add later.

### 3. Test with Adversarial Inputs

Your agents will receive inputs you never imagined. Test with:
- Malformed data
- Prompt injection attempts
- Extremely long inputs
- Unicode edge cases
- Conflicting instructions

### 4. Plan for Failure

Agents will fail. Design your system to degrade gracefully:
- Implement circuit breakers
- Have fallback responses
- Log everything for debugging
- Alert on anomalies

### 5. Monitor Costs

Multi-agent systems can be expensive. Track:
- Token usage per agent
- API calls per request
- Cache hit rates
- Cost per successful outcome

## Conclusion

Building secure multi-agent systems is challenging but rewarding. The key is to balance capability with security, performance with reliability, and complexity with maintainability.

The patterns I've shared here have been battle-tested in enterprise environments. They're not perfect, but they're a solid foundation to build upon.

If you're starting your multi-agent journey, remember: security first, iterate fast, and always keep learning.

---

*Have questions or want to discuss multi-agent architectures? Connect with me on [LinkedIn](https://linkedin.com/in/mishrapunit) or [Twitter](https://twitter.com/punitmishra).*

## Further Reading

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
- [Anthropic's Constitutional AI](https://www.anthropic.com/constitutional-ai)
- [Microsoft's Responsible AI Principles](https://www.microsoft.com/en-us/ai/responsible-ai)
