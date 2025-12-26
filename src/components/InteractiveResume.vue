<script setup>
import { computed } from 'vue';

const props = defineProps({
  resume: { type: Object, required: true },
});

function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const [year, month] = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return month ? `${months[parseInt(month) - 1]} ${year}` : year;
}
</script>

<template>
  <div class="interactive-resume max-w-4xl mx-auto">
    <!-- Header -->
    <header class="mb-8 pb-6 border-b-2 border-gray-900 dark:border-white">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        {{ resume.basics?.name }}
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 font-medium uppercase tracking-widest mt-1">
        {{ resume.basics?.title }}
      </p>
      <div class="flex flex-wrap gap-4 mt-4 text-sm text-gray-500 dark:text-gray-400">
        <span>{{ resume.basics?.location }}</span>
        <span>•</span>
        <span>{{ resume.basics?.email }}</span>
        <span v-for="profile in resume.basics?.profiles?.slice(0, 2)" :key="profile.network">
          •
          <a :href="profile.url" target="_blank" class="hover:text-accent transition-colors">
            {{ profile.network }}
          </a>
        </span>
      </div>
    </header>

    <!-- Two Column Layout -->
    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Main Column -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Summary -->
        <section>
          <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            Summary
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ resume.basics?.summary }}
          </p>
        </section>

        <!-- Experience -->
        <section>
          <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            Experience
          </h2>
          <div v-for="(job, index) in resume.experience" :key="index" class="mb-4 last:mb-0">
            <div class="flex justify-between items-baseline mb-1">
              <h3 class="font-bold text-gray-900 dark:text-white">{{ job.position }}</h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ formatDate(job.startDate) }} — {{ formatDate(job.endDate) }}
              </span>
            </div>
            <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{{ job.company }}</p>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
              <li v-for="(highlight, hi) in job.highlights" :key="hi" class="list-disc">
                {{ highlight }}
              </li>
            </ul>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span
                v-for="tech in job.technologies"
                :key="tech"
                class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
              >
                {{ tech }}
              </span>
            </div>
          </div>
        </section>

        <!-- Education -->
        <section>
          <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            Education
          </h2>
          <div v-for="(edu, index) in resume.education" :key="index" class="mb-3 last:mb-0">
            <div class="flex justify-between items-baseline">
              <h3 class="font-bold text-gray-900 dark:text-white text-sm">
                {{ edu.degree }} in {{ edu.field }}
              </h3>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ edu.startDate }} — {{ edu.endDate }}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ edu.institution }}</p>
            <p v-if="edu.highlights" class="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {{ edu.highlights.join(' • ') }}
            </p>
          </div>
        </section>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Skills -->
        <section>
          <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            Skills
          </h2>
          <div v-for="category in resume.skills" :key="category.category" class="mb-3 last:mb-0">
            <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">{{ category.category }}</h3>
            <div class="flex flex-wrap gap-1">
              <span
                v-for="skill in category.items"
                :key="skill.name"
                class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
              >
                {{ skill.name }}
              </span>
            </div>
          </div>
        </section>

        <!-- Certifications -->
        <section>
          <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            Certifications
          </h2>
          <div v-for="cert in resume.certifications" :key="cert.name" class="mb-2 last:mb-0">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ cert.name }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ cert.issuer }} • {{ cert.date }}</p>
          </div>
        </section>

        <!-- Projects -->
        <section v-if="resume.projects?.length">
          <h2 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
            Projects
          </h2>
          <div v-for="project in resume.projects" :key="project.name" class="mb-2 last:mb-0">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ project.name }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ project.description }}</p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
