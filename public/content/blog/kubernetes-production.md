---
title: "Kubernetes in Production: What They Don't Tell You"
date: "2024-11-28"
category: "Technical"
tags: ["Kubernetes", "DevOps", "Cloud", "Infrastructure"]
readTime: "9 min read"
---

After running Kubernetes in production for several years, I've encountered challenges that tutorials and documentation rarely mention. Here's the hard-won knowledge that can save you weeks of debugging.

## The Reality Check

Kubernetes is powerful, but it's not magic. In production, you'll face:

- **Networking complexity** that breaks in subtle ways
- **Storage issues** that cause data loss
- **Resource management** that's harder than it looks
- **Security concerns** that require constant attention

## Networking Nightmares

### Service Mesh Overhead

That Istio sidecar isn't free:

```yaml
# Each pod gets a sidecar
# Memory: 40-100MB per pod
# CPU: noticeable latency overhead
# Complexity: significant debugging overhead

# Consider: Do you actually need a service mesh?
# Often, simpler solutions work:
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-ingress
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - port: 8080
```

### DNS Resolution Failures

Under load, CoreDNS can become a bottleneck:

```yaml
# Increase CoreDNS replicas
apiVersion: apps/v1
kind: Deployment
metadata:
  name: coredns
  namespace: kube-system
spec:
  replicas: 3  # Default is often 2, not enough for large clusters

---
# Use node-local DNS cache
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-local-dns
  namespace: kube-system
# Caches DNS at node level, reduces CoreDNS load
```

### Connection Timeouts

The default connection tracking table size is too small:

```bash
# On each node, increase conntrack limits
sysctl -w net.netfilter.nf_conntrack_max=1000000
sysctl -w net.netfilter.nf_conntrack_tcp_timeout_established=86400
```

## Storage Gotchas

### PVC Reclaim Policies

The default `Delete` policy can cause data loss:

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: production-storage
provisioner: kubernetes.io/aws-ebs
reclaimPolicy: Retain  # NEVER use Delete for important data
volumeBindingMode: WaitForFirstConsumer
parameters:
  type: gp3
  iopsPerGB: "50"
```

### StatefulSet Headaches

Scaling StatefulSets is not as smooth as Deployments:

```yaml
# Scaling down removes pods in reverse order
# PVCs are NOT deleted automatically (good for safety, confusing for cleanup)

# Always use proper pod disruption budgets
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: database-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: database
```

## Resource Management Reality

### Requests vs Limits

This is where most teams get it wrong:

```yaml
resources:
  requests:
    # What scheduler uses for placement
    # Set to ACTUAL average usage
    memory: "256Mi"
    cpu: "100m"
  limits:
    # Max allowed - OOMKilled or CPU throttled if exceeded
    # Memory: set to handle spikes, but not too high
    # CPU: often better to NOT set (avoid throttling)
    memory: "512Mi"
    # cpu: "500m"  # Consider omitting CPU limits
```

### Quality of Service Classes

Understanding QoS is crucial:

```yaml
# Guaranteed: requests == limits (for critical workloads)
# Burstable: requests < limits (for most workloads)
# BestEffort: no requests/limits (first to be evicted)

# For production databases:
resources:
  requests:
    memory: "4Gi"
    cpu: "2"
  limits:
    memory: "4Gi"
    cpu: "2"
# This gets Guaranteed QoS - last to be evicted
```

## Security in Practice

### RBAC Mistakes

Overly permissive RBAC is common:

```yaml
# BAD: Giving cluster-admin to CI/CD
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: ci-admin
roleRef:
  kind: ClusterRole
  name: cluster-admin  # Never do this
  apiGroup: rbac.authorization.k8s.io

# GOOD: Namespace-scoped, minimal permissions
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: deployer
  namespace: production
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "patch"]
```

### Pod Security Standards

Enforce security baselines:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: production
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

## Observability Requirements

### What to Monitor

Critical metrics beyond the basics:

```yaml
# Custom metrics that matter
- name: pod_restart_rate
  expr: rate(kube_pod_container_status_restarts_total[5m])
  # Alert if > 0.1 restarts/min

- name: pvc_usage_percent
  expr: kubelet_volume_stats_used_bytes / kubelet_volume_stats_capacity_bytes
  # Alert if > 80%

- name: node_pressure
  expr: kube_node_status_condition{condition=~"MemoryPressure|DiskPressure|PIDPressure", status="true"}
  # Alert immediately
```

### Logging Architecture

Centralized logging is mandatory:

```yaml
# DaemonSet for log collection
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentbit
spec:
  template:
    spec:
      containers:
        - name: fluentbit
          resources:
            limits:
              memory: 200Mi
            requests:
              memory: 100Mi
          volumeMounts:
            - name: varlog
              mountPath: /var/log
              readOnly: true
```

## Upgrade Strategy

### Zero-Downtime Upgrades

Rolling updates need proper configuration:

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0  # Never have fewer than desired replicas
      maxSurge: 1        # Only one extra pod at a time
  template:
    spec:
      terminationGracePeriodSeconds: 60  # Give time to drain
      containers:
        - name: app
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 10"]
          # Wait for load balancer to update
```

## Key Takeaways

1. **Network policies first** - don't add service mesh until you need it
2. **Right-size resources** - monitor actual usage, not guesses
3. **Plan for failure** - pod disruption budgets, proper QoS
4. **Security by default** - restricted pod security, minimal RBAC
5. **Observe everything** - custom metrics, centralized logging, tracing

Kubernetes is a powerful platform, but it requires operational investment. Don't underestimate the learning curve and ongoing maintenance required for production deployments.
