<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const thoughts = [
  "Optimizing HNSW index for sub-10ms vector search at 50M scale...",
  "Designing zero-copy serialization for real-time ML inference pipelines...",
  "Implementing adaptive batching for GPU tensor operations...",
  "Profiling async Rust runtime for p99 latency improvements...",
  "Building lock-free concurrent data structures for high-throughput systems...",
  "Orchestrating multi-modal embeddings: CLIP + LLM + structured data fusion...",
  "Analyzing cache coherence patterns in distributed NUMA architectures...",
  "Designing cryptographic audit trails with Merkle tree verification...",
  "Implementing speculative execution for RAG context retrieval...",
  "Building columnar storage engine with SIMD vectorized scans...",
];

const currentThought = ref(thoughts[0]);
const displayText = ref("");
const isTyping = ref(true);
const thoughtIndex = ref(0);
const charIndex = ref(0);
let typeInterval = null;
let pauseTimeout = null;

const startTyping = () => {
  const thought = currentThought.value;

  if (charIndex.value < thought.length) {
    displayText.value = thought.substring(0, charIndex.value + 1);
    charIndex.value++;
    const char = thought[charIndex.value - 1];
    const delay = char === '.' || char === ',' ? 60 : char === ':' ? 40 : 20 + Math.random() * 10;
    typeInterval = setTimeout(startTyping, delay);
  } else {
    isTyping.value = false;
    pauseTimeout = setTimeout(() => {
      thoughtIndex.value = (thoughtIndex.value + 1) % thoughts.length;
      currentThought.value = thoughts[thoughtIndex.value];
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
  <div class="ai-terminal">
    <!-- Terminal Header -->
    <div class="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200/50 dark:border-slate-700/50">
      <div class="flex gap-1.5">
        <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
        <div class="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
      </div>
      <span class="text-[10px] font-mono text-gray-400 dark:text-gray-500 ml-2">neural-process v2.0</span>
    </div>

    <!-- Terminal Content -->
    <div class="font-mono text-sm">
      <!-- Prompt Line -->
      <div class="flex items-start gap-2">
        <span class="text-emerald-500 dark:text-emerald-400 select-none shrink-0">$</span>
        <div class="min-h-[2.5rem]">
          <span class="text-gray-700 dark:text-gray-300">{{ displayText }}</span>
          <span
            v-if="isTyping"
            class="inline-block w-2 h-4 bg-emerald-500 dark:bg-emerald-400 ml-0.5 animate-pulse align-middle"
          ></span>
        </div>
      </div>

      <!-- Status Line -->
      <div class="mt-4 flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            active
          </span>
          <span>|</span>
          <span>{{ thoughtIndex + 1 }}/{{ thoughts.length }}</span>
        </div>
        <span class="opacity-60">powered by curiosity</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-terminal {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.03), rgba(15, 23, 42, 0.01));
  border-radius: 0.75rem;
  padding: 1rem;
}

:root.dark .ai-terminal {
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.1));
}
</style>
