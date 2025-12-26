<script setup>
import { ref, computed, watch } from 'vue';
import { mdiMagnify, mdiFilterVariant, mdiClose, mdiSort } from '@mdi/js';
import BaseIcon from '@/components/BaseIcon.vue';

const props = defineProps({
  projects: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['filtered']);

const searchQuery = ref('');
const selectedCategory = ref('all');
const selectedTech = ref('all');
const sortBy = ref('updated'); // 'updated', 'stars', 'name'

const categories = ['all', 'AI/ML', 'Web', 'Systems', 'Infrastructure', 'Other'];
const technologies = computed(() => {
  const techs = new Set();
  props.projects.forEach(project => {
    // Support both tech array and topics array (GitHub repos use topics)
    if (project.tech && Array.isArray(project.tech)) {
      project.tech.forEach(t => techs.add(t));
    }
    if (project.topics && Array.isArray(project.topics)) {
      project.topics.forEach(t => techs.add(t));
    }
    // Also check language
    if (project.language) {
      techs.add(project.language);
    }
  });
  return ['all', ...Array.from(techs).sort()];
});

const filteredProjects = computed(() => {
  let filtered = [...props.projects];

  // Search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(project => {
      return (
        project.name?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.tech?.some(t => t.toLowerCase().includes(query)) ||
        project.topics?.some(t => t.toLowerCase().includes(query)) ||
        project.language?.toLowerCase().includes(query)
      );
    });
  }

  // Category filter (for GitHub repos, infer from topics/description)
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(project => {
      // If project has explicit category, use it
      if (project.category) {
        return project.category === selectedCategory.value;
      }
      // Otherwise, infer from topics or description
      const categoryKeywords = {
        'AI/ML': ['ai', 'ml', 'machine-learning', 'deep-learning', 'neural', 'tensorflow', 'pytorch', 'langchain', 'langgraph'],
        'Web': ['web', 'frontend', 'backend', 'react', 'vue', 'angular', 'nextjs', 'express'],
        'Systems': ['system', 'os', 'kernel', 'rust', 'c++', 'performance', 'low-level'],
        'Infrastructure': ['infrastructure', 'devops', 'kubernetes', 'docker', 'aws', 'cloud', 'ci/cd'],
      };
      const keywords = categoryKeywords[selectedCategory.value] || [];
      const searchText = `${project.description || ''} ${(project.topics || []).join(' ')} ${project.language || ''}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    });
  }

  // Technology filter
  if (selectedTech.value !== 'all') {
    filtered = filtered.filter(project => {
      // Check tech array, topics array, or language
      return (
        project.tech?.includes(selectedTech.value) ||
        project.topics?.includes(selectedTech.value) ||
        project.language === selectedTech.value
      );
    });
  }

  // Sort
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'stars':
        return (b.stars || 0) - (a.stars || 0);
      case 'name':
        return (a.name || '').localeCompare(b.name || '');
      case 'updated':
      default:
        return new Date(b.updated || 0) - new Date(a.updated || 0);
    }
  });

  return filtered;
});

// Emit filtered results when they change
watch(filteredProjects, (newFiltered) => {
  emit('filtered', newFiltered);
}, { immediate: true });

const clearFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = 'all';
  selectedTech.value = 'all';
  sortBy.value = 'updated';
};

const hasActiveFilters = computed(() => {
  return (
    searchQuery.value.trim() !== '' ||
    selectedCategory.value !== 'all' ||
    selectedTech.value !== 'all'
  );
});
</script>

<template>
  <div class="mb-8 space-y-4">
    <!-- Search Bar -->
    <div class="relative">
      <BaseIcon
        :path="mdiMagnify"
        size="20"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
      />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search projects by name, description, or technology..."
        class="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white font-display"
      >
      <button
        v-if="searchQuery"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        @click="searchQuery = ''"
      >
        <BaseIcon
          :path="mdiClose"
          size="20"
        />
      </button>
    </div>

    <!-- Filters Row -->
    <div class="flex flex-wrap items-center gap-4">
      <!-- Category Filter -->
      <div class="flex items-center gap-2">
        <BaseIcon
          :path="mdiFilterVariant"
          size="20"
          class="text-gray-400"
        />
        <select
          v-model="selectedCategory"
          class="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white font-display text-sm"
        >
          <option
            v-for="cat in categories"
            :key="cat"
            :value="cat"
          >
            {{ cat === 'all' ? 'All Categories' : cat }}
          </option>
        </select>
      </div>

      <!-- Technology Filter -->
      <div class="flex items-center gap-2">
        <select
          v-model="selectedTech"
          class="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white font-display text-sm"
        >
          <option
            v-for="tech in technologies"
            :key="tech"
            :value="tech"
          >
            {{ tech === 'all' ? 'All Technologies' : tech }}
          </option>
        </select>
      </div>

      <!-- Sort -->
      <div class="flex items-center gap-2 ml-auto">
        <BaseIcon
          :path="mdiSort"
          size="20"
          class="text-gray-400"
        />
        <select
          v-model="sortBy"
          class="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 dark:text-white font-display text-sm"
        >
          <option value="updated">
            Recently Updated
          </option>
          <option value="stars">
            Most Stars
          </option>
          <option value="name">
            Name (A-Z)
          </option>
        </select>
      </div>

      <!-- Clear Filters -->
      <button
        v-if="hasActiveFilters"
        class="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-display transition-colors"
        @click="clearFilters"
      >
        Clear Filters
      </button>
    </div>

    <!-- Results Count -->
    <div class="text-sm text-gray-600 dark:text-gray-400 font-display">
      Showing {{ filteredProjects.length }} of {{ projects.length }} projects
    </div>
  </div>
</template>

