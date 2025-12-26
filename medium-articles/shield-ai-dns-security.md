# Shield AI: Building a High-Performance DNS Security System in Rust

*15MB memory, sub-millisecond latency, and real AI-powered threat detection*

---

I built Shield AI to solve a problem that frustrated me: existing DNS filtering solutions are either slow, resource-hungry, or lack intelligent threat detection. Pi-hole uses ~100MB of memory. AdGuard adds ~3ms latency. Neither uses machine learning for threat detection. Shield AI does all three better—15MB memory, sub-millisecond latency, and real AI-powered threat analysis.

## The Problem with DNS Security

DNS is the first line of defense in network security. Every connection starts with a DNS query. Block malicious domains at DNS resolution, and you prevent attacks before they start. But traditional solutions have limitations:

- **Pi-hole**: Great for ad blocking, but no ML-based threat detection
- **AdGuard**: Better performance, still no AI capabilities
- **Commercial solutions**: Expensive and privacy-concerning

I wanted something that combines speed, intelligence, and privacy.

## Architecture Overview

Shield AI uses a modular Rust architecture with 9 specialized crates:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│           Browser  │  Mobile App  │  CLI Tool            │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                API Gateway (Axum :8080)                  │
│              REST API │ WebSocket │ DNS-over-HTTPS       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     Core Services                        │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ dns-resolver│  ml-engine  │ ai-analyzer │  threat-intel │
│ (Hickory+   │  (DGA       │ (Threat     │  (Blocklist   │
│  DNSSEC)    │  Detection) │  Scoring)   │   Mgmt)       │
├─────────────┴─────────────┴─────────────┴───────────────┤
│ filter-engine │ profiles │ tiers │ plugins │ metrics    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Infrastructure Layer                        │
│              Redis Cache  │  Prometheus                  │
└─────────────────────────────────────────────────────────┘
```

## The Query Processing Pipeline

Every DNS query flows through an optimized pipeline:

1. **Client sends DNS query** → API Gateway
2. **Blocklist check** (O(1) hash lookup) → Block or continue
3. **Cache lookup** → Return immediately if cached
4. **DNS resolution** with DNSSEC validation
5. **Async ML/AI analysis** (non-blocking)
6. **Cache result** and return to client

```rust
pub async fn process_query(
    query: DnsQuery,
    state: Arc<AppState>,
) -> Result<DnsResponse, DnsError> {
    // 1. Check blocklist (O(1) hash lookup)
    if let Some(category) = state.filter_engine.check(&query.domain) {
        metrics::blocked_queries.inc();
        return Ok(DnsResponse::blocked(query.domain, category));
    }

    // 2. Check LRU cache (50k entries, 300s TTL)
    if let Some(cached) = state.cache.get(&query.domain).await {
        metrics::cache_hits.inc();
        return Ok(cached);
    }

    // 3. Resolve via upstream DNS with DNSSEC
    let resolution = state.resolver
        .resolve(&query.domain, query.record_type)
        .await?;

    // 4. Async ML/AI analysis (non-blocking)
    let analysis_handle = tokio::spawn({
        let domain = query.domain.clone();
        let ml = state.ml_engine.clone();
        async move {
            ml.detect_dga(&domain).await
        }
    });

    // 5. Cache and return immediately
    state.cache.insert(query.domain.clone(), resolution.clone()).await;

    Ok(resolution)
}
```

**The key insight**: DNS resolution is latency-critical, but threat analysis isn't. By running ML inference asynchronously, we return responses in sub-millisecond time while still catching threats.

## DGA Detection with Machine Learning

Domain Generation Algorithms (DGAs) are used by malware to generate random-looking domains for command and control. Traditional blocklists can't keep up—malware generates thousands of new domains daily.

Our ML engine detects DGAs through feature analysis:

```rust
pub struct DgaFeatures {
    entropy: f32,           // Character randomness
    consonant_ratio: f32,   // Consonant-to-vowel ratio
    digit_ratio: f32,       // Number density
    length: usize,          // Domain length
    n_gram_score: f32,      // Character sequence probability
    tld_risk: f32,          // TLD reputation score
}
```

**Example detections:**

| Domain | Entropy | Is DGA | Confidence |
|--------|---------|--------|------------|
| google.com | 2.8 | No | 0.02 |
| xk3j9f2m.net | 3.1 | Yes | 0.94 |
| amazon.com | 2.6 | No | 0.01 |
| 7h4x9k2p3m.ru | 3.3 | Yes | 0.98 |

## Multi-Factor Threat Scoring

Beyond DGA detection, the AI analyzer combines multiple signals:

1. **Domain age** — Newer domains are riskier
2. **TLD reputation** — Some TLDs have higher abuse rates
3. **Subdomain depth** — Deep subdomain chains are suspicious
4. **Threat intelligence** — Known malicious domain feeds
5. **DGA correlation** — ML-detected randomness patterns

Each factor contributes to a 0.0–1.0 threat score. Domains scoring above 0.7 are flagged for review or blocking.

## Performance Optimizations

Shield AI achieves remarkable performance through several techniques:

### 1. Lock-Free LRU Cache

Using the `moka` crate for a high-performance concurrent cache:

```rust
use moka::future::Cache;

let cache = Cache::builder()
    .max_capacity(50_000)
    .time_to_live(Duration::from_secs(300))
    .build();
```

### 2. Zero-Copy Parsing

DNS packets are parsed directly from bytes without allocation where possible.

### 3. Connection Pooling

Round-robin upstream resolution with health checking and automatic failover.

## Benchmarks

**On Apple M1 (single core):**

| Metric | Value |
|--------|-------|
| P50 Latency | 0.8ms |
| P99 Latency | 2.1ms |
| Throughput | 127,000 qps |
| Idle Memory | 14MB |
| Load Memory | 32MB |
| Startup Time | 180ms |

**Comparison with alternatives:**

| Solution | Memory | Latency | AI Detection |
|----------|--------|---------|--------------|
| Pi-hole | ~100MB | ~5ms | No |
| AdGuard | ~80MB | ~3ms | No |
| Shield AI | ~15MB | <1ms | Yes |

## Deployment

One-liner Docker deployment:

```bash
docker run -d -p 53:53/udp -p 8080:8080 punitmishra/shield-ai
```

## Key Takeaways

Building Shield AI taught me several lessons:

1. **Async is essential** — DNS is latency-critical; ML inference is not. Run them separately.
2. **Rust delivers on performance** — Zero-cost abstractions make sub-millisecond latency achievable.
3. **ML at the edge works** — Lightweight models can run inference in microseconds.
4. **Caching is everything** — 50K-entry LRU cache handles 95%+ of queries.

---

The source code is available at [github.com/punitmishra/shield-ai](https://github.com/punitmishra/shield-ai). Contributions welcome.

*Originally published at [punitmishra.github.io](https://punitmishra.github.io/blog/shield-ai-dns-security)*
