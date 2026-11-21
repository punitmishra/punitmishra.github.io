<script setup>
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  mdiGithub,
  mdiArrowLeft,
  mdiCalendar,
  mdiCodeBraces,
  mdiTagOutline,
  mdiAlertCircleOutline,
} from "@mdi/js";
import BaseIcon from "@/components/BaseIcon.vue";
import { sapProjectBySlug } from "@/data/sapProjects.js";
import { ossProjectBySlug } from "@/data/ossProjects.js";
import { loadProjects, repoBySlug } from "@/utils/projects.js";

const route = useRoute();
const router = useRouter();
const githubUsername = "punitmishra";

const loading = ref(true);
const kind = ref(""); // 'sap' | 'oss' | 'notfound'
const project = ref(null);
const live = ref(null); // { stars, forks, language, url, pushedAt } from the snapshot
const release = ref(null);
const commits = ref([]);

function applyLive(repo) {
  if (!repo) return;
  live.value = {
    stars: repo.stars,
    forks: repo.forks,
    language: repo.language,
    url: repo.url,
    pushedAt: repo.pushedAt,
    ownerLabel: repo.ownerLabel,
  };
  release.value = repo.release || null;
  commits.value = repo.commits || [];
}

// Resolve on mount AND whenever the :id param changes (vue-router reuses this
// component instance when navigating project → project, so a plain onMounted
// would leave stale content on the page).
async function load(id) {
  loading.value = true;
  kind.value = "";
  project.value = null;
  live.value = null;
  release.value = null;
  commits.value = [];

  const sap = sapProjectBySlug[id];
  if (sap) {
    project.value = { ...sap };
    kind.value = "sap";
    loading.value = false;
    return;
  }

  // Everything else is enriched from the daily cached snapshot — no browser
  // calls to the GitHub API, so the page never blanks on rate limits.
  const data = await loadProjects();
  if (route.params.id !== id) return; // a newer navigation superseded this one
  const repo = repoBySlug(data, id);

  const oss = ossProjectBySlug[id];
  if (oss) {
    project.value = { ...oss };
    kind.value = "oss";
    applyLive(repo);
    loading.value = false;
    return;
  }

  if (repo) {
    // In the snapshot but not curated (e.g. an org repo opened directly).
    project.value = {
      name: repo.name,
      summary: repo.description,
      stack: repo.language ? [repo.language] : [],
      url: repo.url,
    };
    kind.value = "oss";
    applyLive(repo);
    loading.value = false;
    return;
  }

  kind.value = "notfound";
  loading.value = false;
}

watch(() => route.params.id, (id) => load(id), { immediate: true });
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

      <!-- Loading -->
      <div
        v-if="loading"
        class="text-center py-20"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-2 border-hairline border-t-accent mx-auto" />
        <p class="mt-4 font-mono text-xs uppercase tracking-widest text-muted">
          Loading project details...
        </p>
      </div>

      <!-- SAP / professional project (static) -->
      <div
        v-else-if="kind === 'sap'"
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

      <!-- OSS project (curated or snapshot), enriched from the cache -->
      <div
        v-else-if="kind === 'oss'"
        class="space-y-8"
      >
        <div class="border border-hairline rounded-lg bg-paper p-8">
          <div class="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.2em] text-accent mb-4">
            <span>{{ (live && live.ownerLabel && live.ownerLabel !== 'Personal') ? live.ownerLabel : 'Open Source' }}</span>
            <span
              v-if="release"
              class="inline-flex items-center gap-1 text-muted normal-case tracking-normal"
            >
              <BaseIcon
                :path="mdiTagOutline"
                size="14"
              />
              {{ release.tag }}<span v-if="release.date"> · {{ release.date }}</span>
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-heading font-bold text-ink mb-4">
            {{ project.name }}
          </h1>
          <p class="font-body text-lg text-muted mb-6 max-w-2xl">
            {{ project.summary || project.card }}
          </p>
          <div class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="t in project.stack"
              :key="t"
              class="font-mono text-[11px] text-muted bg-chip border border-hairline rounded px-2 py-0.5"
            >{{ t }}</span>
          </div>
          <div class="flex flex-wrap gap-3">
            <a
              v-if="project.url"
              :href="project.url"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-hairline font-mono text-sm text-ink hover:border-faint hover:bg-chip transition-colors"
            >
              <BaseIcon
                :path="mdiGithub"
                size="20"
              />
              View on GitHub
            </a>
            <a
              v-if="release && release.url"
              :href="release.url"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-hairline font-mono text-sm text-muted hover:text-ink hover:border-faint transition-colors"
            >
              <BaseIcon
                :path="mdiTagOutline"
                size="18"
              />
              Release {{ release.tag }}
            </a>
          </div>
        </div>

        <!-- Highlights (static, curated) -->
        <div
          v-if="project.highlights && project.highlights.length"
          class="border border-hairline rounded-lg bg-paper p-8"
        >
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
        </div>

        <!-- Repository stats (from the daily snapshot) -->
        <div
          v-if="live"
          class="border border-hairline rounded-lg bg-paper p-8"
        >
          <h2 class="font-mono text-xs font-bold tracking-[0.16em] uppercase text-ink border-b border-hairline pb-3 mb-5">
            Repository
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 border-y border-hairline">
            <div class="py-5 px-5 border-r border-hairline">
              <div class="font-mono text-2xl font-bold text-ink">
                {{ live.stars || 0 }}
              </div>
              <div class="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mt-1">
                Stars
              </div>
            </div>
            <div class="py-5 px-5 border-hairline md:border-r">
              <div class="font-mono text-2xl font-bold text-ink">
                {{ live.forks || 0 }}
              </div>
              <div class="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mt-1">
                Forks
              </div>
            </div>
            <div class="py-5 px-5 border-r border-t md:border-t-0 border-hairline">
              <div class="font-mono text-2xl font-bold text-ink">
                {{ live.language || "N/A" }}
              </div>
              <div class="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mt-1">
                Language
              </div>
            </div>
            <div class="py-5 px-5 border-t md:border-t-0 border-hairline">
              <div class="font-mono text-2xl font-bold text-ink">
                {{ release ? release.tag : "—" }}
              </div>
              <div class="font-mono text-[11px] uppercase tracking-[0.16em] text-faint mt-1">
                Latest release
              </div>
            </div>
          </div>
          <p
            v-if="live.pushedAt"
            class="font-mono text-[11px] text-faint mt-4"
          >
            Last updated {{ live.pushedAt }} · cached daily
          </p>
        </div>

        <!-- Recent commits (from the snapshot) -->
        <div
          v-if="commits.length"
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
                  {{ commit.message }}
                </p>
                <div class="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted">
                  <span
                    v-if="commit.date"
                    class="flex items-center gap-1"
                  >
                    <BaseIcon
                      :path="mdiCalendar"
                      size="16"
                    />
                    {{ commit.date }}
                  </span>
                  <a
                    v-if="commit.url"
                    :href="commit.url"
                    target="_blank"
                    rel="noopener"
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

      <!-- Not found / could not load — graceful, never blank -->
      <div
        v-else
        class="border border-hairline rounded-lg bg-paper p-10 text-center"
      >
        <div class="w-14 h-14 rounded-full bg-chip border border-hairline flex items-center justify-center mx-auto mb-5">
          <BaseIcon
            :path="mdiAlertCircleOutline"
            size="28"
            class="text-faint"
          />
        </div>
        <h1 class="font-heading text-2xl font-bold text-ink mb-2">
          Project unavailable
        </h1>
        <p class="font-body text-muted max-w-md mx-auto mb-7">
          This project isn't in the current snapshot — it may be private or
          renamed. Try my GitHub profile or the full projects index.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-3">
          <router-link
            to="/projects"
            class="px-4 py-2.5 rounded-md bg-ink text-paper font-mono text-sm hover:opacity-90 transition-opacity"
          >
            All projects →
          </router-link>
          <a
            :href="`https://github.com/${githubUsername}`"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-md border border-hairline font-mono text-sm text-ink hover:border-faint hover:bg-chip transition-colors"
          >
            <BaseIcon
              :path="mdiGithub"
              size="20"
            />
            GitHub profile ↗
          </a>
        </div>
      </div>
    </div>
  </div>
</template>
