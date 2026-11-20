// Static "professional work" project pages (not GitHub repos).
// Content drafted from the current résumé (public/data-sources/resume.json) — anonymised,
// no invented metrics. These back the PRO rows in Selected Work and /project/<slug>.

export const sapProjects = [
  {
    slug: "domain-data-access-agents",
    name: "Domain Data Access Agents",
    org: "SAP · CX Data & AI",
    period: "2024 — Present",
    // short line used on the landing's Selected Work row
    card: "Natural-language-to-SQL over S/4HANA; decision-match accuracy 59%→65% with reranking and schema-aware planning.",
    summary:
      "A domain-agnostic conversational agent platform (APEX) with natural-language-to-SQL over S/4HANA — turning business questions into validated, safe queries. Shipping in SAP's 2026 public and private cloud releases.",
    highlights: [
      "Memory-managed agent runtime with multi-tenant LangGraph orchestration, reusable across business domains; performance-critical paths in Rust.",
      "NL-to-SQL over S/4HANA (+ Ariba): decision-match accuracy 59.2% → 64.8%, reranking 50% → 53% — on real numbers, never invented.",
      "Brought SAP's own LLM (Nova) in as a first-class alternative to external frontier models — self-hosted serving, a retriever-reranker, and seven benchmark lanes.",
      "APEX: direct app tenancy auto-provisioned via BTP UCL formations, enabling self-service customer onboarding.",
      "Hardened internal-auth contract (ADR 0021) — a constant-time shared-secret check that closed a real cross-tenant data-leak class across four services.",
    ],
    stack: ["LangGraph", "Nova (SAP LLM)", "NL-to-SQL", "S/4HANA", "Rust", "RAG", "Qdrant"],
  },
  {
    slug: "llm-inference-platform",
    name: "LLM Inference Platform",
    org: "SAP · CX Data & AI",
    period: "2022 — Present",
    card: "Multi-model LLM serving on custom bare-metal H100 GPU clusters with distributed scheduling on Ray.",
    summary:
      "The inference and evaluation backbone for SAP CX AI — multi-model LLM serving on custom bare-metal H100 GPU clusters, built to run self-hosted and frontier models side by side under one evaluation harness.",
    highlights: [
      "Introduced Ray and built LLM serving on custom bare-metal H100 GPU clusters.",
      "Multi-model serving (self-hosted + Claude-, Qwen-, Granite-class) on Kubernetes.",
      "Automated evaluation harnesses and benchmark lanes for every model and release.",
    ],
    stack: ["Ray", "H100 GPUs", "Kubernetes", "Knative / KServe", "Python", "Eval harnesses"],
  },
  {
    slug: "cx-commerce-ai-toolkit",
    name: "CX & Commerce AI Toolkit",
    org: "SAP · CX Data & AI",
    period: "2018 — Present",
    card: "Visual + textual LLM agents across SAP CX & Commerce (PyTorch on Kubernetes), with vector search + RAG.",
    summary:
      "Visual and textual LLM agents delivered across SAP's CX & Commerce products, backed by multi-tenant ML infrastructure spanning the CX cloud.",
    highlights: [
      "Visual + textual LLM agents (PyTorch on Kubernetes) across SAP's CX & Commerce AI Toolkit.",
      "Visual-attribute prediction on OpenAI / CLIP embeddings, backed by vector search + RAG.",
      "Multi-tenant ML on Kubeflow & Knative (Azure AKS) across the CX cloud (C4C, CPQ, CDC), with feature stores (Feathr, Feast).",
      "Re-architected vision into gRPC agent services.",
    ],
    stack: ["PyTorch", "CLIP", "Vector Search", "Kubeflow", "Knative", "gRPC", "Azure AKS"],
  },
];

export const sapProjectBySlug = Object.fromEntries(sapProjects.map((p) => [p.slug, p]));
