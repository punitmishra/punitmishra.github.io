<script setup>
import { ref } from 'vue';
import { mdiWeatherNight, mdiWeatherSunny } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';
import { useStyleStore } from '@/stores/style.js';

const styleStore = useStyleStore();
const showToast = ref(false);
const toastMessage = ref('');

const darkModeMessages = [
  "Dark mode: Because light attracts bugs! 🐛",
  "Welcome to the dark side. We have cookies. 🍪",
  "Saving your eyes, one toggle at a time 😎",
  "Dark mode activated. Hacker mode: ON 💻",
  "Your retinas thank you 🙏",
  "Join the dark side, we have better contrast!",
  "Embracing the void... stylishly ✨",
];

const lightModeMessages = [
  "Let there be light! 💡",
  "Good morning, sunshine! ☀️",
  "Back to the bright side 🌞",
  "Light mode: For the brave ones 😅",
  "Vitamin D loading... ☀️",
  "Rise and shine! ✨",
  "Who needs sleep anyway? 😬",
];

const toggleDarkMode = () => {
  styleStore.setDarkMode();

  const messages = styleStore.darkMode ? darkModeMessages : lightModeMessages;
  toastMessage.value = messages[Math.floor(Math.random() * messages.length)];
  showToast.value = true;

  setTimeout(() => {
    showToast.value = false;
  }, 2500);
};
</script>

<template>
  <div class="relative">
    <button
      class="group p-2 rounded-md border border-hairline text-muted hover:text-ink hover:bg-chip transition-colors"
      :title="styleStore.darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      :aria-label="styleStore.darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleDarkMode"
    >
      <BaseIcon
        :path="styleStore.darkMode ? mdiWeatherSunny : mdiWeatherNight"
        size="18"
        class="transition-transform duration-300 group-hover:rotate-12"
      />
    </button>

    <!-- Toast notification -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="showToast"
        class="absolute top-full right-0 mt-3 px-3 py-2 bg-ink text-paper font-mono text-xs rounded-md whitespace-nowrap z-50"
      >
        {{ toastMessage }}
        <div class="absolute -top-1.5 right-4 w-3 h-3 bg-ink transform rotate-45" />
      </div>
    </Transition>
  </div>
</template>
