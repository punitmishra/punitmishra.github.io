<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import {
  mdiGithub,
  mdiArrowLeft,
  mdiStar,
  mdiSourceFork,
  mdiCalendar,
  mdiCodeBraces,
  mdiClockOutline,
} from "@mdi/js";
import BaseIcon from "@/components/BaseIcon.vue";

const route = useRoute();
const router = useRouter();
const projectId = route.params.id;
const githubUsername = "punitmishra";

const project = ref(null);
const loading = ref(true);
const commits = ref([]);
const contributors = ref([]);

const fetchProjectDetails = async () => {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${githubUsername}/${projectId}`
    );
    project.value = {
      ...response.data,
      htmlUrl: response.data.html_url,
    };
    
    // Fetch recent commits
    try {
      const commitsResponse = await axios.get(
        `https://api.github.com/repos/${githubUsername}/${projectId}/commits?per_page=10`
      );
      commits.value = commitsResponse.data.map((commit) => ({
        sha: commit.sha.substring(0, 7),
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: new Date(commit.commit.author.date).toLocaleDateString(),
        url: commit.html_url,
      }));
    } catch (e) {
      console.error("Error fetching commits:", e);
    }
    
    loading.value = false;
  } catch (error) {
    console.error("Error fetching project:", error);
    loading.value = false;
  }
};

const getLanguageColor = (language) => {
  const colors = {
    JavaScript: "bg-yellow-400",
    TypeScript: "bg-blue-500",
    Python: "bg-green-500",
    Vue: "bg-emerald-500",
    Rust: "bg-orange-600",
    Other: "bg-gray-500",
  };
  return colors[language] || colors.Other;
};

onMounted(() => {
  fetchProjectDetails();
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-20">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <button
        class="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        @click="router.push('/')"
      >
        <BaseIcon
          :path="mdiArrowLeft"
          size="20"
        />
        <span>Back to Portfolio</span>
      </button>

      <div
        v-if="loading"
        class="text-center py-20"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">
          Loading project details...
        </p>
      </div>

      <div
        v-else-if="project"
        class="space-y-8"
      >
        <!-- Project Header -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl">
          <div class="flex items-start justify-between mb-6">
            <div class="flex-1">
              <h1 class="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {{ project.name }}
              </h1>
              <p class="text-xl text-gray-600 dark:text-gray-400 mb-6">
                {{ project.description || "No description" }}
              </p>
              <div class="flex flex-wrap gap-4">
                <a
                  :href="project.htmlUrl"
                  target="_blank"
                  class="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  <BaseIcon
                    :path="mdiGithub"
                    size="20"
                  />
                  View on GitHub
                </a>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div>
              <div class="text-2xl font-black text-blue-600 dark:text-blue-400">
                {{ project.stargazers_count || 0 }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Stars
              </div>
            </div>
            <div>
              <div class="text-2xl font-black text-purple-600 dark:text-purple-400">
                {{ project.forks_count || 0 }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Forks
              </div>
            </div>
            <div>
              <div class="text-2xl font-black text-pink-600 dark:text-pink-400">
                {{ project.language || "N/A" }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Language
              </div>
            </div>
            <div>
              <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                {{ project.size || 0 }} KB
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Size
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Commits -->
        <div
          v-if="commits.length > 0"
          class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl"
        >
          <h2 class="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <div class="space-y-4">
            <div
              v-for="(commit, index) in commits"
              :key="index"
              class="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl"
            >
              <BaseIcon
                :path="mdiCodeBraces"
                size="20"
                class="text-blue-600 dark:text-blue-400 mt-1"
              />
              <div class="flex-1">
                <p class="text-gray-900 dark:text-white font-medium mb-1">
                  {{ commit.message.split('\n')[0] }}
                </p>
                <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{{ commit.author }}</span>
                  <span class="flex items-center gap-1">
                    <BaseIcon
                      :path="mdiCalendar"
                      size="16"
                    />
                    {{ commit.date }}
                  </span>
                  <a
                    :href="commit.url"
                    target="_blank"
                    class="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {{ commit.sha }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

