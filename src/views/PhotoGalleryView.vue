<script setup>
import { ref, onMounted } from 'vue';
import PhotoGallery from '@/components/PhotoGallery.vue';
import DarkModeToggle from '@/components/DarkModeToggle.vue';

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
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-display">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 backdrop-blur-2xl bg-white/70 dark:bg-slate-950/70 border-b border-gray-200/30 dark:border-slate-800/50 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <router-link
          to="/"
          class="text-2xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent font-heading tracking-tight hover:opacity-80 transition-opacity"
        >
          PM
        </router-link>

        <div class="flex items-center gap-6">
          <router-link
            to="/"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
          >
            Home
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </router-link>
          <span class="text-gray-900 dark:text-white font-medium text-sm tracking-wide">
            Photos
          </span>
          <router-link
            to="/resume"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
          >
            Resume
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </router-link>
          <DarkModeToggle />
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-28 pb-12 px-6">
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
          <div class="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent"></div>
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
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-slate-800 mb-6">
            <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">No photos yet</h3>
          <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Photos will appear here once they're uploaded to Cloudinary and added to the gallery.
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
  </div>
</template>
