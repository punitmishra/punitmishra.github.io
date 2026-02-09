---
title: "Tool Routing for LLMs in 2026: Safe, Fast, and Observable"
date: "2026-02-08"
category: "AI/ML"
tags: ["LLM", "Tools", "Architecture", "TypeScript", "Safety"]
readTime: "14 min read"
featured: true
---

# Tool Routing for LLMs in 2026: Safe, Fast, and Observable

Tool routing is where LLM apps either become reliable products or fragile demos. This is a production-ready routing pattern that balances safety, latency, and traceability.

## Architecture Overview

Pipeline stages:

1. **Intent classification** (lightweight model)
2. **Schema-constrained planning** (tool selection)
3. **Policy gate** (allow/deny)
4. **Execution with retries**
5. **Audit logging + trace IDs**

## 1) Typed Tool Registry

```ts
type ToolName = "search" | "getCustomer" | "createTicket";

type ToolRegistry = {
  search: (args: { query: string }) => Promise<string>;
  getCustomer: (args: { id: string }) => Promise<{ id: string; tier: string }>;
  createTicket: (args: { title: string; severity: "low" | "med" | "high" }) => Promise<{ id: string }>;
};
```

## 2) Schema-Constrained Tool Calls

```ts
import { z } from "zod";

const ToolCall = z.object({
  tool: z.enum(["search", "getCustomer", "createTicket"]),
  args: z.record(z.string(), z.unknown()),
  rationale: z.string().min(12),
});
```

## 3) Policy Gate

```ts
const POLICY = {
  search: { maxCalls: 3 },
  getCustomer: { allowFields: ["id"] },
  createTicket: { allowFields: ["title", "severity"] },
} as const;

function policyGate(call: z.infer<typeof ToolCall>) {
  const policy = POLICY[call.tool];
  if (!policy) throw new Error("Tool not allowed");
  if (policy.allowFields) {
    Object.keys(call.args).forEach((k) => {
      if (!policy.allowFields.includes(k)) throw new Error(`Field not allowed: ${k}`);
    });
  }
}
```

## 4) Execution With Retries

```ts
async function executeWithRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i += 1) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      await new Promise((r) => setTimeout(r, 150 * (i + 1)));
    }
  }
  throw lastErr;
}
```

## 5) Audit Logs

```ts
function auditLog(event: Record<string, unknown>) {
  console.log(JSON.stringify({ ts: new Date().toISOString(), ...event }));
}
```

## Closing Thoughts

Routing is where LLM reliability is made. Constrain everything, log everything, and keep the tool surface small. This keeps your system safe and fast as it scales.

