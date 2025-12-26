<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { getImageUrl } from '@/utils/cloudinary';

const props = defineProps({
  photos: { type: Array, required: true },
  initialIndex: { type: Number, default: 0 },
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'close']);

const currentIndex = ref(props.initialIndex);
const isZoomed = ref(false);
const touchStartX = ref(0);

const currentPhoto = computed(() => props.photos[currentIndex.value] || {});
const hasNext = computed(() => currentIndex.value < props.photos.length - 1);
const hasPrev = computed(() => currentIndex.value > 0);

const imageUrl = computed(() =>
  getImageUrl(currentPhoto.value.publicId, { width: 1920, quality: 'auto:best' })
);

function next() {
  if (hasNext.value) currentIndex.value++;
}

function prev() {
  if (hasPrev.value) currentIndex.value--;
}

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function toggleZoom() {
  isZoomed.value = !isZoomed.value;
}

function handleKeydown(e) {
  if (!props.modelValue) return;
  if (e.key === 'Escape') close();
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
}

function handleTouchStart(e) {
  touchStartX.value = e.touches[0].clientX;
}

function handleTouchEnd(e) {
  const diff = touchStartX.value - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) {
    diff > 0 ? next() : prev();
  }
}

watch(() => props.initialIndex, (val) => { currentIndex.value = val; });
watch(() => props.modelValue, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
        @click.self="close"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      >
        <!-- Close button -->
        <button
          class="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
          @click="close"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Navigation -->
        <button
          v-if="hasPrev"
          class="absolute left-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
          @click="prev"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          v-if="hasNext"
          class="absolute right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
          @click="next"
        >
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Image -->
        <div
          class="relative max-w-[90vw] max-h-[85vh] overflow-hidden"
          :class="{ 'cursor-zoom-in': !isZoomed, 'cursor-zoom-out': isZoomed }"
          @click="toggleZoom"
        >
          <img
            :src="imageUrl"
            :alt="currentPhoto.alt || currentPhoto.caption || ''"
            class="max-w-full max-h-[85vh] object-contain transition-transform duration-300"
            :class="{ 'scale-150': isZoomed }"
          />
        </div>

        <!-- Caption -->
        <div
          v-if="currentPhoto.caption"
          class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent"
        >
          <p class="text-white text-center text-lg">{{ currentPhoto.caption }}</p>
          <p v-if="currentPhoto.date" class="text-white/60 text-center text-sm mt-1">
            {{ currentPhoto.date }}
          </p>
        </div>

        <!-- Counter -->
        <div class="absolute bottom-4 right-4 text-white/60 text-sm">
          {{ currentIndex + 1 }} / {{ photos.length }}
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.2s ease;
}
.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
