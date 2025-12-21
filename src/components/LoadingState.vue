<script setup>
import { mdiLoading } from '@mdi/js';
import BaseIcon from '@/components/BaseIcon.vue';

defineProps({
  message: {
    type: String,
    default: 'Loading...',
  },
  size: {
    type: String,
    default: 'medium', // 'small', 'medium', 'large'
  },
});
</script>

<template>
  <div class="flex flex-col items-center justify-center p-8">
    <BaseIcon
      :path="mdiLoading"
      :size="size === 'small' ? 24 : size === 'large' ? 48 : 32"
      class="text-blue-600 dark:text-blue-400 animate-spin mb-4"
    />
    <p class="text-gray-600 dark:text-gray-400 font-display">{{ message }}</p>
  </div>
</template>

