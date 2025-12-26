<script setup>
import { computed } from 'vue';
import CloudinaryImage from './CloudinaryImage.vue';

const props = defineProps({
  project: { type: Object, required: true },
});

const metrics = computed(() => props.project.metrics || []);
const technologies = computed(() => props.project.technologies || []);
const images = computed(() => props.project.images || []);
</script>

<template>
  <article class="case-study">
    <!-- Hero Section -->
    <header class="relative mb-16">
      <CloudinaryImage
        v-if="project.heroImage"
        :public-id="project.heroImage"
        alt="Project hero image"
        aspect-ratio="21:9"
        preset="hero"
        class="w-full rounded-3xl"
      />
      <div v-else class="w-full aspect-[21/9] bg-gradient-to-br from-accent/20 to-accent-light/20 rounded-3xl flex items-center justify-center">
        <span class="text-4xl font-heading font-bold text-accent/50">{{ project.title }}</span>
      </div>
    </header>

    <!-- Project Overview -->
    <section class="mb-16">
      <div class="grid md:grid-cols-3 gap-8">
        <div class="md:col-span-2">
          <h1 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
            {{ project.title }}
          </h1>
          <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ project.description }}
          </p>
        </div>
        <div class="space-y-4">
          <div v-if="project.role">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Role</h4>
            <p class="text-gray-900 dark:text-white">{{ project.role }}</p>
          </div>
          <div v-if="project.duration">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Duration</h4>
            <p class="text-gray-900 dark:text-white">{{ project.duration }}</p>
          </div>
          <div v-if="project.team">
            <h4 class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Team</h4>
            <p class="text-gray-900 dark:text-white">{{ project.team }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Problem & Solution -->
    <section class="mb-16 grid md:grid-cols-2 gap-8">
      <div v-if="project.problem" class="bg-red-50 dark:bg-red-900/10 rounded-2xl p-8">
        <h3 class="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          The Problem
        </h3>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ project.problem }}</p>
      </div>
      <div v-if="project.solution" class="bg-green-50 dark:bg-green-900/10 rounded-2xl p-8">
        <h3 class="text-lg font-semibold text-green-700 dark:text-green-400 mb-4 flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          The Solution
        </h3>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ project.solution }}</p>
      </div>
    </section>

    <!-- Metrics / Impact -->
    <section v-if="metrics.length" class="mb-16">
      <h3 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-8 text-center">
        Impact & Results
      </h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="metric in metrics"
          :key="metric.label"
          class="text-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-soft"
        >
          <div class="text-3xl md:text-4xl font-bold text-accent mb-2">
            {{ metric.value }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ metric.label }}
          </div>
        </div>
      </div>
    </section>

    <!-- Screenshots Gallery -->
    <section v-if="images.length" class="mb-16">
      <h3 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-8">
        Screenshots
      </h3>
      <div class="grid md:grid-cols-2 gap-6">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="group relative overflow-hidden rounded-2xl"
        >
          <CloudinaryImage
            :public-id="image.publicId"
            :alt="image.caption || 'Project screenshot'"
            aspect-ratio="16:9"
            preset="gallery"
            class="w-full"
          />
          <div v-if="image.caption" class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <p class="text-white text-sm">{{ image.caption }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Technologies Used -->
    <section v-if="technologies.length" class="mb-16">
      <h3 class="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
        Technologies Used
      </h3>
      <div class="flex flex-wrap gap-3">
        <span
          v-for="tech in technologies"
          :key="tech"
          class="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
        >
          {{ tech }}
        </span>
      </div>
    </section>

    <!-- Links -->
    <section v-if="project.links" class="flex flex-wrap gap-4">
      <a
        v-if="project.links.demo"
        :href="project.links.demo"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-full font-medium hover:bg-accent-dark transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Live Demo
      </a>
      <a
        v-if="project.links.repo"
        :href="project.links.repo"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        View Code
      </a>
      <a
        v-if="project.links.article"
        :href="project.links.article"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:border-accent hover:text-accent transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Read Article
      </a>
    </section>
  </article>
</template>
