<script setup>
import { mdiTwitter, mdiInstagram, mdiArrowRight } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';

const socialProfiles = [
  {
    name: 'Twitter / X',
    handle: '@punitmishra',
    url: 'https://twitter.com/punitmishra',
    icon: mdiTwitter,
    color: 'from-sky-400 to-blue-500',
    hoverColor: 'hover:bg-sky-50 dark:hover:bg-sky-900/20',
    description: 'Tech thoughts, AI/ML insights, and engineering updates'
  },
  {
    name: 'Instagram',
    handle: '@punitmishra',
    url: 'https://instagram.com/punitmishra',
    icon: mdiInstagram,
    color: 'from-pink-500 via-purple-500 to-orange-400',
    hoverColor: 'hover:bg-pink-50 dark:hover:bg-pink-900/20',
    description: 'Behind the scenes, travel, and personal projects'
  }
];
</script>

<template>
  <section class="py-12">
    <div class="max-w-5xl mx-auto px-6">
      <div class="text-center mb-8">
        <span class="inline-block px-3 py-1 text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-full mb-3">
          Social
        </span>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white font-heading">
          Follow Along
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          v-for="profile in socialProfiles"
          :key="profile.name"
          :href="profile.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 border border-gray-100 dark:border-slate-700/50 transition-all hover:shadow-lg hover:-translate-y-0.5"
          :class="profile.hoverColor"
        >
          <!-- Gradient accent -->
          <div
            class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r"
            :class="profile.color"
          />

          <div class="flex items-start gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg"
              :class="profile.color"
            >
              <BaseIcon :path="profile.icon" size="24" />
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ profile.name }}
                </h3>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ profile.handle }}
                </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {{ profile.description }}
              </p>
              <div class="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                <span>View Profile</span>
                <BaseIcon :path="mdiArrowRight" size="16" />
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>
