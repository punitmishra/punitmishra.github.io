---
title: "Multi-Agent AI Systems: Patterns and Pitfalls"
date: "2024-12-05"
category: "AI/ML"
tags: ["LangGraph", "Agents", "LLM", "Architecture"]
readTime: "12 min read"
---

Multi-agent systems are transforming how we build AI applications. Instead of monolithic prompts, we're now orchestrating specialized agents that collaborate to solve complex problems. Here's what I've learned building production multi-agent systems.

## The Promise and Reality

The idea is compelling: break complex tasks into subtasks, assign specialized agents, and coordinate their work. But the reality is messier:

- **Agents hallucinate** - and those hallucinations propagate
- **Coordination is hard** - agents need to share context efficiently
- **Debugging is painful** - tracing issues across agents is complex
- **Costs scale** - each agent call costs tokens

## LangGraph: A Solid Foundation

LangGraph provides the primitives for building reliable agent systems:

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, List

class AgentState(TypedDict):
    messages: List[dict]
    context: dict
    current_step: str
    results: dict

def create_research_workflow():
    workflow = StateGraph(AgentState)

    # Define nodes (agents)
    workflow.add_node("researcher", research_agent)
    workflow.add_node("analyzer", analysis_agent)
    workflow.add_node("synthesizer", synthesis_agent)
    workflow.add_node("validator", validation_agent)

    # Define edges (flow)
    workflow.add_edge("researcher", "analyzer")
    workflow.add_edge("analyzer", "synthesizer")
    workflow.add_conditional_edges(
        "synthesizer",
        should_validate,
        {
            "validate": "validator",
            "complete": END
        }
    )
    workflow.add_edge("validator", "synthesizer")

    workflow.set_entry_point("researcher")
    return workflow.compile()
```

## Patterns That Work

### 1. Specialized Agents with Clear Boundaries

Each agent should have a single, well-defined responsibility:

```python
class ResearchAgent:
    """Finds and retrieves relevant information."""

    def __init__(self, retriever, llm):
        self.retriever = retriever
        self.llm = llm

    async def execute(self, state: AgentState) -> AgentState:
        query = state["messages"][-1]["content"]

        # Retrieve relevant documents
        docs = await self.retriever.search(query, k=10)

        # Extract key information
        extraction_prompt = f"""
        Query: {query}
        Documents: {docs}

        Extract relevant facts and cite sources.
        """

        facts = await self.llm.generate(extraction_prompt)

        return {
            **state,
            "results": {**state["results"], "research": facts},
            "current_step": "research_complete"
        }
```

### 2. Structured Communication

Don't pass free-form text between agents. Use structured formats:

```python
from pydantic import BaseModel
from typing import List, Optional

class ResearchFinding(BaseModel):
    fact: str
    source: str
    confidence: float
    supporting_quotes: List[str]

class AnalysisResult(BaseModel):
    findings: List[ResearchFinding]
    gaps: List[str]
    recommendations: List[str]
    overall_confidence: float

def analyzer_agent(state: AgentState) -> AgentState:
    research = state["results"]["research"]

    # Parse structured input
    findings = parse_research(research)

    # Produce structured output
    analysis = AnalysisResult(
        findings=prioritize(findings),
        gaps=identify_gaps(findings),
        recommendations=generate_recommendations(findings),
        overall_confidence=calculate_confidence(findings)
    )

    return {
        **state,
        "results": {**state["results"], "analysis": analysis.dict()}
    }
```

### 3. Explicit Error Handling

Agents will fail. Plan for it:

```python
class AgentExecutor:
    def __init__(self, agent, max_retries=3):
        self.agent = agent
        self.max_retries = max_retries

    async def execute(self, state: AgentState) -> AgentState:
        for attempt in range(self.max_retries):
            try:
                result = await self.agent.execute(state)

                # Validate output
                if not self.validate_output(result):
                    raise InvalidOutputError("Agent produced invalid output")

                return result

            except RateLimitError:
                await asyncio.sleep(2 ** attempt)
            except InvalidOutputError as e:
                # Log and retry with modified prompt
                self.logger.warning(f"Invalid output on attempt {attempt}: {e}")
                state = self.modify_for_retry(state, e)
            except Exception as e:
                self.logger.error(f"Agent failed: {e}")
                return self.fallback_response(state, e)

        return self.fallback_response(state, "Max retries exceeded")
```

### 4. State Checkpointing

For long-running workflows, checkpoint state:

```python
class CheckpointedWorkflow:
    def __init__(self, workflow, checkpoint_store):
        self.workflow = workflow
        self.store = checkpoint_store

    async def run(self, initial_state: AgentState, run_id: str):
        # Check for existing checkpoint
        checkpoint = await self.store.get(run_id)
        state = checkpoint or initial_state

        async for event in self.workflow.astream(state):
            # Save checkpoint after each step
            await self.store.save(run_id, event)

            # Check for early termination
            if event.get("should_stop"):
                break

        return await self.store.get(run_id)
```

## Common Pitfalls

### 1. Over-Engineering Agent Hierarchies

Don't create deep agent hierarchies. Two levels is usually enough:

```
BAD:
Orchestrator -> SubOrchestrator -> Agent Group -> Individual Agents

GOOD:
Coordinator -> Specialized Agents (flat)
```

### 2. Insufficient Context Management

Agents need shared context, but not everything:

```python
def prepare_agent_context(full_state: AgentState, agent_type: str) -> dict:
    """Each agent gets only what it needs."""

    base_context = {
        "task": full_state["task"],
        "constraints": full_state["constraints"]
    }

    agent_specific = {
        "researcher": {"search_scope": full_state.get("search_scope")},
        "analyzer": {"research_findings": full_state["results"].get("research")},
        "synthesizer": {"analysis": full_state["results"].get("analysis")}
    }

    return {**base_context, **agent_specific.get(agent_type, {})}
```

### 3. Ignoring Token Economics

Each agent call costs money. Optimize:

```python
class TokenOptimizedAgent:
    def __init__(self, llm, token_budget: int):
        self.llm = llm
        self.token_budget = token_budget

    async def execute(self, state: AgentState) -> AgentState:
        # Compress context to fit budget
        context = self.compress_context(state, self.token_budget * 0.6)

        # Use smaller model for simple tasks
        if self.is_simple_task(state):
            return await self.llm.generate(context, model="gpt-3.5-turbo")

        return await self.llm.generate(context, model="gpt-4")
```

## Monitoring and Observability

You need visibility into agent behavior:

```python
class AgentTracer:
    def __init__(self, trace_store):
        self.store = trace_store

    def trace(self, agent_name: str):
        def decorator(func):
            async def wrapper(state: AgentState) -> AgentState:
                trace_id = str(uuid.uuid4())
                start_time = time.time()

                try:
                    result = await func(state)
                    await self.store.log({
                        "trace_id": trace_id,
                        "agent": agent_name,
                        "duration_ms": (time.time() - start_time) * 1000,
                        "input_tokens": count_tokens(state),
                        "output_tokens": count_tokens(result),
                        "status": "success"
                    })
                    return result
                except Exception as e:
                    await self.store.log({
                        "trace_id": trace_id,
                        "agent": agent_name,
                        "status": "error",
                        "error": str(e)
                    })
                    raise

            return wrapper
        return decorator
```

## Key Takeaways

1. **Start simple** - one or two agents, add more only when needed
2. **Use structured communication** - Pydantic models, not free text
3. **Handle failures explicitly** - every agent can and will fail
4. **Monitor everything** - trace flows, measure tokens, track latency
5. **Optimize for cost** - model selection, context compression, caching

Multi-agent systems are powerful but complex. Build incrementally, test thoroughly, and always have fallbacks.
