---
title: "Building a Production Vector Search Engine for E-Commerce"
date: "2024-12-21"
category: "AI/ML"
tags: ["Vector Search", "FAISS", "CLIP", "E-Commerce", "Python"]
readTime: "13 min read"
---

Visual search is transforming e-commerce. Instead of typing "blue denim jacket with brass buttons," users can upload a photo and find similar products instantly. I built a production-ready vector search system that handles 30,000+ products with sub-100ms query latency using FAISS, CLIP embeddings, and multimodal fusion.

## The Challenge

Product similarity search seems simple until you try to do it well:

- **Multiple modalities**: Products have images, titles, descriptions, prices, and attributes
- **Scale**: Millions of products, thousands of queries per second
- **Latency**: Users expect results in <100ms
- **Accuracy**: Subjective similarity—what makes two products "similar"?

Traditional approaches like text search or rule-based filtering fall short. Vector search solves this by embedding products into a continuous space where similar items are geometrically close.

## Architecture Overview

```
Query (Image/Text)
    ↓
Embedding Layer
├── CLIP Image Encoder (ViT-L/14)
├── CLIP Text Encoder
└── Attribute Encoder (learned)
    ↓
Fusion Layer (weighted combination)
    ↓
FAISS Index (IVF + PQ)
    ↓
Post-Processing (reranking, filtering)
    ↓
Similar Products
```

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

        # Description embedding
        if product.get('description'):
            desc_emb = self.text_encoder.encode(product['description'][:512])
            embeddings.append(('description', desc_emb))

        # Attribute embedding (categorical + numerical)
        attr_emb = self._encode_attributes(product)
        embeddings.append(('attributes', attr_emb))

        # Weighted fusion with dimension alignment
        return self._fuse_embeddings(embeddings)

    def _fuse_embeddings(self, embeddings: list) -> np.ndarray:
        # Project all embeddings to common dimension
        target_dim = 512

        fused = np.zeros(target_dim)
        total_weight = 0

        for name, emb in embeddings:
            # Linear projection if needed
            if len(emb) != target_dim:
                emb = self._project(emb, target_dim)

            weight = self.weights.get(name, 0.1)
            fused += weight * emb
            total_weight += weight

        # L2 normalize
        fused = fused / (np.linalg.norm(fused) + 1e-8)
        return fused

    def _encode_attributes(self, product: dict) -> np.ndarray:
        """Encode categorical and numerical attributes."""
        features = []

        # Price (log-scaled, normalized)
        if price := product.get('price'):
            features.append(np.log1p(price) / 10)

        # Brand (one-hot or learned embedding)
        if brand := product.get('brand'):
            brand_emb = self.brand_embeddings.get(brand, np.zeros(32))
            features.extend(brand_emb)

        # Color (learned color embedding)
        if color := product.get('color'):
            color_emb = self.color_embeddings.get(color.lower(), np.zeros(16))
            features.extend(color_emb)

        # Category hierarchy
        if category := product.get('category'):
            cat_emb = self._encode_category_path(category)
            features.extend(cat_emb)

        return np.array(features)
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
        self.use_gpu = use_gpu

        # IVF (Inverted File) with Product Quantization
        self.quantizer = faiss.IndexFlatIP(dimension)  # Inner product
        self.index = faiss.IndexIVFPQ(
            self.quantizer,
            dimension,
            n_clusters,      # Number of Voronoi cells
            32,              # Number of sub-quantizers
            8                # Bits per sub-quantizer
        )

        if use_gpu:
            res = faiss.StandardGpuResources()
            self.index = faiss.index_cpu_to_gpu(res, 0, self.index)

        self.product_ids = []
        self.is_trained = False

    def train(self, embeddings: np.ndarray):
        """Train the index on a sample of embeddings."""
        if len(embeddings) < self.n_clusters * 40:
            raise ValueError(f"Need at least {self.n_clusters * 40} samples to train")

        # Normalize for cosine similarity via inner product
        faiss.normalize_L2(embeddings)

        self.index.train(embeddings)
        self.is_trained = True

    def add(self, embeddings: np.ndarray, product_ids: List[str]):
        """Add embeddings to the index."""
        if not self.is_trained:
            self.train(embeddings)

        faiss.normalize_L2(embeddings)
        self.index.add(embeddings)
        self.product_ids.extend(product_ids)

    def search(
        self,
        query_embedding: np.ndarray,
        k: int = 10,
        filters: dict = None
    ) -> List[Tuple[str, float]]:
        """Search for similar products."""
        # Normalize query
        query = query_embedding.reshape(1, -1).astype('float32')
        faiss.normalize_L2(query)

        # Set search parameters
        self.index.nprobe = self.n_probe

        # Search
        distances, indices = self.index.search(query, k * 3)  # Over-fetch for filtering

        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue

            product_id = self.product_ids[idx]

            # Apply post-filters
            if filters and not self._passes_filters(product_id, filters):
                continue

            # Convert distance to similarity score
            similarity = float(dist)  # Already similarity for IP
            results.append((product_id, similarity))

            if len(results) >= k:
                break

        return results

    def save(self, path: str):
        """Persist index to disk."""
        faiss.write_index(self.index, f"{path}/index.faiss")
        np.save(f"{path}/product_ids.npy", np.array(self.product_ids))

    def load(self, path: str):
        """Load index from disk."""
        self.index = faiss.read_index(f"{path}/index.faiss")
        self.product_ids = np.load(f"{path}/product_ids.npy").tolist()
        self.is_trained = True
```

## Visual Search API

The FastAPI service handles search requests:

```python
from fastapi import FastAPI, UploadFile, File, Query
from PIL import Image
import io

app = FastAPI()

# Global instances
embedder = ProductEmbedder()
index = VectorIndex()
product_db = ProductDatabase()

@app.post("/search/image")
async def search_by_image(
    image: UploadFile = File(...),
    k: int = Query(10, ge=1, le=100),
    category: str = Query(None),
    min_price: float = Query(None),
    max_price: float = Query(None),
):
    """Search for similar products by image."""
    # Load and preprocess image
    image_data = await image.read()
    pil_image = Image.open(io.BytesIO(image_data)).convert('RGB')

    # Generate embedding
    query_embedding = embedder.embed_image(pil_image)

    # Build filters
    filters = {}
    if category:
        filters['category'] = category
    if min_price is not None or max_price is not None:
        filters['price_range'] = (min_price, max_price)

    # Search
    results = index.search(query_embedding, k=k, filters=filters)

    # Fetch product details
    products = []
    for product_id, score in results:
        product = product_db.get(product_id)
        products.append({
            **product,
            'similarity_score': round(score, 4),
        })

    return {'results': products}

@app.post("/search/text")
async def search_by_text(
    query: str,
    k: int = Query(10, ge=1, le=100),
):
    """Search for products by text description."""
    query_embedding = embedder.embed_text(query)
    results = index.search(query_embedding, k=k)

    products = [
        {**product_db.get(pid), 'similarity_score': round(score, 4)}
        for pid, score in results
    ]

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

    if not embeddings:
        raise HTTPException(400, "Provide image and/or text")

    # Weighted combination
    combined = sum(w * e for w, e in embeddings)
    combined = combined / np.linalg.norm(combined)

    results = index.search(combined, k=10)
    return {'results': [product_db.get(pid) for pid, _ in results]}
```

## Indexing Pipeline

Processing 30,000 products efficiently:

```python
import asyncio
from concurrent.futures import ProcessPoolExecutor
from tqdm import tqdm
import pyarrow.parquet as pq

class IndexingPipeline:
    def __init__(self, embedder: ProductEmbedder, index: VectorIndex):
        self.embedder = embedder
        self.index = index
        self.batch_size = 100

    async def index_dataset(self, parquet_path: str):
        """Index products from Parquet file."""
        # Read dataset
        table = pq.read_table(parquet_path)
        df = table.to_pandas()

        print(f"Indexing {len(df)} products...")

        # Process in batches
        all_embeddings = []
        all_ids = []

        for batch_start in tqdm(range(0, len(df), self.batch_size)):
            batch = df.iloc[batch_start:batch_start + self.batch_size]

            # Parallel embedding generation
            embeddings = await self._embed_batch(batch)

            all_embeddings.extend(embeddings)
            all_ids.extend(batch['product_id'].tolist())

        # Train and add to index
        embeddings_array = np.array(all_embeddings).astype('float32')

        print("Training index...")
        self.index.train(embeddings_array)

        print("Adding to index...")
        self.index.add(embeddings_array, all_ids)

        print(f"Indexed {len(all_ids)} products")

    async def _embed_batch(self, batch) -> List[np.ndarray]:
        """Embed a batch of products in parallel."""
        loop = asyncio.get_event_loop()

        with ProcessPoolExecutor(max_workers=4) as executor:
            futures = [
                loop.run_in_executor(
                    executor,
                    self.embedder.embed_product,
                    row.to_dict()
                )
                for _, row in batch.iterrows()
            ]

            results = await asyncio.gather(*futures)

        return list(results)

# Run indexing
async def main():
    embedder = ProductEmbedder()
    index = VectorIndex(dimension=512, n_clusters=100)
    pipeline = IndexingPipeline(embedder, index)

    await pipeline.index_dataset("data/amazon_fashion_2020.parquet")
    index.save("indexes/fashion_v1")

if __name__ == "__main__":
    asyncio.run(main())
```

## Performance Optimization

### 1. Caching Hot Queries

```python
from functools import lru_cache
import hashlib

class CachedIndex:
    def __init__(self, index: VectorIndex, cache_size: int = 10000):
        self.index = index
        self.cache = {}
        self.cache_size = cache_size

    def search(self, embedding: np.ndarray, k: int, filters: dict = None):
        # Generate cache key
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
        # Quantize embedding for better cache hits
        quantized = (embedding * 100).astype(int).tobytes()
        filters_str = str(sorted(filters.items())) if filters else ""
        return hashlib.md5(quantized + str(k).encode() + filters_str.encode()).hexdigest()
```

### 2. Approximate Reranking

```python
def rerank_results(
    query_embedding: np.ndarray,
    candidates: List[Tuple[str, float]],
    product_db: ProductDatabase,
    embedder: ProductEmbedder,
) -> List[Tuple[str, float]]:
    """Rerank candidates with full embeddings."""
    reranked = []

    for product_id, approx_score in candidates:
        product = product_db.get(product_id)

        # Compute exact similarity
        product_embedding = embedder.embed_product(product)
        exact_score = np.dot(query_embedding, product_embedding)

        reranked.append((product_id, exact_score))

    # Sort by exact score
    reranked.sort(key=lambda x: x[1], reverse=True)
    return reranked
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

## Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Pre-download models
RUN python -c "from transformers import CLIPModel; CLIPModel.from_pretrained('openai/clip-vit-large-patch14')"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Key Learnings

1. **Multimodal beats unimodal** - Combining image, text, and attributes significantly improves relevance
2. **Approximate search is good enough** - FAISS IVF-PQ trades 10% recall for 100x speedup
3. **Caching matters** - Popular queries repeat; cache aggressively
4. **Normalize everything** - L2 normalization before indexing enables cosine similarity via inner product

The complete implementation is available on [GitHub](https://github.com/punitmishra/sap-cxii-tech-ex-01). It includes Docker deployment, Kubernetes manifests, and comprehensive benchmarks.
