<script setup>
import { ref, onMounted, watch } from 'vue';
import { mdiCodeBraces, mdiStar, mdiCalendar, mdiCoffee } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';

const props = defineProps({
  repos: { type: Number, default: 0 },
  stars: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  years: { type: Number, default: 0 },
});

const stats = ref([
  { icon: mdiCodeBraces, value: 0, target: props.repos, label: 'Repositories', suffix: '' },
  { icon: mdiCalendar, value: 0, target: props.years, label: 'Years Experience', suffix: '+' },
  { icon: mdiStar, value: 0, target: props.stars, label: 'GitHub Stars', suffix: '' },
  { icon: mdiCoffee, value: 0, target: 10000, label: 'Cups of Coffee', suffix: '+' },
]);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const animateStat = (stat, index) => {
  if (prefersReducedMotion()) {
    stat.value = stat.target;
    return;
  }
  const from = stat.value;
  setTimeout(() => {
    const duration = 2000;
    const start = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      stat.value = Math.round(from + (stat.target - from) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, index * 150);
};

const runAnimation = () => stats.value.forEach(animateStat);

onMounted(runAnimation);

// Re-seed targets and re-animate when async GitHub data (stars/repos) arrives,
// so "GitHub Stars" no longer sticks at 0 after the fetch resolves.
watch(
  () => [props.repos, props.years, props.stars],
  ([repos, years, stars]) => {
    stats.value[0].target = repos;
    stats.value[1].target = years;
    stats.value[2].target = stars;
    runAnimation();
  }
);
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="group relative bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-5 border border-gray-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-violet-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div class="relative">
        <div class="flex items-center gap-2 mb-2">
          <BaseIcon
            :path="stat.icon"
            size="18"
            class="text-blue-500"
          />
        </div>
        <div class="text-3xl font-bold text-gray-900 dark:text-white font-heading">
          {{ stat.value.toLocaleString() }}{{ stat.suffix }}
        </div>
        <div class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ stat.label }}
        </div>
      </div>
    </div>
  </div>
</template>
