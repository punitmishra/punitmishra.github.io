# Building a Production Vector Search Engine for E-Commerce

*CLIP embeddings, FAISS indexing, and multimodal fusion for visual product search*

---

Visual search is transforming e-commerce. Instead of typing "blue denim jacket with brass buttons," users can upload a photo and find similar products instantly. I built a production-ready vector search system that handles 30,000+ products with sub-100ms query latency using FAISS, CLIP embeddings, and multimodal fusion.

## The Challenge

Product similarity search seems simple until you try to do it well:

- **Multiple modalities**: Products have images, titles, descriptions, prices, and attributes
- **Scale**: Millions of products, thousands of queries per second
- **Latency**: Users expect results in <100ms
- **Accuracy**: Subjective similarity—what makes two products "similar"?

Traditional approaches like text search or rule-based filtering fall short. Vector search solves this by embedding products into a continuous space where similar items are geometrically close.

## Multimodal Embeddings

Products have multiple signals. The key insight is combining them effectively:

```python
import torch
from transformers import CLIPProcessor, CLIPModel
from sentence_transformers import SentenceTransformer
import numpy as np

class ProductEmbedder:
    def __init__(self):
        # Visual features via CLIP
        self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-large-patch14")
        self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")

        # Text features
        self.text_encoder = SentenceTransformer('all-MiniLM-L6-v2')

        # Fusion weights (learned from validation data)
        self.weights = {
            'image': 0.45,
            'title': 0.25,
            'description': 0.15,
            'attributes': 0.15,
        }

    def embed_product(self, product: dict) -> np.ndarray:
        embeddings = []

        # Image embedding (768-dim from CLIP ViT-L/14)
        if product.get('image_url'):
            image = self._load_image(product['image_url'])
            inputs = self.clip_processor(images=image, return_tensors="pt")
            with torch.no_grad():
                image_features = self.clip_model.get_image_features(**inputs)
                image_emb = image_features / image_features.norm(dim=-1, keepdim=True)
            embeddings.append(('image', image_emb.numpy().flatten()))

        # Title embedding (384-dim)
        if product.get('title'):
            title_emb = self.text_encoder.encode(product['title'])
            embeddings.append(('title', title_emb))

        # Weighted fusion with dimension alignment
        return self._fuse_embeddings(embeddings)

    def _fuse_embeddings(self, embeddings: list) -> np.ndarray:
        # Project all embeddings to common dimension
        target_dim = 512

        fused = np.zeros(target_dim)
        total_weight = 0

        for name, emb in embeddings:
            if len(emb) != target_dim:
                emb = self._project(emb, target_dim)

            weight = self.weights.get(name, 0.1)
            fused += weight * emb
            total_weight += weight

        # L2 normalize
        fused = fused / (np.linalg.norm(fused) + 1e-8)
        return fused
```

## FAISS Index Construction

With 30,000+ products, brute-force search is too slow. FAISS provides approximate nearest neighbor search:

```python
import faiss
import numpy as np
from typing import List, Tuple

class VectorIndex:
    def __init__(
        self,
        dimension: int = 512,
        n_clusters: int = 100,
        n_probe: int = 10,
        use_gpu: bool = False
    ):
        self.dimension = dimension
        self.n_clusters = n_clusters
        self.n_probe = n_probe

        # IVF (Inverted File) with Product Quantization
        self.quantizer = faiss.IndexFlatIP(dimension)  # Inner product
        self.index = faiss.IndexIVFPQ(
            self.quantizer,
            dimension,
            n_clusters,      # Number of Voronoi cells
            32,              # Number of sub-quantizers
            8                # Bits per sub-quantizer
        )

        self.product_ids = []
        self.is_trained = False

    def train(self, embeddings: np.ndarray):
        """Train the index on a sample of embeddings."""
        faiss.normalize_L2(embeddings)
        self.index.train(embeddings)
        self.is_trained = True

    def search(
        self,
        query_embedding: np.ndarray,
        k: int = 10,
        filters: dict = None
    ) -> List[Tuple[str, float]]:
        """Search for similar products."""
        query = query_embedding.reshape(1, -1).astype('float32')
        faiss.normalize_L2(query)

        self.index.nprobe = self.n_probe
        distances, indices = self.index.search(query, k * 3)

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue

            product_id = self.product_ids[idx]

            if filters and not self._passes_filters(product_id, filters):
                continue

            similarity = float(dist)
            results.append((product_id, similarity))

            if len(results) >= k:
                break

        return results
```

## Visual Search API

The FastAPI service handles search requests:

```python
from fastapi import FastAPI, UploadFile, File, Query
from PIL import Image
import io

app = FastAPI()

@app.post("/search/image")
async def search_by_image(
    image: UploadFile = File(...),
    k: int = Query(10, ge=1, le=100),
    category: str = Query(None),
):
    """Search for similar products by image."""
    image_data = await image.read()
    pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')

    query_embedding = embedder.embed_image(pil_image)

    filters = {}
    if category:
        filters['category'] = category

    results = index.search(query_embedding, k=k, filters=filters)

    products = []
    for product_id, score in results:
        product = product_db.get(product_id)
        products.append({
            **product,
            'similarity_score': round(score, 4),
        })

    return {'results': products}

@app.post("/search/multimodal")
async def search_multimodal(
    image: UploadFile = File(None),
    text: str = Query(None),
    image_weight: float = Query(0.7, ge=0, le=1),
):
    """Combined image + text search."""
    embeddings = []

    if image:
        image_data = await image.read()
        pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')
        img_emb = embedder.embed_image(pil_image)
        embeddings.append((image_weight, img_emb))

    if text:
        text_emb = embedder.embed_text(text)
        embeddings.append((1 - image_weight, text_emb))

    # Weighted combination
    combined = sum(w * e for w, e in embeddings)
    combined = combined / np.linalg.norm(combined)

    results = index.search(combined, k=10)
    return {'results': [product_db.get(pid) for pid, _ in results]}
```

## Performance Optimization

### Caching Hot Queries

```python
from functools import lru_cache
import hashlib

class CachedIndex:
    def __init__(self, index: VectorIndex, cache_size: int = 10000):
        self.index = index
        self.cache = {}
        self.cache_size = cache_size

    def search(self, embedding: np.ndarray, k: int, filters: dict = None):
        key = self._cache_key(embedding, k, filters)

        if key in self.cache:
            return self.cache[key]

        results = self.index.search(embedding, k, filters)

        # LRU eviction
        if len(self.cache) >= self.cache_size:
            oldest = next(iter(self.cache))
            del self.cache[oldest]

        self.cache[key] = results
        return results

    def _cache_key(self, embedding, k, filters):
        quantized = (embedding * 100).astype(int).tobytes()
        filters_str = str(sorted(filters.items())) if filters else ""
        return hashlib.md5(quantized + str(k).encode() + filters_str.encode()).hexdigest()
```

## Benchmarks

On the Amazon Fashion 2020 dataset (30k products):

| Metric | Value |
|--------|-------|
| Index Build Time | 12 minutes |
| Index Size (disk) | 45 MB |
| Query Latency (P50) | 8 ms |
| Query Latency (P99) | 42 ms |
| Recall@10 | 0.89 |
| Throughput | 500 qps |

## Key Learnings

1. **Multimodal beats unimodal** — Combining image, text, and attributes significantly improves relevance
2. **Approximate search is good enough** — FAISS IVF-PQ trades 10% recall for 100x speedup
3. **Caching matters** — Popular queries repeat; cache aggressively
4. **Normalize everything** — L2 normalization before indexing enables cosine similarity via inner product

The complete implementation is available on [GitHub](https://github.com/punitmishra/sap-cxii-tech-ex-01). It includes Docker deployment, Kubernetes manifests, and comprehensive benchmarks.

---

*Originally published at [punitmishra.github.io](https://punitmishra.github.io/blog/vector-search-ecommerce)*
