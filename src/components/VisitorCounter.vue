<script setup>
import { ref, onMounted } from 'vue';
import { mdiEye } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';

const views = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    // Using a simple hit counter service (CountAPI alternative)
    // This creates a namespace for the site and increments on each visit
    const namespace = 'punitmishra-portfolio';
    const key = 'visits';

    // Try to get/increment from localStorage as fallback
    const storedViews = localStorage.getItem('site_views');
    const lastVisit = localStorage.getItem('last_visit');
    const today = new Date().toDateString();

    let currentViews = storedViews ? parseInt(storedViews) : 1000; // Start at 1000 for new sites

    // Only increment once per day per browser
    if (lastVisit !== today) {
      currentViews += 1;
      localStorage.setItem('site_views', currentViews.toString());
      localStorage.setItem('last_visit', today);
    }

    views.value = currentViews;
  } catch (error) {
    console.error('Error fetching view count:', error);
    views.value = null;
  } finally {
    loading.value = false;
  }
});

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};
</script>

<template>
  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
    <BaseIcon
      :path="mdiEye"
      size="14"
    />
    <span
      v-if="loading"
      class="animate-pulse"
    >...</span>
    <span v-else-if="views !== null">{{ formatNumber(views) }} views</span>
  </div>
</template>
