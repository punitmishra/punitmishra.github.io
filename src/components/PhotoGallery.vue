<script setup>
import { ref, computed } from 'vue';
import CloudinaryImage from './CloudinaryImage.vue';
import PhotoLightbox from './PhotoLightbox.vue';

const props = defineProps({
  photos: { type: Array, required: true },
  columns: { type: Number, default: 3 },
  gap: { type: String, default: '1rem' },
  category: { type: String, default: null },
});

const selectedIndex = ref(null);
const showLightbox = ref(false);
const activeCategory = ref(props.category || 'all');

const categories = computed(() => {
  const cats = new Set(['all']);
  props.photos.forEach(p => p.category && cats.add(p.category));
  return Array.from(cats);
});

const filteredPhotos = computed(() => {
  if (activeCategory.value === 'all') return props.photos;
  return props.photos.filter(p => p.category === activeCategory.value);
});

function openLightbox(index) {
  selectedIndex.value = index;
  showLightbox.value = true;
}
</script>

<template>
  <div class="photo-gallery">
    <!-- Category filters -->
    <div
      v-if="categories.length > 2"
      class="flex flex-wrap gap-2 mb-8"
    >
      <button
        v-for="cat in categories"
        :key="cat"
        class="px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
        :class="activeCategory === cat
          ? 'bg-accent text-white'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
        @click="activeCategory = cat"
      >
        {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
      </button>
    </div>

    <!-- Masonry grid -->
    <div
      class="grid gap-4"
      :style="{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: gap,
      }"
    >
      <div
        v-for="(photo, index) in filteredPhotos"
        :key="photo.publicId || index"
        class="group relative overflow-hidden rounded-2xl cursor-pointer hover-scale"
        :class="photo.span === 2 ? 'row-span-2' : ''"
        @click="openLightbox(index)"
      >
        <CloudinaryImage
          :public-id="photo.publicId"
          :alt="photo.alt || photo.caption || ''"
          :aspect-ratio="photo.aspectRatio || '4:3'"
          preset="gallery"
          class="w-full h-full"
          rounded="2xl"
        />

        <!-- Hover overlay -->
        <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-end">
          <div class="w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <p
              v-if="photo.caption"
              class="text-white text-sm font-medium"
            >
              {{ photo.caption }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <PhotoLightbox
      v-model="showLightbox"
      :photos="filteredPhotos"
      :initial-index="selectedIndex || 0"
    />
  </div>
</template>

<style scoped>
@media (max-width: 768px) {
  .photo-gallery .grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
@media (max-width: 480px) {
  .photo-gallery .grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
