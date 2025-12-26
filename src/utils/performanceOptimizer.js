/**
 * Performance Optimizer
 * Additional performance optimizations and bundle analysis
 */

/**
 * Preload critical resources
 * Note: In production, Vite handles preloading of bundled assets automatically
 */
export function preloadCriticalResources() {
  // Vite automatically adds modulepreload links in production build
  // This function is kept for potential future manual preloading needs
}

/**
 * Defer non-critical CSS
 */
export function deferNonCriticalCSS() {
  const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
  nonCriticalCSS.forEach((link) => {
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
  });
}

/**
 * Optimize images - convert to WebP if supported
 */
export function optimizeImages() {
  if (!('HTMLImageElement' in window)) return;

  const images = document.querySelectorAll('img[data-src]');
  images.forEach((img) => {
    if (img.dataset.src) {
      const webpSrc = img.dataset.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      const picture = document.createElement('picture');
      const source = document.createElement('source');
      source.srcset = webpSrc;
      source.type = 'image/webp';
      picture.appendChild(source);
      picture.appendChild(img.cloneNode());
      img.parentNode.replaceChild(picture, img);
    }
  });
}

/**
 * Bundle size analyzer (development only)
 */
export function analyzeBundleSize() {
  if (import.meta.env.DEV && 'performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('resource');
      const jsFiles = perfData.filter(entry => entry.name.includes('.js'));
      const cssFiles = perfData.filter(entry => entry.name.includes('.css'));

      console.group('📦 Bundle Size Analysis');
      jsFiles.forEach(file => {
        console.log(`JS: ${file.name.split('/').pop()} - ${(file.transferSize / 1024).toFixed(2)} KB`);
      });
      cssFiles.forEach(file => {
        console.log(`CSS: ${file.name.split('/').pop()} - ${(file.transferSize / 1024).toFixed(2)} KB`);
      });
      console.groupEnd();
    });
  }
}

/**
 * Initialize all performance optimizations
 */
export function initPerformanceOptimizations() {
  preloadCriticalResources();
  deferNonCriticalCSS();
  optimizeImages();
  analyzeBundleSize();
}

