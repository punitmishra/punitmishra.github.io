<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { mdiFormatQuoteOpen, mdiLinkedin } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';

const testimonials = [
  {
    quote: "Punit brings exceptional technical depth combined with the ability to communicate complex concepts clearly. His work on our AI infrastructure was instrumental in achieving production readiness.",
    author: "Engineering Leadership",
    role: "Enterprise AI Platform",
    image: null
  },
  {
    quote: "A rare engineer who excels at both system design and hands-on implementation. Punit's contributions to our distributed systems significantly improved reliability and performance.",
    author: "Technical Leadership",
    role: "Cloud Infrastructure",
    image: null
  },
  {
    quote: "Punit consistently delivers high-quality solutions while mentoring team members and driving best practices. His expertise spans from low-level systems to modern AI/ML architectures.",
    author: "Senior Engineering",
    role: "Platform Engineering",
    image: null
  }
];

const currentIndex = ref(0);
let intervalId = null;

const nextTestimonial = () => {
  currentIndex.value = (currentIndex.value + 1) % testimonials.length;
};

const prevTestimonial = () => {
  currentIndex.value = (currentIndex.value - 1 + testimonials.length) % testimonials.length;
};

const goTo = (index) => {
  currentIndex.value = index;
};

onMounted(() => {
  intervalId = setInterval(nextTestimonial, 6000);
});

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId);
});
</script>

<template>
  <section class="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
    <div class="max-w-4xl mx-auto px-6">
      <div class="text-center mb-10">
        <span class="inline-block px-3 py-1 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-3">
          Testimonials
        </span>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white font-heading">
          What People Say
        </h2>
      </div>

      <div class="relative">
        <!-- Testimonial Card -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-slate-700">
          <!-- Quote Icon -->
          <div class="absolute -top-4 left-8">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BaseIcon
                :path="mdiFormatQuoteOpen"
                size="20"
                class="text-white"
              />
            </div>
          </div>

          <!-- Content -->
          <div class="pt-4">
            <p class="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 italic">
              "{{ testimonials[currentIndex].quote }}"
            </p>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {{ testimonials[currentIndex].author.charAt(0) }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">
                    {{ testimonials[currentIndex].author }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ testimonials[currentIndex].role }}
                  </p>
                </div>
              </div>

              <a
                href="https://linkedin.com/in/mishrapunit"
                target="_blank"
                class="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <BaseIcon
                  :path="mdiLinkedin"
                  size="16"
                />
                <span class="hidden sm:inline">View on LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Navigation Dots -->
        <div class="flex justify-center gap-2 mt-6">
          <button
            v-for="(_, index) in testimonials"
            :key="index"
            :class="[
              'w-2 h-2 rounded-full transition-all',
              currentIndex === index
                ? 'bg-blue-600 w-6'
                : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
            ]"
            :aria-label="`Go to testimonial ${index + 1}`"
            @click="goTo(index)"
          />
        </div>

        <!-- Arrow Navigation -->
        <button
          class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors hidden md:flex"
          aria-label="Previous testimonial"
          @click="prevTestimonial"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white dark:bg-slate-700 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors hidden md:flex"
          aria-label="Next testimonial"
          @click="nextTestimonial"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>
