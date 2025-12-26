<script setup>
import { ref, onMounted } from 'vue';
import PhotoGallery from '@/components/PhotoGallery.vue';

const photos = ref([]);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    const response = await fetch('/data-sources/photos.json');
    if (!response.ok) throw new Error('Failed to load photos');
    const data = await response.json();
    photos.value = data.photos || [];
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-surface dark:bg-slate-900">
    <!-- Hero Section -->
    <section class="pt-32 pb-16 px-6">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-4">
          Photo Gallery
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          A collection of professional photos, project screenshots, and personal moments.
        </p>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="pb-24 px-6">
      <div class="max-w-7xl mx-auto">
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

        <!-- Empty State -->
        <div v-else-if="photos.length === 0" class="text-center py-20">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p class="text-gray-600 dark:text-gray-400">No photos available yet.</p>
          <p class="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Upload photos to Cloudinary and update the photos.json file.
          </p>
        </div>

        <!-- Photo Gallery -->
        <PhotoGallery
          v-else
          :photos="photos"
          :columns="3"
          gap="1.5rem"
        />
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
