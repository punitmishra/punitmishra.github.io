<script setup>
import { ref, computed, onMounted } from "vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import { ossProjectBySlug } from "@/data/ossProjects.js";
import { loadProjects } from "@/utils/projects.js";

const data = ref({ generated: "", profile: {}, owners: [], repos: [] });

const groups = computed(() =>
  (data.value.owners || []).map((o) => ({
    ...o,
    repos: (data.value.repos || []).filter((r) => r.owner === o.login),
  }))
);

const activeCount = computed(() => (data.value.repos || []).filter((r) => r.active).length);
const generatedDate = computed(() => (data.value.generated || "").slice(0, 10));

const hasDetail = (slug) => slug in ossProjectBySlug;

onMounted(async () => {
  data.value = await loadProjects();
});
</script>

<template>
  <div class="min-h-screen bg-paper text-ink font-sans">
    <!-- Masthead -->
    <header class="sticky top-0 z-40 bg-paper border-b border-hairline">
      <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div class="flex items-baseline gap-4 min-w-0">
          <router-link
            to="/"
            class="font-mono font-bold text-sm tracking-tight shrink-0"
          >
            punit<span class="text-accent">.</span>mishra
          </router-link>
          <span class="font-mono text-[11px] tracking-[0.14em] uppercase text-faint hidden sm:inline truncate">PROJECTS — ALL WORK</span>
        </div>
        <nav class="flex items-center gap-4 font-mono text-xs text-muted">
          <router-link
            to="/"
            class="hover:text-ink transition-colors"
          >
            ← home
          </router-link>
          <DarkModeToggle />
        </nav>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 py-10">
      <!-- Hero -->
      <section class="pt-8 pb-10">
        <div class="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-5">
          § Projects · Labs · Open Source
        </div>
        <h1 class="font-mono font-extrabold text-4xl sm:text-5xl leading-[0.95] tracking-tight mb-5">
          All Projects
        </h1>
        <p class="font-sans text-lg leading-relaxed text-muted max-w-2xl">
          Work across my personal account and the labs I run — shipped tools,
          active experiments, and open-source infrastructure. Repository data is
          cached daily from GitHub.
        </p>
        <div class="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 font-mono text-[11px] tracking-[0.1em] uppercase text-faint">
          <span>{{ (data.repos || []).length }} projects</span>
          <span>{{ (data.owners || []).length }} owners</span>
          <span class="inline-flex items-center gap-1.5"><span class="text-accent">●</span> {{ activeCount }} active</span>
          <span v-if="generatedDate">cached {{ generatedDate }}</span>
        </div>
      </section>

      <!-- Groups by owner -->
      <section
        v-for="g in groups"
        :key="g.login"
        class="pt-6 pb-2"
      >
        <div class="flex items-baseline justify-between border-b-2 border-ink pb-2.5">
          <div class="font-mono text-sm font-bold tracking-[0.16em] uppercase">
            {{ g.label }}
            <span class="text-faint font-normal normal-case tracking-normal">· {{ g.type === 'org' ? '@' + g.login : 'personal' }}</span>
          </div>
          <div class="font-mono text-[10px] tracking-[0.12em] uppercase text-faint">
            {{ g.repos.length }} {{ g.repos.length === 1 ? 'repo' : 'repos' }}
          </div>
        </div>

        <div
          class="grid gap-px bg-hairline border-b border-hairline"
          :class="g.repos.length === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'"
        >
          <component
            :is="hasDetail(r.slug) ? 'router-link' : 'a'"
            v-for="r in g.repos"
            :key="r.owner + '/' + r.slug"
            v-bind="hasDetail(r.slug)
              ? { to: `/project/${r.slug}` }
              : { href: r.url, target: '_blank', rel: 'noopener' }"
            class="group bg-paper p-5 hover:bg-chip transition-colors flex flex-col"
          >
            <div class="flex items-center justify-between gap-3 mb-2">
              <div class="flex items-center gap-2 min-w-0">
                <span
                  v-if="r.active"
                  class="text-accent text-xs shrink-0"
                  title="Actively developed"
                >●</span>
                <h3 class="font-mono text-lg font-bold tracking-tight truncate group-hover:text-accent transition-colors">
                  {{ r.name }}
                </h3>
              </div>
              <span class="font-mono text-[10px] text-faint whitespace-nowrap shrink-0">
                {{ r.language || "—" }}
              </span>
            </div>
            <p class="font-sans text-sm text-muted leading-relaxed flex-1">
              {{ r.description || "—" }}
            </p>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 font-mono text-[11px] text-faint">
              <span v-if="r.stars">{{ r.stars }}★</span>
              <span v-if="r.release">{{ r.release.tag }}</span>
              <span v-if="r.pushedAt">upd {{ r.pushedAt }}</span>
              <span
                v-if="hasDetail(r.slug)"
                class="text-accent ml-auto"
              >details →</span>
              <span
                v-else
                class="text-faint ml-auto group-hover:text-accent transition-colors"
              >github ↗</span>
            </div>
          </component>
        </div>
      </section>

      <!-- Empty fallback -->
      <p
        v-if="!groups.length"
        class="font-mono text-sm text-faint py-16 text-center"
      >
        Loading projects…
      </p>
    </main>

    <!-- Footer -->
    <footer class="border-t border-hairline mt-10">
      <div class="max-w-6xl mx-auto px-6 py-8 flex flex-wrap justify-between gap-3 font-mono text-[11px] tracking-[0.08em] uppercase text-faint">
        <span>© 2026 Punit Mishra</span>
        <router-link
          to="/"
          class="hover:text-ink transition-colors"
        >
          ← back to portfolio
        </router-link>
      </div>
    </footer>
  </div>
</template>
