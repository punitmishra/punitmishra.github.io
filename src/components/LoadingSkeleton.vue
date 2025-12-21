<script setup>
defineProps({
  type: {
    type: String,
    default: 'card', // card, text, avatar, list
  },
  count: {
    type: Number,
    default: 1,
  },
});
</script>

<template>
  <div v-for="i in count" :key="i" class="animate-pulse">
    <!-- Card Skeleton -->
    <div v-if="type === 'card'" class="bg-gray-200 dark:bg-slate-700 rounded-2xl p-6 space-y-4">
      <div class="h-4 bg-gray-300 dark:bg-slate-600 rounded w-3/4"></div>
      <div class="h-4 bg-gray-300 dark:bg-slate-600 rounded w-1/2"></div>
      <div class="h-32 bg-gray-300 dark:bg-slate-600 rounded"></div>
    </div>
    
    <!-- Text Skeleton -->
    <div v-else-if="type === 'text'" class="space-y-2">
      <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
      <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
      <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/6"></div>
    </div>
    
    <!-- Avatar Skeleton -->
    <div v-else-if="type === 'avatar'" class="flex items-center space-x-4">
      <div class="h-16 w-16 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
      <div class="space-y-2 flex-1">
        <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
        <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
      </div>
    </div>
    
    <!-- List Skeleton -->
    <div v-else-if="type === 'list'" class="space-y-3">
      <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
      <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded"></div>
      <div class="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>

