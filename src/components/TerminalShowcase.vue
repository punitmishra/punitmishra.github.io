<script setup>
import { ref } from 'vue';
import TerminalDemo from './TerminalDemo.vue';
import BaseIcon from './BaseIcon.vue';
import { mdiConsole, mdiPlay, mdiOpenInNew } from '@mdi/js';

const activeDemo = ref(0);

const demos = [
  {
    id: 'shield-ai',
    title: 'Shield AI - DNS Security',
    description: 'AI-powered DNS filtering with real-time threat detection',
    commands: [
      {
        prompt: '$ ',
        input: 'cargo run --release',
        delay: 500,
        output: [
          '   Compiling shield-ai v0.1.0',
          '    Finished release [optimized] target(s) in 2.34s',
          '     Running `target/release/shield-ai`',
        ],
        pauseAfter: 800,
      },
      {
        prompt: '$ ',
        input: 'shield-ai start --config /etc/shield/config.toml',
        delay: 400,
        output: [
          '[INFO] Loading configuration...',
          '[INFO] Initializing ML engine (DGA detection)...',
          '[INFO] Loading 847,293 blocklist entries...',
          '[INFO] Starting DNS server on 0.0.0.0:53',
          '[INFO] Starting API server on 0.0.0.0:8080',
          '[INFO] Shield AI ready! Monitoring DNS traffic...',
        ],
        outputColor: 'success',
        pauseAfter: 1200,
      },
      {
        prompt: '$ ',
        input: 'shield-ai stats --live',
        delay: 300,
        output: [
          '╭─────────────────────────────────────────────╮',
          '│  Shield AI Stats (Live)                     │',
          '├─────────────────────────────────────────────┤',
          '│  Queries/sec:     12,847                    │',
          '│  Blocked:         2.3% (298 threats)        │',
          '│  Cache hit rate:  94.7%                     │',
          '│  Avg latency:     0.8ms                     │',
          '│  Memory usage:    14.2 MB                   │',
          '╰─────────────────────────────────────────────╯',
        ],
        outputColor: 'info',
        pauseAfter: 2000,
      },
    ],
  },
  {
    id: 'rust-cli',
    title: 'Rust CLI Tools',
    description: 'Building blazing fast command-line applications',
    commands: [
      {
        prompt: '$ ',
        input: 'cargo new rust-find && cd rust-find',
        delay: 400,
        output: [
          '     Created binary (application) `rust-find` package',
        ],
        pauseAfter: 600,
      },
      {
        prompt: '$ ',
        input: 'cargo add clap walkdir rayon colored anyhow',
        delay: 500,
        output: [
          '    Updating crates.io index',
          '      Adding clap v4.4 to dependencies',
          '      Adding walkdir v2.4 to dependencies',
          '      Adding rayon v1.8 to dependencies',
          '      Adding colored v2.1 to dependencies',
          '      Adding anyhow v1.0 to dependencies',
        ],
        outputColor: 'success',
        pauseAfter: 800,
      },
      {
        prompt: '$ ',
        input: 'cargo build --release',
        delay: 600,
        output: [
          '   Compiling rust-find v0.1.0',
          '    Finished release [optimized] target(s) in 8.42s',
        ],
        pauseAfter: 600,
      },
      {
        prompt: '$ ',
        input: './target/release/rust-find "\\.rs$" --size',
        delay: 300,
        output: [
          '    2.1K  ./src/main.rs',
          '    4.8K  ./src/walker.rs',
          '    1.2K  ./src/filter.rs',
          '    892B  ./src/output.rs',
          '',
          '4 matches found in 0.003s',
        ],
        outputColor: 'highlight',
        pauseAfter: 1500,
      },
    ],
  },
  {
    id: 'vector-search',
    title: 'Vector Search Engine',
    description: 'CLIP embeddings + FAISS for similarity search',
    commands: [
      {
        prompt: '$ ',
        input: 'python -m venv venv && source venv/bin/activate',
        delay: 300,
        output: [],
        pauseAfter: 400,
      },
      {
        prompt: '(venv) $ ',
        input: 'pip install torch faiss-cpu transformers clip-by-openai',
        delay: 600,
        output: [
          'Installing collected packages: torch, faiss-cpu, transformers...',
          'Successfully installed torch-2.1.0 faiss-cpu-1.7.4',
        ],
        pauseAfter: 800,
      },
      {
        prompt: '(venv) $ ',
        input: 'python index_products.py --images ./data/products/',
        delay: 500,
        output: [
          '[INFO] Loading CLIP model (ViT-B/32)...',
          '[INFO] Processing 30,847 product images...',
          '[████████████████████████████████] 100%',
          '[INFO] Building FAISS index (IVF4096,PQ32)...',
          '[INFO] Index saved: product_index.faiss (128MB)',
          '[INFO] Indexing complete in 4m 23s',
        ],
        outputColor: 'success',
        pauseAfter: 1000,
      },
      {
        prompt: '(venv) $ ',
        input: 'python search.py --query "red leather handbag" --top-k 5',
        delay: 400,
        output: [
          'Query: "red leather handbag"',
          '',
          '  1. SKU-8847 (score: 0.94) - Coach Red Leather Tote',
          '  2. SKU-2341 (score: 0.91) - Michael Kors Crimson Bag',
          '  3. SKU-9982 (score: 0.89) - Kate Spade Ruby Satchel',
          '  4. SKU-1123 (score: 0.87) - Fossil Burgundy Crossbody',
          '  5. SKU-4456 (score: 0.85) - Coach Cherry Shoulder Bag',
          '',
          'Search completed in 23ms',
        ],
        outputColor: 'info',
        pauseAfter: 2000,
      },
    ],
  },
  {
    id: 'kubernetes',
    title: 'Kubernetes Deployment',
    description: 'Production cluster management with kubespray',
    commands: [
      {
        prompt: '$ ',
        input: 'kubectl get nodes -o wide',
        delay: 400,
        output: [
          'NAME      STATUS   ROLES           AGE   VERSION   INTERNAL-IP',
          'master1   Ready    control-plane   45d   v1.28.4   10.0.1.10',
          'master2   Ready    control-plane   45d   v1.28.4   10.0.1.11',
          'worker1   Ready    <none>          45d   v1.28.4   10.0.2.10',
          'worker2   Ready    <none>          45d   v1.28.4   10.0.2.11',
          'worker3   Ready    <none>          45d   v1.28.4   10.0.2.12',
        ],
        pauseAfter: 800,
      },
      {
        prompt: '$ ',
        input: 'kubectl apply -f shield-ai-deployment.yaml',
        delay: 500,
        output: [
          'namespace/shield-ai created',
          'deployment.apps/shield-ai created',
          'service/shield-ai-dns created',
          'service/shield-ai-api created',
          'configmap/shield-ai-config created',
          'horizontalpodautoscaler.autoscaling/shield-ai created',
        ],
        outputColor: 'success',
        pauseAfter: 800,
      },
      {
        prompt: '$ ',
        input: 'kubectl get pods -n shield-ai -w',
        delay: 400,
        output: [
          'NAME                         READY   STATUS    RESTARTS   AGE',
          'shield-ai-7d8f9c6b4d-x2k9l   1/1     Running   0          12s',
          'shield-ai-7d8f9c6b4d-m4n7p   1/1     Running   0          12s',
          'shield-ai-7d8f9c6b4d-q9r2s   1/1     Running   0          12s',
        ],
        outputColor: 'success',
        pauseAfter: 1500,
      },
    ],
  },
];

const setActiveDemo = (index) => {
  activeDemo.value = index;
};
</script>

<template>
  <section
    id="terminal-demos"
    class="py-14 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
  >
    <div class="max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center mb-10">
        <div class="flex items-center justify-center gap-2 mb-3">
          <BaseIcon
            :path="mdiConsole"
            size="32"
            class="text-emerald-400"
          />
          <span class="inline-block px-3 py-1 text-sm font-medium text-emerald-400 bg-emerald-900/30 rounded-full">Live Demos</span>
        </div>
        <h2 class="text-3xl md:text-4xl font-bold text-white font-heading tracking-tight mb-2">
          Terminal Showcase
        </h2>
        <p class="text-base text-gray-400">
          Watch real command-line workflows from my projects
        </p>
      </div>

      <!-- Demo Tabs -->
      <div class="flex flex-wrap justify-center gap-2 mb-8">
        <button
          v-for="(demo, index) in demos"
          :key="demo.id"
          :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-all',
            activeDemo === index
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
              : 'bg-slate-700/50 text-gray-400 hover:bg-slate-700 hover:text-white'
          ]"
          @click="setActiveDemo(index)"
        >
          {{ demo.title }}
        </button>
      </div>

      <!-- Active Demo -->
      <div class="max-w-4xl mx-auto">
        <div class="mb-4">
          <h3 class="text-xl font-semibold text-white mb-1">
            {{ demos[activeDemo].title }}
          </h3>
          <p class="text-gray-400 text-sm">
            {{ demos[activeDemo].description }}
          </p>
        </div>

        <!-- Terminal Demo Component -->
        <TerminalDemo
          :key="demos[activeDemo].id"
          :title="demos[activeDemo].title"
          :commands="demos[activeDemo].commands"
          :auto-play="true"
          :loop="true"
          :typing-speed="35"
        />
      </div>

      <!-- Real Asciinema Link -->
      <div class="mt-10 text-center">
        <a
          href="https://asciinema.org/~punitmishra"
          target="_blank"
          class="inline-flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-gray-300 hover:text-white rounded-full font-medium transition-all border border-slate-600/50 hover:border-emerald-500/50"
        >
          <BaseIcon
            :path="mdiPlay"
            size="20"
            class="text-emerald-400"
          />
          <span>View Real Recordings on Asciinema</span>
          <BaseIcon
            :path="mdiOpenInNew"
            size="16"
            class="opacity-50"
          />
        </a>
      </div>
    </div>
  </section>
</template>
