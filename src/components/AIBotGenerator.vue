<script setup>
import { ref, onMounted, computed } from "vue";
import {
  mdiBrain,
  mdiLightningBolt,
  mdiClockOutline,
  mdiCalendar,
  mdiDownload,
  mdiDelete,
  mdiSparkles,
  mdiThoughtBubble,
} from "@mdi/js";
import BaseIcon from "@/components/BaseIcon.vue";

const contextHistory = ref([]);
const currentContext = ref("");
const generating = ref(false);
const selectedFrequency = ref("daily");

const generateContext = async () => {
  generating.value = true;
  
  // Simulate AI generation with a more realistic delay
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  const newContext = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    frequency: selectedFrequency.value,
    content: generateContextContent(),
    metadata: {
      reposCount: 5,
      commitsCount: 12,
      activityLevel: "high",
    },
  };
  
  contextHistory.value.unshift(newContext);
  currentContext.value = newContext.content;
  generating.value = false;
  
  // Save to localStorage
  saveHistory();
};

const generateContextContent = () => {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
  if (selectedFrequency.value === "daily") {
    return `🧠 What's in Punit's Mind - ${date}

💡 Current Thoughts & Focus:
• Exploring advanced Rust memory management patterns for AI agents
• Designing scalable vector search architectures
• Thinking about security-first AI infrastructure

🚀 Active Development:
• LangGraph Rust Memory Manager - optimizing performance (3-5x improvement achieved)
• Vector Image Search Engine - enhancing CLIP embeddings and FAISS integration
• AI Security Dashboard - implementing real-time compliance monitoring

📊 Today's Progress:
• 5 repositories updated with latest improvements
• 12 commits across multiple projects
• 3 critical issues resolved
• Performance optimizations: 15% improvement in memory manager

🎯 Key Insights:
• Multi-tenant agent orchestration requires careful memory isolation
• Vector similarity search benefits from custom object detection pipelines
• Security compliance needs real-time bias detection and audit trails

🔮 What's Next:
• Continue Rust optimization work
• Plan next iteration of AI security features
• Review community feedback and integrate improvements
• Explore new multimodal search capabilities`;
  } else {
    return `⚡ Quick Mind Update - ${time}

🎯 Current Focus:
• Performance optimization on Rust implementations
• Security enhancements for AI infrastructure
• Code review and testing

📝 Recent Activity:
• Committed changes to LangGraph memory manager
• Updated vector search documentation
• Responded to GitHub issues

📈 Metrics (Last Hour):
• Code commits: 3
• Issues resolved: 1
• Documentation updates: 2
• Performance tests: 5 passed`;
  }
};

const saveHistory = () => {
  localStorage.setItem("punitMindHistory", JSON.stringify(contextHistory.value));
};

const loadHistory = () => {
  const saved = localStorage.getItem("punitMindHistory");
  if (saved) {
    try {
      contextHistory.value = JSON.parse(saved);
    } catch (e) {
      console.error("Error loading history:", e);
    }
  }
};

const exportContext = () => {
  if (!currentContext.value) return;
  
  const blob = new Blob([currentContext.value], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `punit-mind-${selectedFrequency.value}-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

const clearHistory = () => {
  if (confirm("Clear all mind history? This cannot be undone.")) {
    contextHistory.value = [];
    currentContext.value = "";
    localStorage.removeItem("punitMindHistory");
  }
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

onMounted(() => {
  loadHistory();
});
</script>

<template>
  <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border border-blue-200/50 dark:border-slate-700 shadow-2xl">
    <!-- Animated Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0); background-size: 40px 40px;"></div>
    </div>
    
    <!-- Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-indigo-500/5"></div>
    
    <div class="relative p-8 md:p-10">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-2xl blur-xl opacity-50 animate-pulse-slow"></div>
            <div class="relative w-16 h-16 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
              <BaseIcon :path="mdiBrain" size="32" class="text-white" />
            </div>
            <div class="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <BaseIcon :path="mdiSparkles" size="14" class="text-white" />
            </div>
          </div>
          <div>
            <h3 class="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight mb-1">
              What's in Punit's Mind
            </h3>
            <p class="text-sm md:text-base text-gray-600 dark:text-gray-400 font-display flex items-center gap-2">
              <BaseIcon :path="mdiThoughtBubble" size="16" />
              <span>Peek into current thoughts, projects, and insights</span>
            </p>
          </div>
        </div>
        
        <button
          @click="generateContext"
          :disabled="generating"
          class="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 text-white rounded-full font-bold hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span v-if="!generating" class="relative flex items-center gap-3 font-display">
            <BaseIcon :path="mdiLightningBolt" size="24" />
            <span>Generate Thoughts</span>
          </span>
          <span v-else class="relative flex items-center gap-3 font-display">
            <div class="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Thinking...</span>
          </span>
        </button>
      </div>

      <!-- Controls -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 dark:border-slate-700/50">
          <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-display">Frequency</label>
          <select
            v-model="selectedFrequency"
            class="w-full px-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-display focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
          >
            <option value="daily">📅 Daily Thoughts</option>
            <option value="hourly">⚡ Quick Updates</option>
          </select>
        </div>
        
        <button
          @click="exportContext"
          :disabled="!currentContext"
          class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-gray-200/50 dark:border-slate-700/50 hover:border-blue-500 dark:hover:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-gray-700 dark:text-gray-300 font-display"
        >
          <BaseIcon :path="mdiDownload" size="20" />
          <span>Export</span>
        </button>
        
        <button
          @click="clearHistory"
          class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border-2 border-red-200/50 dark:border-red-900/30 hover:border-red-500 dark:hover:border-red-500 transition-all flex items-center justify-center gap-3 font-semibold text-red-700 dark:text-red-300 font-display"
        >
          <BaseIcon :path="mdiDelete" size="20" />
          <span>Clear History</span>
        </button>
      </div>

      <!-- Current Context Display -->
      <div v-if="currentContext" class="mb-8">
        <div class="relative bg-gradient-to-br from-white/90 to-blue-50/50 dark:from-slate-800/90 dark:to-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border-2 border-blue-200/50 dark:border-slate-700/50 shadow-xl">
          <!-- Decorative Elements -->
          <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
          
          <div class="relative">
            <div class="flex items-center justify-between mb-6">
              <h4 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 font-heading">
                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <BaseIcon :path="mdiClockOutline" size="20" class="text-white" />
                </div>
                <span>Current Thoughts</span>
              </h4>
              <span class="text-xs text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-slate-700/50 px-3 py-1.5 rounded-full font-mono">
                {{ new Date().toLocaleString() }}
              </span>
            </div>
            <div class="bg-white/50 dark:bg-slate-900/50 rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/50">
              <pre class="text-sm md:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono leading-relaxed">{{ currentContext }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- History Section -->
      <div>
        <div class="flex items-center justify-between mb-6">
          <h4 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3 font-heading">
            <div class="w-10 h-10 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <BaseIcon :path="mdiCalendar" size="20" class="text-white" />
            </div>
            <span>Mind History</span>
          </h4>
          <span class="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-slate-700/50 px-4 py-2 rounded-full font-display">
            {{ contextHistory.length }} {{ contextHistory.length === 1 ? 'entry' : 'entries' }}
          </span>
        </div>
        
        <div class="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          <div
            v-for="item in contextHistory"
            :key="item.id"
            @click="currentContext = item.content"
            class="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border-2 border-gray-200/50 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all transform hover:scale-[1.02] hover:shadow-lg"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BaseIcon :path="selectedFrequency === 'daily' ? mdiCalendar : mdiClockOutline" size="16" class="text-white" />
                </div>
                <div>
                  <span class="text-sm font-bold text-gray-900 dark:text-white capitalize font-heading">
                    {{ item.frequency === 'daily' ? '📅 Daily Thoughts' : '⚡ Quick Update' }}
                  </span>
                  <p class="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">
                    {{ formatDate(item.timestamp) }}
                  </p>
                </div>
              </div>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 font-display leading-relaxed">
              {{ item.content.substring(0, 150) }}...
            </p>
            <div class="mt-3 pt-3 border-t border-gray-200/50 dark:border-slate-700/50 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="font-semibold">Click to view full thoughts</span>
              <BaseIcon :path="mdiLightningBolt" size="14" />
            </div>
          </div>
          
          <div v-if="contextHistory.length === 0" class="text-center py-12 bg-white/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700">
            <BaseIcon :path="mdiThoughtBubble" size="48" class="text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p class="text-gray-500 dark:text-gray-400 font-display font-semibold mb-2">No thoughts yet</p>
            <p class="text-sm text-gray-400 dark:text-gray-500 font-display">Generate your first mind snapshot!</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #06b6d4, #6366f1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #0891b2, #4f46e5);
}
</style>
