<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  name: { type: String, required: true },
  level: { type: Number, default: 0 },
  color: { type: String, default: '#3b82f6' },
  size: { type: Number, default: 120 },
  strokeWidth: { type: Number, default: 8 },
});

const isVisible = ref(false);
const currentLevel = ref(0);

const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const offset = computed(() => circumference.value - (currentLevel.value / 100) * circumference.value);

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
    // Animate the level
    const duration = 1500;
    const start = performance.now();
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3);
      currentLevel.value = props.level * eased;
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, 100);
});
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <div
      class="relative"
      :style="{ width: `${size}px`, height: `${size}px` }"
    >
      <!-- Background ring -->
      <svg
        :width="size"
        :height="size"
        class="transform -rotate-90"
      >
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          class="stroke-gray-200 dark:stroke-slate-700"
          :stroke-width="strokeWidth"
        />
        <!-- Progress ring -->
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          :stroke="color"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
          class="transition-all duration-1000 ease-out"
        />
      </svg>
      <!-- Center content -->
      <div class="absolute inset-0 flex items-center justify-center">
        <span class="text-2xl font-bold text-gray-900 dark:text-white font-heading">
          {{ Math.round(currentLevel) }}%
        </span>
      </div>
    </div>
    <span class="text-sm font-medium text-gray-600 dark:text-gray-400 text-center">{{ name }}</span>
  </div>
</template>
