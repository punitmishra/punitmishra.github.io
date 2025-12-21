<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { mdiGithub } from '@mdi/js';
import BaseIcon from '@/components/BaseIcon.vue';

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

const contributions = ref([]);
const loading = ref(true);
const error = ref(null);

// Generate calendar grid (last 52 weeks)
const weeks = computed(() => {
  const weeksArray = [];
  const today = new Date();
  
  for (let i = 51; i >= 0; i--) {
    const weekDate = new Date(today);
    weekDate.setDate(today.getDate() - (i * 7));
    weeksArray.push(weekDate);
  }
  
  return weeksArray;
});

// Fetch contribution data (using GitHub API)
const fetchContributions = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // Note: GitHub API doesn't provide direct contribution graph data
    // This is a simplified version. For full graph, you'd need to:
    // 1. Use GitHub's GraphQL API
    // 2. Or scrape the contribution graph (not recommended)
    // 3. Or use a third-party service
    
    // For now, we'll show a placeholder that can be enhanced
    // with actual API integration
    
    // Simulate contribution data structure
    contributions.value = weeks.value.map(() => ({
      date: new Date(),
      count: Math.floor(Math.random() * 10), // Placeholder
    }));
    
    loading.value = false;
  } catch (err) {
    error.value = err.message;
    loading.value = false;
  }
};

const getIntensity = (count) => {
  if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
  if (count < 3) return 'bg-green-200 dark:bg-green-900';
  if (count < 6) return 'bg-green-400 dark:bg-green-700';
  if (count < 9) return 'bg-green-600 dark:bg-green-600';
  return 'bg-green-800 dark:bg-green-500';
};

onMounted(() => {
  fetchContributions();
});
</script>

<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700">
    <div class="flex items-center gap-3 mb-6">
      <BaseIcon :path="mdiGithub" size="24" class="text-gray-700 dark:text-gray-300" />
      <h3 class="text-xl font-bold text-gray-900 dark:text-white font-heading">
        Contribution Activity
      </h3>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-pulse text-gray-400 font-display">Loading contributions...</div>
    </div>

    <div v-else-if="error" class="text-red-600 dark:text-red-400 text-sm font-display">
      {{ error }}
    </div>

    <div v-else class="space-y-4">
      <!-- Contribution Grid -->
      <div class="flex gap-1 overflow-x-auto pb-2">
        <div
          v-for="(week, weekIndex) in weeks"
          :key="weekIndex"
          class="flex flex-col gap-1"
        >
          <div
            v-for="day in 7"
            :key="day"
            :class="[
              'w-3 h-3 rounded-sm',
              getIntensity(contributions[weekIndex]?.count || 0),
              'hover:ring-2 hover:ring-blue-500 cursor-pointer transition-all'
            ]"
            :title="`${contributions[weekIndex]?.count || 0} contributions`"
          />
        </div>
      </div>

      <!-- Legend -->
      <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-display">
        <span>Less</span>
        <div class="flex gap-1">
          <div class="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div>
          <div class="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
          <div class="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
          <div class="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-600"></div>
          <div class="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-500"></div>
        </div>
        <span>More</span>
      </div>

      <p class="text-xs text-gray-500 dark:text-gray-500 text-center font-display">
        Note: Full contribution graph requires GitHub GraphQL API integration
      </p>
    </div>
  </div>
</template>

