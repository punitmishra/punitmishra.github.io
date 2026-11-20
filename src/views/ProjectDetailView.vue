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
import { sapProjectBySlug } from "@/data/sapProjects.js";

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
  const staticProject = sapProjectBySlug[projectId];
  if (staticProject) {
    project.value = { ...staticProject, isStatic: true };
    loading.value = false;
  } else {
    fetchProjectDetails();
  }
});
</script>

<template>
  <div class="min-h-screen bg-paper pt-20">
    <div class="max-w-4xl mx-auto px-6 py-12">
      <button
        class="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-muted hover:text-ink transition-colors"
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
        <div class="animate-spin rounded-full h-12 w-12 border-2 border-hairline border-t-accent mx-auto" />
        <p class="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
          Loading project details...
        </p>
      </div>

      <div
        v-else-if="project && project.isStatic"
        class="space-y-8"
      >
        <div class="border border-hairline rounded-lg bg-paper p-8">
          <div class="font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
            {{ project.org }} · {{ project.period }}
          </div>
          <h1 class="text-4xl md:text-5xl font-heading font-bold text-ink mb-4">
            {{ project.name }}
          </h1>
          <p class="font-body text-lg text-muted mb-6 max-w-2xl">
            {{ project.summary }}
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="t in project.stack"
              :key="t"
              class="font-mono text-[11px] text-muted bg-chip border border-hairline rounded px-2 py-0.5"
            >{{ t }}</span>
          </div>
        </div>
        <div class="border border-hairline rounded-lg bg-paper p-8">
          <h2 class="font-mono text-xs font-bold tracking-[0.16em] uppercase text-ink border-b border-hairline pb-3 mb-5">
            Highlights
          </h2>
          <ul class="space-y-3">
            <li
              v-for="(h, i) in project.highlights"
              :key="i"
              class="flex gap-3 font-body text-muted"
            >
              <span class="font-mono text-faint shrink-0">{{ String(i + 1).padStart(2, '0') }}</span>
              <span>{{ h }}</span>
            </li>
          </ul>
          <router-link
            to="/resume"
            class="inline-flex items-center gap-2 mt-6 font-mono text-xs uppercase tracking-[0.16em] text-accent hover:underline"
          >
            Full résumé ↗
          </router-link>
        </div>
      </div>

      <div
        v-else-if="project"
        class="space-y-8"
      >
        <!-- Project Header -->
        <div class="border border-hairline rounded-lg bg-paper p-8">
          <div class="flex items-start justify-between mb-6">
            <div class="flex-1">
              <h1 class="text-4xl md:text-5xl font-heading font-bold text-ink mb-4">
                {{ project.name }}
              </h1>
              <p class="font-body text-lg text-muted mb-6">
                {{ project.description || "No description" }}
              </p>
              <div class="flex flex-wrap gap-4">
                <a
                  :href="project.htmlUrl"
                  target="_blank"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-hairline font-mono text-sm text-ink hover:border-faint hover:bg-chip transition-colors"
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

          <div class="grid grid-cols-2 md:grid-cols-4 border-y border-hairline mt-8">
            <div class="py-5 px-5 border-r border-hairline">
              <div class="font-mono text-2xl font-bold text-ink">
                {{ project.stargazers_count || 0 }}
              </div>
              <div class="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mt-1">
                Stars
              </div>
            </div>
            <div class="py-5 px-5 border-hairline md:border-r">
              <div class="font-mono text-2xl font-bold text-ink">
                {{ project.forks_count || 0 }}
              </div>
              <div class="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mt-1">
                Forks
              </div>
            </div>
            <div class="py-5 px-5 border-r border-t md:border-t-0 border-hairline">
              <div class="font-mono text-2xl font-bold text-ink">
                {{ project.language || "N/A" }}
              </div>
              <div class="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mt-1">
                Language
              </div>
            </div>
            <div class="py-5 px-5 border-t md:border-t-0 border-hairline">
              <div class="font-mono text-2xl font-bold text-ink">
                {{ project.size || 0 }} KB
              </div>
              <div class="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mt-1">
                Size
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Commits -->
        <div
          v-if="commits.length > 0"
          class="border border-hairline rounded-lg bg-paper p-8"
        >
          <h2 class="font-mono text-xs font-bold tracking-[0.16em] uppercase text-ink border-b border-hairline pb-3 mb-5">
            Recent Activity
          </h2>
          <div class="divide-y divide-hairline">
            <div
              v-for="(commit, index) in commits"
              :key="index"
              class="flex items-start gap-4 py-4"
            >
              <BaseIcon
                :path="mdiCodeBraces"
                size="20"
                class="text-faint mt-1 shrink-0"
              />
              <div class="flex-1">
                <p class="font-body text-ink font-medium mb-1">
                  {{ commit.message.split('\n')[0] }}
                </p>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted">
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
                    class="text-accent hover:underline"
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

