<script setup>
import { ref } from 'vue';
import { mdiContentCopy, mdiCheck } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';

const props = defineProps({
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: 'javascript',
  },
  title: {
    type: String,
    default: '',
  },
});

const copied = ref(false);

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};
</script>

<template>
  <div class="relative group bg-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 shadow-xl">
    <div
      v-if="title"
      class="px-4 py-2 bg-slate-800 border-b border-slate-700/50 flex items-center justify-between"
    >
      <span class="text-sm font-semibold text-gray-300 font-mono">{{ title }}</span>
      <button
        class="p-1.5 rounded-lg hover:bg-slate-700 transition-colors text-gray-400 hover:text-white"
        title="Copy code"
        @click="copyToClipboard"
      >
        <BaseIcon
          :path="copied ? mdiCheck : mdiContentCopy"
          size="18"
        />
      </button>
    </div>
    <div
      v-else
      class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <button
        class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 transition-colors text-gray-400 hover:text-white"
        title="Copy code"
        @click="copyToClipboard"
      >
        <BaseIcon
          :path="copied ? mdiCheck : mdiContentCopy"
          size="18"
        />
      </button>
    </div>
    <pre class="p-6 overflow-x-auto"><code class="text-sm text-gray-100 font-mono leading-relaxed">{{ code }}</code></pre>
  </div>
</template>

<style scoped>
code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}
</style>

