import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { useMainStore } from "@/stores/main.js";
import { useStyleStore } from "@/stores/style.js";
import { darkModeKey, styleKey } from "@/config.js";
import { measurePerformance, lazyLoadImages } from "@/utils/performance.js";
import { initScrollAnimations, initScrollProgress } from "@/utils/scrollEffects.js";

import "./css/main.css";

/* Init Pinia */
const pinia = createPinia();

/* Create Vue app */
const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount("#app");

/* Init Pinia stores */
const mainStore = useMainStore(pinia);
const styleStore = useStyleStore(pinia);

/* Fetch sample data - defer non-critical data */
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    mainStore.fetch("clients");
    mainStore.fetch("history");
  }, { timeout: 2000 });
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(() => {
    mainStore.fetch("clients");
    mainStore.fetch("history");
  }, 2000);
}

/* App style */
styleStore.setStyle(localStorage[styleKey] ?? "basic");

/* Dark mode */
if (
  (!localStorage[darkModeKey] &&
    window.matchMedia("(prefers-color-scheme: dark)").matches) ||
  localStorage[darkModeKey] === "1"
) {
  styleStore.setDarkMode(true);
}

/* Default title tag */
const defaultDocumentTitle = "Punit Mishra - Portfolio";

/* Set document title from route meta */
router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle;
});

/* Performance optimizations */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initScrollProgress();
    lazyLoadImages();
    measurePerformance();
  });
} else {
  initScrollAnimations();
  initScrollProgress();
  lazyLoadImages();
  measurePerformance();
}
