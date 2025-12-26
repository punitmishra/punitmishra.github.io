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

const topProjects = computed(() => (props.resume.projects || []).slice(0, 3));
</script>

<template>
  <div class="interactive-resume max-w-4xl mx-auto font-serif">
    <!-- Header - Centered LaTeX style -->
    <header class="text-center mb-6 pb-4 border-b-2 border-gray-900 dark:border-white">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-wide uppercase">
        {{ resume.basics?.name }}
      </h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 tracking-widest mt-1">
        {{ resume.basics?.title }}
      </p>
      <div class="flex flex-wrap justify-center gap-2 mt-3 text-xs text-gray-600 dark:text-gray-400">
        <span>{{ resume.basics?.location }}</span>
        <span class="text-gray-400">|</span>
        <a
          :href="`mailto:${resume.basics?.email}`"
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {{ resume.basics?.email }}
        </a>
        <span class="text-gray-400">|</span>
        <a
          href="https://punitmishra.com"
          target="_blank"
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          punitmishra.com
        </a>
        <template
          v-for="profile in resume.basics?.profiles?.slice(0, 2)"
          :key="profile.network"
        >
          <span class="text-gray-400">|</span>
          <a
            :href="profile.url"
            target="_blank"
            class="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {{ profile.network }}
          </a>
        </template>
      </div>
    </header>

    <!-- Two Column Layout -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Main Column (2/3) -->
      <div class="lg:col-span-2 space-y-5">
        <!-- Summary -->
        <section>
          <h2 class="section-title">
            Summary
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed text-justify">
            {{ resume.basics?.summary }}
          </p>
        </section>

        <!-- Experience -->
        <section>
          <h2 class="section-title">
            Experience
          </h2>
          <div
            v-for="(job, index) in resume.experience"
            :key="index"
            class="mb-4 last:mb-0"
          >
            <div class="flex justify-between items-baseline mb-0.5">
              <h3 class="font-bold text-gray-900 dark:text-white text-sm">
                {{ job.position }}
              </h3>
              <span class="text-xs text-gray-500 dark:text-gray-400 italic">
                {{ formatDate(job.startDate) }} — {{ formatDate(job.endDate) }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {{ job.company }}
            </p>
            <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-0.5 ml-4 list-disc">
              <li
                v-for="(highlight, hi) in job.highlights.slice(0, 4)"
                :key="hi"
              >
                {{ highlight }}
              </li>
            </ul>
            <p class="text-xs text-gray-500 dark:text-gray-500 mt-2 font-sans">
              {{ job.technologies.join(' · ') }}
            </p>
          </div>
        </section>

        <!-- Education -->
        <section>
          <h2 class="section-title">
            Education
          </h2>
          <div
            v-for="(edu, index) in resume.education"
            :key="index"
            class="mb-3 last:mb-0"
          >
            <div class="flex justify-between items-baseline">
              <h3 class="font-bold text-gray-900 dark:text-white text-sm">
                {{ edu.degree }} in {{ edu.field }}
              </h3>
              <span class="text-xs text-gray-500 dark:text-gray-400 italic">{{ edu.startDate }} — {{ edu.endDate }}</span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ edu.institution }}
            </p>
            <p
              v-if="edu.highlights"
              class="text-xs text-gray-500 dark:text-gray-500 mt-1"
            >
              {{ edu.highlights.join(' · ') }}
            </p>
          </div>
        </section>
      </div>

      <!-- Side Column (1/3) -->
      <div class="lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-6 space-y-5">
        <!-- Skills -->
        <section>
          <h2 class="section-title">
            Technical Skills
          </h2>
          <div
            v-for="category in resume.skills"
            :key="category.category"
            class="mb-3 last:mb-0"
          >
            <h3 class="text-xs font-bold text-gray-700 dark:text-gray-300 font-sans mb-1">
              {{ category.category }}
            </h3>
            <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ category.items.map(s => s.name).join(', ') }}
            </p>
          </div>
        </section>

        <!-- Certifications -->
        <section>
          <h2 class="section-title">
            Certifications
          </h2>
          <div
            v-for="cert in resume.certifications"
            :key="cert.name"
            class="mb-2 last:mb-0"
          >
            <p class="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {{ cert.name }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ cert.issuer }} · {{ cert.date }}
            </p>
          </div>
        </section>

        <!-- Projects -->
        <section v-if="topProjects.length">
          <h2 class="section-title">
            Projects
          </h2>
          <div
            v-for="project in topProjects"
            :key="project.name"
            class="mb-3 last:mb-0"
          >
            <a
              :href="project.url"
              target="_blank"
              class="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {{ project.name }}
            </a>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ project.highlights.slice(0, 2).join(' · ') }}
            </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-title {
  @apply text-xs font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-200 dark:border-gray-700 font-sans;
}

.font-serif {
  font-family: 'Crimson Pro', Georgia, 'Times New Roman', serif;
}

.font-sans {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
