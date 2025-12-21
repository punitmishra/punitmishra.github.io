<script setup>
import { mdiDownload, mdiFileDocument } from '@mdi/js';
import BaseIcon from '@/components/BaseIcon.vue';
import { downloadResumePDF } from '@/utils/resumeGenerator';

const isDownloading = ref(false);

const handleDownload = async () => {
  isDownloading.value = true;
  try {
    await downloadResumePDF();
  } catch (error) {
    console.error('Download error:', error);
  } finally {
    isDownloading.value = false;
  }
};
</script>

<template>
  <button
    @click="handleDownload"
    :disabled="isDownloading"
    class="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-display disabled:opacity-50 disabled:cursor-not-allowed"
  >
    <BaseIcon
      :path="isDownloading ? mdiFileDocument : mdiDownload"
      size="20"
      :class="isDownloading && 'animate-pulse'"
    />
    <span>{{ isDownloading ? 'Generating...' : 'Download Resume' }}</span>
  </button>
</template>

