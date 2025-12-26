<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  cols: {
    type: Number,
    default: 120,
  },
  rows: {
    type: Number,
    default: 24,
  },
  autoPlay: {
    type: Boolean,
    default: false,
  },
  loop: {
    type: Boolean,
    default: false,
  },
  speed: {
    type: Number,
    default: 1,
  },
  theme: {
    type: String,
    default: 'monokai',
  },
  title: {
    type: String,
    default: '',
  },
  poster: {
    type: String,
    default: 'npt:0:3',
  },
  fit: {
    type: String,
    default: 'width',
  },
});

const containerRef = ref(null);
const player = ref(null);
const isLoaded = ref(false);
const error = ref(null);

const loadPlayer = async () => {
  if (!containerRef.value) return;

  try {
    // Dynamically import asciinema-player
    const AsciinemaPlayer = await import('asciinema-player');

    // Clear any existing player
    if (containerRef.value) {
      containerRef.value.innerHTML = '';
    }

    player.value = AsciinemaPlayer.create(
      props.src,
      containerRef.value,
      {
        cols: props.cols,
        rows: props.rows,
        autoPlay: props.autoPlay,
        loop: props.loop,
        speed: props.speed,
        theme: props.theme,
        poster: props.poster,
        fit: props.fit,
        terminalFontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', monospace",
      }
    );

    isLoaded.value = true;
  } catch (e) {
    console.error('Failed to load asciinema player:', e);
    error.value = e.message;
  }
};

onMounted(() => {
  loadPlayer();
});

onUnmounted(() => {
  if (player.value && player.value.dispose) {
    player.value.dispose();
  }
});

watch(() => props.src, () => {
  loadPlayer();
});
</script>

<template>
  <div class="asciinema-container my-6">
    <div
      v-if="title"
      class="flex items-center gap-2 mb-3"
    >
      <div class="flex gap-1.5">
        <span class="w-3 h-3 rounded-full bg-red-500" />
        <span class="w-3 h-3 rounded-full bg-yellow-500" />
        <span class="w-3 h-3 rounded-full bg-green-500" />
      </div>
      <span class="text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">{{ title }}</span>
    </div>

    <div
      ref="containerRef"
      class="asciinema-player-wrapper rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg"
    >
      <div
        v-if="!isLoaded && !error"
        class="flex items-center justify-center h-64 bg-gray-900"
      >
        <div class="flex items-center gap-3 text-gray-400">
          <svg
            class="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span class="font-mono text-sm">Loading terminal...</span>
        </div>
      </div>

      <div
        v-if="error"
        class="flex items-center justify-center h-64 bg-gray-900"
      >
        <div class="text-center text-gray-400">
          <p class="font-mono text-sm mb-2">
            Failed to load recording
          </p>
          <a
            :href="src"
            target="_blank"
            class="text-blue-400 hover:text-blue-300 text-sm"
          >
            View on asciinema.org
          </a>
        </div>
      </div>
    </div>

    <div class="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
      <span class="font-mono">Terminal Recording</span>
      <a
        :href="src"
        target="_blank"
        class="hover:text-blue-500 transition-colors"
      >
        View on asciinema
      </a>
    </div>
  </div>
</template>

<style>
@import 'asciinema-player/dist/bundle/asciinema-player.css';

.asciinema-player-wrapper {
  background: #1a1a2e;
}

.asciinema-player-wrapper .ap-wrapper {
  border-radius: 0.5rem;
}

/* Custom theme overrides */
.asciinema-player-wrapper .ap-terminal {
  padding: 12px 16px;
}
</style>
