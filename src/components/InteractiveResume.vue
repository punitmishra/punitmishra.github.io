<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  resume: { type: Object, required: true },
});

const activeSection = ref('experience');
const expandedItems = ref(new Set());

const sections = [
  { id: 'experience', label: 'Experience', icon: 'briefcase' },
  { id: 'skills', label: 'Skills', icon: 'code' },
  { id: 'education', label: 'Education', icon: 'academic' },
  { id: 'certifications', label: 'Certifications', icon: 'badge' },
];

function toggleExpand(id) {
  if (expandedItems.value.has(id)) {
    expandedItems.value.delete(id);
  } else {
    expandedItems.value.add(id);
  }
  expandedItems.value = new Set(expandedItems.value);
}

function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function calculateDuration(start, end) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (years === 0) return `${remainingMonths} mo`;
  if (remainingMonths === 0) return `${years} yr`;
  return `${years} yr ${remainingMonths} mo`;
}
</script>

<template>
  <div class="interactive-resume">
    <!-- Header -->
    <div class="text-center mb-12">
      <h1 class="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">
        {{ resume.basics?.name }}
      </h1>
      <p class="text-xl text-accent font-medium mb-3">{{ resume.basics?.title }}</p>
      <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        {{ resume.basics?.summary }}
      </p>
      <div class="flex justify-center gap-4 mt-4">
        <span class="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ resume.basics?.location }}
        </span>
      </div>
    </div>

    <!-- Section Tabs -->
    <div class="flex flex-wrap justify-center gap-2 mb-10">
      <button
        v-for="section in sections"
        :key="section.id"
        class="px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200"
        :class="activeSection === section.id
          ? 'bg-accent text-white shadow-soft'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
        @click="activeSection = section.id"
      >
        {{ section.label }}
      </button>
    </div>

    <!-- Experience Section -->
    <div v-show="activeSection === 'experience'" class="space-y-6">
      <div
        v-for="(job, index) in resume.experience"
        :key="index"
        class="relative pl-8 pb-8 border-l-2 border-gray-200 dark:border-gray-700 last:pb-0"
      >
        <!-- Timeline dot -->
        <div
          class="absolute left-[-9px] top-0 w-4 h-4 rounded-full"
          :class="job.current ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'"
        />

        <div
          class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow cursor-pointer"
          @click="toggleExpand(`exp-${index}`)"
        >
          <div class="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ job.position }}
              </h3>
              <p class="text-accent font-medium">{{ job.company }}</p>
            </div>
            <div class="text-right text-sm text-gray-500 dark:text-gray-400">
              <p>{{ formatDate(job.startDate) }} - {{ formatDate(job.endDate) }}</p>
              <p class="text-xs">{{ calculateDuration(job.startDate, job.endDate) }}</p>
            </div>
          </div>

          <p class="text-gray-600 dark:text-gray-400 text-sm mb-3">{{ job.summary }}</p>

          <!-- Expandable details -->
          <div
            v-show="expandedItems.has(`exp-${index}`)"
            class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
          >
            <ul class="space-y-2 mb-4">
              <li
                v-for="(highlight, hi) in job.highlights"
                :key="hi"
                class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
              >
                <svg class="w-4 h-4 text-accent flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ highlight }}
              </li>
            </ul>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tech in job.technologies"
                :key="tech"
                class="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md"
              >
                {{ tech }}
              </span>
            </div>
          </div>

          <!-- Expand indicator -->
          <div class="flex justify-center mt-3">
            <svg
              class="w-5 h-5 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': expandedItems.has(`exp-${index}`) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Skills Section -->
    <div v-show="activeSection === 'skills'" class="grid md:grid-cols-2 gap-6">
      <div
        v-for="category in resume.skills"
        :key="category.category"
        class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft"
      >
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {{ category.category }}
        </h3>
        <div class="space-y-4">
          <div v-for="skill in category.items" :key="skill.name">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-700 dark:text-gray-300">{{ skill.name }}</span>
              <span class="text-gray-500 dark:text-gray-400">{{ skill.level }}%</span>
            </div>
            <div class="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-accent to-accent-light rounded-full transition-all duration-500"
                :style="{ width: `${skill.level}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Education Section -->
    <div v-show="activeSection === 'education'" class="space-y-6">
      <div
        v-for="(edu, index) in resume.education"
        :key="index"
        class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft"
      >
        <div class="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ edu.degree }} in {{ edu.field }}
            </h3>
            <p class="text-accent font-medium">{{ edu.institution }}</p>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ edu.startDate }} - {{ edu.endDate }}
          </p>
        </div>
        <ul v-if="edu.highlights" class="space-y-1">
          <li
            v-for="(highlight, hi) in edu.highlights"
            :key="hi"
            class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
          >
            <span class="w-1.5 h-1.5 bg-accent rounded-full"></span>
            {{ highlight }}
          </li>
        </ul>
      </div>
    </div>

    <!-- Certifications Section -->
    <div v-show="activeSection === 'certifications'" class="grid sm:grid-cols-2 gap-4">
      <div
        v-for="cert in resume.certifications"
        :key="cert.name"
        class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-soft hover:shadow-soft-lg transition-shadow"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white">{{ cert.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ cert.issuer }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">{{ cert.date }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
