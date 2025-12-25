---
title: "Rust for AI Infrastructure: Performance Benchmarks and Real-World Results"
date: "2024-11-15"
author: "Punit Mishra"
category: "Technical"
tags: ["Rust", "Python", "AI", "Performance", "Infrastructure"]
readTime: "18 min"
featured: true
---

# Rust for AI Infrastructure: Performance Benchmarks and Real-World Results

> Why we rewrote critical AI infrastructure components in Rust and achieved 3-5x performance improvements.

## The Problem We Faced

At an enterprise scale, we were running AI inference pipelines processing millions of requests daily. Our Python-based infrastructure was hitting walls:

- **Memory usage** was unpredictable, with occasional OOM crashes
- **Latency spikes** during garbage collection
- **CPU utilization** never exceeded 60% due to GIL limitations
- **Cold start times** were 10+ seconds in serverless environments

We needed a solution that could handle our scale while providing predictable performance.

## Why Rust?

After evaluating Go, C++, and Rust, we chose Rust for several reasons:

| Factor | Go | C++ | Rust |
|--------|-----|-----|------|
| Memory Safety | GC-based | Manual | Compile-time guaranteed |
| Concurrency | Goroutines | Threads | Fearless concurrency |
| C Interop | CGO overhead | Native | Zero-cost FFI |
| Error Handling | Error values | Exceptions | Result types |
| Learning Curve | Low | High | Medium-High |

Rust's memory safety guarantees without garbage collection made it ideal for latency-sensitive AI workloads.

## The Benchmark Setup

We benchmarked three critical components:

1. **Embedding Generation** - Converting text to vectors
2. **Vector Similarity Search** - Finding nearest neighbors
3. **Memory Management** - Storing and retrieving agent state

### Test Environment

```
Hardware:
- CPU: AMD EPYC 7763 (64 cores)
- RAM: 256GB DDR4
- Storage: NVMe SSD

Software:
- Python 3.11 with NumPy, FAISS
- Rust 1.74 with ndarray, faiss-rs
- Ubuntu 22.04 LTS
```

## Component 1: Embedding Generation

### Python Implementation

```python
import numpy as np
from sentence_transformers import SentenceTransformer

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)

    def generate_embeddings(
        self,
        texts: list[str],
        batch_size: int = 32
    ) -> np.ndarray:
        """Generate embeddings for a list of texts."""
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        return embeddings

    def generate_single(self, text: str) -> np.ndarray:
        """Generate embedding for a single text."""
        return self.model.encode([text])[0]
```

### Rust Implementation

```rust
use candle_core::{Device, Tensor};
use candle_transformers::models::bert::{BertModel, Config};
use tokenizers::Tokenizer;
use std::sync::Arc;
use rayon::prelude::*;

pub struct EmbeddingService {
    model: Arc<BertModel>,
    tokenizer: Arc<Tokenizer>,
    device: Device,
    config: Config,
}

impl EmbeddingService {
    pub fn new(model_path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let device = Device::cuda_if_available(0)?;
        let config = Config::load(model_path)?;
        let model = BertModel::load(model_path, &config, &device)?;
        let tokenizer = Tokenizer::from_file(
            format!("{}/tokenizer.json", model_path)
        )?;

        Ok(Self {
            model: Arc::new(model),
            tokenizer: Arc::new(tokenizer),
            device,
            config,
        })
    }

    pub fn generate_embeddings(
        &self,
        texts: &[String],
        batch_size: usize,
    ) -> Result<Vec<Vec<f32>>, Box<dyn std::error::Error>> {
        // Process in batches with parallel tokenization
        let embeddings: Vec<Vec<f32>> = texts
            .par_chunks(batch_size)
            .map(|batch| self.process_batch(batch))
            .collect::<Result<Vec<_>, _>>()?
            .into_iter()
            .flatten()
            .collect();

        Ok(embeddings)
    }

    fn process_batch(
        &self,
        texts: &[String],
    ) -> Result<Vec<Vec<f32>>, Box<dyn std::error::Error>> {
        // Tokenize batch
        let encodings = self.tokenizer.encode_batch(
            texts.iter().map(|s| s.as_str()).collect(),
            true,
        )?;

        // Create tensors
        let input_ids = self.create_input_tensor(&encodings)?;
        let attention_mask = self.create_attention_mask(&encodings)?;

        // Forward pass
        let output = self.model.forward(&input_ids, &attention_mask)?;

        // Mean pooling
        let embeddings = self.mean_pooling(&output, &attention_mask)?;

        // Convert to Vec<Vec<f32>>
        self.tensor_to_vecs(&embeddings)
    }

    fn mean_pooling(
        &self,
        output: &Tensor,
        attention_mask: &Tensor,
    ) -> Result<Tensor, Box<dyn std::error::Error>> {
        // Expand attention mask to match output dimensions
        let mask_expanded = attention_mask
            .unsqueeze(2)?
            .expand(output.dims())?
            .to_dtype(output.dtype())?;

        // Apply mask and compute mean
        let sum_embeddings = (output * &mask_expanded)?.sum(1)?;
        let sum_mask = mask_expanded.sum(1)?.clamp(1e-9, f32::MAX)?;

        Ok((sum_embeddings / sum_mask)?)
    }
}
```

### Results: Embedding Generation

```
Benchmark: 10,000 texts, batch size 32
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    │ Python     │ Rust       │ Improvement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Time          │ 45.2s      │ 12.8s      │ 3.5x faster
Memory (Peak)       │ 4.2 GB     │ 1.8 GB     │ 2.3x less
Memory (Avg)        │ 3.1 GB     │ 1.2 GB     │ 2.6x less
P99 Latency/batch   │ 156ms      │ 42ms       │ 3.7x faster
Throughput          │ 221/sec    │ 781/sec    │ 3.5x higher
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Component 2: Vector Similarity Search

### Python Implementation

```python
import faiss
import numpy as np
from typing import List, Tuple

class VectorIndex:
    def __init__(
        self,
        dimension: int,
        index_type: str = "IVF1024,Flat",
        metric: str = "L2"
    ):
        self.dimension = dimension

        if metric == "L2":
            quantizer = faiss.IndexFlatL2(dimension)
        else:
            quantizer = faiss.IndexFlatIP(dimension)

        self.index = faiss.index_factory(
            dimension,
            index_type,
            faiss.METRIC_L2 if metric == "L2" else faiss.METRIC_INNER_PRODUCT
        )

        # Use GPU if available
        try:
            res = faiss.StandardGpuResources()
            self.index = faiss.index_cpu_to_gpu(res, 0, self.index)
            self.is_gpu = True
        except:
            self.is_gpu = False

    def add(self, vectors: np.ndarray, ids: np.ndarray = None):
        """Add vectors to the index."""
        if not self.index.is_trained:
            self.index.train(vectors)
        self.index.add(vectors)

    def search(
        self,
        query_vectors: np.ndarray,
        k: int = 10
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Search for k nearest neighbors."""
        distances, indices = self.index.search(query_vectors, k)
        return distances, indices

    def batch_search(
        self,
        query_vectors: np.ndarray,
        k: int = 10,
        batch_size: int = 1000
    ) -> List[Tuple[np.ndarray, np.ndarray]]:
        """Search in batches for memory efficiency."""
        results = []
        for i in range(0, len(query_vectors), batch_size):
            batch = query_vectors[i:i + batch_size]
            distances, indices = self.search(batch, k)
            results.append((distances, indices))
        return results
```

### Rust Implementation

```rust
use faiss::{Index, IndexImpl, MetricType};
use ndarray::{Array2, ArrayView1, ArrayView2, Axis};
use rayon::prelude::*;
use std::sync::RwLock;

pub struct VectorIndex {
    index: RwLock<IndexImpl>,
    dimension: usize,
    is_trained: bool,
}

impl VectorIndex {
    pub fn new(
        dimension: usize,
        index_type: &str,
        metric: MetricType,
    ) -> Result<Self, faiss::Error> {
        let index = faiss::index_factory(dimension, index_type, metric)?;

        Ok(Self {
            index: RwLock::new(index),
            dimension,
            is_trained: false,
        })
    }

    pub fn train(&mut self, vectors: ArrayView2<f32>) -> Result<(), faiss::Error> {
        let mut index = self.index.write().unwrap();
        index.train(vectors.as_slice().unwrap())?;
        self.is_trained = true;
        Ok(())
    }

    pub fn add(&self, vectors: ArrayView2<f32>) -> Result<(), faiss::Error> {
        let mut index = self.index.write().unwrap();
        index.add(vectors.as_slice().unwrap())?;
        Ok(())
    }

    pub fn search(
        &self,
        query_vectors: ArrayView2<f32>,
        k: usize,
    ) -> Result<SearchResult, faiss::Error> {
        let index = self.index.read().unwrap();
        let n_queries = query_vectors.nrows();

        let mut distances = vec![0.0f32; n_queries * k];
        let mut indices = vec![0i64; n_queries * k];

        index.search(
            query_vectors.as_slice().unwrap(),
            k,
            &mut distances,
            &mut indices,
        )?;

        Ok(SearchResult {
            distances: Array2::from_shape_vec((n_queries, k), distances)?,
            indices: Array2::from_shape_vec((n_queries, k), indices)?,
        })
    }

    pub fn parallel_search(
        &self,
        query_vectors: ArrayView2<f32>,
        k: usize,
        batch_size: usize,
    ) -> Result<Vec<SearchResult>, faiss::Error> {
        // Split into batches and search in parallel
        let results: Vec<SearchResult> = query_vectors
            .axis_chunks_iter(Axis(0), batch_size)
            .collect::<Vec<_>>()
            .par_iter()
            .map(|batch| self.search(batch.view(), k))
            .collect::<Result<Vec<_>, _>>()?;

        Ok(results)
    }
}

#[derive(Debug)]
pub struct SearchResult {
    pub distances: Array2<f32>,
    pub indices: Array2<i64>,
}
```

### Results: Vector Search

```
Benchmark: 1M vectors in index, 10K queries, k=10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    │ Python     │ Rust       │ Improvement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Time          │ 2.8s       │ 0.6s       │ 4.7x faster
Queries/Second      │ 3,571      │ 16,667     │ 4.7x higher
P99 Latency         │ 4.2ms      │ 0.8ms      │ 5.3x faster
Memory (Peak)       │ 6.8 GB     │ 4.1 GB     │ 1.7x less
Index Build Time    │ 45s        │ 12s        │ 3.8x faster
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Component 3: Memory Management for AI Agents

### Python Implementation

```python
import json
import hashlib
import redis
from cryptography.fernet import Fernet
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict

@dataclass
class MemoryEntry:
    agent_id: str
    key: str
    value: Dict[str, Any]
    timestamp: float
    ttl: int

class AgentMemoryManager:
    def __init__(
        self,
        redis_url: str,
        encryption_key: bytes,
        default_ttl: int = 3600
    ):
        self.redis = redis.from_url(redis_url)
        self.cipher = Fernet(encryption_key)
        self.default_ttl = default_ttl

    def store(
        self,
        agent_id: str,
        key: str,
        value: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> bool:
        """Store encrypted memory entry."""
        try:
            # Serialize and encrypt
            serialized = json.dumps(value).encode('utf-8')
            encrypted = self.cipher.encrypt(serialized)

            # Create scoped key
            scoped_key = self._create_key(agent_id, key)

            # Store with TTL
            self.redis.setex(
                scoped_key,
                ttl or self.default_ttl,
                encrypted
            )

            return True
        except Exception as e:
            logger.error(f"Failed to store memory: {e}")
            return False

    def retrieve(
        self,
        agent_id: str,
        key: str
    ) -> Optional[Dict[str, Any]]:
        """Retrieve and decrypt memory entry."""
        try:
            scoped_key = self._create_key(agent_id, key)
            encrypted = self.redis.get(scoped_key)

            if encrypted is None:
                return None

            decrypted = self.cipher.decrypt(encrypted)
            return json.loads(decrypted.decode('utf-8'))
        except Exception as e:
            logger.error(f"Failed to retrieve memory: {e}")
            return None

    def _create_key(self, agent_id: str, key: str) -> str:
        """Create a scoped Redis key."""
        return f"agent:{agent_id}:memory:{key}"
```

### Rust Implementation

```rust
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use redis::{AsyncCommands, Client};
use serde::{Deserialize, Serialize};
use std::time::SystemTime;
use tokio::sync::RwLock;

pub struct AgentMemoryManager {
    redis: Client,
    cipher: Aes256Gcm,
    default_ttl: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MemoryEntry<T: Serialize> {
    pub agent_id: String,
    pub key: String,
    pub value: T,
    pub timestamp: u64,
}

impl AgentMemoryManager {
    pub fn new(
        redis_url: &str,
        encryption_key: &[u8; 32],
        default_ttl: u64,
    ) -> Result<Self, Box<dyn std::error::Error>> {
        let redis = Client::open(redis_url)?;
        let cipher = Aes256Gcm::new_from_slice(encryption_key)?;

        Ok(Self {
            redis,
            cipher,
            default_ttl,
        })
    }

    pub async fn store<T: Serialize>(
        &self,
        agent_id: &str,
        key: &str,
        value: &T,
        ttl: Option<u64>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let mut conn = self.redis.get_async_connection().await?;

        // Serialize
        let serialized = serde_json::to_vec(value)?;

        // Generate nonce and encrypt
        let nonce = self.generate_nonce();
        let encrypted = self.cipher.encrypt(&nonce, serialized.as_ref())?;

        // Combine nonce + ciphertext
        let mut data = nonce.to_vec();
        data.extend(encrypted);

        // Create scoped key
        let scoped_key = format!("agent:{}:memory:{}", agent_id, key);

        // Store with TTL
        conn.set_ex(
            &scoped_key,
            data,
            ttl.unwrap_or(self.default_ttl),
        ).await?;

        Ok(())
    }

    pub async fn retrieve<T: for<'de> Deserialize<'de>>(
        &self,
        agent_id: &str,
        key: &str,
    ) -> Result<Option<T>, Box<dyn std::error::Error>> {
        let mut conn = self.redis.get_async_connection().await?;

        let scoped_key = format!("agent:{}:memory:{}", agent_id, key);

        let data: Option<Vec<u8>> = conn.get(&scoped_key).await?;

        match data {
            None => Ok(None),
            Some(data) => {
                // Split nonce and ciphertext
                let (nonce_bytes, ciphertext) = data.split_at(12);
                let nonce = Nonce::from_slice(nonce_bytes);

                // Decrypt
                let decrypted = self.cipher.decrypt(nonce, ciphertext)?;

                // Deserialize
                let value: T = serde_json::from_slice(&decrypted)?;

                Ok(Some(value))
            }
        }
    }

    pub async fn batch_store<T: Serialize + Send + Sync>(
        &self,
        entries: &[(String, String, T)],
        ttl: Option<u64>,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let mut conn = self.redis.get_async_connection().await?;

        // Use Redis pipeline for batch operations
        let mut pipe = redis::pipe();

        for (agent_id, key, value) in entries {
            let serialized = serde_json::to_vec(value)?;
            let nonce = self.generate_nonce();
            let encrypted = self.cipher.encrypt(&nonce, serialized.as_ref())?;

            let mut data = nonce.to_vec();
            data.extend(encrypted);

            let scoped_key = format!("agent:{}:memory:{}", agent_id, key);

            pipe.set_ex(
                &scoped_key,
                data,
                ttl.unwrap_or(self.default_ttl),
            );
        }

        pipe.query_async(&mut conn).await?;

        Ok(())
    }

    fn generate_nonce(&self) -> Nonce<typenum::U12> {
        let mut nonce = [0u8; 12];
        getrandom::getrandom(&mut nonce).expect("Failed to generate nonce");
        *Nonce::from_slice(&nonce)
    }
}
```

### Results: Memory Management

```
Benchmark: 100K store/retrieve operations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    │ Python     │ Rust       │ Improvement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Store (ops/sec)     │ 8,500      │ 42,000     │ 4.9x faster
Retrieve (ops/sec)  │ 12,000     │ 58,000     │ 4.8x faster
Batch Store (100)   │ 145ms      │ 28ms       │ 5.2x faster
Memory per op       │ 2.4 KB     │ 0.8 KB     │ 3x less
P99 Latency         │ 8.2ms      │ 1.4ms      │ 5.9x faster
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Production Deployment Strategy

We didn't rewrite everything at once. Here's our migration strategy:

### Phase 1: Critical Path (Month 1-2)
- Identified the 3 most latency-sensitive components
- Rewrote in Rust with Python bindings (PyO3)
- Deployed behind feature flags

### Phase 2: Gradual Rollout (Month 3-4)
- A/B tested Rust vs Python implementations
- Monitored metrics closely
- Fixed edge cases discovered in production

### Phase 3: Full Migration (Month 5-6)
- Removed Python fallbacks
- Optimized based on production data
- Documented everything

### PyO3 Integration

We used PyO3 to create Python bindings, allowing gradual adoption:

```rust
use pyo3::prelude::*;

#[pyclass]
struct RustEmbeddingService {
    inner: EmbeddingService,
}

#[pymethods]
impl RustEmbeddingService {
    #[new]
    fn new(model_path: &str) -> PyResult<Self> {
        let inner = EmbeddingService::new(model_path)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
                e.to_string()
            ))?;

        Ok(Self { inner })
    }

    fn generate_embeddings(
        &self,
        py: Python<'_>,
        texts: Vec<String>,
        batch_size: usize,
    ) -> PyResult<Py<PyArray2<f32>>> {
        // Release GIL during computation
        let embeddings = py.allow_threads(|| {
            self.inner.generate_embeddings(&texts, batch_size)
        }).map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(
            e.to_string()
        ))?;

        // Convert to NumPy array
        let array = PyArray2::from_vec2(py, &embeddings)?;
        Ok(array.into())
    }
}

#[pymodule]
fn rust_ai_infra(_py: Python<'_>, m: &PyModule) -> PyResult<()> {
    m.add_class::<RustEmbeddingService>()?;
    m.add_class::<RustVectorIndex>()?;
    m.add_class::<RustMemoryManager>()?;
    Ok(())
}
```

Usage from Python:

```python
from rust_ai_infra import RustEmbeddingService

# Drop-in replacement for Python implementation
service = RustEmbeddingService("/path/to/model")
embeddings = service.generate_embeddings(texts, batch_size=32)
```

## Key Learnings

### 1. Not Everything Needs Rust

We kept the following in Python:
- Configuration management
- Logging and monitoring integration
- Testing and debugging tools
- Non-critical batch jobs

### 2. Profiling is Essential

We used `perf`, `flamegraph`, and `criterion` extensively:

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn benchmark_embedding_generation(c: &mut Criterion) {
    let service = EmbeddingService::new("model/path").unwrap();
    let texts: Vec<String> = (0..1000)
        .map(|i| format!("Sample text number {}", i))
        .collect();

    c.bench_function("generate_1000_embeddings", |b| {
        b.iter(|| {
            black_box(service.generate_embeddings(&texts, 32).unwrap())
        })
    });
}

criterion_group!(benches, benchmark_embedding_generation);
criterion_main!(benches);
```

### 3. Error Handling Matters

Rust forced us to handle errors properly:

```rust
#[derive(Debug, thiserror::Error)]
pub enum AIInfraError {
    #[error("Model loading failed: {0}")]
    ModelLoad(String),

    #[error("Tokenization failed: {0}")]
    Tokenization(#[from] tokenizers::Error),

    #[error("Inference failed: {0}")]
    Inference(#[from] candle_core::Error),

    #[error("Redis operation failed: {0}")]
    Redis(#[from] redis::RedisError),

    #[error("Encryption failed: {0}")]
    Encryption(String),
}
```

## Conclusion

Rewriting critical AI infrastructure in Rust delivered:

- **3-5x performance improvements** across all components
- **Predictable latency** without GC pauses
- **Lower memory usage** enabling higher density
- **Better reliability** through compile-time safety

The investment was significant (6 months, 3 engineers), but the ROI was clear: we could handle 4x more traffic on the same infrastructure.

Is Rust right for your AI infrastructure? If you're hitting Python's performance limits and need predictable latency, it's worth serious consideration.

---

*Interested in discussing Rust for AI? Connect with me on [LinkedIn](https://linkedin.com/in/mishrapunit) or check out my [GitHub](https://github.com/punitmishra).*

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [PyO3 Guide](https://pyo3.rs/)
- [Candle ML Framework](https://github.com/huggingface/candle)
- [FAISS Rust Bindings](https://github.com/Enet4/faiss-rs)
