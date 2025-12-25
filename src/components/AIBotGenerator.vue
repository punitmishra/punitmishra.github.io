<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  mdiBrain,
  mdiLightningBolt,
  mdiRobot,
} from "@mdi/js";
import BaseIcon from "@/components/BaseIcon.vue";

const thoughts = [
  "Optimizing vector search with FAISS for 10M+ embeddings...",
  "Exploring HNSW indexing vs IVF for latency improvements...",
  "Implementing memory isolation for multi-tenant AI agents...",
  "Building secure RAG pipelines with encrypted context...",
  "Designing async Rust handlers for 100k concurrent connections...",
  "Profiling LangGraph orchestration bottlenecks...",
  "Implementing zero-copy deserialization for ML inference...",
  "Testing CLIP embeddings for visual search accuracy...",
  "Architecting event-driven microservices with Kafka...",
  "Deploying GPU workloads on Kubernetes with autoscaling...",
  "Building real-time bias detection for LLM outputs...",
  "Optimizing PostgreSQL queries with covering indexes...",
  "Implementing Redis caching with intelligent TTL strategies...",
  "Designing SOC 2 compliant audit trail systems...",
  "Profiling memory allocations in hot paths...",
  "Building custom tokenizers for domain-specific NLP...",
  "Implementing circuit breakers for resilient distributed systems...",
  "Testing multi-modal search with image and text fusion...",
  "Designing API rate limiting with token bucket algorithms...",
  "Building observability dashboards with OpenTelemetry...",
];

const currentThought = ref("");
const displayText = ref("");
const isTyping = ref(true);
const thoughtIndex = ref(0);
const charIndex = ref(0);
let typeInterval = null;
let pauseTimeout = null;

const startTyping = () => {
  const thought = thoughts[thoughtIndex.value];

  if (charIndex.value < thought.length) {
    displayText.value = thought.substring(0, charIndex.value + 1);
    charIndex.value++;
    typeInterval = setTimeout(startTyping, 30 + Math.random() * 20);
  } else {
    // Finished typing current thought
    isTyping.value = false;
    pauseTimeout = setTimeout(() => {
      // Move to next thought
      thoughtIndex.value = (thoughtIndex.value + 1) % thoughts.length;
      charIndex.value = 0;
      displayText.value = "";
      isTyping.value = true;
      startTyping();
    }, 2500);
  }
};

onMounted(() => {
  startTyping();
});

onUnmounted(() => {
  if (typeInterval) clearTimeout(typeInterval);
  if (pauseTimeout) clearTimeout(pauseTimeout);
});
</script>

<template>
  <div class="relative">
    <div class="flex items-start gap-3">
      <div class="relative flex-shrink-0">
        <div class="w-10 h-10 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <BaseIcon :path="mdiBrain" size="20" class="text-white" />
        </div>
        <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-sm font-semibold text-gray-900 dark:text-white font-heading">Thinking</span>
          <div v-if="isTyping" class="flex gap-0.5">
            <span class="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
            <span class="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
            <span class="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
          </div>
        </div>

        <div class="relative">
          <p class="text-sm text-gray-600 dark:text-gray-400 font-mono leading-relaxed min-h-[1.5rem]">
            {{ displayText }}<span v-if="isTyping" class="inline-block w-0.5 h-4 bg-blue-500 ml-0.5 animate-pulse"></span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
