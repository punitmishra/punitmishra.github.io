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
import { initScrollAnimations as initAdvancedAnimations } from "@/utils/animations.js";
import { initPerformanceOptimizations } from "@/utils/performanceOptimizer.js";

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

/* Initialize Analytics */
if (import.meta.env.PROD) {
  initAnalytics();
  trackScrollDepth();
  trackTimeOnPage();
  
  // Track initial page view
  router.afterEach((to) => {
    trackPageView(to.fullPath, to.meta?.title || 'Punit Mishra - Portfolio');
  });
}

/* Performance optimizations - with error handling */
try {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        initScrollAnimations();
        initScrollProgress();
        lazyLoadImages();
        measurePerformance();
        initAdvancedAnimations();
        initPerformanceOptimizations();
        
        // Register service worker for PWA
        if ('serviceWorker' in navigator && import.meta.env.PROD) {
          navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
              console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
              console.warn('Service Worker registration failed:', error);
            });
        }
      } catch (e) {
        console.warn('Performance optimizations error:', e);
      }
    });
  } else {
    try {
      initScrollAnimations();
      initScrollProgress();
      lazyLoadImages();
      measurePerformance();
      initAdvancedAnimations();
      initPerformanceOptimizations();
      
      // Register service worker for PWA
      if ('serviceWorker' in navigator && import.meta.env.PROD) {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('Service Worker registered:', registration);
          })
          .catch((error) => {
            console.warn('Service Worker registration failed:', error);
          });
      }
    } catch (e) {
      console.warn('Performance optimizations error:', e);
    }
  }
} catch (e) {
  console.warn('Failed to initialize performance optimizations:', e);
}
