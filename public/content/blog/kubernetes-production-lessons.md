---
title: "Kubernetes in Production: Hard-Won Lessons from Running at Scale"
date: "2022-11-15"
author: "Punit Mishra"
category: "Technical"
tags: ["Kubernetes", "DevOps", "Infrastructure", "Scale", "Production"]
readTime: "18 min"
featured: false
---

# Kubernetes in Production: Hard-Won Lessons from Running at Scale

> Three years of running Kubernetes clusters serving millions of requests. Here's what I wish I knew on day one.

## The Reality Check

Kubernetes promises a lot. And it delivers—eventually. But the path from "it works on my laptop" to "it's running in production" is paved with YAML files and sleepless nights.

This article shares the lessons that took me years to learn.

## Lesson 1: Resource Limits Aren't Optional

### The Problem

Without proper resource limits, one misbehaving pod can take down your entire node:

```yaml
# Don't do this
spec:
  containers:
  - name: my-app
    image: my-app:latest
    # No resource limits = recipe for disaster
```

### The Solution

```yaml
# Do this instead
spec:
  containers:
  - name: my-app
    image: my-app:v1.2.3  # Pin versions!
    resources:
      requests:
        memory: "256Mi"
        cpu: "250m"
      limits:
        memory: "512Mi"
        cpu: "500m"
```

### The Gotcha

Setting limits too low causes OOMKills. Too high wastes resources. Here's how we found the sweet spot:

```python
def analyze_resource_usage(prometheus_client, deployment_name, namespace):
    """Analyze actual resource usage over 7 days."""

    # Query actual memory usage
    memory_query = f'''
        max(container_memory_working_set_bytes{{
            namespace="{namespace}",
            container="{deployment_name}"
        }}) by (pod)
    '''

    # Query CPU usage
    cpu_query = f'''
        max(rate(container_cpu_usage_seconds_total{{
            namespace="{namespace}",
            container="{deployment_name}"
        }}[5m])) by (pod)
    '''

    memory_data = prometheus_client.query_range(
        memory_query,
        start="-7d",
        end="now",
        step="1h"
    )

    cpu_data = prometheus_client.query_range(
        cpu_query,
        start="-7d",
        end="now",
        step="1h"
    )

    # Calculate P99 for limits, P50 for requests
    return {
        "memory_request": percentile(memory_data, 50),
        "memory_limit": percentile(memory_data, 99) * 1.2,  # 20% buffer
        "cpu_request": percentile(cpu_data, 50),
        "cpu_limit": percentile(cpu_data, 99) * 1.2,
    }
```

## Lesson 2: Health Checks That Actually Check Health

### The Anti-Pattern

```yaml
# This tells you nothing
livenessProbe:
  httpGet:
    path: /
    port: 8080
  initialDelaySeconds: 3
  periodSeconds: 3
```

### The Pattern

```yaml
# This tells you if the app is actually working
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3

startupProbe:
  httpGet:
    path: /health/started
    port: 8080
  initialDelaySeconds: 0
  periodSeconds: 5
  failureThreshold: 30  # 150 seconds to start
```

And the corresponding application code:

```python
from fastapi import FastAPI, Response
from typing import Dict

app = FastAPI()

class HealthChecker:
    def __init__(self):
        self.db_pool = None
        self.cache_client = None
        self.started = False

    def check_database(self) -> bool:
        try:
            self.db_pool.execute("SELECT 1")
            return True
        except Exception:
            return False

    def check_cache(self) -> bool:
        try:
            self.cache_client.ping()
            return True
        except Exception:
            return False

health = HealthChecker()

@app.get("/health/live")
async def liveness():
    """Am I running? Basic process health."""
    return {"status": "alive"}

@app.get("/health/ready")
async def readiness(response: Response) -> Dict:
    """Am I ready to receive traffic?"""
    checks = {
        "database": health.check_database(),
        "cache": health.check_cache(),
    }

    all_healthy = all(checks.values())

    if not all_healthy:
        response.status_code = 503

    return {
        "status": "ready" if all_healthy else "not_ready",
        "checks": checks
    }

@app.get("/health/started")
async def startup():
    """Have I finished starting up?"""
    if health.started:
        return {"status": "started"}
    return Response(status_code=503)
```

## Lesson 3: Secrets Management Done Right

### What Not To Do

```yaml
# Never do this
env:
  - name: DATABASE_PASSWORD
    value: "super-secret-password"  # Now it's in git history forever
```

### The Right Way

```yaml
# Use external secrets
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: app-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: ClusterSecretStore
  target:
    name: app-secrets
    creationPolicy: Owner
  data:
  - secretKey: database-password
    remoteRef:
      key: apps/myapp/database
      property: password
```

Then reference in your deployment:

```yaml
env:
  - name: DATABASE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: app-secrets
        key: database-password
```

## Lesson 4: Graceful Shutdowns Save Lives

When Kubernetes terminates a pod, you have a grace period. Use it.

```python
import signal
import asyncio
from contextlib import asynccontextmanager

class GracefulShutdown:
    def __init__(self):
        self.shutdown_requested = False
        self.active_requests = 0

    def request_shutdown(self):
        self.shutdown_requested = True

    @asynccontextmanager
    async def track_request(self):
        self.active_requests += 1
        try:
            yield
        finally:
            self.active_requests -= 1

shutdown = GracefulShutdown()

# Handle SIGTERM from Kubernetes
signal.signal(signal.SIGTERM, lambda *_: shutdown.request_shutdown())

@app.get("/health/ready")
async def readiness():
    # Stop accepting new traffic when shutting down
    if shutdown.shutdown_requested:
        return Response(status_code=503)
    return {"status": "ready"}

@app.middleware("http")
async def track_requests(request, call_next):
    async with shutdown.track_request():
        return await call_next(request)

async def wait_for_shutdown():
    """Wait for all requests to complete."""
    while shutdown.active_requests > 0:
        await asyncio.sleep(0.1)
```

And the pod spec:

```yaml
spec:
  terminationGracePeriodSeconds: 60  # Match your app's needs
  containers:
  - name: app
    lifecycle:
      preStop:
        exec:
          command: ["/bin/sh", "-c", "sleep 5"]  # Allow time for service mesh
```

## Lesson 5: Pod Disruption Budgets Prevent Outages

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: app-pdb
spec:
  minAvailable: 2  # Always keep at least 2 pods running
  selector:
    matchLabels:
      app: my-app
```

Or percentage-based:

```yaml
spec:
  maxUnavailable: 25%  # Never take down more than 25% at once
```

## Lesson 6: Network Policies Are Your Friend

By default, every pod can talk to every other pod. That's terrifying.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: app-network-policy
spec:
  podSelector:
    matchLabels:
      app: my-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: api-gateway
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
```

## Lesson 7: Observability or Bust

### The Three Pillars

**Metrics (Prometheus)**

```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: app-metrics
spec:
  selector:
    matchLabels:
      app: my-app
  endpoints:
  - port: metrics
    interval: 15s
    path: /metrics
```

**Logs (Structured JSON)**

```python
import structlog

logger = structlog.get_logger()

@app.middleware("http")
async def log_requests(request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start

    logger.info(
        "http_request",
        method=request.method,
        path=request.url.path,
        status=response.status_code,
        duration_ms=duration * 1000,
        request_id=request.headers.get("x-request-id"),
    )

    return response
```

**Traces (OpenTelemetry)**

```python
from opentelemetry import trace
from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor

tracer = trace.get_tracer(__name__)

FastAPIInstrumentor.instrument_app(app)

async def process_order(order_id: str):
    with tracer.start_as_current_span("process_order") as span:
        span.set_attribute("order.id", order_id)

        with tracer.start_as_current_span("validate_order"):
            await validate(order_id)

        with tracer.start_as_current_span("charge_payment"):
            await charge(order_id)
```

## The Checklist

Before going to production:

### Reliability
- [ ] Resource limits on all containers
- [ ] Liveness, readiness, and startup probes
- [ ] Pod disruption budgets
- [ ] Graceful shutdown handling
- [ ] Horizontal pod autoscaling configured

### Security
- [ ] No secrets in YAML or images
- [ ] Network policies restricting traffic
- [ ] Pod security policies/standards
- [ ] Service accounts with minimal permissions
- [ ] Image scanning in CI/CD

### Observability
- [ ] Metrics exposed and scraped
- [ ] Structured logging
- [ ] Distributed tracing
- [ ] Alerting configured
- [ ] Dashboards created

### Operations
- [ ] Rollback strategy documented
- [ ] Backup and recovery tested
- [ ] Runbooks written
- [ ] On-call rotation established

## Conclusion

Kubernetes is powerful, but it's not magic. The clusters that run smoothly are the ones where operators respected the fundamentals:

1. Set proper resource limits
2. Implement real health checks
3. Manage secrets securely
4. Handle shutdowns gracefully
5. Protect your availability
6. Lock down networking
7. Invest in observability

Get these right, and Kubernetes becomes a reliable foundation. Get them wrong, and you'll spend your nights debugging.

---

*Running Kubernetes in production? Let's compare notes on [LinkedIn](https://linkedin.com/in/mishrapunit).*
