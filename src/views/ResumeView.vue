<script setup>
import { ref, onMounted } from 'vue';
import InteractiveResume from '@/components/InteractiveResume.vue';
import DarkModeToggle from '@/components/DarkModeToggle.vue';
import { downloadResumePDF } from '@/utils/resumeGenerator';

const resume = ref(null);
const loading = ref(true);
const error = ref(null);
const isDownloading = ref(false);

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

async function downloadPDF() {
  isDownloading.value = true;
  try {
    await downloadResumePDF();
  } catch (err) {
    console.error('Download error:', err);
  } finally {
    isDownloading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-paper font-body">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 bg-paper border-b border-hairline">
      <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <router-link
          to="/"
          class="text-lg font-mono font-bold text-ink tracking-tight hover:opacity-80 transition-opacity"
        >
          PM
        </router-link>

        <div class="flex items-center gap-6">
          <router-link
            to="/"
            class="text-muted hover:text-ink transition-colors font-mono text-xs uppercase tracking-[0.12em] relative group"
          >
            Home
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
          </router-link>
          <router-link
            to="/photos"
            class="text-muted hover:text-ink transition-colors font-mono text-xs uppercase tracking-[0.12em] relative group"
          >
            Photos
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
          </router-link>
          <span class="text-ink font-mono text-xs uppercase tracking-[0.12em]">
            Resume
          </span>
          <DarkModeToggle />
        </div>
      </div>
    </nav>

    <!-- Header -->
    <section class="pt-28 pb-8 px-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 class="text-4xl md:text-5xl font-heading font-bold text-ink tracking-tight mb-2">
              Resume
            </h1>
            <p class="text-muted font-body">
              Professional experience and qualifications
            </p>
          </div>
          <button
            :disabled="isDownloading"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-paper rounded-md text-sm font-mono font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            @click="downloadPDF"
          >
            <svg
              class="w-4 h-4"
              :class="isDownloading && 'animate-pulse'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {{ isDownloading ? 'Generating...' : 'Download PDF' }}
          </button>
        </div>
      </div>
    </section>

    <!-- Resume Content -->
    <section class="pb-24 px-6">
      <div class="max-w-4xl mx-auto">
        <!-- Loading State -->
        <div
          v-if="loading"
          class="flex justify-center py-20"
        >
          <div class="animate-spin rounded-full h-12 w-12 border-2 border-accent border-t-transparent" />
        </div>

        <!-- Error State -->
        <div
          v-else-if="error"
          class="text-center py-20"
        >
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <svg
              class="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <p class="text-muted font-body">
            {{ error }}
          </p>
        </div>

        <!-- Resume Component -->
        <div
          v-else-if="resume"
          class="bg-paper rounded-lg border border-hairline p-8 md:p-12"
        >
          <InteractiveResume :resume="resume" />
        </div>
      </div>
    </section>
  </div>
</template>
