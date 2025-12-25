---
title: "Vector Search at Scale: Building Production-Ready Systems with CLIP Embeddings"
date: "2024-10-20"
author: "Punit Mishra"
category: "Technical"
tags: ["Vector Search", "CLIP", "FAISS", "ML", "Scale"]
readTime: "20 min"
featured: true
---

# Vector Search at Scale: Building Production-Ready Systems with CLIP Embeddings

> How we built a vector search engine handling 50 million images with sub-100ms query times.

## The Challenge

At SAP's CX Intelligence team, we needed to build a visual search system that could:

- Index **50+ million product images**
- Return results in **under 100ms**
- Handle **10,000 queries per second**
- Support **real-time index updates**
- Run on a **reasonable budget**

This article shares the architecture, optimizations, and lessons learned.

## Understanding the Problem Space

Visual search is fundamentally a **nearest neighbor** problem in high-dimensional space. The pipeline looks like:

```
Query Image → CLIP Encoder → 512-d Vector → FAISS Index → Top-K Results
                    ↓
              Cached Embeddings (50M vectors × 512 dimensions)
```

The math is simple: 50M × 512 × 4 bytes = **100GB of vectors** just for storage, plus index overhead.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer                            │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │  Query Pod  │ │  Query Pod  │ │  Query Pod  │
       │  (GPU)      │ │  (GPU)      │ │  (GPU)      │
       └─────────────┘ └─────────────┘ └─────────────┘
              │               │               │
              ▼               ▼               ▼
       ┌─────────────────────────────────────────────────────┐
       │              FAISS Index Shards                      │
       │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
       │  │ Shard 0 │ │ Shard 1 │ │ Shard 2 │ │ Shard 3 │   │
       │  │ 12.5M   │ │ 12.5M   │ │ 12.5M   │ │ 12.5M   │   │
       │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
       └─────────────────────────────────────────────────────┘
              │
              ▼
       ┌─────────────────────────────────────────────────────┐
       │              Redis Cluster (Metadata)                │
       └─────────────────────────────────────────────────────┘
```

## Component Deep Dive

### 1. CLIP Encoding Layer

We use OpenAI's CLIP model for generating embeddings. The key optimization is **batching**:

```python
import torch
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
import numpy as np

class CLIPEncoder:
    def __init__(self, model_name: str = "openai/clip-vit-base-patch32"):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = CLIPModel.from_pretrained(model_name).to(self.device)
        self.processor = CLIPProcessor.from_pretrained(model_name)
        self.model.eval()

        # Enable TensorRT optimization if available
        if torch.cuda.is_available():
            self.model = torch.compile(self.model, mode="max-autotune")

    @torch.no_grad()
    def encode_images(
        self,
        images: list[Image.Image],
        batch_size: int = 64
    ) -> np.ndarray:
        """Encode images to CLIP embeddings with batching."""
        all_embeddings = []

        for i in range(0, len(images), batch_size):
            batch = images[i:i + batch_size]

            # Preprocess
            inputs = self.processor(
                images=batch,
                return_tensors="pt",
                padding=True
            ).to(self.device)

            # Forward pass
            outputs = self.model.get_image_features(**inputs)

            # Normalize embeddings
            embeddings = outputs / outputs.norm(dim=-1, keepdim=True)
            all_embeddings.append(embeddings.cpu().numpy())

        return np.vstack(all_embeddings)

    @torch.no_grad()
    def encode_text(self, texts: list[str]) -> np.ndarray:
        """Encode text queries to CLIP embeddings."""
        inputs = self.processor(
            text=texts,
            return_tensors="pt",
            padding=True,
            truncation=True
        ).to(self.device)

        outputs = self.model.get_text_features(**inputs)
        embeddings = outputs / outputs.norm(dim=-1, keepdim=True)

        return embeddings.cpu().numpy()
```

### 2. FAISS Index Strategy

Choosing the right FAISS index is critical. Here's our decision matrix:

| Index Type | Build Time | Query Time | Memory | Recall@10 |
|------------|------------|------------|--------|-----------|
| Flat | 1x | 1x (slow) | 100GB | 100% |
| IVF4096,Flat | 10x | 50x faster | 105GB | 98% |
| IVF4096,PQ32 | 15x | 100x faster | 25GB | 92% |
| HNSW32 | 20x | 80x faster | 150GB | 99% |
| IVF4096,PQ32 + OPQ | 20x | 100x faster | 25GB | 95% |

We chose **IVF4096,PQ32 with OPQ** for the best balance of recall, speed, and memory:

```python
import faiss
import numpy as np

class VectorSearchIndex:
    def __init__(
        self,
        dimension: int = 512,
        n_list: int = 4096,
        n_subquantizers: int = 32,
        n_bits: int = 8
    ):
        self.dimension = dimension
        self.n_list = n_list

        # Create OPQ transform + IVF + PQ index
        self.index = faiss.index_factory(
            dimension,
            f"OPQ{n_subquantizers},IVF{n_list},PQ{n_subquantizers}x{n_bits}",
            faiss.METRIC_INNER_PRODUCT  # Cosine similarity for normalized vectors
        )

        # Training parameters
        self.trained = False

    def train(self, training_vectors: np.ndarray):
        """Train the index on a representative sample."""
        print(f"Training index on {len(training_vectors)} vectors...")

        # Use GPU for training if available
        if faiss.get_num_gpus() > 0:
            gpu_resources = faiss.StandardGpuResources()
            gpu_index = faiss.index_cpu_to_gpu(gpu_resources, 0, self.index)
            gpu_index.train(training_vectors)
            self.index = faiss.index_gpu_to_cpu(gpu_index)
        else:
            self.index.train(training_vectors)

        self.trained = True
        print("Training complete!")

    def add(self, vectors: np.ndarray, ids: np.ndarray = None):
        """Add vectors to the index."""
        if not self.trained:
            raise ValueError("Index must be trained before adding vectors")

        if ids is not None:
            # Use IndexIDMap for custom IDs
            self.index = faiss.IndexIDMap(self.index)
            self.index.add_with_ids(vectors, ids)
        else:
            self.index.add(vectors)

    def search(
        self,
        query_vectors: np.ndarray,
        k: int = 10,
        n_probe: int = 64
    ) -> tuple[np.ndarray, np.ndarray]:
        """Search for nearest neighbors."""
        # Set search parameters
        self.index.nprobe = n_probe

        distances, indices = self.index.search(query_vectors, k)
        return distances, indices

    def save(self, path: str):
        """Save index to disk."""
        faiss.write_index(self.index, path)

    @classmethod
    def load(cls, path: str) -> 'VectorSearchIndex':
        """Load index from disk."""
        instance = cls.__new__(cls)
        instance.index = faiss.read_index(path)
        instance.trained = True
        return instance
```

### 3. Sharding Strategy

With 50M vectors, a single index becomes unwieldy. We shard by:

```python
import hashlib
from typing import List, Tuple
from concurrent.futures import ThreadPoolExecutor

class ShardedVectorIndex:
    def __init__(self, n_shards: int = 4, base_path: str = "/data/index"):
        self.n_shards = n_shards
        self.shards: List[VectorSearchIndex] = []
        self.base_path = base_path

        # Load or create shards
        for i in range(n_shards):
            shard_path = f"{base_path}/shard_{i}.index"
            try:
                shard = VectorSearchIndex.load(shard_path)
            except FileNotFoundError:
                shard = VectorSearchIndex()
            self.shards.append(shard)

    def _get_shard_id(self, item_id: str) -> int:
        """Consistent hashing for shard assignment."""
        hash_value = int(hashlib.md5(item_id.encode()).hexdigest(), 16)
        return hash_value % self.n_shards

    def add(self, item_id: str, vector: np.ndarray):
        """Add a single vector to the appropriate shard."""
        shard_id = self._get_shard_id(item_id)
        self.shards[shard_id].add(
            vector.reshape(1, -1),
            np.array([hash(item_id)])
        )

    def search(
        self,
        query_vector: np.ndarray,
        k: int = 10,
        n_probe: int = 64
    ) -> List[Tuple[str, float]]:
        """Search across all shards in parallel."""

        def search_shard(shard: VectorSearchIndex) -> Tuple[np.ndarray, np.ndarray]:
            return shard.search(query_vector.reshape(1, -1), k * 2, n_probe)

        # Parallel search across shards
        with ThreadPoolExecutor(max_workers=self.n_shards) as executor:
            results = list(executor.map(search_shard, self.shards))

        # Merge results
        all_distances = np.concatenate([r[0] for r in results], axis=1)
        all_indices = np.concatenate([r[1] for r in results], axis=1)

        # Sort by distance and take top k
        sorted_idx = np.argsort(all_distances[0])[::-1][:k]

        return [
            (int(all_indices[0][i]), float(all_distances[0][i]))
            for i in sorted_idx
        ]
```

### 4. Real-Time Index Updates

E-commerce catalogs change constantly. We use a **two-tier index** approach:

```python
class HybridVectorIndex:
    """Combines a static bulk index with a dynamic update index."""

    def __init__(self, bulk_index_path: str, update_capacity: int = 100000):
        # Large, pre-built index for bulk data
        self.bulk_index = VectorSearchIndex.load(bulk_index_path)

        # Smaller, flat index for recent updates (faster to rebuild)
        self.update_index = faiss.IndexFlatIP(512)
        self.update_ids: List[int] = []
        self.update_capacity = update_capacity

        # Track deletions
        self.deleted_ids: Set[int] = set()

        # Lock for thread safety
        self._lock = threading.RLock()

    def add_or_update(self, item_id: int, vector: np.ndarray):
        """Add or update a vector in real-time."""
        with self._lock:
            # Mark old version as deleted if exists
            if item_id in self.update_ids:
                self.deleted_ids.add(item_id)

            # Add to update index
            self.update_index.add(vector.reshape(1, -1))
            self.update_ids.append(item_id)

            # Compact if update index is full
            if len(self.update_ids) >= self.update_capacity:
                self._compact()

    def delete(self, item_id: int):
        """Mark an item as deleted."""
        with self._lock:
            self.deleted_ids.add(item_id)

    def search(
        self,
        query_vector: np.ndarray,
        k: int = 10
    ) -> List[Tuple[int, float]]:
        """Search both indices and merge results."""
        query = query_vector.reshape(1, -1)

        # Search bulk index
        bulk_distances, bulk_indices = self.bulk_index.search(query, k * 2)

        # Search update index
        if self.update_index.ntotal > 0:
            update_distances, update_indices = self.update_index.search(query, k * 2)
            # Map back to actual IDs
            update_ids = [self.update_ids[i] for i in update_indices[0] if i >= 0]
        else:
            update_distances = np.array([[]])
            update_ids = []

        # Merge and filter deleted
        results = []

        for idx, dist in zip(bulk_indices[0], bulk_distances[0]):
            if idx >= 0 and idx not in self.deleted_ids:
                results.append((int(idx), float(dist)))

        for idx, dist in zip(update_ids, update_distances[0]):
            if idx not in self.deleted_ids:
                results.append((int(idx), float(dist)))

        # Sort and deduplicate
        seen = set()
        unique_results = []
        for item_id, dist in sorted(results, key=lambda x: -x[1]):
            if item_id not in seen:
                seen.add(item_id)
                unique_results.append((item_id, dist))
                if len(unique_results) >= k:
                    break

        return unique_results

    def _compact(self):
        """Merge update index into bulk index (run periodically)."""
        # In practice, this would trigger a background rebuild
        logger.info("Update index compaction triggered")
```

## Performance Optimizations

### 1. GPU Acceleration

Moving the search to GPU provides 10-20x speedup:

```python
def create_gpu_index(cpu_index: faiss.Index) -> faiss.Index:
    """Convert CPU index to GPU index."""
    n_gpus = faiss.get_num_gpus()

    if n_gpus == 0:
        return cpu_index

    if n_gpus == 1:
        res = faiss.StandardGpuResources()
        return faiss.index_cpu_to_gpu(res, 0, cpu_index)

    # Multi-GPU sharding
    return faiss.index_cpu_to_all_gpus(cpu_index)
```

### 2. Query Batching

Batching queries amortizes the fixed costs:

```python
import asyncio
from collections import deque
from dataclasses import dataclass
from typing import Callable

@dataclass
class PendingQuery:
    vector: np.ndarray
    k: int
    future: asyncio.Future

class QueryBatcher:
    """Batch queries for efficient GPU utilization."""

    def __init__(
        self,
        search_fn: Callable,
        max_batch_size: int = 128,
        max_wait_ms: float = 5.0
    ):
        self.search_fn = search_fn
        self.max_batch_size = max_batch_size
        self.max_wait_ms = max_wait_ms
        self.pending: deque[PendingQuery] = deque()
        self._lock = asyncio.Lock()
        self._batch_task = None

    async def search(self, vector: np.ndarray, k: int = 10) -> List[Tuple[int, float]]:
        """Submit a query and wait for results."""
        future = asyncio.get_event_loop().create_future()
        query = PendingQuery(vector=vector, k=k, future=future)

        async with self._lock:
            self.pending.append(query)

            # Start batch processing if not already running
            if self._batch_task is None or self._batch_task.done():
                self._batch_task = asyncio.create_task(self._process_batch())

        return await future

    async def _process_batch(self):
        """Process accumulated queries as a batch."""
        await asyncio.sleep(self.max_wait_ms / 1000)

        async with self._lock:
            if not self.pending:
                return

            # Collect batch
            batch = []
            while self.pending and len(batch) < self.max_batch_size:
                batch.append(self.pending.popleft())

        if not batch:
            return

        # Execute batch search
        vectors = np.vstack([q.vector for q in batch])
        max_k = max(q.k for q in batch)

        try:
            distances, indices = self.search_fn(vectors, max_k)

            # Distribute results
            for i, query in enumerate(batch):
                results = [
                    (int(indices[i][j]), float(distances[i][j]))
                    for j in range(query.k)
                    if indices[i][j] >= 0
                ]
                query.future.set_result(results)

        except Exception as e:
            for query in batch:
                query.future.set_exception(e)
```

### 3. Embedding Cache

Cache frequently queried embeddings:

```python
from functools import lru_cache
import redis

class EmbeddingCache:
    def __init__(self, redis_client: redis.Redis, encoder: CLIPEncoder):
        self.redis = redis_client
        self.encoder = encoder
        self.ttl = 3600 * 24  # 24 hours

    async def get_embedding(self, image_url: str) -> np.ndarray:
        """Get embedding from cache or compute."""
        cache_key = f"embedding:{hashlib.sha256(image_url.encode()).hexdigest()}"

        # Try cache
        cached = await self.redis.get(cache_key)
        if cached:
            return np.frombuffer(cached, dtype=np.float32)

        # Compute
        image = await self._download_image(image_url)
        embedding = self.encoder.encode_images([image])[0]

        # Cache
        await self.redis.setex(
            cache_key,
            self.ttl,
            embedding.tobytes()
        )

        return embedding
```

## Production Metrics

After 6 months in production:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Metric                  │ Target    │ Actual    │ Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P50 Latency             │ < 50ms    │ 28ms      │ ✅
P99 Latency             │ < 100ms   │ 72ms      │ ✅
Queries/Second          │ 10,000    │ 14,500    │ ✅
Recall@10               │ > 90%     │ 94.2%     │ ✅
Index Size              │ < 50GB    │ 38GB      │ ✅
Monthly Cost            │ < $15K    │ $11,200   │ ✅
Uptime                  │ 99.9%     │ 99.97%    │ ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Lessons Learned

### 1. Start with Accuracy, Then Optimize Speed

We initially over-optimized for speed and sacrificed too much recall. The right order:
1. Get recall right (even if slow)
2. Measure carefully
3. Optimize incrementally

### 2. Monitoring is Critical

Key metrics to track:
- Query latency distribution (not just mean!)
- Recall vs ground truth (sample periodically)
- Index health (fragmentation, update lag)
- Cache hit rates

### 3. Plan for Growth

We built for 50M vectors but designed for 500M:
- Sharding from day one
- Horizontal scaling strategy
- Index rebuild automation

### 4. Test with Production Data

Synthetic benchmarks lie. Test with:
- Real query patterns
- Real image distributions
- Real update patterns

## Conclusion

Building vector search at scale requires careful attention to:
- **Index choice** - Balance recall, speed, and memory
- **Architecture** - Shard early, cache aggressively
- **Operations** - Monitor everything, automate rebuilds
- **Testing** - Use production data

The result: a system that handles 50M+ images with sub-100ms latency at reasonable cost.

---

*Questions about vector search? Connect on [LinkedIn](https://linkedin.com/in/mishrapunit) or [GitHub](https://github.com/punitmishra).*

## References

- [FAISS Wiki](https://github.com/facebookresearch/faiss/wiki)
- [CLIP Paper](https://arxiv.org/abs/2103.00020)
- [Billion-Scale ANN](http://big-ann-benchmarks.com/)
