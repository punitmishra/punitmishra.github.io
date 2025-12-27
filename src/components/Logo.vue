<script setup>
import { computed } from 'vue';
import { useStyleStore } from '@/stores/style.js';

const props = defineProps({
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  showText: {
    type: Boolean,
    default: false,
  },
});

const styleStore = useStyleStore();

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };
  return sizes[props.size] || sizes.md;
});

const textSizeClasses = computed(() => {
  const sizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };
  return sizes[props.size] || sizes.md;
});
</script>

<template>
  <div class="flex items-center gap-2">
    <!-- Logo Icon -->
    <div
      :class="[
        sizeClasses,
        'relative flex items-center justify-center rounded-xl overflow-hidden',
        'bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900',
        'border border-blue-500/20',
        'shadow-lg shadow-blue-500/10'
      ]"
    >
      <!-- PM Text -->
      <span
        class="font-black bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent"
        :class="textSizeClasses"
      >
        PM
      </span>

      <!-- Subtle glow effect -->
      <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-cyan-500/5 pointer-events-none" />
    </div>

    <!-- Optional text -->
    <span
      v-if="showText"
      class="font-bold text-gray-900 dark:text-white"
      :class="textSizeClasses"
    >
      <span class="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Punit</span>
      <span class="text-gray-500 dark:text-gray-400 font-medium ml-1">Mishra</span>
    </span>
  </div>
</template>
