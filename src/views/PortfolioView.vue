<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import axios from "axios";
import ContactForm from "@/components/ContactForm.vue";
import CommandPalette from "@/components/CommandPalette.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";

const commandPaletteRef = ref(null);
const githubUsername = "punitmishra";
const linkedinUsername = "mishrapunit";

const githubProfile = ref({
  name: "Punit Mishra",
  bio: "Senior ML Expert & AI Tech Lead @ SAP",
  publicRepos: 36,
  htmlUrl: `https://github.com/${githubUsername}`,
});
const githubStats = ref({ totalStars: 0 });

const totalYearsExperience = computed(() => 14);

const lede =
  "I take machine learning from prototype to production at enterprise scale — agent platforms, LLM inference on custom H100 clusters, and the multi-tenant infrastructure underneath.";

/* ---- Selected Work: professional (SAP/ML) + personal (OSS) ---- */
const PRO_WORK = [
  { kind: "pro", title: "Domain Data Access Agents", summary: "Natural-language-to-SQL over S/4HANA; decision-match accuracy 59%→65% with reranking and schema-aware planning.", stack: ["LLM", "NL-to-SQL", "Agents"], link: "/resume" },
  { kind: "pro", title: "LLM Inference Platform", summary: "Multi-tenant model serving on custom bare-metal H100 GPU clusters with distributed scheduling on Ray.", stack: ["Ray", "H100", "Serving"], link: "/resume" },
  { kind: "pro", title: "CX & Commerce AI Toolkit", summary: "Visual + textual LLM agents across SAP's CX & Commerce (PyTorch on Kubernetes), with vector search + RAG.", stack: ["AI", "CX", "Platform"], link: "/resume" },
];
const featuredProjects = [
  { name: "CoViber", description: "Local-first memory for LLMs over the Model Context Protocol — work graph, urgency triage, and local semantic memory. No cloud, no telemetry.", tech: ["Python", "MCP", "LLM"], url: `https://github.com/${githubUsername}/coviber` },
  { name: "Vaultic", description: "Local-first, encrypted password manager in Rust with FIDO2/YubiKey — one vault across CLI, TUI, daemon, GUI, and an MCP server.", tech: ["Rust", "FIDO2", "Security"], url: `https://github.com/${githubUsername}/vaultic` },
  { name: "Shield AI", description: "AI-powered DNS filtering with real-time threat detection.", tech: ["TypeScript", "AI/ML", "DNS"], url: `https://github.com/${githubUsername}/shield-ai` },
  { name: "Railroad Arcade", description: "Full-stack IoT app controlling a real HO-scale model railroad — Next.js front end, a Rust backend on a Raspberry Pi driving the hardware.", tech: ["Next.js", "Rust", "IoT"], url: `https://github.com/${githubUsername}/railroad-arcade` },
  { name: "RailCommand Firmware", description: "Multi-node ESP32-C3 firmware — the embedded layer beneath Railroad Arcade.", tech: ["C++", "ESP32-C3", "Embedded"], url: `https://github.com/${githubUsername}/esp32-firmware` },
  { name: "Pi Race", description: "Zero-dependency Rust CLI racing four classic π algorithms on accuracy and speed.", tech: ["Rust", "CLI", "Numerics"], url: `https://github.com/${githubUsername}/pi-race` },
];
const slugFromUrl = (u) => u.split("/").pop();
const selectedWork = [
  ...PRO_WORK,
  ...featuredProjects.map((p) => ({ kind: "oss", title: p.name, summary: p.description, stack: p.tech.slice(0, 3), link: `/project/${slugFromUrl(p.url)}` })),
];
const proCount = selectedWork.filter((w) => w.kind === "pro").length;
const ossCount = selectedWork.filter((w) => w.kind === "oss").length;

/* ---- Dossier: experience (compact), skills, education, links ---- */
const experience = [
  { company: "SAP", role: "Senior ML & AI Tech Lead · CX Data & AI", period: "2018 — Present" },
  { company: "CallidusCloud", role: "Senior Software Engineer · Thunderbridge AI", period: "2014 — 2018" },
  { company: "IBM", role: "Automation Systems Engineer", period: "2012 — 2013" },
];
const skills = [
  { group: "ML / AI", items: ["LLMs", "RAG", "Agents", "Inference", "PyTorch"] },
  { group: "Platforms", items: ["Ray", "Kubernetes", "Multi-tenant", "GPU / H100"] },
  { group: "Languages", items: ["Python", "Rust", "TypeScript", "Java"] },
  { group: "Data", items: ["S/4HANA", "SQL", "Vector DBs"] },
];
const education = { school: "UC Berkeley", degree: "B.S. EECS", year: "2012" };
const links = [
  { label: "github", url: `https://github.com/${githubUsername}` },
  { label: "linkedin", url: `https://linkedin.com/in/${linkedinUsername}` },
  { label: "résumé", url: "#/resume" },
];

/* ---- Writing: newest posts from the blog index ---- */
const recentPosts = ref([]);
const fetchPosts = async () => {
  try {
    const res = await axios.get(`${import.meta.env.BASE_URL}content/blog/index.json`);
    const arts = (res.data && res.data.articles) || res.data || [];
    recentPosts.value = [...arts]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  } catch {
    recentPosts.value = [];
  }
};
const postMonth = (d) => {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${y}·${m}`;
};
const latestRev = computed(() => (recentPosts.value[0] ? postMonth(recentPosts.value[0].date) : "2026·02"));

/* ---- GitHub stats (repo count + summed stars); keep auto-refresh ---- */
const fetchGitHub = async () => {
  try {
    const profile = await axios.get(`https://api.github.com/users/${githubUsername}`);
    if (profile.data && typeof profile.data.public_repos === "number") {
      githubProfile.value = { ...githubProfile.value, publicRepos: profile.data.public_repos, htmlUrl: profile.data.html_url };
    }
    const repos = await axios.get(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100&type=all`);
    if (Array.isArray(repos.data)) {
      githubStats.value.totalStars = repos.data.reduce((s, r) => s + (r.stargazers_count || 0), 0);
    }
  } catch (e) {
    console.warn("GitHub fetch failed; using seeded stats:", e?.message);
  }
};

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 70, behavior: "smooth" });
};

let refreshTimer = null;
onMounted(() => {
  fetchPosts();
  fetchGitHub();
  refreshTimer = setInterval(fetchGitHub, 5 * 60 * 1000);
});
onBeforeUnmount(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});
</script>

<template>
  <div
    id="top"
    class="min-h-screen bg-paper text-ink font-sans"
  >
    <!-- Masthead -->
    <header class="sticky top-0 z-40 bg-paper border-b border-hairline">
      <div class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        <div class="flex items-baseline gap-4 min-w-0">
          <a
            href="#top"
            class="font-mono font-bold text-sm tracking-tight shrink-0"
          >punit<span class="text-accent">.</span>mishra</a>
          <span class="font-mono text-[11px] tracking-[0.14em] uppercase text-faint hidden sm:inline truncate">INDEX — REV {{ latestRev }}</span>
        </div>
        <nav class="flex items-center gap-4 font-mono text-xs text-muted">
          <button
            class="hidden sm:inline hover:text-ink transition-colors"
            @click="scrollToSection('work')"
          >
            work
          </button>
          <button
            class="hidden sm:inline hover:text-ink transition-colors"
            @click="scrollToSection('writing')"
          >
            writing
          </button>
          <button
            class="hidden sm:inline hover:text-ink transition-colors"
            @click="scrollToSection('about')"
          >
            about
          </button>
          <button
            class="px-2 py-1 border border-hairline rounded text-faint hover:text-ink transition-colors"
            aria-label="Open command palette"
            @click="commandPaletteRef && (commandPaletteRef.isOpen = true)"
          >
            ⌘K
          </button>
          <DarkModeToggle />
        </nav>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 lg:gap-14 py-10">
      <!-- ===== MAIN COLUMN ===== -->
      <div class="min-w-0">
        <!-- Hero -->
        <section class="pt-10 pb-8">
          <div class="font-mono text-[11px] tracking-[0.2em] uppercase text-accent mb-5">
            §00 · ML · AI · Platforms · @ SAP
          </div>
          <h1 class="font-mono font-extrabold text-5xl sm:text-6xl leading-[0.95] tracking-tight mb-6">
            Punit Mishra
          </h1>
          <p class="font-sans text-lg leading-relaxed text-ink max-w-2xl">
            {{ lede }}
          </p>
          <div class="flex flex-wrap gap-3 mt-8 font-mono text-sm">
            <button
              class="px-4 py-2.5 rounded-md bg-ink text-paper font-medium hover:opacity-90 transition-opacity"
              @click="scrollToSection('work')"
            >
              view work →
            </button>
            <router-link
              to="/resume"
              class="px-4 py-2.5 rounded-md border border-hairline text-muted hover:text-ink hover:border-faint transition-colors"
            >
              résumé
            </router-link>
            <a
              :href="githubProfile.htmlUrl"
              target="_blank"
              rel="noopener"
              class="px-4 py-2.5 rounded-md border border-hairline text-muted hover:text-ink hover:border-faint transition-colors"
            >github ↗</a>
          </div>
        </section>

        <!-- Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 border-y border-hairline">
          <div class="py-5 pr-6 border-r border-hairline">
            <div class="font-mono text-3xl font-bold tracking-tight">
              {{ githubProfile.publicRepos }}
            </div>
            <div class="font-mono text-[10px] tracking-[0.14em] uppercase text-faint mt-2">
              Repositories
            </div>
          </div>
          <div class="py-5 px-6 sm:border-r border-hairline">
            <div class="font-mono text-3xl font-bold tracking-tight">
              {{ totalYearsExperience }}<span class="text-accent">+</span>
            </div>
            <div class="font-mono text-[10px] tracking-[0.14em] uppercase text-faint mt-2">
              Years
            </div>
          </div>
          <div class="py-5 sm:px-6 pr-6 border-r sm:border-r border-hairline border-t sm:border-t-0 border-hairline">
            <div class="font-mono text-3xl font-bold tracking-tight">
              {{ githubStats.totalStars }}<span class="text-accent">★</span>
            </div>
            <div class="font-mono text-[10px] tracking-[0.14em] uppercase text-faint mt-2">
              Stars
            </div>
          </div>
          <div class="py-5 px-6 border-t sm:border-t-0 border-hairline">
            <div class="font-mono text-3xl font-bold tracking-tight">
              EECS
            </div>
            <div class="font-mono text-[10px] tracking-[0.14em] uppercase text-faint mt-2">
              UC Berkeley
            </div>
          </div>
        </div>

        <!-- §01 Selected Work -->
        <section
          id="work"
          class="pt-14"
        >
          <div class="flex items-baseline justify-between border-b-2 border-ink pb-2.5">
            <div class="font-mono text-sm font-bold tracking-[0.16em] uppercase">
              <span class="text-accent">§01</span> Selected Work
            </div>
            <div class="font-mono text-[10px] tracking-[0.12em] uppercase text-faint">
              {{ proCount }} pro · {{ ossCount }} oss
            </div>
          </div>
          <router-link
            v-for="(item, i) in selectedWork"
            :key="item.title"
            :to="item.link"
            class="group grid grid-cols-[2rem_1fr_1.25rem] gap-4 items-baseline py-6 border-b border-hairline hover:bg-chip transition-colors -mx-3 px-3"
          >
            <div class="font-mono text-xs text-faint pt-1">
              {{ String(i + 1).padStart(2, "0") }}
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2.5 mb-1.5">
                <span
                  class="font-mono text-[9px] font-semibold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-sm"
                  :class="item.kind === 'pro' ? 'text-accent border border-accent' : 'text-muted border border-hairline bg-chip'"
                >{{ item.kind }}</span>
                <h3 class="font-mono text-xl font-bold tracking-tight group-hover:text-accent transition-colors truncate">
                  {{ item.title }}
                </h3>
              </div>
              <p class="font-sans text-sm text-muted leading-relaxed max-w-xl">
                {{ item.summary }}
              </p>
              <div class="flex flex-wrap gap-1.5 mt-3">
                <span
                  v-for="t in item.stack"
                  :key="t"
                  class="font-mono text-[11px] text-muted bg-chip border border-hairline rounded px-2 py-0.5"
                >{{ t }}</span>
              </div>
            </div>
            <div class="font-mono text-faint group-hover:text-accent transition-colors text-right pt-1">
              ↗
            </div>
          </router-link>
        </section>

        <!-- §02 Writing -->
        <section
          id="writing"
          class="pt-14"
        >
          <div class="flex items-baseline justify-between border-b-2 border-ink pb-2.5">
            <div class="font-mono text-sm font-bold tracking-[0.16em] uppercase">
              <span class="text-accent">§02</span> Writing
            </div>
          </div>
          <router-link
            v-for="post in recentPosts"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="group grid grid-cols-[5rem_1fr_1.25rem] gap-4 items-baseline py-4 border-b border-hairline hover:bg-chip transition-colors -mx-3 px-3"
          >
            <div class="font-mono text-xs text-faint">
              {{ postMonth(post.date) }}
            </div>
            <h4 class="font-mono text-base font-semibold tracking-tight group-hover:text-accent transition-colors">
              {{ post.title }}
            </h4>
            <div class="font-mono text-faint group-hover:text-accent transition-colors text-right">
              ↗
            </div>
          </router-link>
          <p
            v-if="recentPosts.length === 0"
            class="font-mono text-sm text-faint py-4"
          >
            Loading writing…
          </p>
        </section>
      </div>

      <!-- ===== DOSSIER SIDEBAR ===== -->
      <aside
        id="about"
        class="lg:border-l lg:border-hairline lg:pl-8 pt-14 lg:pt-10 border-t lg:border-t-0 border-hairline"
      >
        <div class="font-mono text-[10px] tracking-[0.2em] uppercase text-faint mb-7">
          / dossier · meta
        </div>

        <!-- Experience -->
        <div class="font-mono text-xs font-bold tracking-[0.16em] uppercase border-b border-hairline pb-2 mb-3">
          <span class="text-accent">§03</span> Experience
        </div>
        <div
          v-for="x in experience"
          :key="x.company"
          class="py-2.5 border-b border-hairline last:border-0"
        >
          <div class="flex items-baseline justify-between gap-2">
            <span class="font-mono text-sm font-bold">{{ x.company }}</span>
            <span class="font-mono text-[10px] text-faint whitespace-nowrap">{{ x.period }}</span>
          </div>
          <div class="font-sans text-xs text-muted mt-0.5 leading-snug">
            {{ x.role }}
          </div>
        </div>

        <!-- Skills -->
        <div class="font-mono text-xs font-bold tracking-[0.16em] uppercase border-b border-hairline pb-2 mb-3 mt-8">
          <span class="text-accent">§04</span> Skills
        </div>
        <div
          v-for="s in skills"
          :key="s.group"
          class="mb-3.5"
        >
          <div class="font-mono text-[10px] tracking-[0.12em] uppercase text-faint mb-1.5">
            {{ s.group }}
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="it in s.items"
              :key="it"
              class="font-mono text-[11px] text-muted bg-chip border border-hairline rounded px-2 py-0.5"
            >{{ it }}</span>
          </div>
        </div>

        <!-- Education + links -->
        <div class="font-mono text-xs font-bold tracking-[0.16em] uppercase border-b border-hairline pb-2 mb-3 mt-8">
          <span class="text-accent">§05</span> Education + Links
        </div>
        <div class="font-mono text-sm font-bold">
          {{ education.school }}
        </div>
        <div class="font-sans text-xs text-muted mb-4">
          {{ education.degree }} · {{ education.year }}
        </div>
        <div class="flex flex-col gap-1">
          <a
            v-for="l in links"
            :key="l.label"
            :href="l.url"
            :target="l.url.startsWith('http') ? '_blank' : '_self'"
            rel="noopener"
            class="font-mono text-xs text-accent hover:underline py-1 w-fit"
          >{{ l.label }} ↗</a>
        </div>
        <div class="font-mono text-[11px] text-faint mt-5 pt-4 border-t border-hairline">
          {{ githubProfile.publicRepos }} public repos · {{ githubStats.totalStars }}★ · active 2012—present
        </div>
      </aside>
    </main>

    <!-- Contact -->
    <section
      id="contact"
      class="border-t border-hairline bg-chip"
    >
      <div class="max-w-6xl mx-auto px-6 py-14">
        <div class="font-mono text-sm font-bold tracking-[0.16em] uppercase border-b-2 border-ink pb-2.5 mb-8">
          <span class="text-accent">§06</span> Let's Connect
        </div>
        <ContactForm />
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-hairline">
      <div class="max-w-6xl mx-auto px-6 py-8 flex flex-wrap justify-between gap-3 font-mono text-[11px] tracking-[0.08em] uppercase text-faint">
        <span>© 2026 Punit Mishra</span>
        <span>Built from silicon to software · ⌘K to navigate</span>
      </div>
    </footer>

    <CommandPalette
      ref="commandPaletteRef"
      @navigate="scrollToSection"
    />
  </div>
</template>
