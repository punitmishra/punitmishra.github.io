import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// Temporarily disable PWA plugin to fix deployment issues
// import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  base: "/", // Root domain - punitmishra.com
  plugins: [
    vue(),
    // PWA plugin temporarily disabled due to workbox build issues
    // Will re-enable once workbox dependencies are resolved
    // VitePWA({
    //   registerType: 'prompt',
    //   includeAssets: ['favicon.png'],
    //   manifest: {
    //     name: 'Punit Mishra - Portfolio',
    //     short_name: 'Punit Mishra',
    //     description: 'Software Engineer Portfolio',
    //     theme_color: '#2563eb',
    //     icons: [
    //       {
    //         src: '/favicon.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/favicon.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       }
    //     ]
    //   },
    //   strategies: 'generateSW',
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt}'],
    //     runtimeCaching: [],
    //     skipWaiting: true,
    //     clientsClaim: true
    //   }
    // })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - split for better caching
          if (id.includes('node_modules')) {
            // Core Vue ecosystem
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vue-vendor';
            }
            // UI icons
            if (id.includes('@mdi/js')) {
              return 'ui-vendor';
            }
            // Utilities
            if (id.includes('axios') || id.includes('lodash')) {
              return 'utils-vendor';
            }
            // Markdown/highlighting - lazy loaded
            if (id.includes('marked') || id.includes('highlight.js') || id.includes('mermaid')) {
              return 'markdown-vendor';
            }
            // PDF generation - lazy loaded
            if (id.includes('html2pdf') || id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-vendor';
            }
            // Chart.js - lazy loaded
            if (id.includes('chart.js')) {
              return 'chart-vendor';
            }
            // Other node_modules
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Optimize build - use esbuild (faster, built-in)
    minify: 'esbuild',
    // Remove console and debugger in production
    esbuild: {
      drop: ['console', 'debugger'],
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production (optional, can disable for smaller size)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Target modern browsers for smaller bundles
    target: 'es2015',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', '@mdi/js', 'axios'],
    exclude: ['chart.js'], // Large library, load on demand
  },
  // Server options for dev
  server: {
    hmr: true,
  },
});
