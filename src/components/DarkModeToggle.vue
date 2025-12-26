<script setup>
import { ref, computed, watch } from 'vue';
import { mdiWeatherNight, mdiWeatherSunny, mdiCreation } from '@mdi/js';
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
      class="group relative p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-300 overflow-hidden"
      :title="styleStore.darkMode ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="toggleDarkMode"
    >
      <!-- Animated background -->
      <div
        class="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 dark:from-indigo-600 dark:to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
      />

      <!-- Icon with rotation animation -->
      <div class="relative transition-transform duration-500 group-hover:rotate-12">
        <BaseIcon
          :path="styleStore.darkMode ? mdiWeatherSunny : mdiWeatherNight"
          size="20"
          :class="[
            'transition-colors duration-300',
            styleStore.darkMode ? 'text-yellow-500' : 'text-indigo-600'
          ]"
        />
      </div>

      <!-- Sparkle effect on hover -->
      <div class="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <BaseIcon
          :path="mdiCreation"
          size="12"
          class="text-yellow-400 dark:text-purple-400"
        />
      </div>
    </button>

    <!-- Toast notification -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 translate-y-2 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="showToast"
        class="absolute top-full right-0 mt-3 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-xl shadow-xl whitespace-nowrap z-50"
      >
        <div class="flex items-center gap-2">
          <span>{{ toastMessage }}</span>
        </div>
        <!-- Arrow pointing up -->
        <div class="absolute -top-1.5 right-4 w-3 h-3 bg-gray-900 dark:bg-white transform rotate-45" />
      </div>
    </Transition>
  </div>
</template>
