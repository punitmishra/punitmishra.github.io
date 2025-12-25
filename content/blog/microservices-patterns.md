---
title: "Enterprise Microservices Patterns: Lessons from Serving Global Customers"
date: "2024-07-15"
author: "Punit Mishra"
category: "Technical"
tags: ["Microservices", "Architecture", "Enterprise", "Scale", "Patterns"]
readTime: "14 min"
featured: false
---

# Enterprise Microservices Patterns: Lessons from Serving Global Customers

> 10+ years of building microservices at SAP—the patterns that work, the mistakes to avoid.

## The Reality of Enterprise Microservices

Microservices in enterprise environments are different from what you read in blog posts. You're dealing with:

- **Legacy systems** that can't be rewritten
- **Compliance requirements** (SOX, GDPR, SOC 2)
- **Global scale** with users across time zones
- **Uptime expectations** of 99.99%+
- **Teams** that don't always communicate well

This article shares patterns that have worked for us at SAP.

## Pattern 1: The Strangler Fig

### The Problem

You have a monolith that works. Rewriting it is risky and expensive. But it's holding you back.

### The Solution

Gradually replace parts of the monolith with microservices, like a strangler fig slowly enveloping a host tree.

```
Phase 1: Route traffic through a facade
┌─────────────────────────────────────────────────────┐
│                    API Gateway                       │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │   Monolith    │
              └───────────────┘

Phase 2: Extract one capability
┌─────────────────────────────────────────────────────┐
│                    API Gateway                       │
└─────────┬───────────────────────────┬───────────────┘
          │                           │
          ▼                           ▼
   ┌─────────────┐            ┌───────────────┐
   │ User Service│            │   Monolith    │
   └─────────────┘            │ (minus users) │
                              └───────────────┘

Phase 3: Repeat until monolith is gone
┌─────────────────────────────────────────────────────┐
│                    API Gateway                       │
└──┬──────────┬───────────┬──────────┬───────────────┘
   │          │           │          │
   ▼          ▼           ▼          ▼
┌──────┐  ┌──────┐    ┌──────┐   ┌──────┐
│Users │  │Orders│    │ Inv  │   │ Pay  │
└──────┘  └──────┘    └──────┘   └──────┘
```

### Implementation

```python
class StranglerFacade:
    """Route requests to monolith or new services based on feature flags."""

    def __init__(self, monolith_client, service_registry, feature_flags):
        self.monolith = monolith_client
        self.registry = service_registry
        self.flags = feature_flags

    async def route_request(self, request: Request) -> Response:
        capability = self._identify_capability(request)

        # Check if capability has been migrated
        if self.flags.is_enabled(f"migrate_{capability}"):
            service = self.registry.get_service(capability)
            if service:
                return await self._call_new_service(service, request)

        # Fall back to monolith
        return await self._call_monolith(request)

    async def _call_new_service(self, service, request) -> Response:
        try:
            response = await service.handle(request)
            return response
        except Exception as e:
            # If new service fails, optionally fall back
            if self.flags.is_enabled(f"fallback_{request.capability}"):
                logger.warning(f"Falling back to monolith: {e}")
                return await self._call_monolith(request)
            raise
```

### Key Lessons

1. **Start with the edges** - Extract services that have fewer dependencies first
2. **Keep the monolith running** - Don't commit to the new service until it's proven
3. **Feature flags are essential** - You need to be able to roll back instantly
4. **Double-write during migration** - Write to both old and new systems, compare results

## Pattern 2: Saga for Distributed Transactions

### The Problem

In a monolith, you have ACID transactions. In microservices, you don't. How do you maintain consistency across services?

### The Solution

Use the Saga pattern—a sequence of local transactions with compensating actions.

```
Order Saga:
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  Create Order → Reserve Inventory → Charge Payment → Ship     │
│       │                │                  │             │      │
│       │                │                  │             │      │
│       ▼                ▼                  ▼             ▼      │
│  (Compensate:     (Compensate:      (Compensate:   (Compensate:│
│   Cancel Order)    Release Stock)    Refund)       Return)     │
│                                                                │
└────────────────────────────────────────────────────────────────┘

If "Charge Payment" fails:
1. Refund is NOT needed (payment never happened)
2. Release Inventory (compensate)
3. Cancel Order (compensate)
```

### Implementation

```python
from dataclasses import dataclass
from enum import Enum
from typing import Callable, List, Optional

class SagaStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    COMPENSATING = "compensating"
    FAILED = "failed"

@dataclass
class SagaStep:
    name: str
    action: Callable
    compensate: Callable
    executed: bool = False

class SagaOrchestrator:
    """Orchestrate distributed transactions with compensation."""

    def __init__(self, saga_id: str, steps: List[SagaStep]):
        self.saga_id = saga_id
        self.steps = steps
        self.status = SagaStatus.PENDING
        self.current_step = 0
        self.error: Optional[Exception] = None

    async def execute(self, context: dict) -> dict:
        """Execute the saga, compensating on failure."""
        self.status = SagaStatus.RUNNING

        try:
            for i, step in enumerate(self.steps):
                self.current_step = i
                logger.info(f"Executing step: {step.name}")

                try:
                    result = await step.action(context)
                    context.update(result or {})
                    step.executed = True

                except Exception as e:
                    logger.error(f"Step {step.name} failed: {e}")
                    self.error = e
                    await self._compensate(context)
                    return {"status": "failed", "error": str(e)}

            self.status = SagaStatus.COMPLETED
            return {"status": "completed", "context": context}

        except Exception as e:
            self.status = SagaStatus.FAILED
            raise

    async def _compensate(self, context: dict):
        """Execute compensating transactions in reverse order."""
        self.status = SagaStatus.COMPENSATING
        logger.info("Starting compensation...")

        # Only compensate steps that were executed
        executed_steps = [s for s in self.steps if s.executed]

        for step in reversed(executed_steps):
            try:
                logger.info(f"Compensating: {step.name}")
                await step.compensate(context)
            except Exception as e:
                # Log but continue compensating
                logger.error(f"Compensation failed for {step.name}: {e}")


# Usage example
async def create_order_saga(order_data: dict) -> dict:
    steps = [
        SagaStep(
            name="create_order",
            action=lambda ctx: order_service.create(ctx["order_data"]),
            compensate=lambda ctx: order_service.cancel(ctx["order_id"])
        ),
        SagaStep(
            name="reserve_inventory",
            action=lambda ctx: inventory_service.reserve(ctx["order_id"], ctx["items"]),
            compensate=lambda ctx: inventory_service.release(ctx["order_id"])
        ),
        SagaStep(
            name="charge_payment",
            action=lambda ctx: payment_service.charge(ctx["order_id"], ctx["amount"]),
            compensate=lambda ctx: payment_service.refund(ctx["payment_id"])
        ),
        SagaStep(
            name="schedule_shipping",
            action=lambda ctx: shipping_service.schedule(ctx["order_id"]),
            compensate=lambda ctx: shipping_service.cancel(ctx["shipment_id"])
        ),
    ]

    saga = SagaOrchestrator(f"order-{uuid.uuid4()}", steps)
    return await saga.execute({"order_data": order_data})
```

### Key Lessons

1. **Design compensations first** - If you can't compensate, you can't saga
2. **Idempotency is crucial** - Actions and compensations may be retried
3. **Use correlation IDs** - Track the saga across all services
4. **Eventual consistency is okay** - Users can handle "processing" states

## Pattern 3: Circuit Breaker

### The Problem

One slow or failing service brings down the entire system.

### The Solution

Stop calling a failing service temporarily, allowing it to recover.

```
Circuit States:
┌──────────┐       failure threshold      ┌──────────┐
│  CLOSED  │ ─────────exceeded──────────► │   OPEN   │
│(normal)  │                              │(blocking)│
└──────────┘                              └────┬─────┘
     ▲                                         │
     │                                    timeout
     │              ┌──────────┐              │
     │              │HALF-OPEN │              │
     └──success─────│(testing) │◄─────────────┘
                    └──────────┘
                         │
                    failure
                         │
                         ▼
                    ┌──────────┐
                    │   OPEN   │
                    └──────────┘
```

### Implementation

```python
import time
from threading import Lock
from functools import wraps

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: int = 30,
        half_open_max_calls: int = 3
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.half_open_max_calls = half_open_max_calls

        self.failure_count = 0
        self.success_count = 0
        self.last_failure_time = 0
        self.state = "CLOSED"
        self._lock = Lock()

    def __call__(self, func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            return await self._call(func, *args, **kwargs)
        return wrapper

    async def _call(self, func, *args, **kwargs):
        with self._lock:
            if self.state == "OPEN":
                if time.time() - self.last_failure_time >= self.recovery_timeout:
                    self.state = "HALF-OPEN"
                    self.success_count = 0
                else:
                    raise CircuitOpenError("Circuit is open")

        try:
            result = await func(*args, **kwargs)

            with self._lock:
                if self.state == "HALF-OPEN":
                    self.success_count += 1
                    if self.success_count >= self.half_open_max_calls:
                        self._close()
                else:
                    self.failure_count = 0

            return result

        except Exception as e:
            with self._lock:
                self.failure_count += 1
                self.last_failure_time = time.time()

                if self.state == "HALF-OPEN" or self.failure_count >= self.failure_threshold:
                    self._open()

            raise

    def _open(self):
        self.state = "OPEN"
        logger.warning(f"Circuit opened after {self.failure_count} failures")

    def _close(self):
        self.state = "CLOSED"
        self.failure_count = 0
        logger.info("Circuit closed")


# Usage
circuit = CircuitBreaker(failure_threshold=5, recovery_timeout=30)

@circuit
async def call_inventory_service(order_id: str):
    return await inventory_client.check_stock(order_id)
```

## Pattern 4: Event-Driven Communication

### The Problem

Synchronous REST calls create tight coupling and cascade failures.

### The Solution

Use events for communication between services.

```
Synchronous (problematic):
OrderService ──REST──► InventoryService ──REST──► ShippingService
     │                        │                         │
     └────────────────────────┴─────────────────────────┘
          If any service is down, order fails

Asynchronous (resilient):
OrderService ──publish──► [Event Bus] ◄──subscribe── InventoryService
                              │
                              ├──subscribe── ShippingService
                              │
                              └──subscribe── NotificationService

    Services are decoupled, can process at their own pace
```

### Implementation

```python
from abc import ABC, abstractmethod
from typing import Dict, List, Callable
import json

class Event:
    def __init__(self, event_type: str, payload: dict, metadata: dict = None):
        self.event_type = event_type
        self.payload = payload
        self.metadata = metadata or {}
        self.timestamp = datetime.utcnow().isoformat()
        self.event_id = str(uuid.uuid4())

class EventBus(ABC):
    @abstractmethod
    async def publish(self, event: Event): pass

    @abstractmethod
    async def subscribe(self, event_type: str, handler: Callable): pass

class KafkaEventBus(EventBus):
    def __init__(self, bootstrap_servers: str):
        self.producer = AIOKafkaProducer(bootstrap_servers=bootstrap_servers)
        self.consumers: Dict[str, List[Callable]] = {}

    async def publish(self, event: Event):
        message = json.dumps({
            "event_id": event.event_id,
            "event_type": event.event_type,
            "payload": event.payload,
            "metadata": event.metadata,
            "timestamp": event.timestamp
        })

        await self.producer.send(
            event.event_type,
            message.encode('utf-8'),
            key=event.metadata.get("correlation_id", "").encode()
        )

    async def subscribe(self, event_type: str, handler: Callable):
        if event_type not in self.consumers:
            self.consumers[event_type] = []
        self.consumers[event_type].append(handler)


# Event handlers in different services
class InventoryService:
    def __init__(self, event_bus: EventBus):
        self.event_bus = event_bus

    async def start(self):
        await self.event_bus.subscribe("OrderCreated", self.handle_order_created)

    async def handle_order_created(self, event: Event):
        order_id = event.payload["order_id"]
        items = event.payload["items"]

        try:
            reservation = await self.reserve_inventory(order_id, items)

            # Publish success event
            await self.event_bus.publish(Event(
                event_type="InventoryReserved",
                payload={"order_id": order_id, "reservation_id": reservation.id},
                metadata={"correlation_id": event.metadata.get("correlation_id")}
            ))

        except InsufficientInventoryError as e:
            # Publish failure event
            await self.event_bus.publish(Event(
                event_type="InventoryReservationFailed",
                payload={"order_id": order_id, "reason": str(e)},
                metadata={"correlation_id": event.metadata.get("correlation_id")}
            ))
```

## Pattern 5: API Gateway

### The Problem

Clients need to call multiple services, handle authentication, rate limiting, etc.

### The Solution

A single entry point that handles cross-cutting concerns.

```python
from fastapi import FastAPI, Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class APIGateway:
    def __init__(self):
        self.app = FastAPI()
        self.service_registry = ServiceRegistry()

        # Add middleware
        self.app.add_middleware(AuthMiddleware)
        self.app.add_middleware(RateLimitMiddleware)
        self.app.add_middleware(LoggingMiddleware)
        self.app.add_middleware(CircuitBreakerMiddleware)

        self._setup_routes()

    def _setup_routes(self):
        @self.app.api_route("/{service}/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
        async def route_request(request: Request, service: str, path: str):
            # Get service URL from registry
            service_url = self.service_registry.get(service)
            if not service_url:
                raise HTTPException(status_code=404, detail=f"Service {service} not found")

            # Forward request
            response = await self._forward_request(request, service_url, path)
            return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, redis_client, requests_per_minute: int = 100):
        super().__init__(app)
        self.redis = redis_client
        self.rpm = requests_per_minute

    async def dispatch(self, request: Request, call_next):
        client_id = self._get_client_id(request)
        key = f"rate_limit:{client_id}:{int(time.time() / 60)}"

        current = await self.redis.incr(key)
        if current == 1:
            await self.redis.expire(key, 60)

        if current > self.rpm:
            raise HTTPException(
                status_code=429,
                detail="Rate limit exceeded",
                headers={"Retry-After": "60"}
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Remaining"] = str(self.rpm - current)
        return response
```

## Summary: The Enterprise Microservices Checklist

### Architecture
- [ ] API Gateway for all external traffic
- [ ] Service mesh for internal communication
- [ ] Event-driven for async operations
- [ ] Sagas for distributed transactions

### Resilience
- [ ] Circuit breakers on all external calls
- [ ] Retries with exponential backoff
- [ ] Timeouts on all operations
- [ ] Fallbacks for degraded operation

### Observability
- [ ] Distributed tracing (Jaeger, Zipkin)
- [ ] Centralized logging (ELK, Splunk)
- [ ] Metrics and dashboards (Prometheus, Grafana)
- [ ] Alerting on SLOs

### Security
- [ ] Zero-trust networking
- [ ] Service-to-service authentication
- [ ] Secrets management
- [ ] Regular security audits

### Operations
- [ ] Automated deployments
- [ ] Feature flags for rollouts
- [ ] Canary deployments
- [ ] Automated rollbacks

## Conclusion

Microservices aren't inherently better than monoliths. They're a trade-off:

**You get:**
- Independent deployability
- Technology flexibility
- Team autonomy
- Scaling granularity

**You pay with:**
- Distributed systems complexity
- Network reliability challenges
- Operational overhead
- Testing difficulty

Choose microservices when the benefits outweigh the costs for your specific situation.

---

*Want to discuss microservices architecture? Connect on [LinkedIn](https://linkedin.com/in/mishrapunit).*
