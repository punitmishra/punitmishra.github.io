# Scaling Vector Search: From Prototype to Production

*HNSW, IVF, and product quantization — engineering for billions of vectors*

---

Vector search has become the backbone of modern AI applications—from semantic search to recommendation systems to RAG pipelines. But scaling from a demo with 10K vectors to production with billions requires fundamental architectural changes.

## Understanding the Scale Problem

At small scale, brute-force cosine similarity works fine:

```python
# Works for ~100K vectors
def naive_search(query_embedding, all_embeddings, k=10):
    similarities = cosine_similarity(query_embedding, all_embeddings)
    top_k_indices = np.argsort(similarities)[-k:][::-1]
    return top_k_indices
```

But at 1 billion vectors, this becomes computationally infeasible. You need approximate nearest neighbor (ANN) algorithms.

## Indexing Strategies

### HNSW (Hierarchical Navigable Small World)

HNSW provides excellent query performance with reasonable memory overhead:

```python
import hnswlib

# Build HNSW index
index = hnswlib.Index(space='cosine', dim=768)
index.init_index(max_elements=1_000_000, ef_construction=200, M=16)
index.add_items(embeddings, ids)

# Query
index.set_ef(100)  # Higher = more accurate, slower
labels, distances = index.knn_query(query_embedding, k=10)
```

Key parameters:
- `M` — number of connections per layer (higher = more accurate, more memory)
- `ef_construction` — search width during build (higher = better index, slower build)
- `ef` — search width during query (higher = more accurate, slower query)

### IVF (Inverted File Index)

IVF partitions the vector space into clusters:

```python
import faiss

# Build IVF index with 1024 clusters
nlist = 1024
quantizer = faiss.IndexFlatIP(dimension)
index = faiss.IndexIVFFlat(quantizer, dimension, nlist)
index.train(training_vectors)  # Needs representative sample
index.add(all_vectors)

# Query - only search nprobe clusters
index.nprobe = 32
distances, indices = index.search(query, k=10)
```

### Product Quantization for Memory Efficiency

For billion-scale with limited memory, PQ compresses vectors:

```python
# 768-dim vectors compressed to 96 bytes each
index = faiss.IndexIVFPQ(quantizer, 768, nlist, 96, 8)
# 8x memory reduction with ~95% recall
```

## Architecture for Scale

### Sharding Strategy

Key decisions:
- **Shard by hash** — uniform distribution, but no locality
- **Shard by cluster** — better locality, potential hot spots
- **Hybrid** — hash for distribution, local clustering within shards

### Caching Strategy

Embedding computation is expensive. Cache aggressively:

```python
class EmbeddingCache:
    def __init__(self, redis_client, model):
        self.cache = redis_client
        self.model = model

    async def get_embedding(self, text: str) -> np.ndarray:
        cache_key = f"emb:{hash(text)}"

        cached = await self.cache.get(cache_key)
        if cached:
            return np.frombuffer(cached, dtype=np.float32)

        embedding = self.model.encode(text)
        await self.cache.setex(cache_key, 3600, embedding.tobytes())
        return embedding
```

## Production Considerations

### Index Updates

Handling real-time updates with ANN indexes is tricky:

```python
class VectorIndex:
    def __init__(self):
        self.main_index = load_hnsw_index()  # Immutable, rebuilt periodically
        self.buffer_index = hnswlib.Index()   # Small, for recent additions
        self.delete_set = set()               # Soft deletes

    def search(self, query, k):
        # Search both indexes
        main_results = self.main_index.knn_query(query, k * 2)
        buffer_results = self.buffer_index.knn_query(query, k)

        # Merge and filter deletes
        all_results = merge(main_results, buffer_results)
        return [r for r in all_results if r.id not in self.delete_set][:k]

    def rebuild(self):
        # Periodically merge buffer into main index
        new_index = build_index(self.get_all_vectors())
        self.main_index = new_index
        self.buffer_index = hnswlib.Index()
        self.delete_set = set()
```

### Monitoring

Track these metrics:

- **Recall@K** — are you finding the true nearest neighbors?
- **Query latency** — p50, p95, p99
- **Index size** — memory usage and disk footprint
- **Update latency** — time to index new vectors

## Cost Optimization

Vector search infrastructure can be expensive. Strategies:

1. **Quantization** — 4x-8x memory reduction with PQ
2. **Tiered storage** — hot data in memory, cold on SSD
3. **Dimension reduction** — project to 256-384 dims if possible
4. **Batch queries** — amortize overhead

## Lessons Learned

1. **Start with HNSW** — it's the best general-purpose choice
2. **Measure recall** — approximate search can silently degrade
3. **Plan for updates** — immutable indexes are simpler but limiting
4. **Cache embeddings** — model inference is often the bottleneck
5. **Test at scale early** — performance characteristics change dramatically

Vector search at scale is more about systems engineering than ML. Get the fundamentals right, and you'll have a solid foundation for building powerful AI applications.

---

*Originally published at [punitmishra.github.io](https://punitmishra.github.io/blog/vector-databases-scale)*
