<script setup>
import { ref, onErrorCaptured, provide } from 'vue';
import { mdiAlertCircle, mdiReload } from '@mdi/js';
import BaseIcon from '@/components/BaseIcon.vue';
import { errorBoundary } from '@/utils/errorHandler';

const hasError = ref(false);
const error = ref(null);

onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  error.value = err;
  errorBoundary.captureError(err, { component: info });
  return false; // Prevent error from propagating
});

const reset = () => {
  hasError.value = false;
  error.value = null;
};

provide('errorBoundary', { hasError, error, reset });
</script>

<template>
  <div
    v-if="hasError"
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6"
  >
    <div class="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
      <div class="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <BaseIcon
          :path="mdiAlertCircle"
          size="32"
          class="text-red-600 dark:text-red-400"
        />
      </div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2 font-heading">
        Something went wrong
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6 font-display">
        {{ error?.message || 'An unexpected error occurred' }}
      </p>
      <button
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all font-display"
        @click="reset"
      >
        <BaseIcon
          :path="mdiReload"
          size="20"
        />
        <span>Try Again</span>
      </button>
      <p class="text-xs text-gray-500 dark:text-gray-500 mt-4 font-display">
        If the problem persists, please refresh the page.
      </p>
    </div>
  </div>
  <slot v-else />
</template>

