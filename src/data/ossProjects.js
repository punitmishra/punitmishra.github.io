// Open-source project pages. These back the OSS rows in Selected Work and
// /project/<slug>. The <slug> is also the GitHub repo name, so the detail
// page renders this static content first (never blank) and enriches it with
// live GitHub stats/commits when the API is reachable.

const GH = "punitmishra";

export const ossProjects = [
  {
    slug: "coviber",
    name: "CoViber",
    card: "Local-first memory for LLMs over MCP — a work graph, an urgency triage queue, and local semantic search. Your data never leaves your machine.",
    summary:
      "Local-first memory for LLMs, exposed over the Model Context Protocol. CoViber gives Claude (or any MCP client) continuous personal context — who you work with, what's in flight, and what actually needs attention — while keeping every byte on your machine. No cloud egress, no telemetry.",
    highlights: [
      "Work graph — people, projects, channels, and tickets cross-linked automatically from whatever sources you plug in.",
      "Triage queue — a multi-signal urgency score over the raw stream, so the important things surface first.",
      "Local semantic memory — on-device embeddings answer \"what did I miss about X?\" with no cloud round-trip.",
      "\"Swap the loader, keep the brain\": a pluggable Loader turns any source (IMAP, Slack export, web scrape, JSONL) into canonical records; everything downstream is loader-agnostic.",
      "Dependency-free core, Apache-2.0. Design and evaluation are written up in a whitepaper — Continuous Context Replication for AI-Augmented Knowledge Work.",
    ],
    stack: ["Python", "MCP", "Work Graph", "Local Embeddings"],
    url: `https://github.com/${GH}/coviber`,
  },
  {
    slug: "vaultic",
    name: "Vaultic",
    card: "Local-first, hardware-secured password manager in Rust — one encrypted vault across CLI, TUI, daemon, GUI, and an MCP server. No cloud, no account.",
    summary:
      "A local-first, encrypted password manager in Rust. Your vault is a directory of encrypted files on your machine, shared by a CLI, a TUI, a background daemon, a GUI, and an MCP server — all one on-disk format. No cloud, no account, no telemetry.",
    highlights: [
      "Vetted, modern cryptography: Argon2id key derivation (64 MB), XChaCha20-Poly1305 authenticated encryption, X25519 for sharing — no home-rolled crypto.",
      "Hardware-backed authentication with FIDO2 / YubiKey.",
      "One encrypted vault, five front ends — CLI, TUI, daemon, GUI, and an MCP server — sharing a single on-disk format.",
      "Actively released (v2.3.x), distributed via a Homebrew tap and cargo install.",
    ],
    stack: ["Rust", "FIDO2", "XChaCha20", "MCP"],
    url: `https://github.com/${GH}/vaultic`,
  },
  {
    slug: "shield-ai",
    name: "Shield AI",
    card: "AI-powered DNS filtering with real-time threat detection.",
    summary:
      "AI-powered DNS filtering with real-time threat detection — classifying and blocking malicious domains as queries happen.",
    highlights: [
      "DNS-layer filtering that classifies domains in real time.",
      "Threat detection driven by an ML model rather than static blocklists alone.",
    ],
    stack: ["TypeScript", "AI/ML", "DNS"],
    url: `https://github.com/${GH}/shield-ai`,
  },
  {
    slug: "railroad-arcade",
    name: "Railroad Arcade",
    card: "Full-stack IoT app controlling a real HO-scale model railroad — Next.js front end, a Rust backend on a Raspberry Pi driving the hardware.",
    summary:
      "A full-stack IoT project that controls a real HO-scale model railroad. A Next.js front end talks to a Rust backend running on a Raspberry Pi, which drives the physical hardware.",
    highlights: [
      "Next.js front end for driving the layout from any browser.",
      "Rust backend on a Raspberry Pi bridging software to real-world hardware.",
      "Controls a physical HO-scale model railroad end to end.",
    ],
    stack: ["Next.js", "Rust", "IoT", "Raspberry Pi"],
    url: `https://github.com/${GH}/railroad-arcade`,
  },
  {
    slug: "esp32-firmware",
    name: "RailCommand Firmware",
    card: "Multi-node ESP32-C3 firmware — the embedded layer beneath Railroad Arcade.",
    summary:
      "Multi-node ESP32-C3 firmware — the embedded layer beneath Railroad Arcade, running on the microcontrollers that drive the track hardware.",
    highlights: [
      "Runs across multiple ESP32-C3 nodes.",
      "The embedded firmware layer that Railroad Arcade's backend commands.",
    ],
    stack: ["C++", "ESP32-C3", "Embedded"],
    url: `https://github.com/${GH}/esp32-firmware`,
  },
  {
    slug: "pi-race",
    name: "Pi Race",
    card: "Zero-dependency Rust CLI racing four classic π algorithms on accuracy and speed.",
    summary:
      "A zero-dependency Rust CLI that races four classic π-computing algorithms against each other, comparing them on both accuracy and speed.",
    highlights: [
      "Implements four classic π algorithms and benchmarks them head to head.",
      "Zero dependencies — pure Rust, standard library only.",
    ],
    stack: ["Rust", "CLI", "Numerics"],
    url: `https://github.com/${GH}/pi-race`,
  },
];

export const ossProjectBySlug = Object.fromEntries(ossProjects.map((p) => [p.slug, p]));
