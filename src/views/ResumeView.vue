<script setup>
import { ref, onMounted } from 'vue';
import InteractiveResume from '@/components/InteractiveResume.vue';

const resume = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await fetch('/data-sources/resume.json');
    if (!response.ok) throw new Error('Failed to load resume');
    resume.value = await response.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

function downloadPDF() {
  // Trigger PDF download - could integrate with existing resumeGenerator
  window.print();
}
</script>

<template>
  <div class="min-h-screen bg-surface dark:bg-slate-900">
    <!-- Hero Section -->
    <section class="pt-32 pb-8 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 class="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-2">
              Resume
            </h1>
            <p class="text-gray-600 dark:text-gray-400">
              Interactive overview of my experience and skills
            </p>
          </div>
          <button
            @click="downloadPDF"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-full font-medium hover:bg-accent-dark transition-colors shadow-soft"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        </div>
      </div>
    </section>

    <!-- Resume Content -->
    <section class="pb-32 px-6">
      <div class="max-w-4xl mx-auto">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="text-center py-20">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-gray-600 dark:text-gray-400">{{ error }}</p>
        </div>

        <!-- Resume Component -->
        <InteractiveResume v-else-if="resume" :resume="resume" />
      </div>
    </section>

    <!-- Back to Home -->
    <div class="fixed bottom-8 left-8 z-40">
      <router-link
        to="/"
        class="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-full shadow-soft-lg hover:shadow-soft-xl transition-shadow text-gray-600 dark:text-gray-300 hover:text-accent"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span class="text-sm font-medium">Back</span>
      </router-link>
    </div>
  </div>
</template>

<style>
@media print {
  .fixed {
    display: none;
  }
}
</style>
