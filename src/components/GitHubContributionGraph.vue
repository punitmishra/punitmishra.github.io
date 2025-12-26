<script setup>
import { ref, computed } from 'vue';
import { mdiGithub, mdiOpenInNew } from '@mdi/js';
import BaseIcon from '@/components/BaseIcon.vue';

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
});

const imageLoaded = ref(false);
const imageError = ref(false);

// Use GitHub's contribution chart from third-party service
const chartUrl = computed(() => {
  return `https://ghchart.rshah.org/${props.username}`;
});

const profileUrl = computed(() => {
  return `https://github.com/${props.username}`;
});
</script>

<template>
  <div class="glass-premium rounded-2xl p-6 border border-gray-200/50 dark:border-slate-700/50">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-gray-900 dark:bg-white rounded-xl">
          <BaseIcon
            :path="mdiGithub"
            size="20"
            class="text-white dark:text-gray-900"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white font-heading">
            GitHub Activity
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Contribution graph
          </p>
        </div>
      </div>
      <a
        :href="profileUrl"
        target="_blank"
        class="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        <span>View Profile</span>
        <BaseIcon
          :path="mdiOpenInNew"
          size="14"
        />
      </a>
    </div>

    <!-- GitHub Chart Image -->
    <div class="relative overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-4">
      <div
        v-if="!imageLoaded && !imageError"
        class="flex items-center justify-center py-8"
      >
        <div class="flex items-center gap-2 text-gray-400">
          <div class="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span class="text-sm">Loading contributions...</span>
        </div>
      </div>

      <div
        v-if="imageError"
        class="text-center py-8"
      >
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-3">
          Unable to load contribution graph
        </p>
        <a
          :href="profileUrl"
          target="_blank"
          class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <BaseIcon
            :path="mdiGithub"
            size="16"
          />
          View on GitHub
        </a>
      </div>

      <img
        v-show="imageLoaded && !imageError"
        :src="chartUrl"
        :alt="`${username}'s GitHub contribution graph`"
        class="w-full h-auto dark:invert dark:hue-rotate-180"
        @load="imageLoaded = true"
        @error="imageError = true"
      >
    </div>

    <!-- Stats hint -->
    <div class="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
      <div class="flex items-center gap-1.5">
        <div class="w-2.5 h-2.5 rounded-sm bg-green-200 dark:bg-green-800" />
        <span>Less</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="w-2.5 h-2.5 rounded-sm bg-green-300 dark:bg-green-700" />
        <div class="w-2.5 h-2.5 rounded-sm bg-green-400 dark:bg-green-600" />
        <div class="w-2.5 h-2.5 rounded-sm bg-green-500 dark:bg-green-500" />
        <div class="w-2.5 h-2.5 rounded-sm bg-green-600 dark:bg-green-400" />
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2.5 h-2.5 rounded-sm bg-green-700 dark:bg-green-300" />
        <span>More</span>
      </div>
    </div>
  </div>
</template>

