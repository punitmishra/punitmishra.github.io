<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { mdiArrowRight, mdiClockOutline, mdiTagOutline } from '@mdi/js';
import BaseIcon from './BaseIcon.vue';

const router = useRouter();
const articles = ref([]);
const loading = ref(true);
const selectedCategory = ref('all');

const categories = ['all', 'AI/ML', 'Technical', 'Personal', 'Security'];

const categoryColors = {
  'AI/ML': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'Technical': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Personal': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  'Security': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const filteredArticles = computed(() => {
  if (selectedCategory.value === 'all') {
    return articles.value;
  }
  return articles.value.filter(a => a.category === selectedCategory.value);
});

const fetchArticles = async () => {
  try {
    const response = await fetch('/content/blog/index.json');
    const data = await response.json();
    articles.value = data.articles;
    loading.value = false;
  } catch (error) {
    console.error('Failed to load articles:', error);
    loading.value = false;
  }
};

const goToArticle = (slug) => {
  router.push(`/blog/${slug}`);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  fetchArticles();
});
</script>

<template>
  <section id="blog" class="py-24 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-white to-indigo-50/30 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/50"></div>

    <div class="relative max-w-7xl mx-auto px-6">
      <!-- Header -->
      <div class="text-center mb-12" v-scroll-reveal>
        <span class="inline-block px-3 py-1 text-sm font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-full mb-4">Writing</span>
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
          Technical Articles
        </h2>
        <p class="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          Deep dives into AI infrastructure, systems engineering, and lessons from building enterprise software.
        </p>
      </div>

      <!-- Category Filter -->
      <div class="flex flex-wrap justify-center gap-2 mb-10" v-scroll-reveal="{ delay: '100ms' }">
        <button
          v-for="category in categories"
          :key="category"
          @click="selectedCategory = category"
          :class="[
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            selectedCategory === category
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
          ]"
        >
          {{ category === 'all' ? 'All Articles' : category }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Articles Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <article
          v-for="(article, index) in filteredArticles"
          :key="article.slug"
          @click="goToArticle(article.slug)"
          class="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700/50 cursor-pointer hover:-translate-y-1 overflow-hidden"
          v-scroll-reveal="{ delay: `${index * 75}ms` }"
        >
          <!-- Gradient accent on top -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <!-- Featured badge -->
          <div v-if="article.featured" class="absolute top-4 right-4">
            <span class="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-full">
              Featured
            </span>
          </div>

          <div class="relative">
            <!-- Category & Date -->
            <div class="flex items-center gap-2 mb-4">
              <span :class="['px-3 py-1 rounded-full text-xs font-medium', categoryColors[article.category] || categoryColors['Technical']]">
                {{ article.category }}
              </span>
              <span class="text-xs text-gray-400 dark:text-gray-500">
                {{ formatDate(article.date) }}
              </span>
            </div>

            <!-- Title -->
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-heading leading-tight line-clamp-2">
              {{ article.title }}
            </h3>

            <!-- Excerpt -->
            <p class="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
              {{ article.excerpt }}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span
                v-for="tag in article.tags.slice(0, 3)"
                :key="tag"
                class="px-2 py-0.5 bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 rounded text-xs"
              >
                {{ tag }}
              </span>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700/50">
              <div class="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-sm">
                <BaseIcon :path="mdiClockOutline" size="14" />
                <span>{{ article.readTime }}</span>
              </div>
              <div class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:gap-2 transition-all">
                <span>Read article</span>
                <BaseIcon :path="mdiArrowRight" size="14" class="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </article>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && filteredArticles.length === 0" class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400">No articles found in this category.</p>
      </div>

      <!-- View All Link -->
      <div class="text-center mt-12" v-scroll-reveal="{ delay: '200ms' }">
        <a
          href="https://github.com/punitmishra/punitmishra.github.io/tree/main/content/blog"
          target="_blank"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
        >
          <span>View All on GitHub</span>
          <BaseIcon :path="mdiArrowRight" size="18" />
        </a>
      </div>
    </div>
  </section>
</template>
