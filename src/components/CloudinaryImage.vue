<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { getImageUrl, getPlaceholderUrl, getSrcSet, getSizes, PRESETS } from '@/utils/cloudinary';

const props = defineProps({
  publicId: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: '',
  },
  width: {
    type: [Number, String],
    default: null,
  },
  height: {
    type: [Number, String],
    default: null,
  },
  aspectRatio: {
    type: String,
    default: null, // e.g., "16:9", "1:1", "4:3"
  },
  preset: {
    type: String,
    default: null, // 'avatar', 'thumbnail', 'hero', 'gallery', 'card'
  },
  crop: {
    type: String,
    default: null, // 'fill', 'fit', 'scale', 'thumb', etc.
  },
  gravity: {
    type: String,
    default: null, // 'auto', 'face', 'center', etc.
  },
  lazy: {
    type: Boolean,
    default: true,
  },
  placeholder: {
    type: Boolean,
    default: true,
  },
  responsive: {
    type: Boolean,
    default: true,
  },
  sizes: {
    type: Object,
    default: () => ({}),
  },
  rounded: {
    type: [Boolean, String],
    default: false, // true = rounded-lg, 'full' = rounded-full, 'xl' = rounded-xl
  },
  class: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['load', 'error']);

// State
const imageRef = ref(null);
const isLoaded = ref(false);
const hasError = ref(false);
const isInView = ref(!props.lazy);

// Build options from props
const imageOptions = computed(() => {
  // Start with preset if provided
  const preset = props.preset ? PRESETS[props.preset] : {};

  return {
    ...preset,
    ...(props.width && { width: parseInt(props.width) }),
    ...(props.height && { height: parseInt(props.height) }),
    ...(props.aspectRatio && { aspectRatio: props.aspectRatio }),
    ...(props.crop && { crop: props.crop }),
    ...(props.gravity && { gravity: props.gravity }),
  };
});

// Computed URLs
const mainUrl = computed(() => getImageUrl(props.publicId, imageOptions.value));
const placeholderUrl = computed(() =>
  props.placeholder ? getPlaceholderUrl(props.publicId) : null
);
const srcset = computed(() =>
  props.responsive ? getSrcSet(props.publicId, undefined, imageOptions.value) : null
);
const sizesAttr = computed(() =>
  props.responsive ? getSizes(props.sizes) : null
);

// Current source (placeholder or main)
const currentSrc = computed(() => {
  if (!isInView.value && props.lazy) return placeholderUrl.value;
  return mainUrl.value;
});

// Rounded class
const roundedClass = computed(() => {
  if (!props.rounded) return '';
  if (props.rounded === true) return 'rounded-lg';
  if (props.rounded === 'full') return 'rounded-full';
  return `rounded-${props.rounded}`;
});

// Intersection Observer for lazy loading
let observer = null;

onMounted(() => {
  if (props.lazy && imageRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isInView.value = true;
            observer?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );
    observer.observe(imageRef.value);
  }
});

onUnmounted(() => {
  observer?.disconnect();
});

// Event handlers
function handleLoad() {
  isLoaded.value = true;
  emit('load');
}

function handleError() {
  hasError.value = true;
  emit('error');
}
</script>

<template>
  <div
    ref="imageRef"
    class="cloudinary-image relative overflow-hidden bg-gray-100 dark:bg-gray-800"
    :class="[roundedClass, props.class]"
    :style="{
      aspectRatio: aspectRatio?.replace(':', '/') || 'auto',
    }"
  >
    <!-- Blur placeholder background -->
    <div
      v-if="placeholder && placeholderUrl && !isLoaded"
      class="absolute inset-0 bg-cover bg-center transition-opacity duration-500"
      :class="{ 'opacity-0': isLoaded }"
      :style="{ backgroundImage: `url(${placeholderUrl})` }"
    />

    <!-- Main image -->
    <img
      v-if="isInView || !lazy"
      :src="currentSrc"
      :srcset="srcset"
      :sizes="sizesAttr"
      :alt="alt"
      :width="width"
      :height="height"
      class="w-full h-full object-cover transition-opacity duration-500"
      :class="[
        roundedClass,
        { 'opacity-0': !isLoaded && placeholder, 'opacity-100': isLoaded || !placeholder }
      ]"
      loading="lazy"
      decoding="async"
      @load="handleLoad"
      @error="handleError"
    />

    <!-- Error state -->
    <div
      v-if="hasError"
      class="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700"
      :class="roundedClass"
    >
      <svg
        class="w-8 h-8 text-gray-400"
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

    <!-- Loading shimmer -->
    <div
      v-if="!isLoaded && !hasError && isInView"
      class="absolute inset-0 animate-pulse"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 1.5s infinite;
}
</style>
