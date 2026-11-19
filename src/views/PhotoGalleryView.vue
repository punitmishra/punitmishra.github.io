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
  <div class="min-h-screen bg-paper">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 bg-paper border-b border-hairline">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <router-link
          to="/"
          class="font-mono text-xl font-bold text-ink tracking-tight hover:opacity-80 transition-opacity"
        >
          PM
        </router-link>

        <div class="flex items-center gap-6">
          <router-link
            to="/"
            class="font-mono text-xs text-muted hover:text-ink transition-colors tracking-wide relative group"
          >
            Home
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
          </router-link>
          <span class="font-mono text-xs text-ink tracking-wide">
            Photos
          </span>
          <router-link
            to="/resume"
            class="font-mono text-xs text-muted hover:text-ink transition-colors tracking-wide relative group"
          >
            Resume
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-300" />
          </router-link>
          <DarkModeToggle />
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-28 pb-12 px-6">
      <div class="max-w-6xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-heading font-bold text-ink mb-4">
          Photo Gallery
        </h1>
        <p class="font-body text-lg text-muted max-w-2xl mx-auto">
          A collection of professional photos, project screenshots, and personal moments.
        </p>
      </div>
    </section>

    <!-- Gallery Section -->
    <section class="pb-24 px-6">
      <div class="max-w-7xl mx-auto">
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
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chip mb-4">
            <svg
              class="w-8 h-8 text-muted"
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
          <p class="font-body text-muted">
            {{ error }}
          </p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="photos.length === 0"
          class="text-center py-20"
        >
          <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-chip mb-6">
            <svg
              class="w-10 h-10 text-faint"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-ink mb-2">
            No photos yet
          </h3>
          <p class="font-body text-muted max-w-md mx-auto">
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
