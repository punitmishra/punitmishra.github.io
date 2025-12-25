---
title: "Distributed Systems: Hard Lessons from Production"
date: "2024-12-18"
category: "Technical"
tags: ["Distributed Systems", "Architecture", "Resilience", "Scale"]
readTime: "11 min read"
---

After a decade of building distributed systems serving millions of requests, I've accumulated a collection of lessons learned the hard way. These aren't theoretical concerns—they're battle scars from production incidents.

## The Eight Fallacies Are Real

Every distributed systems course mentions the Eight Fallacies of Distributed Computing. Let me tell you how each one has personally bitten me.

### 1. "The Network Is Reliable"

```python
# What I wrote
response = requests.post(api_url, json=data)
return response.json()

# What I should have written
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    retry=retry_if_exception_type((RequestException, Timeout))
)
def make_request(url: str, data: dict) -> dict:
    response = requests.post(
        url,
        json=data,
        timeout=(3.05, 27)  # (connect, read) timeouts
    )
    response.raise_for_status()
    return response.json()
```

**Incident**: A network blip caused our payment service to fail silently. 2,000 orders processed without payment confirmations. Lesson: Always retry, always timeout, always have fallbacks.

### 2. "Latency Is Zero"

```python
# Distributed cache with latency-aware fallback
class LatencyAwareCache:
    def __init__(self, redis_client, local_cache, latency_threshold_ms=50):
        self.redis = redis_client
        self.local = local_cache
        self.threshold = latency_threshold_ms
        self.latency_window = []

    async def get(self, key: str) -> Optional[str]:
        # Check local cache first (always fast)
        if value := self.local.get(key):
            return value

        # Check Redis with latency tracking
        start = time.monotonic()
        try:
            value = await asyncio.wait_for(
                self.redis.get(key),
                timeout=self.threshold / 1000
            )
            latency = (time.monotonic() - start) * 1000
            self._record_latency(latency)

            if value:
                self.local.set(key, value, ttl=60)
            return value

        except asyncio.TimeoutError:
            self._record_latency(self.threshold)
            # Fall back to slower but reliable source
            return await self._fallback_get(key)

    def _record_latency(self, latency_ms: float):
        self.latency_window.append(latency_ms)
        if len(self.latency_window) > 100:
            self.latency_window.pop(0)

    def _should_bypass_redis(self) -> bool:
        if len(self.latency_window) < 10:
            return False
        avg_latency = sum(self.latency_window) / len(self.latency_window)
        return avg_latency > self.threshold * 0.8
```

## Consensus Is Expensive

I learned this building a distributed lock service:

```python
# Naive approach: call consensus for everything
async def acquire_lock(key: str) -> bool:
    # 3 round trips minimum for Raft consensus
    return await raft_cluster.propose(LockAcquire(key))

# Better: lease-based with local validation
class LeaseBasedLock:
    def __init__(self, raft_cluster, lease_duration=30):
        self.cluster = raft_cluster
        self.lease_duration = lease_duration
        self.local_leases = {}

    async def acquire(self, key: str, holder_id: str) -> bool:
        # Check local cache first
        if lease := self.local_leases.get(key):
            if lease.holder == holder_id and not lease.expired:
                return True
            if not lease.expired:
                return False

        # Only go to consensus when necessary
        lease = await self.cluster.propose(
            LeaseAcquire(key, holder_id, self.lease_duration)
        )

        if lease.granted:
            self.local_leases[key] = lease
            # Background renewal
            asyncio.create_task(self._renew_lease(key, holder_id))

        return lease.granted

    async def _renew_lease(self, key: str, holder_id: str):
        while True:
            await asyncio.sleep(self.lease_duration * 0.7)
            try:
                await self.cluster.propose(
                    LeaseRenew(key, holder_id)
                )
            except LeaseExpired:
                del self.local_leases[key]
                break
```

## Partial Failures Are the Norm

The hardest distributed systems bugs involve partial failures—some nodes succeed, some fail.

```python
from dataclasses import dataclass
from enum import Enum
from typing import List, Dict

class OperationStatus(Enum):
    SUCCESS = "success"
    FAILED = "failed"
    TIMEOUT = "timeout"
    UNKNOWN = "unknown"  # The dangerous one

@dataclass
class PartialResult:
    node: str
    status: OperationStatus
    result: Optional[any]
    error: Optional[str]

class DistributedOperation:
    def __init__(self, nodes: List[str], quorum: int):
        self.nodes = nodes
        self.quorum = quorum

    async def execute_with_quorum(
        self,
        operation: Callable,
        rollback: Callable
    ) -> tuple[bool, List[PartialResult]]:
        """Execute operation with quorum semantics and rollback."""

        results = []
        successes = []

        # Phase 1: Execute on all nodes
        tasks = [
            self._execute_on_node(node, operation)
            for node in self.nodes
        ]

        for coro in asyncio.as_completed(tasks):
            result = await coro
            results.append(result)

            if result.status == OperationStatus.SUCCESS:
                successes.append(result.node)

            # Early success if quorum reached
            if len(successes) >= self.quorum:
                # Wait briefly for stragglers, but don't block
                await asyncio.sleep(0.1)
                break

        # Phase 2: Handle partial failures
        if len(successes) >= self.quorum:
            # Success! But roll back failed nodes for consistency
            failed_nodes = [
                r.node for r in results
                if r.status != OperationStatus.SUCCESS
            ]
            await self._rollback_nodes(failed_nodes, rollback)
            return True, results

        else:
            # Failed to reach quorum - rollback ALL
            await self._rollback_nodes(
                [r.node for r in results if r.status == OperationStatus.SUCCESS],
                rollback
            )
            return False, results

    async def _execute_on_node(
        self,
        node: str,
        operation: Callable
    ) -> PartialResult:
        try:
            result = await asyncio.wait_for(
                operation(node),
                timeout=5.0
            )
            return PartialResult(node, OperationStatus.SUCCESS, result, None)

        except asyncio.TimeoutError:
            return PartialResult(node, OperationStatus.TIMEOUT, None, "Timeout")

        except Exception as e:
            return PartialResult(node, OperationStatus.FAILED, None, str(e))
```

## The Clock Problem

Distributed time is a nightmare. Here's what actually works:

```python
from dataclasses import dataclass
import uuid

@dataclass
class HybridTimestamp:
    """Hybrid Logical Clock implementation."""
    physical: int  # milliseconds since epoch
    logical: int   # logical counter
    node_id: str

    def __lt__(self, other: 'HybridTimestamp') -> bool:
        if self.physical != other.physical:
            return self.physical < other.physical
        if self.logical != other.logical:
            return self.logical < other.logical
        return self.node_id < other.node_id

    def encode(self) -> str:
        return f"{self.physical:016x}-{self.logical:08x}-{self.node_id}"

class HybridClock:
    def __init__(self, node_id: str = None):
        self.node_id = node_id or str(uuid.uuid4())[:8]
        self.last_physical = 0
        self.logical = 0
        self.lock = asyncio.Lock()

    async def now(self) -> HybridTimestamp:
        async with self.lock:
            physical = int(time.time() * 1000)

            if physical > self.last_physical:
                self.last_physical = physical
                self.logical = 0
            else:
                self.logical += 1

            return HybridTimestamp(
                self.last_physical,
                self.logical,
                self.node_id
            )

    async def update(self, received: HybridTimestamp) -> HybridTimestamp:
        """Update clock based on received timestamp."""
        async with self.lock:
            physical = int(time.time() * 1000)

            if physical > self.last_physical and physical > received.physical:
                self.last_physical = physical
                self.logical = 0
            elif received.physical > self.last_physical:
                self.last_physical = received.physical
                self.logical = received.logical + 1
            else:
                self.logical = max(self.logical, received.logical) + 1

            return HybridTimestamp(
                self.last_physical,
                self.logical,
                self.node_id
            )
```

## Circuit Breakers: Not Optional

Every external call needs a circuit breaker:

```python
from enum import Enum
from dataclasses import dataclass, field
from typing import Callable, Optional
import time

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing recovery

@dataclass
class CircuitBreaker:
    name: str
    failure_threshold: int = 5
    recovery_timeout: float = 30.0
    half_open_requests: int = 3

    state: CircuitState = field(default=CircuitState.CLOSED)
    failures: int = field(default=0)
    successes: int = field(default=0)
    last_failure_time: float = field(default=0)
    half_open_successes: int = field(default=0)

    async def call(
        self,
        func: Callable,
        *args,
        fallback: Optional[Callable] = None,
        **kwargs
    ):
        if not self._should_allow_request():
            if fallback:
                return await fallback(*args, **kwargs)
            raise CircuitOpenError(f"Circuit {self.name} is open")

        try:
            result = await func(*args, **kwargs)
            self._record_success()
            return result

        except Exception as e:
            self._record_failure()
            if fallback:
                return await fallback(*args, **kwargs)
            raise

    def _should_allow_request(self) -> bool:
        if self.state == CircuitState.CLOSED:
            return True

        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                self.half_open_successes = 0
                return True
            return False

        # Half open: allow limited requests
        return self.half_open_successes < self.half_open_requests

    def _record_success(self):
        if self.state == CircuitState.HALF_OPEN:
            self.half_open_successes += 1
            if self.half_open_successes >= self.half_open_requests:
                self.state = CircuitState.CLOSED
                self.failures = 0

        self.successes += 1

    def _record_failure(self):
        self.failures += 1
        self.last_failure_time = time.time()

        if self.state == CircuitState.HALF_OPEN:
            self.state = CircuitState.OPEN
        elif self.failures >= self.failure_threshold:
            self.state = CircuitState.OPEN
```

## Idempotency: The Hidden Requirement

Every operation that matters must be idempotent:

```python
from hashlib import sha256
import json

class IdempotentOperationHandler:
    def __init__(self, redis_client, ttl: int = 3600):
        self.redis = redis_client
        self.ttl = ttl

    async def execute(
        self,
        idempotency_key: str,
        operation: Callable,
        *args,
        **kwargs
    ) -> tuple[any, bool]:
        """Execute operation idempotently."""

        # Check for existing result
        cache_key = f"idempotent:{idempotency_key}"
        cached = await self.redis.get(cache_key)

        if cached:
            result = json.loads(cached)
            return result["value"], True  # True = was cached

        # Execute operation
        try:
            result = await operation(*args, **kwargs)

            # Cache result
            await self.redis.setex(
                cache_key,
                self.ttl,
                json.dumps({"value": result, "status": "success"})
            )

            return result, False

        except Exception as e:
            # Cache failure too (prevents retry storms)
            await self.redis.setex(
                cache_key,
                self.ttl // 10,  # Shorter TTL for failures
                json.dumps({"error": str(e), "status": "failed"})
            )
            raise

    @staticmethod
    def generate_key(*args) -> str:
        """Generate deterministic idempotency key."""
        content = json.dumps(args, sort_keys=True)
        return sha256(content.encode()).hexdigest()[:16]
```

## Key Lessons

1. **Everything fails** - Design for failure from day one
2. **Timeouts everywhere** - No operation should wait forever
3. **Idempotency is mandatory** - Retries are inevitable
4. **Partial success is the norm** - Handle it explicitly
5. **Distributed time is hard** - Use logical clocks when ordering matters
6. **Circuit breakers save systems** - Fail fast, recover gracefully

These patterns have saved my systems countless times. The code above is battle-tested and production-ready. Use it as a starting point, then adapt to your specific failure modes.
