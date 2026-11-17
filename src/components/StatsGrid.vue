<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
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

// Track each stat's in-flight delay timer + RAF so a re-animation cancels the
// previous loop instead of overlapping it (overlapping loops write the same
// stat.value every frame and visibly flash/snap the counter on load).
const timers = [];

const clearTimers = () => {
  timers.forEach((t) => {
    if (!t) return;
    clearTimeout(t.timeout);
    if (t.raf) cancelAnimationFrame(t.raf);
  });
  timers.length = 0;
};

const animateStat = (stat, index) => {
  if (prefersReducedMotion()) {
    stat.value = stat.target;
    return;
  }
  const from = stat.value;
  const handle = { timeout: 0, raf: 0 };
  handle.timeout = setTimeout(() => {
    const duration = 2000;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      stat.value = Math.round(from + (stat.target - from) * eased);
      if (progress < 1) handle.raf = requestAnimationFrame(step);
    };
    handle.raf = requestAnimationFrame(step);
  }, index * 150);
  timers[index] = handle;
};

const runAnimation = () => {
  clearTimers();
  stats.value.forEach(animateStat);
};

onMounted(runAnimation);
onBeforeUnmount(clearTimers);

// Re-seed targets and re-animate when async GitHub data (stars/repos) arrives,
// so "GitHub Stars" no longer sticks at 0 after the fetch resolves. clearTimers()
// inside runAnimation cancels the mount animation so the two never overlap/flash.
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
