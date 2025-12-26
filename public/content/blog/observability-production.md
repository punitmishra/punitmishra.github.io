---
title: "Observability in Production: Metrics, Logs, and Traces"
date: "2024-12-28"
category: "Technical"
tags: ["Observability", "DevOps", "Monitoring", "SRE"]
readTime: "11 min read"
---

# Observability in Production: Metrics, Logs, and Traces

"It works on my machine" stops being funny when you're debugging a production incident at 2 AM. After years of operating distributed systems, I've learned that observability isn't a nice-to-have—it's the difference between resolving incidents in minutes vs. hours.

## The Three Pillars

### 1. Metrics: The Vital Signs

Metrics tell you *what* is happening at an aggregate level.

**RED Method (for services):**
- **R**ate: Requests per second
- **E**rrors: Error rate
- **D**uration: Latency percentiles

**USE Method (for resources):**
- **U**tilization: How busy is the resource?
- **S**aturation: How much queued work?
- **E**rrors: Error count

```python
from prometheus_client import Counter, Histogram, Gauge

# RED metrics
request_count = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

request_latency = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint'],
    buckets=[.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10]
)

# USE metrics
connection_pool_usage = Gauge(
    'db_connection_pool_usage',
    'Database connection pool utilization'
)
```

### 2. Logs: The Story

Logs tell you *why* something happened.

**Structured Logging (JSON):**

```python
import structlog

logger = structlog.get_logger()

logger.info(
    "order_created",
    order_id="ord_123",
    customer_id="cust_456",
    total_amount=99.99,
    items_count=3,
    payment_method="credit_card"
)
```

Output:
```json
{
  "event": "order_created",
  "order_id": "ord_123",
  "customer_id": "cust_456",
  "total_amount": 99.99,
  "items_count": 3,
  "payment_method": "credit_card",
  "timestamp": "2024-12-28T10:30:00Z",
  "level": "info",
  "service": "order-service",
  "trace_id": "abc123"
}
```

**Log Levels (use them correctly):**

```python
# DEBUG: Detailed diagnostic info (not in production)
logger.debug("cache_lookup", key="user:123", hit=True)

# INFO: Normal operations
logger.info("order_created", order_id="123")

# WARNING: Unexpected but handled
logger.warning("rate_limit_approaching", current=950, limit=1000)

# ERROR: Operation failed
logger.error("payment_failed", order_id="123", error="card_declined")

# CRITICAL: System is unusable
logger.critical("database_connection_lost", error=str(e))
```

### 3. Traces: The Journey

Traces tell you *where* time is spent across services.

```python
from opentelemetry import trace
from opentelemetry.trace import SpanKind

tracer = trace.get_tracer(__name__)

async def process_order(order_id: str):
    with tracer.start_as_current_span(
        "process_order",
        kind=SpanKind.SERVER,
        attributes={"order_id": order_id}
    ) as span:
        # Validate order
        with tracer.start_as_current_span("validate_order"):
            await validate_order(order_id)

        # Charge payment
        with tracer.start_as_current_span("charge_payment"):
            result = await payment_service.charge(order_id)
            span.set_attribute("payment.amount", result.amount)

        # Update inventory
        with tracer.start_as_current_span("update_inventory"):
            await inventory_service.reserve(order_id)
```

## Connecting the Pillars

The magic happens when you correlate all three:

```python
import structlog
from opentelemetry import trace

def get_logger():
    # Inject trace context into logs
    span = trace.get_current_span()
    context = span.get_span_context()

    return structlog.get_logger().bind(
        trace_id=format(context.trace_id, '032x'),
        span_id=format(context.span_id, '016x')
    )
```

Now every log entry includes the trace ID, letting you jump from a log line to the full distributed trace.

## Alerting That Doesn't Suck

### Alert on Symptoms, Not Causes

```yaml
# Bad: Alert on cause
- alert: HighCPU
  expr: cpu_usage > 90%

# Good: Alert on symptom
- alert: HighLatency
  expr: histogram_quantile(0.99, http_request_duration_seconds) > 0.5
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "P99 latency above 500ms"
    runbook: "https://wiki.example.com/runbooks/high-latency"
```

### Multi-Window Alerting

Avoid flapping alerts:

```yaml
# Alert if error rate is high over both short AND long windows
- alert: HighErrorRate
  expr: |
    (
      sum(rate(http_requests_total{status=~"5.."}[5m]))
      / sum(rate(http_requests_total[5m])) > 0.01
    ) and (
      sum(rate(http_requests_total{status=~"5.."}[1h]))
      / sum(rate(http_requests_total[1h])) > 0.005
    )
```

## Dashboards That Help

### The SRE Dashboard

Four essential panels:
1. **Request rate** - Traffic pattern
2. **Error rate** - Are users affected?
3. **Latency (P50, P95, P99)** - Performance degradation
4. **Saturation** - Are we running out of resources?

### Golden Signals Query Examples (Prometheus)

```promql
# Request Rate
sum(rate(http_requests_total[5m])) by (service)

# Error Rate
sum(rate(http_requests_total{status=~"5.."}[5m]))
/ sum(rate(http_requests_total[5m]))

# P99 Latency
histogram_quantile(0.99,
  sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
)

# Saturation (queue depth)
sum(http_requests_in_flight) by (service)
```

## Cost-Effective Observability

Observability can get expensive. Here's how to manage costs:

### Log Sampling

```python
import random

def should_log_request(request, response):
    # Always log errors
    if response.status_code >= 500:
        return True

    # Sample successful requests
    return random.random() < 0.1  # 10% sampling
```

### Metric Cardinality Control

```python
# Bad: Unbounded cardinality
request_count.labels(
    user_id=user_id,  # Millions of unique values!
    endpoint=endpoint
).inc()

# Good: Bounded cardinality
request_count.labels(
    user_tier=user.tier,  # "free", "pro", "enterprise"
    endpoint=endpoint
).inc()
```

### Trace Sampling

```python
from opentelemetry.sdk.trace.sampling import TraceIdRatioBased

# Sample 10% of traces in production
sampler = TraceIdRatioBased(0.1)

# But always sample errors (head-based sampling can miss these)
# Use tail-based sampling with a collector for better coverage
```

## Tools of the Trade

| Category | Open Source | Commercial |
|----------|-------------|------------|
| Metrics | Prometheus, VictoriaMetrics | Datadog, New Relic |
| Logs | Loki, Elasticsearch | Splunk, Sumo Logic |
| Traces | Jaeger, Zipkin | Honeycomb, Lightstep |
| All-in-One | Grafana Stack | Datadog, Dynatrace |

## References

- [Google SRE Book - Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [The RED Method](https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/)
- [USE Method](http://www.brendangregg.com/usemethod.html)

## Conclusion

Good observability isn't about collecting everything—it's about collecting the *right* things and making them actionable. Start with RED metrics, add structured logs with trace correlation, and build dashboards that answer the questions you'll ask during incidents.

The goal is to reduce Mean Time To Detection (MTTD) and Mean Time To Resolution (MTTR). Every minute saved during an incident is worth hours of setup time.
