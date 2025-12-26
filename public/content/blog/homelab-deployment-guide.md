---
title: "Homelab Deployment Guide: From Code to Production"
date: "2024-12-20"
category: "Technical"
tags: ["DevOps", "Docker", "CI/CD", "Raspberry Pi", "Deployment"]
readTime: "18 min read"
---

Deploying personal projects to production doesn't require enterprise-grade infrastructure. This guide covers my complete deployment pipeline—from GitHub push to running on Raspberry Pis—using GitHub Actions, Docker, and Cloudflare Tunnels.

## The Deployment Philosophy

My homelab deployment follows these principles:

1. **Git is the source of truth** - Everything is version controlled
2. **Immutable deployments** - Docker images, not in-place updates
3. **Zero-downtime updates** - Blue-green or rolling deploys
4. **Automatic rollback** - Health checks trigger automatic recovery
5. **Secure by default** - No exposed ports, Cloudflare Tunnel for access

```mermaid
graph LR
    subgraph "Development"
        Code[Local Code]
        Git[GitHub Repo]
    end

    subgraph "CI/CD"
        Actions[GitHub Actions]
        Registry[Docker Registry]
    end

    subgraph "Deployment"
        Webhook[Watchtower]
        Docker[Docker Compose]
    end

    subgraph "Access"
        Tunnel[Cloudflare Tunnel]
        Users[Internet Users]
    end

    Code -->|push| Git
    Git -->|trigger| Actions
    Actions -->|build & push| Registry
    Registry -->|pull| Webhook
    Webhook -->|update| Docker
    Docker -->|connect| Tunnel
    Tunnel -->|access| Users
```

## Project Structure

Every project follows the same structure for consistent deployments:

```
project-name/
├── .github/
│   └── workflows/
│       ├── build.yml       # Build and push Docker image
│       ├── deploy.yml      # Deploy to Raspberry Pi
│       └── test.yml        # Run tests
├── docker/
│   ├── Dockerfile          # Production image
│   ├── Dockerfile.dev      # Development image
│   └── docker-compose.yml  # Local development
├── deploy/
│   ├── docker-compose.yml  # Production compose
│   ├── .env.example        # Environment template
│   └── prometheus.yml      # Monitoring config
├── src/                    # Application source
├── tests/                  # Test files
├── Makefile                # Common commands
└── README.md
```

## Docker Image Build Pipeline

The build workflow runs on every push to main:

```yaml
# .github/workflows/build.yml
name: Build and Push

on:
  push:
    branches: [main]
    paths:
      - 'src/**'
      - 'Dockerfile'
      - '.github/workflows/build.yml'
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        if: github.event_name != 'pull_request'
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha,prefix=
            type=raw,value=latest,enable={{is_default_branch}}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Trigger deployment
        if: github.event_name != 'pull_request'
        run: |
          curl -X POST \
            -H "Authorization: token ${{ secrets.DEPLOY_TOKEN }}" \
            -H "Accept: application/vnd.github.v3+json" \
            https://api.github.com/repos/${{ github.repository }}/dispatches \
            -d '{"event_type":"deploy","client_payload":{"sha":"${{ github.sha }}"}}'
```

### Multi-Architecture Builds

Raspberry Pis use ARM64. Desktop machines use AMD64. The workflow builds for both:

```dockerfile
# Dockerfile - Multi-stage, multi-arch
FROM --platform=$BUILDPLATFORM rust:1.74-slim AS builder

ARG TARGETPLATFORM
ARG BUILDPLATFORM

# Install cross-compilation tools
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && if [ "$TARGETPLATFORM" = "linux/arm64" ]; then \
        apt-get install -y gcc-aarch64-linux-gnu; \
    fi

WORKDIR /app
COPY . .

# Set target for cross-compilation
RUN case "$TARGETPLATFORM" in \
    "linux/arm64") export CARGO_TARGET="aarch64-unknown-linux-gnu" ;; \
    *) export CARGO_TARGET="x86_64-unknown-linux-gnu" ;; \
    esac && \
    rustup target add $CARGO_TARGET && \
    cargo build --release --target $CARGO_TARGET && \
    cp target/$CARGO_TARGET/release/app /app/app

# Runtime image
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/app /usr/local/bin/

EXPOSE 8080
CMD ["app"]
```

## Automatic Deployment with Watchtower

Each Raspberry Pi runs Watchtower, which monitors Docker registries and automatically pulls new images:

```yaml
# deploy/docker-compose.yml
version: '3.8'

services:
  watchtower:
    image: containrrr/watchtower
    container_name: watchtower
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /root/.docker/config.json:/config.json:ro
    environment:
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_POLL_INTERVAL=300  # Check every 5 minutes
      - WATCHTOWER_INCLUDE_STOPPED=true
      - WATCHTOWER_REVIVE_STOPPED=true
      - WATCHTOWER_NOTIFICATIONS=slack
      - WATCHTOWER_NOTIFICATION_SLACK_HOOK_URL=${SLACK_WEBHOOK}
      - WATCHTOWER_NOTIFICATION_SLACK_IDENTIFIER=watchtower-pi
    command: --label-enable  # Only update containers with specific label

  shield-ai:
    image: ghcr.io/punitmishra/shield-ai:latest
    container_name: shield-ai
    restart: unless-stopped
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
    ports:
      - "53:53/udp"
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

### Deployment Notifications

Watchtower sends Slack notifications on updates:

```
🚀 Shield AI updated
  Old: ghcr.io/punitmishra/shield-ai:abc123
  New: ghcr.io/punitmishra/shield-ai:def456
  Host: pi-shield
  Time: 2024-12-20 14:32:01
```

## Zero-Downtime Deployments

For services that can't have downtime, I use Docker Swarm's rolling updates:

```yaml
# deploy/docker-compose.swarm.yml
version: '3.8'

services:
  api:
    image: ghcr.io/punitmishra/railroad-api:latest
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
        order: start-first
      rollback_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        max_attempts: 3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 10s
      timeout: 5s
      retries: 3
```

Deploy with:
```bash
docker stack deploy -c docker-compose.swarm.yml railroad
```

## Cloudflare Tunnel Setup

Exposing services to the internet securely without opening firewall ports:

```mermaid
sequenceDiagram
    participant U as User
    participant CF as Cloudflare Edge
    participant T as Tunnel (Pi)
    participant S as Service

    U->>CF: HTTPS Request to app.example.com
    CF->>CF: WAF, DDoS Protection
    CF->>T: Encrypted Tunnel
    T->>S: Forward to localhost:8080
    S-->>T: Response
    T-->>CF: Encrypted Response
    CF-->>U: HTTPS Response
```

### Tunnel Configuration

```yaml
# cloudflared/config.yml
tunnel: my-tunnel-id
credentials-file: /etc/cloudflared/credentials.json

ingress:
  # Shield AI Dashboard
  - hostname: dns.punitmishra.com
    service: http://localhost:8080
    originRequest:
      noTLSVerify: true

  # Railroad Arcade
  - hostname: railroad.punitmishra.com
    service: http://localhost:3000

  # Railroad WebSocket
  - hostname: ws.railroad.punitmishra.com
    service: ws://localhost:8765

  # Grafana Monitoring
  - hostname: monitoring.punitmishra.com
    service: http://192.168.1.13:3000

  # Catch-all
  - service: http_status:404
```

### Docker Compose for Cloudflared

```yaml
# cloudflared/docker-compose.yml
version: '3.8'

services:
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared
    restart: unless-stopped
    command: tunnel run
    environment:
      - TUNNEL_TOKEN=${CLOUDFLARE_TUNNEL_TOKEN}
    networks:
      - host  # Access all local services

networks:
  host:
    external: true
```

## Health Checks and Automatic Recovery

Every service exposes a health endpoint:

```rust
// src/health.rs - Rust example
use axum::{routing::get, Router, Json};
use serde::Serialize;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    uptime_seconds: u64,
    checks: HealthChecks,
}

#[derive(Serialize)]
struct HealthChecks {
    database: bool,
    cache: bool,
    dns_upstream: bool,
}

async fn health_check(state: AppState) -> Json<HealthResponse> {
    let checks = HealthChecks {
        database: state.db.ping().await.is_ok(),
        cache: state.redis.ping().await.is_ok(),
        dns_upstream: check_dns_upstream().await,
    };

    let status = if checks.database && checks.cache && checks.dns_upstream {
        "healthy"
    } else {
        "degraded"
    };

    Json(HealthResponse {
        status: status.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime_seconds: state.start_time.elapsed().as_secs(),
        checks,
    })
}

pub fn health_routes() -> Router<AppState> {
    Router::new()
        .route("/health", get(health_check))
        .route("/ready", get(|| async { "OK" }))
        .route("/live", get(|| async { "OK" }))
}
```

### Docker Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
```

Docker automatically restarts unhealthy containers:

```yaml
services:
  app:
    restart: unless-stopped
    # With health check, Docker restarts after 3 failed checks
```

## Secrets Management

Secrets never go in Git. They're managed through:

1. **Local development**: `.env` file (gitignored)
2. **CI/CD**: GitHub Secrets
3. **Production**: Environment files on Pi

```bash
# On Raspberry Pi
# /home/pi/docker/.env (chmod 600)
DATABASE_URL=postgres://user:pass@localhost/db
REDIS_URL=redis://localhost:6379
CLOUDFLARE_TUNNEL_TOKEN=ey...
SLACK_WEBHOOK=https://hooks.slack.com/...
```

### GitHub Secrets to Pi

Deploy secrets securely:

```yaml
# .github/workflows/deploy-secrets.yml
name: Deploy Secrets

on:
  workflow_dispatch:
    inputs:
      pi_host:
        description: 'Pi hostname'
        required: true
        default: 'pi-shield'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy secrets
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.PI_HOST }}
          username: pi
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cat > /home/pi/docker/.env << 'EOF'
            DATABASE_URL=${{ secrets.DATABASE_URL }}
            REDIS_URL=${{ secrets.REDIS_URL }}
            CLOUDFLARE_TUNNEL_TOKEN=${{ secrets.CLOUDFLARE_TUNNEL_TOKEN }}
            EOF
            chmod 600 /home/pi/docker/.env
```

## Monitoring and Alerting

Prometheus scrapes all services, Grafana visualizes, Alertmanager notifies:

```yaml
# alertmanager/config.yml
global:
  slack_api_url: '${SLACK_WEBHOOK}'

route:
  receiver: 'slack'
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  routes:
    - match:
        severity: critical
      receiver: 'slack-critical'
      repeat_interval: 1h

receivers:
  - name: 'slack'
    slack_configs:
      - channel: '#homelab-alerts'
        title: '{{ .Status | toUpper }}: {{ .CommonLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'

  - name: 'slack-critical'
    slack_configs:
      - channel: '#homelab-critical'
        title: '🚨 CRITICAL: {{ .CommonLabels.alertname }}'
        text: '{{ .CommonAnnotations.description }}'
```

### Alert Rules

```yaml
# prometheus/rules.yml
groups:
  - name: homelab
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          description: '{{ $labels.job }} on {{ $labels.instance }} is down'

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          description: 'Memory usage above 90% on {{ $labels.instance }}'

      - alert: DiskSpaceLow
        expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          description: 'Disk space below 10% on {{ $labels.instance }}'

      - alert: HighDNSLatency
        expr: histogram_quantile(0.99, rate(dns_query_duration_seconds_bucket[5m])) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          description: 'DNS P99 latency above 100ms'
```

## Makefile for Common Operations

Every project has a Makefile for consistency:

```makefile
# Makefile
.PHONY: build run test deploy logs shell

# Development
build:
	docker build -t $(IMAGE_NAME):dev .

run:
	docker compose -f docker/docker-compose.yml up -d

stop:
	docker compose -f docker/docker-compose.yml down

logs:
	docker compose -f docker/docker-compose.yml logs -f

shell:
	docker compose -f docker/docker-compose.yml exec app /bin/sh

# Testing
test:
	cargo test

lint:
	cargo clippy -- -D warnings
	cargo fmt --check

# Production
deploy:
	docker compose -f deploy/docker-compose.yml pull
	docker compose -f deploy/docker-compose.yml up -d

rollback:
	docker compose -f deploy/docker-compose.yml down
	docker image rm $(IMAGE_NAME):latest
	docker pull $(IMAGE_NAME):previous
	docker tag $(IMAGE_NAME):previous $(IMAGE_NAME):latest
	docker compose -f deploy/docker-compose.yml up -d

# Maintenance
backup:
	./scripts/backup.sh

update:
	docker compose -f deploy/docker-compose.yml pull
	docker compose -f deploy/docker-compose.yml up -d
	docker system prune -f
```

## Complete Deployment Example

Deploying Shield AI from scratch:

```bash
# 1. Clone repository on Pi
ssh pi@192.168.1.10
git clone https://github.com/punitmishra/shield-ai.git
cd shield-ai/deploy

# 2. Create environment file
cp .env.example .env
vim .env  # Fill in secrets

# 3. Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u punitmishra --password-stdin

# 4. Deploy
docker compose up -d

# 5. Verify
docker compose ps
curl http://localhost:8080/health

# 6. Setup Cloudflare Tunnel
cd /home/pi/cloudflared
docker compose up -d

# 7. Configure router DNS to point to Pi
# Router > DHCP > DNS Server = 192.168.1.10
```

## Lessons Learned

After 50+ deployments:

1. **Automate everything** - Manual deploys introduce human error
2. **Health checks are essential** - Automatic recovery saves midnight pages
3. **Immutable images** - Never modify running containers
4. **Multi-arch from day one** - Cross-compilation is tricky to add later
5. **Cloudflare Tunnel > port forwarding** - Security with zero configuration
6. **Monitor before you need it** - Add Prometheus from the start

Total deployment time for a new project: ~5 minutes from push to production.
