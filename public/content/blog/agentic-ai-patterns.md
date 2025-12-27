---
title: "Agentic AI Patterns: Building Autonomous Systems That Actually Work"
date: "2025-01-19"
category: "AI/ML"
tags: ["AI Agents", "LangGraph", "LLM", "Automation", "Architecture"]
readTime: "16 min read"
featured: true
---

# Agentic AI Patterns: Building Autonomous Systems That Actually Work

After building multi-agent systems for enterprise use cases, I've learned that the gap between "cool demo" and "production-ready" is massive. Here's what actually works when building agentic AI systems.

## What Makes an AI System "Agentic"?

An agentic AI system can:
1. **Reason** about goals and break them into subtasks
2. **Plan** sequences of actions to achieve objectives
3. **Execute** actions using tools and APIs
4. **Reflect** on outcomes and adjust strategy
5. **Persist** state across interactions

The key difference from simple LLM calls: agents make decisions, not just predictions.

## Core Patterns

### 1. The ReAct Pattern (Reasoning + Acting)

The foundational pattern for most agent systems:

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]
    reasoning: str
    action: str
    observation: str
    iteration: int

def reason(state: AgentState) -> AgentState:
    """Think about what to do next."""
    messages = state["messages"]

    # LLM call to reason about next action
    response = llm.invoke([
        SystemMessage(content=REASONING_PROMPT),
        *messages
    ])

    return {
        "reasoning": response.content,
        "iteration": state["iteration"] + 1
    }

def act(state: AgentState) -> AgentState:
    """Execute the decided action."""
    reasoning = state["reasoning"]

    # Parse action from reasoning
    action = parse_action(reasoning)

    # Execute tool
    result = execute_tool(action)

    return {
        "action": action,
        "observation": result
    }

def should_continue(state: AgentState) -> str:
    """Decide if we should continue or stop."""
    if state["iteration"] > MAX_ITERATIONS:
        return "end"
    if "FINAL_ANSWER" in state.get("reasoning", ""):
        return "end"
    return "continue"

# Build the graph
graph = StateGraph(AgentState)
graph.add_node("reason", reason)
graph.add_node("act", act)
graph.add_edge("reason", "act")
graph.add_conditional_edges("act", should_continue, {
    "continue": "reason",
    "end": END
})
```

### 2. The Supervisor Pattern

For complex tasks requiring specialized agents:

```python
class SupervisorState(TypedDict):
    task: str
    subtasks: list[str]
    current_agent: str
    results: dict[str, str]
    final_result: str

AGENTS = {
    "researcher": ResearchAgent(),
    "analyst": AnalystAgent(),
    "writer": WriterAgent(),
    "reviewer": ReviewerAgent(),
}

def supervisor(state: SupervisorState) -> SupervisorState:
    """Route tasks to appropriate specialist agents."""
    task = state["task"]
    results = state["results"]

    # Determine next agent based on task state
    prompt = f"""
    Task: {task}
    Completed work: {results}

    Which agent should handle the next step?
    Options: {list(AGENTS.keys())}
    Or respond DONE if task is complete.
    """

    response = llm.invoke(prompt)
    next_agent = parse_agent(response.content)

    return {"current_agent": next_agent}

def execute_agent(state: SupervisorState) -> SupervisorState:
    """Run the selected specialist agent."""
    agent = AGENTS[state["current_agent"]]
    result = agent.run(state["task"], state["results"])

    return {
        "results": {
            **state["results"],
            state["current_agent"]: result
        }
    }
```

### 3. The Reflection Pattern

Critical for self-improving agents:

```python
def reflect(state: AgentState) -> AgentState:
    """Evaluate output quality and suggest improvements."""
    output = state["output"]

    reflection_prompt = f"""
    Evaluate this output critically:
    {output}

    Consider:
    1. Does it fully address the original request?
    2. Are there factual errors or inconsistencies?
    3. Could the explanation be clearer?
    4. What's missing?

    Provide specific, actionable feedback.
    """

    critique = llm.invoke(reflection_prompt)

    if "SATISFACTORY" in critique.content:
        return {"status": "complete", "reflection": critique.content}

    return {
        "status": "needs_revision",
        "reflection": critique.content,
        "iteration": state["iteration"] + 1
    }
```

## Production Considerations

### Error Handling

Agents will fail. Plan for it:

```python
class RobustAgent:
    def __init__(self, max_retries: int = 3):
        self.max_retries = max_retries
        self.fallback_responses = {}

    async def execute_with_retry(self, action: str) -> str:
        for attempt in range(self.max_retries):
            try:
                result = await self.execute(action)
                return result
            except RateLimitError:
                await asyncio.sleep(2 ** attempt)
            except ToolExecutionError as e:
                # Log and try alternative approach
                logger.warning(f"Tool failed: {e}")
                if alternative := self.get_alternative(action):
                    action = alternative
                    continue
                raise

        # Return graceful fallback
        return self.fallback_responses.get(
            action,
            "I encountered an issue and couldn't complete this step."
        )
```

### Cost Control

LLM calls add up fast:

```python
class CostAwareAgent:
    def __init__(self, budget_cents: int = 100):
        self.budget = budget_cents
        self.spent = 0
        self.token_costs = {
            "gpt-4": 0.03,      # per 1K tokens
            "gpt-3.5": 0.001,
            "claude-3": 0.015,
        }

    def select_model(self, task_complexity: str) -> str:
        """Use cheaper models for simpler tasks."""
        if self.spent > self.budget * 0.8:
            return "gpt-3.5"  # Budget mode

        if task_complexity == "simple":
            return "gpt-3.5"
        elif task_complexity == "medium":
            return "claude-3"
        return "gpt-4"

    def track_usage(self, model: str, tokens: int):
        cost = (tokens / 1000) * self.token_costs[model]
        self.spent += cost

        if self.spent > self.budget:
            raise BudgetExceededError(f"Spent ${self.spent/100:.2f}")
```

### State Persistence

For long-running agents:

```python
import redis
import json

class PersistentAgentState:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.redis = redis.Redis()

    def save(self, state: dict):
        """Persist state for recovery."""
        self.redis.hset(
            f"agent:{self.session_id}",
            mapping={
                "state": json.dumps(state),
                "updated_at": datetime.now().isoformat(),
                "checkpoint": state.get("iteration", 0)
            }
        )

    def load(self) -> dict | None:
        """Restore from last checkpoint."""
        data = self.redis.hgetall(f"agent:{self.session_id}")
        if data:
            return json.loads(data[b"state"])
        return None

    def can_resume(self) -> bool:
        """Check if we can resume from checkpoint."""
        data = self.redis.hgetall(f"agent:{self.session_id}")
        if not data:
            return False

        updated = datetime.fromisoformat(data[b"updated_at"].decode())
        return datetime.now() - updated < timedelta(hours=24)
```

## Anti-Patterns to Avoid

### 1. Infinite Loops
Always set iteration limits and detect cycles:

```python
def detect_loop(state: AgentState) -> bool:
    """Check if agent is stuck in a loop."""
    recent_actions = state["action_history"][-5:]

    # Same action repeated
    if len(set(recent_actions)) == 1:
        return True

    # Alternating pattern
    if len(recent_actions) >= 4:
        if recent_actions[0] == recent_actions[2] == recent_actions[4]:
            return True

    return False
```

### 2. Overloaded Prompts
Split complex instructions into focused agents instead of one mega-prompt.

### 3. No Guardrails
Always validate agent outputs before execution:

```python
def validate_action(action: dict) -> bool:
    """Ensure action is safe to execute."""
    # Check against allowlist
    if action["type"] not in ALLOWED_ACTIONS:
        return False

    # Validate parameters
    if action["type"] == "file_write":
        if not action["path"].startswith(SAFE_DIRECTORY):
            return False

    # Rate limiting
    if rate_limiter.is_exceeded(action["type"]):
        return False

    return True
```

## Real-World Example: Code Review Agent

Here's a production pattern I use:

```python
class CodeReviewAgent:
    def __init__(self):
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        graph = StateGraph(ReviewState)

        # Nodes
        graph.add_node("parse_diff", self.parse_diff)
        graph.add_node("check_style", self.check_style)
        graph.add_node("check_security", self.check_security)
        graph.add_node("check_logic", self.check_logic)
        graph.add_node("synthesize", self.synthesize_feedback)

        # Parallel execution for independent checks
        graph.add_edge("parse_diff", "check_style")
        graph.add_edge("parse_diff", "check_security")
        graph.add_edge("parse_diff", "check_logic")

        # Merge results
        graph.add_edge("check_style", "synthesize")
        graph.add_edge("check_security", "synthesize")
        graph.add_edge("check_logic", "synthesize")

        return graph.compile()

    async def review(self, pr_diff: str) -> ReviewResult:
        state = {"diff": pr_diff, "findings": []}
        result = await self.graph.ainvoke(state)
        return ReviewResult.from_state(result)
```

## Measuring Success

Track these metrics for your agents:

1. **Task completion rate** - Did the agent achieve the goal?
2. **Iteration efficiency** - How many steps to complete?
3. **Cost per task** - Total LLM spend
4. **Error rate** - Failed executions / total attempts
5. **User satisfaction** - Were corrections needed?

## Conclusion

Building production agentic AI requires:
- Clear boundaries and guardrails
- Robust error handling
- Cost awareness
- State management
- Comprehensive logging

The patterns here have survived production use. Start simple, add complexity only when needed, and always have a human in the loop for critical decisions.

---

*Building agentic systems? I'd love to hear about your patterns. Reach out on [Twitter](https://twitter.com/punitmishra) or [GitHub](https://github.com/punitmishra).*
