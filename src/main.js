import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { useMainStore } from "@/stores/main.js";
import { useStyleStore } from "@/stores/style.js";
import { darkModeKey, styleKey } from "@/config.js";
import { measurePerformance, lazyLoadImages } from "@/utils/performance.js";
import { initScrollAnimations, initScrollProgress } from "@/utils/scrollEffects.js";
import { initAnalytics, trackPageView, trackScrollDepth, trackTimeOnPage } from "@/utils/analytics.js";
import { initPerformanceOptimizations } from "@/utils/performanceOptimizer.js";
import { initSEO } from "@/utils/seo.js";
import { vScrollReveal } from "@/directives/scrollReveal.js";

import "./css/main.css";

/* Init Pinia */
const pinia = createPinia();

/* Create Vue app */
const app = createApp(App);
app.use(router);
app.use(pinia);
app.directive('scroll-reveal', vScrollReveal);
app.mount("#app");

/* Init Pinia stores */
useMainStore(pinia);
const styleStore = useStyleStore(pinia);

/* Data fetching handled by individual components as needed */

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

/* Initialize SEO */
initSEO({
  title: 'Punit Mishra - Senior ML Expert & AI Tech Lead',
  description: 'Senior Machine Learning Expert & AI Tech Lead at SAP — agent platforms, LLM inference, and multi-tenant infrastructure at enterprise scale.',
  path: '/',
});

/* Initialize Analytics (production only) */
if (import.meta.env.PROD) {
  initAnalytics();
  trackScrollDepth();
  trackTimeOnPage();

  router.afterEach((to) => {
    trackPageView(to.fullPath, to.meta?.title || 'Punit Mishra - Portfolio');
  });
}

/* Startup tasks — run once the DOM is ready (now, or on DOMContentLoaded). */
const runStartupTasks = () => {
  try {
    initScrollAnimations();
    initScrollProgress();
    lazyLoadImages();
    measurePerformance();
    initPerformanceOptimizations();
  } catch (e) {
    console.warn("Startup tasks error:", e);
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runStartupTasks);
} else {
  runStartupTasks();
}
