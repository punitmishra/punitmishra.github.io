<script setup>
import { containerMaxW } from "@/config.js";
import BaseLevel from "@/components/BaseLevel.vue";

const year = new Date().getFullYear();
</script>

<template>
  <footer
    class="py-4 px-6"
    :class="containerMaxW"
  >
    <BaseLevel>
      <div class="text-center md:text-left text-gray-600 dark:text-gray-400">
        <span>&copy;{{ year }} Punit Mishra. All rights reserved.</span>
        <slot />
      </div>
      <div class="flex gap-4 text-gray-500 dark:text-gray-400">
        <a
          href="https://github.com/punitmishra"
          target="_blank"
          class="hover:text-blue-600 transition-colors"
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/mishrapunit"
          target="_blank"
          class="hover:text-blue-600 transition-colors"
        >
          LinkedIn
        </a>
      </div>
    </BaseLevel>
  </footer>
</template>
