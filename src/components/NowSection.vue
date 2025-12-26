<script setup>
import { mdiRocket, mdiBookOpenPageVariant, mdiHeadphones, mdiMapMarker, mdiCalendar } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';

const nowItems = [
  {
    icon: mdiRocket,
    label: 'Building',
    value: 'AI-powered enterprise solutions at SAP',
    color: 'text-blue-500',
  },
  {
    icon: mdiBookOpenPageVariant,
    label: 'Learning',
    value: 'Rust systems programming & LLM orchestration',
    color: 'text-emerald-500',
  },
  {
    icon: mdiMapMarker,
    label: 'Based in',
    value: 'Pleasanton, California',
    color: 'text-rose-500',
  },
];
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2 mb-6">
      <span class="relative flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
      </span>
      <span class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">What I'm doing now</span>
    </div>

    <div class="space-y-4">
      <div
        v-for="item in nowItems"
        :key="item.label"
        class="flex items-start gap-4 group"
      >
        <div :class="['p-2 rounded-xl bg-gray-100 dark:bg-slate-700/50 group-hover:scale-110 transition-transform', item.color]">
          <BaseIcon
            :path="item.icon"
            size="20"
          />
        </div>
        <div>
          <div class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
            {{ item.label }}
          </div>
          <div class="text-gray-900 dark:text-white font-medium">
            {{ item.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
