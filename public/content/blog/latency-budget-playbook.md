---
title: "Latency Budget Playbook: How to Keep P99 Under 200ms"
date: "2025-02-08"
category: "Technical"
tags: ["Performance", "Latency", "SLO", "Distributed Systems", "Optimization"]
readTime: "12 min read"
featured: true
---

# Latency Budget Playbook: How to Keep P99 Under 200ms

Fast systems are not an accident. They are a result of explicit budgets, ruthless measurement, and disciplined tradeoffs. This post is the playbook I use to keep user-facing systems under a strict P99 target while traffic scales.

## Step 1: Set a Real Budget (Not a Wish)

Start with your user-facing target. If the product needs **P99 < 200ms**, you do not get 200ms for everything. You split that budget:

- **Network**: 30ms
- **Edge / CDN / LB**: 20ms
- **App**: 100ms
- **Data**: 40ms
- **Headroom**: 10ms

Write it down. Every subsystem gets a number. This is how you stop the "just 10ms more" creep.

## Step 2: Measure the Critical Path

Latency does not come from averages. It comes from the slowest path. Instrument:

- **End-to-end tracing** with a trace ID at the edge
- **Span-level timing** for DB, cache, network, external APIs
- **P50, P90, P99** on every span

You need a flame graph of the request path. If you cannot see it, you cannot control it.

## Step 3: Tame Tail Latency

P99 is dominated by outliers. Typical causes:

- GC pauses
- Database queueing
- Lock contention
- Cross-region calls

Fixes that consistently work:

- **Warm pools**: keep a minimum number of hot workers
- **Connection pooling**: avoid new TLS handshakes in the hot path
- **Backpressure**: fail fast instead of piling up
- **Timeout discipline**: every call must have a timeout

## Step 4: Cache With Intent

Caching is not a band-aid. It is a design decision:

- Cache **expensive, stable** results
- Cache **idempotent** reads, not writes
- Use **stale-while-revalidate** for read-heavy APIs

If you cannot describe your cache invalidation strategy in one sentence, it is not ready for prod.

## Step 5: Avoid the Slow Path

Most requests do not need the full feature set. Short-circuit:

- **Feature flags** for expensive features
- **Partial responses** for slower data
- **Async work** for non-critical tasks (emails, analytics)

Every time you can skip work, you buy back budget.

## Step 6: Build a Latency Review Loop

Weekly review:

- P99 trend vs target
- Top 3 slow spans
- New regressions since last deploy

Treat latency like a product feature. It needs a backlog and owners.

## A Simple Rule

If you cannot explain where each millisecond went, you do not own performance yet.

## Closing Thoughts

Performance is not a one-time effort. It is a culture. The teams that win are the ones who budget, measure, and enforce it every sprint.

If you want a deeper breakdown of instrumentation, let me know. I can share real-world dashboards and playbooks I use in production.

