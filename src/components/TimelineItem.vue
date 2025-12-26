<script setup>
import { computed } from 'vue';
import { mdiCheckCircle } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  period: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  achievements: {
    type: Array,
    default: () => [],
  },
  icon: {
    type: String,
    default: '',
  },
  gradient: {
    type: String,
    default: 'from-blue-500 to-cyan-500',
  },
  isLast: {
    type: Boolean,
    default: false,
  },
});

const iconPath = computed(() => props.icon || 'mdiBriefcase');
</script>

<template>
  <div
    class="relative flex gap-6 pb-12"
    :class="{ 'pb-0': isLast }"
  >
    <!-- Timeline Line -->
    <div class="flex flex-col items-center">
      <div :class="`w-14 h-14 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center shadow-lg flex-shrink-0`">
        <BaseIcon
          :path="iconPath"
          size="24"
          class="text-white"
        />
      </div>
      <div
        v-if="!isLast"
        class="flex-1 w-0.5 bg-gradient-to-b from-blue-400 via-cyan-400 to-indigo-400 mt-4"
      />
    </div>

    <!-- Content -->
    <div class="flex-1 pb-4">
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
          <div>
            <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-1 font-heading">
              {{ title }}
            </h3>
            <p
              v-if="subtitle"
              class="text-lg text-blue-600 dark:text-blue-400 font-semibold font-display"
            >
              {{ subtitle }}
            </p>
          </div>
          <span class="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full mt-2 md:mt-0">{{ period }}</span>
        </div>
        
        <p
          v-if="description"
          class="text-gray-600 dark:text-gray-400 mb-4 font-display leading-relaxed"
        >
          {{ description }}
        </p>
        
        <ul
          v-if="achievements.length > 0"
          class="space-y-2"
        >
          <li
            v-for="(achievement, index) in achievements"
            :key="index"
            class="flex items-start gap-2 text-gray-600 dark:text-gray-400 font-display"
          >
            <BaseIcon
              :path="mdiCheckCircle"
              size="18"
              class="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            />
            <span>{{ achievement }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

