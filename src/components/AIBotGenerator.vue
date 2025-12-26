<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import {
  mdiBrain,
  mdiLightningBolt,
  mdiChip,
  mdiCodeBraces,
  mdiDatabase,
  mdiShield,
  mdiRocket,
  mdiCog,
} from "@mdi/js";
import BaseIcon from "@/components/BaseIcon.vue";

// Thought categories with icons and colors
const categories = {
  architecture: { icon: mdiChip, color: "from-violet-500 to-purple-500", label: "Architecture" },
  optimization: { icon: mdiLightningBolt, color: "from-amber-500 to-orange-500", label: "Optimization" },
  ml: { icon: mdiBrain, color: "from-blue-500 to-cyan-500", label: "AI/ML" },
  security: { icon: mdiShield, color: "from-rose-500 to-pink-500", label: "Security" },
  systems: { icon: mdiCog, color: "from-emerald-500 to-teal-500", label: "Systems" },
  data: { icon: mdiDatabase, color: "from-indigo-500 to-blue-500", label: "Data" },
};

const thoughts = [
  { text: "Evaluating HNSW vs IVF-PQ trade-offs for 50M vector index...", category: "ml", depth: "deep" },
  { text: "Profiling cache coherence patterns in multi-socket NUMA systems...", category: "systems", depth: "deep" },
  { text: "Designing zero-trust service mesh with mTLS rotation...", category: "security", depth: "deep" },
  { text: "Implementing speculative execution for RAG context retrieval...", category: "architecture", depth: "elite" },
  { text: "Analyzing GC pause distributions under 100k req/s load...", category: "optimization", depth: "deep" },
  { text: "Building columnar storage engine with SIMD vectorization...", category: "data", depth: "elite" },
  { text: "Orchestrating multi-modal fusion: CLIP + LLM + structured data...", category: "ml", depth: "elite" },
  { text: "Implementing lock-free concurrent B+ tree for LSM storage...", category: "systems", depth: "elite" },
  { text: "Designing audit trail with cryptographic integrity proofs...", category: "security", depth: "deep" },
  { text: "Profiling async Rust runtime for tail latency regression...", category: "optimization", depth: "deep" },
  { text: "Building adaptive batch sizing for GPU tensor operations...", category: "ml", depth: "deep" },
  { text: "Implementing copy-on-write semantics for immutable state trees...", category: "architecture", depth: "deep" },
  { text: "Designing distributed consensus with Raft pipelining...", category: "systems", depth: "elite" },
  { text: "Analyzing entropy sources for cryptographic key derivation...", category: "security", depth: "elite" },
  { text: "Building query optimizer with cardinality estimation...", category: "data", depth: "elite" },
  { text: "Implementing gradient checkpointing for memory-efficient training...", category: "ml", depth: "deep" },
  { text: "Designing backpressure propagation in reactive streams...", category: "architecture", depth: "deep" },
  { text: "Profiling page fault patterns for memory-mapped I/O...", category: "systems", depth: "elite" },
  { text: "Building real-time anomaly detection on streaming embeddings...", category: "ml", depth: "deep" },
  { text: "Implementing sharded bloom filters for membership queries...", category: "data", depth: "deep" },
];

const currentThought = ref(thoughts[0]);
const displayText = ref("");
const isTyping = ref(true);
const thoughtIndex = ref(0);
const charIndex = ref(0);
const processingDepth = ref(0); // 0-100 for progress animation
let typeInterval = null;
let pauseTimeout = null;
let depthInterval = null;

const currentCategory = computed(() => categories[currentThought.value.category]);

const startTyping = () => {
  const thought = currentThought.value.text;

  if (charIndex.value < thought.length) {
    displayText.value = thought.substring(0, charIndex.value + 1);
    charIndex.value++;
    // Variable speed based on punctuation
    const char = thought[charIndex.value - 1];
    const delay = char === '.' || char === ',' ? 80 : char === ':' ? 60 : 25 + Math.random() * 15;
    typeInterval = setTimeout(startTyping, delay);
  } else {
    isTyping.value = false;

    // Animate processing depth
    processingDepth.value = 0;
    const targetDepth = currentThought.value.depth === 'elite' ? 100 : 75;
    depthInterval = setInterval(() => {
      processingDepth.value = Math.min(processingDepth.value + 2, targetDepth);
      if (processingDepth.value >= targetDepth) {
        clearInterval(depthInterval);
      }
    }, 20);

    pauseTimeout = setTimeout(() => {
      thoughtIndex.value = (thoughtIndex.value + 1) % thoughts.length;
      currentThought.value = thoughts[thoughtIndex.value];
      charIndex.value = 0;
      displayText.value = "";
      processingDepth.value = 0;
      isTyping.value = true;
      startTyping();
    }, 3000);
  }
};

onMounted(() => {
  startTyping();
});

onUnmounted(() => {
  if (typeInterval) clearTimeout(typeInterval);
  if (pauseTimeout) clearTimeout(pauseTimeout);
  if (depthInterval) clearInterval(depthInterval);
});
</script>

<template>
  <div class="ai-insights">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="relative">
          <div :class="['w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center', currentCategory.color]">
            <BaseIcon :path="currentCategory.icon" size="16" class="text-white" />
          </div>
          <div class="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
        </div>
        <div>
          <span class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Neural Process</span>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <span :class="['px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded',
          currentThought.depth === 'elite'
            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400']">
          {{ currentThought.depth === 'elite' ? '◆ Elite' : '○ Deep' }}
        </span>
      </div>
    </div>

    <!-- Category Tag -->
    <div class="flex items-center gap-2 mb-3">
      <span :class="['px-2 py-0.5 text-[10px] font-medium rounded-full bg-gradient-to-r text-white', currentCategory.color]">
        {{ currentCategory.label }}
      </span>
      <div v-if="isTyping" class="flex gap-0.5 items-center">
        <span class="text-[10px] text-gray-400 font-mono">processing</span>
        <span class="w-1 h-1 bg-blue-400 rounded-full animate-ping"></span>
      </div>
    </div>

    <!-- Thought Display -->
    <div class="relative min-h-[3rem] mb-3">
      <p class="text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed">
        <span class="text-gray-400 dark:text-gray-500 select-none">›</span>
        {{ displayText }}<span v-if="isTyping" class="inline-block w-[2px] h-4 bg-blue-500 ml-0.5 animate-pulse align-middle"></span>
      </p>
    </div>

    <!-- Processing Depth Bar -->
    <div class="space-y-1.5">
      <div class="flex justify-between items-center">
        <span class="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Reasoning Depth</span>
        <span class="text-[10px] font-mono text-gray-500 dark:text-gray-400">{{ processingDepth }}%</span>
      </div>
      <div class="h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          :class="['h-full rounded-full transition-all duration-300 bg-gradient-to-r', currentCategory.color]"
          :style="{ width: `${processingDepth}%` }"
        ></div>
      </div>
    </div>

    <!-- Neural Activity Indicator -->
    <div class="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/50">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex -space-x-1">
            <div v-for="i in 4" :key="i"
              :class="['w-5 h-5 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold',
                i <= 2 ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-400']">
              {{ ['λ', 'Σ', '∂', 'π'][i-1] }}
            </div>
          </div>
          <span class="text-[10px] text-gray-400 dark:text-gray-500">2 threads active</span>
        </div>
        <div class="flex items-center gap-1">
          <div v-for="i in 5" :key="i"
            :class="['w-0.5 rounded-full transition-all duration-300',
              i <= Math.ceil(processingDepth / 25) + 1 ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-slate-600']"
            :style="{ height: `${8 + (i * 3)}px` }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ai-insights {
  position: relative;
}

/* Subtle gradient border effect */
.ai-insights::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(6, 182, 212, 0.1));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
</style>
