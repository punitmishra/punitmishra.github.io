<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  mdiGithub,
  mdiLinkedin,
  mdiTwitter,
  mdiInstagram,
  mdiWeb,
  mdiStar,
  mdiSourceFork,
  mdiArrowRight,
  mdiMagnify,
} from "@mdi/js";
import BaseIcon from "@/components/BaseIcon.vue";
import AnimatedCounter from "@/components/AnimatedCounter.vue";
import ContactForm from "@/components/ContactForm.vue";
import ProjectFilter from "@/components/ProjectFilter.vue";
import ResumeDownload from "@/components/ResumeDownload.vue";
import GitHubContributionGraph from "@/components/GitHubContributionGraph.vue";
import TypingAnimation from "@/components/TypingAnimation.vue";
import CommandPalette from "@/components/CommandPalette.vue";
import StatsGrid from "@/components/StatsGrid.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import BlogSection from "@/components/BlogSection.vue";
import CurrentlyBuilding from "@/components/CurrentlyBuilding.vue";
import TestimonialsSection from "@/components/TestimonialsSection.vue";
import VisitorCounter from "@/components/VisitorCounter.vue";
import { useStyleStore } from "@/stores/style.js";

const commandPaletteRef = ref(null);
const router = useRouter();
const styleStore = useStyleStore();
const githubUsername = "punitmishra";
const linkedinUsername = "mishrapunit";

const githubProfile = ref({
  name: "Punit Mishra",
  bio: "Senior Engineer & AI/ML Architect @ SAP",
  avatar: `https://github.com/${githubUsername}.png`,
  followers: 10,
  following: 7,
  publicRepos: 29,
  location: "Pleasanton, CA",
  company: "@SAP",
  blog: "https://punitmishra.com",
  htmlUrl: `https://github.com/${githubUsername}`,
  createdAt: "2011-04-13T13:26:01Z",
});

const githubRepos = ref([]);
const latestRepos = ref([]);
const githubStats = ref({ totalStars: 0, totalForks: 0, languages: {} });
const loading = ref({ profile: true, repos: true });
const reposError = ref(false);

const socialLinks = [
  { icon: mdiGithub, label: "GitHub", url: `https://github.com/${githubUsername}`, color: "hover:text-gray-900 dark:hover:text-white" },
  { icon: mdiLinkedin, label: "LinkedIn", url: `https://linkedin.com/in/${linkedinUsername}`, color: "hover:text-blue-600" },
  { icon: mdiTwitter, label: "Twitter", url: "https://twitter.com/punitmishra", color: "hover:text-sky-400" },
  { icon: mdiInstagram, label: "Instagram", url: "https://instagram.com/punitmishra", color: "hover:text-pink-500" },
  { icon: mdiWeb, label: "Website", url: "https://punitmishra.com", color: "hover:text-cyan-600" },
];

const featuredProjects = [
  {
    name: "Shield AI",
    description: "High-performance DNS security system in Rust with ML-based DGA detection. Sub-millisecond latency, 15MB memory footprint, 127K queries/sec throughput.",
    tech: ["Rust", "AI/ML", "DNS", "Security", "FAISS"],
    gradient: "from-rose-500 to-orange-500",
    url: `https://github.com/${githubUsername}/shield-ai`,
    featured: true,
    highlights: [
      "Sub-millisecond DNS resolution",
      "ML-based DGA detection",
      "15MB memory footprint",
      "127K queries/sec throughput",
    ],
  },
  {
    name: "Railroad Arcade",
    description: "Remote-controlled model railroad via web app with Raspberry Pi GPIO, WebSockets, game modes, and leaderboards. Real physical trains, controlled from anywhere.",
    tech: ["Next.js", "Raspberry Pi", "WebSockets", "IoT", "TypeScript"],
    gradient: "from-emerald-500 to-teal-500",
    url: `https://github.com/${githubUsername}/railroad-arcade`,
    featured: true,
    highlights: [
      "Real-time WebSocket control",
      "Sub-100ms latency",
      "Gamification system",
      "Multi-camera support",
    ],
  },
  {
    name: "Circuit Playground Controller",
    description: "Open-source CircuitPython firmware for embedded model railroad control. PWM motor control, NeoPixel feedback, smooth acceleration, and serial protocol bridge.",
    tech: ["CircuitPython", "Embedded", "Hardware", "Open Source"],
    gradient: "from-amber-500 to-yellow-500",
    url: `https://github.com/${githubUsername}/railroad-arcade-cpx`,
    featured: true,
    highlights: [
      "CircuitPython firmware",
      "PWM motor control",
      "NeoPixel feedback",
      "Serial protocol bridge",
    ],
  },
  {
    name: "Raspberry Pi Homelab",
    description: "Fleet of 5 Raspberry Pis providing DNS security, IoT control, media serving, monitoring, and sensor collection with Docker and Cloudflare Tunnels.",
    tech: ["Raspberry Pi", "Docker", "Prometheus", "Grafana", "Cloudflare"],
    gradient: "from-violet-500 to-purple-500",
    url: `https://github.com/${githubUsername}/homelab`,
    featured: true,
    highlights: [
      "Docker-based deployments",
      "Prometheus/Grafana monitoring",
      "Cloudflare Tunnel access",
      "Automated CI/CD",
    ],
  },
  {
    name: "Vector Search Engine",
    description: "Production vector similarity search using FAISS, HNSW, and CLIP embeddings. Sub-100ms queries across 30k+ products with multimodal product similarity.",
    tech: ["Python", "FAISS", "CLIP", "Docker", "FastAPI"],
    gradient: "from-blue-500 to-indigo-500",
    url: `https://github.com/${githubUsername}/sap-cxii-tech-ex-01`,
    featured: true,
    highlights: [
      "CLIP embeddings",
      "FAISS indexing",
      "Sub-100ms queries",
      "Multimodal search",
    ],
  },
  {
    name: "Grepcoin ($GREP)",
    description: "Cryptocurrency for developers with utility tied to code search APIs. ERC-20 token with staking, governance, and DeFi integration. Open source smart contracts.",
    tech: ["Solidity", "Web3", "DeFi", "React", "Hardhat"],
    gradient: "from-green-500 to-emerald-500",
    url: `https://github.com/${githubUsername}/grepcoin`,
    featured: true,
    highlights: [
      "ERC-20 token launch",
      "Staking & governance",
      "API token utility",
      "Security audited",
    ],
  },
  {
    name: "Kubernetes Infrastructure",
    description: "Production Kubernetes cluster deployment using Kubespray with Ansible automation. Scalable container orchestration for enterprise workloads.",
    tech: ["Kubernetes", "Ansible", "DevOps", "Terraform"],
    gradient: "from-sky-500 to-cyan-500",
    url: `https://github.com/${githubUsername}/kubespray`,
    featured: true,
    highlights: [
      "Production Kubernetes",
      "Ansible automation",
      "Cluster management",
      "Container orchestration",
    ],
  },
];

const experience = [
  {
    title: "Senior Software Engineer",
    company: "SAP",
    period: "2013 - Present",
    location: "Pleasanton, CA",
    duration: "12+ years",
    achievements: [
      "Architected enterprise AI platform from v0 to production serving Fortune 500 customers with 1M+ daily requests",
      "Led AI/ML infrastructure: LLM integration, vector search (FAISS), multi-agent systems (LangGraph)",
      "Achieved 40% latency reduction and 3x throughput through distributed caching and query optimization",
      "Reduced cloud costs by $500K+ annually via resource optimization and intelligent autoscaling",
      "Technical lead for teams of 5-8 engineers; mentored 10+ engineers across multiple teams",
    ],
    tech: ["Python", "TypeScript", "Java", "Rust", "Kubernetes", "AWS", "PostgreSQL", "Redis", "LangGraph", "FAISS"],
    highlights: [
      "Platform Architecture",
      "AI/ML at Scale",
      "Technical Leadership",
    ],
  },
  {
    title: "Hardware & IoT Engineer",
    company: "Personal Projects",
    period: "2020 - Present",
    location: "Home Lab",
    duration: "5+ years",
    achievements: [
      "Built Railroad Arcade: remote-controlled model railroad with real-time IoT via Raspberry Pi and WebSockets",
      "Developed Shield AI: high-performance DNS security in Rust with ML-based threat detection (<1ms latency)",
      "Created open-source CircuitPython controller for embedded hardware with smooth acceleration curves",
      "Deployed 5-node Raspberry Pi homelab: DNS filtering, media server, monitoring, IoT bridge, sensors",
    ],
    tech: ["Raspberry Pi", "CircuitPython", "Rust", "Docker", "Prometheus", "Grafana", "Next.js", "WebSockets"],
    highlights: [
      "IoT Systems",
      "Embedded Development",
      "Home Infrastructure",
    ],
  },
];

const education = [
  {
    degree: "B.S. Computer Science",
    school: "University of California, Berkeley",
    period: "2010 - 2012",
    description: "Advanced coursework in computer science and electrical engineering at one of the world's top engineering programs.",
    specializations: [
      "Artificial Intelligence (CS 188)",
      "Computer Architecture (CS 150/152)",
      "Communication Networks (EE 122)",
      "Signals and Systems (EE 120)",
    ],
    awards: ["International Student Scholarship ($10,000)"],
  },
];

const certifications = [
  { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", year: "2020" },
  { name: "Kubernetes Administrator", issuer: "CNCF", year: "2021" },
];

const getLanguageColor = (language) => {
  const colors = {
    JavaScript: "bg-yellow-400",
    TypeScript: "bg-blue-500",
    Python: "bg-green-500",
    Vue: "bg-emerald-500",
    Rust: "bg-orange-600",
    Go: "bg-cyan-500",
    Java: "bg-red-500",
    HTML: "bg-orange-500",
    CSS: "bg-blue-400",
    Other: "bg-gray-500",
  };
  return colors[language] || colors.Other;
};

const fetchGitHubProfile = async () => {
  try {
    const response = await axios.get(`https://api.github.com/users/${githubUsername}`);
    githubProfile.value = { 
      ...response.data, 
      htmlUrl: response.data.html_url,
      bio: response.data.bio || "Software Engineer"
    };
    loading.value.profile = false;
  } catch (error) {
    console.error("Error fetching GitHub profile:", error);
    loading.value.profile = false;
  }
};

const fetchGitHubRepos = async () => {
  try {
    loading.value.repos = true;
    reposError.value = false;

    const response = await axios.get(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=15&type=all`
    );

    if (!response.data || response.data.length === 0) {
      console.warn("No repositories found");
      reposError.value = true;
      loading.value.repos = false;
      return;
    }

    const allRepos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || "No description",
      language: repo.language || "Other",
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      url: repo.html_url,
      updated: new Date(repo.updated_at).toLocaleDateString(),
      updatedAt: repo.updated_at,
      topics: repo.topics || [],
      createdAt: repo.created_at,
      pushedAt: repo.pushed_at,
      tech: repo.topics || [],
      category: repo.topics?.includes('ai') || repo.topics?.includes('ml') ? 'AI/ML' :
                 repo.topics?.includes('web') || repo.topics?.includes('frontend') ? 'Web' :
                 repo.topics?.includes('infrastructure') || repo.topics?.includes('devops') ? 'Infrastructure' :
                 repo.topics?.includes('systems') || repo.topics?.includes('rust') ? 'Systems' : 'Other',
    }));

    githubRepos.value = allRepos.slice(0, 10);
    latestRepos.value = allRepos.slice(0, 6);
    filteredRepos.value = [...latestRepos.value];

    githubStats.value.totalStars = allRepos.reduce((sum, repo) => sum + repo.stars, 0);
    githubStats.value.totalForks = allRepos.reduce((sum, repo) => sum + repo.forks, 0);

    const langCount = {};
    allRepos.forEach((repo) => {
      if (repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      }
    });
    githubStats.value.languages = langCount;

    loading.value.repos = false;
  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    reposError.value = true;
    loading.value.repos = false;
  }
};


const totalYearsExperience = computed(() => {
  return 12.5;
});

// Filter state
const filteredRepos = ref([]);

const handleFiltered = (filtered) => {
  filteredRepos.value = filtered;
};


const goToProject = (repoName) => {
  router.push(`/project/${repoName}`);
};

const isMobileMenuOpen = ref(false);

const scrollToSection = (sectionId) => {
  isMobileMenuOpen.value = false;
  const element = document.getElementById(sectionId);
  if (element) {
    const offset = 80; // Account for fixed navbar
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Auto-refresh every 5 minutes
onMounted(() => {
  fetchGitHubProfile();
  fetchGitHubRepos();
  
  setInterval(() => {
    fetchGitHubProfile();
    fetchGitHubRepos();
  }, 5 * 60 * 1000);
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-display">
    <!-- Animated Gradient Mesh Background -->
    <GradientMesh />

    <!-- Command Palette -->
    <CommandPalette ref="commandPaletteRef" @navigate="scrollToSection" />

    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 backdrop-blur-2xl bg-white/70 dark:bg-slate-950/70 border-b border-gray-200/30 dark:border-slate-800/50 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          @click="scrollToSection('hero')"
          class="text-2xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent font-heading tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
        >
          PM
        </button>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-8">
          <button
            @click="scrollToSection('projects')"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
          >
            Projects
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            @click="scrollToSection('latest')"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
          >
            Latest
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            @click="scrollToSection('skills')"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
          >
            Skills
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            @click="scrollToSection('experience')"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
          >
            Experience
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button
            @click="scrollToSection('blog')"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
          >
            Blog
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </button>
          <router-link
            to="/photos"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
          >
            Photos
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </router-link>
          <router-link
            to="/resume"
            class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-medium text-sm tracking-wide relative group"
          >
            Resume
            <span class="absolute -bottom-1 left-0 w-0 h-px bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </router-link>

          <!-- Command Palette Trigger -->
          <button
            @click="commandPaletteRef.isOpen = true"
            class="flex items-center gap-2 px-3 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100/80 dark:bg-slate-800/80 rounded-lg text-sm transition-colors border border-gray-200/50 dark:border-slate-700/50"
          >
            <BaseIcon :path="mdiMagnify" size="16" />
            <span class="text-xs">Search</span>
            <kbd class="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white dark:bg-slate-700 rounded border border-gray-200 dark:border-slate-600">
              <span>⌘</span><span>K</span>
            </kbd>
          </button>

          <!-- Dark Mode Toggle with Fun Messages -->
          <DarkModeToggle />

          <button
            @click="scrollToSection('contact')"
            class="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
          >
            Contact
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="isMobileMenuOpen = !isMobileMenuOpen"
          class="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="Toggle menu"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div 
        v-if="isMobileMenuOpen"
        class="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-slate-700/50"
      >
        <div class="max-w-7xl mx-auto px-6 py-4 space-y-3">
          <button 
            @click="scrollToSection('projects')" 
            class="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display py-2"
          >
            Projects
          </button>
          <button 
            @click="scrollToSection('latest')" 
            class="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display py-2"
          >
            Latest
          </button>
          <button 
            @click="scrollToSection('skills')" 
            class="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display py-2"
          >
            Skills
          </button>
          <button
            @click="scrollToSection('experience')"
            class="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display py-2"
          >
            Experience
          </button>
          <button
            @click="scrollToSection('blog')"
            class="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display py-2"
          >
            Blog
          </button>
          <router-link
            to="/photos"
            class="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display py-2"
            @click="isMobileMenuOpen = false"
          >
            Photos
          </router-link>
          <router-link
            to="/resume"
            class="block w-full text-left text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display py-2"
            @click="isMobileMenuOpen = false"
          >
            Resume
          </router-link>
          <button
            @click="styleStore.setDarkMode()"
            class="flex items-center gap-2 px-6 py-2.5 text-gray-700 dark:text-gray-300 font-semibold font-display"
          >
            <BaseIcon :path="styleStore.darkMode ? mdiWeatherSunny : mdiWeatherNight" size="20" />
            <span>{{ styleStore.darkMode ? 'Light Mode' : 'Dark Mode' }}</span>
          </button>
          <button 
            @click="scrollToSection('contact')" 
            class="block w-full text-left px-6 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 text-white rounded-full font-semibold font-display text-center hover:shadow-lg transition-all"
          >
            Contact
          </button>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="hero" class="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
      <div class="relative z-10 max-w-6xl mx-auto px-6">
        <!-- Bento Grid Hero Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">

          <!-- Main Hero Content - Spans 2 columns -->
          <div class="lg:col-span-2 text-center lg:text-left" v-scroll-reveal>
            <!-- Status Badge -->
            <div class="mb-6 inline-flex items-center gap-2 px-4 py-2 glass-premium rounded-full">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-300">Available for opportunities</span>
            </div>

            <!-- Name with gradient animation -->
            <h1 class="text-5xl md:text-6xl lg:text-7xl font-black mb-4 leading-tight font-heading tracking-tight">
              <span class="text-gray-900 dark:text-white">Hi, I'm </span>
              <span class="text-gradient-animate">{{ githubProfile.name?.split(' ')[0] || "Punit" }}</span>
            </h1>

            <!-- Typing Animation -->
            <div class="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-6 font-medium h-8">
              <TypingAnimation
                :texts="['Senior Engineer @ SAP', 'AI/ML Systems Architect', 'Building Products at Scale', '12+ Years • UC Berkeley']"
                :typing-speed="60"
                :deleting-speed="30"
                :pause-duration="3000"
              />
            </div>

            <!-- Description -->
            <p class="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl leading-relaxed">
              Architect and tech lead building enterprise AI infrastructure at scale.
              {{ totalYearsExperience }}+ years shipping production systems—from silicon design to cloud-native microservices.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-wrap justify-center lg:justify-start items-center gap-3">
              <a
                :href="`https://github.com/${githubUsername}`"
                target="_blank"
                class="group flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 shine"
              >
                <BaseIcon :path="mdiGithub" size="20" />
                <span>GitHub</span>
              </a>
              <a
                :href="`https://linkedin.com/in/${linkedinUsername}`"
                target="_blank"
                class="group flex items-center gap-2 px-6 py-3 glass-premium rounded-full font-medium text-gray-700 dark:text-gray-200 hover:-translate-y-0.5 transition-all"
              >
                <BaseIcon :path="mdiLinkedin" size="20" />
                <span>LinkedIn</span>
              </a>
              <ResumeDownload />
            </div>
          </div>

          <!-- Profile Card - Right column -->
          <div class="hidden lg:block space-y-6" v-scroll-reveal="{ delay: '200ms' }">
            <div class="relative group">
              <!-- Glow effect -->
              <div class="absolute -inset-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>

              <!-- Card -->
              <div class="relative glass-premium rounded-3xl p-6 gradient-border">
                <div class="flex flex-col items-center">
                  <img
                    :src="githubProfile.avatar || `https://github.com/${githubUsername}.png`"
                    :alt="githubProfile.name || 'Punit Mishra'"
                    class="w-32 h-32 rounded-2xl shadow-xl mb-4 float"
                    loading="eager"
                  />
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white font-heading">{{ githubProfile.name }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">{{ githubProfile.company }}</p>

                  <!-- Mini stats -->
                  <div class="grid grid-cols-3 gap-4 w-full pt-4 border-t border-gray-200/50 dark:border-slate-700/50">
                    <div class="text-center">
                      <div class="text-xl font-bold text-gray-900 dark:text-white">{{ githubProfile.publicRepos }}</div>
                      <div class="text-xs text-gray-500">Repos</div>
                    </div>
                    <div class="text-center">
                      <div class="text-xl font-bold text-gray-900 dark:text-white">{{ totalYearsExperience }}+</div>
                      <div class="text-xs text-gray-500">Years</div>
                    </div>
                    <div class="text-center">
                      <div class="text-xl font-bold text-gray-900 dark:text-white">{{ githubProfile.followers }}</div>
                      <div class="text-xs text-gray-500">Followers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Currently Building -->
            <CurrentlyBuilding :username="githubUsername" />
          </div>
        </div>

        <!-- Stats Grid below hero -->
        <div class="mt-10" v-scroll-reveal="{ delay: '400ms' }">
          <StatsGrid
            :repos="githubProfile.publicRepos"
            :stars="githubStats.totalStars"
            :followers="githubProfile.followers"
            :years="totalYearsExperience"
          />
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-50 hover:opacity-100 transition-opacity">
        <div class="w-6 h-10 border-2 border-gray-400 dark:border-gray-500 rounded-full flex justify-center pt-2">
          <div class="w-1 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </section>

    <!-- Quick Stats Section -->
    <section class="py-10 relative overflow-hidden">
      <div class="max-w-5xl mx-auto px-6">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">12+</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Years Experience</div>
          </div>
          <div class="text-center p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">SAP</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Senior Engineer</div>
          </div>
          <div class="text-center p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">UC Berkeley</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Computer Science</div>
          </div>
          <div class="text-center p-4 bg-white dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700/50">
            <div class="text-2xl font-bold text-gray-900 dark:text-white">AI/ML</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Infrastructure</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog Section - Highlighted -->
    <BlogSection />

    <!-- Latest Projects -->
    <section id="latest" class="py-14 bg-gray-50/50 dark:bg-slate-900/50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-10" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-full mb-3">Recent Work</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-2">
            Latest Projects
          </h2>
          <p class="text-base text-gray-500 dark:text-gray-400">Most recently updated repositories and contributions</p>
        </div>

        <!-- Project Filter -->
        <ProjectFilter
          v-if="!loading.repos && githubRepos.length > 0"
          :projects="githubRepos"
          @filtered="handleFiltered"
        />

        <div v-if="loading.repos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl p-6 skeleton">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>

        <div v-else-if="latestRepos.length > 0 || filteredRepos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(repo, index) in (filteredRepos.length > 0 ? filteredRepos : latestRepos)"
            :key="repo.id"
            @click="goToProject(repo.name)"
            class="group bg-white dark:bg-slate-800/80 rounded-2xl p-6 shadow-elegant hover:shadow-elegant-lg hover-lift border border-gray-100 dark:border-slate-700/50 cursor-pointer card-glow"
            v-scroll-reveal="{ delay: `${index * 50}ms` }"
          >
            <div class="flex items-start justify-between mb-3">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-heading leading-tight">
                {{ repo.name }}
              </h3>
              <BaseIcon :path="mdiGithub" size="20" class="text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors flex-shrink-0" />
            </div>
            <p class="text-gray-500 dark:text-gray-400 mb-4 text-sm leading-relaxed line-clamp-2">
              {{ repo.description }}
            </p>
            <div v-if="repo.topics && repo.topics.length > 0" class="flex flex-wrap gap-1.5 mb-4">
              <span
                v-for="topic in repo.topics.slice(0, 3)"
                :key="topic"
                class="px-2 py-0.5 bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 rounded text-xs font-medium"
              >
                {{ topic }}
              </span>
            </div>
            <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-slate-700/50">
              <div class="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                <div class="flex items-center gap-1">
                  <BaseIcon :path="mdiStar" size="14" />
                  <span>{{ repo.stars }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <BaseIcon :path="mdiSourceFork" size="14" />
                  <span>{{ repo.forks }}</span>
                </div>
                <div v-if="repo.language" class="flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full" :class="getLanguageColor(repo.language)"></span>
                  <span>{{ repo.language }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Error state when repos failed to load -->
        <div v-else-if="reposError" class="text-center py-12">
          <div class="glass-premium rounded-2xl p-8 max-w-md mx-auto">
            <BaseIcon :path="mdiGithub" size="48" class="text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Couldn't load repositories</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">GitHub API may be rate limited. Check out my profile directly.</p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                @click="fetchGitHubRepos"
                class="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
              <a
                :href="`https://github.com/${githubUsername}`"
                target="_blank"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                View on GitHub
              </a>
            </div>
          </div>
        </div>

        <!-- Empty loading state -->
        <div v-else class="text-center py-12">
          <div class="glass-premium rounded-2xl p-8 max-w-md mx-auto">
            <div class="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading repositories...</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm">Fetching latest projects from GitHub</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Projects -->
    <section id="projects" class="py-14">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-10" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-3">Showcase</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-2">
            Featured Projects
          </h2>
          <p class="text-base text-gray-500 dark:text-gray-400">Innovative solutions built with cutting-edge technology</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a
            v-for="(project, index) in featuredProjects"
            :key="index"
            :href="project.url"
            target="_blank"
            class="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800/80 p-6 shadow-elegant hover:shadow-elegant-lg hover-lift border border-gray-100 dark:border-slate-700/50 cursor-pointer"
            v-scroll-reveal="{ delay: `${index * 75}ms` }"
          >
            <!-- Gradient accent bar -->
            <div :class="`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${project.gradient}`"></div>
            <div class="relative z-10">
              <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white font-heading group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ project.name }}</h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4 leading-relaxed text-sm line-clamp-2">{{ project.description }}</p>
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span
                  v-for="tech in project.tech.slice(0, 4)"
                  :key="tech"
                  class="px-2 py-0.5 bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-gray-400 rounded text-xs font-medium"
                >
                  {{ tech }}
                </span>
              </div>
              <div class="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:gap-2 transition-all">
                <span>View on GitHub</span>
                <BaseIcon :path="mdiArrowRight" size="16" />
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>

    <!-- GitHub Repositories -->
    <section class="py-14">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-10">
          <h2 class="text-3xl md:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
            Open Source
          </h2>
          <p class="text-base text-gray-600 dark:text-gray-400 font-display">Recent contributions and repositories</p>
        </div>

        <!-- GitHub Contribution Graph -->
        <div class="mb-8">
          <GitHubContributionGraph :username="githubUsername" />
        </div>

        <div v-if="loading.repos" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>

        <div v-else-if="githubRepos.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a
            v-for="repo in githubRepos"
            :key="repo.id"
            :href="repo.url"
            target="_blank"
            class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-slate-700"
          >
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-heading">
                {{ repo.name }}
              </h3>
              <BaseIcon :path="mdiGithub" size="24" class="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4 font-display line-clamp-2">
              {{ repo.description }}
            </p>
            <div v-if="repo.topics && repo.topics.length > 0" class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="topic in repo.topics.slice(0, 4)"
                :key="topic"
                class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium font-display"
              >
                {{ topic }}
              </span>
            </div>
            <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-slate-700">
              <div class="flex items-center gap-4 text-sm">
                <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <BaseIcon :path="mdiStar" size="16" />
                  <span class="font-display">{{ repo.stars }}</span>
                </div>
                <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <BaseIcon :path="mdiSourceFork" size="16" />
                  <span class="font-display">{{ repo.forks }}</span>
                </div>
                <div v-if="repo.language" class="flex items-center gap-1">
                  <span class="w-3 h-3 rounded-full" :class="getLanguageColor(repo.language)"></span>
                  <span class="text-gray-600 dark:text-gray-400 font-display">{{ repo.language }}</span>
                </div>
              </div>
              <span class="text-xs text-gray-500 font-mono">{{ repo.updated }}</span>
            </div>
          </a>
        </div>
        
        <!-- No repos message -->
        <div v-else class="text-center py-12">
          <div class="glass-premium rounded-2xl p-8 max-w-md mx-auto">
            <BaseIcon :path="mdiGithub" size="48" class="text-gray-400 mx-auto mb-4" />
            <p class="text-gray-600 dark:text-gray-400 text-lg font-display mb-4">
              Unable to load repositories at the moment.
            </p>
            <div class="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                @click="fetchGitHubRepos"
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-display"
              >
                Retry
              </button>
              <a
                :href="`https://github.com/${githubUsername}`"
                target="_blank"
                class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-display hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                View Profile
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section id="skills" class="py-12">
      <div class="max-w-5xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white font-heading mb-6">Skills</h2>
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Languages</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="lang in ['Python', 'TypeScript', 'JavaScript', 'Rust', 'Java', 'Go', 'SQL', 'CircuitPython']" :key="lang" class="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">{{ lang }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Frontend</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tech in ['Vue.js', 'React', 'Next.js', 'Tailwind CSS']" :key="tech" class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">{{ tech }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Backend & Infrastructure</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tech in ['Node.js', 'FastAPI', 'PostgreSQL', 'Redis', 'Kubernetes', 'Docker', 'AWS', 'Terraform']" :key="tech" class="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium">{{ tech }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">AI/ML</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tech in ['LangGraph', 'LangChain', 'FAISS', 'Vector Search', 'RAG', 'PyTorch']" :key="tech" class="px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium">{{ tech }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Hardware & IoT</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tech in ['Raspberry Pi', 'Circuit Playground', 'GPIO', 'PWM', 'Prometheus', 'Grafana', 'WebSockets']" :key="tech" class="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-lg text-sm font-medium">{{ tech }}</span>
            </div>
          </div>
          <div>
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Web3 & Blockchain</h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="tech in ['Solidity', 'Hardhat', 'Foundry', 'Wagmi', 'Ethers.js', 'ERC-20', 'DeFi', 'The Graph']" :key="tech" class="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">{{ tech }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience -->
    <section id="experience" class="py-12 bg-gray-50/50 dark:bg-slate-900/50">
      <div class="max-w-5xl mx-auto px-6">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white font-heading mb-6">Experience</h2>

        <!-- All Experience Entries -->
        <div class="space-y-4 mb-6">
          <div v-for="exp in experience" :key="exp.company" class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700/50">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ exp.title }}</h3>
                <p class="text-blue-600 dark:text-blue-400 font-medium">{{ exp.company }}</p>
              </div>
              <div class="text-right">
                <span class="text-sm text-gray-500 dark:text-gray-400">{{ exp.period }}</span>
                <p class="text-xs text-gray-400 dark:text-gray-500">{{ exp.location }}</p>
              </div>
            </div>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li v-for="achievement in exp.achievements" :key="achievement" class="flex items-start gap-2">
                <span class="text-emerald-500 mt-1 flex-shrink-0">•</span>
                <span>{{ achievement }}</span>
              </li>
            </ul>
            <div class="flex flex-wrap gap-1.5 mt-4">
              <span v-for="tech in exp.tech.slice(0, 8)" :key="tech" class="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded text-xs">{{ tech }}</span>
            </div>
          </div>
        </div>

        <!-- Education -->
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Education</h3>
        <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700/50 mb-6">
          <div v-for="edu in education" :key="edu.school">
            <h4 class="font-bold text-gray-900 dark:text-white">{{ edu.school }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ edu.degree }} • {{ edu.period }}</p>
            <p v-if="edu.awards && edu.awards[0]" class="text-xs text-amber-600 dark:text-amber-400 mt-2">{{ edu.awards[0] }}</p>
          </div>
        </div>

        <!-- Certifications - Inline -->
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Certifications:</span>
          <span v-for="cert in certifications" :key="cert.name" class="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
            {{ cert.name }}
          </span>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <TestimonialsSection />

    <!-- Contact -->
    <section id="contact" class="py-14 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-800/50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-8" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-full mb-3">Get in Touch</span>
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-2">
            Let's Connect
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400 mb-2 max-w-2xl mx-auto">
            Ready to collaborate on your next project? Let's build something amazing together.
          </p>
          <p class="text-gray-400 dark:text-gray-500 text-sm">
            Open to opportunities in AI/ML infrastructure, software development, and systems engineering.
          </p>
        </div>

        <!-- Social Links -->
        <div class="flex flex-wrap justify-center gap-3 mb-12" v-scroll-reveal="{ delay: '100ms' }">
          <a
            v-for="link in socialLinks"
            :key="link.label"
            :href="link.url"
            target="_blank"
            class="group flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 rounded-full shadow-md hover:shadow-lg transition-all text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-0.5"
          >
            <BaseIcon :path="link.icon" size="18" class="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span class="font-medium text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ link.label }}</span>
          </a>
        </div>

        <div v-scroll-reveal="{ delay: '150ms' }" class="max-w-3xl mx-auto">
          <div class="glass-premium rounded-3xl p-8 border border-gray-200/50 dark:border-slate-700/50">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-gray-50 dark:bg-slate-900 border-t border-gray-200/50 dark:border-slate-800/50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <!-- Brand -->
          <div class="flex items-center gap-3">
            <div class="text-2xl font-black bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent font-heading">PM</div>
            <div class="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
            <p class="text-gray-500 dark:text-gray-400 text-sm">
              &copy; {{ new Date().getFullYear() }} Punit Mishra. All rights reserved.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm">
            <button @click="scrollToSection('projects')" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Projects</button>
            <button @click="scrollToSection('experience')" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Experience</button>
            <button @click="scrollToSection('blog')" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</button>
            <router-link to="/photos" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Photos</router-link>
            <router-link to="/resume" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Resume</router-link>
            <button @click="scrollToSection('contact')" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</button>
          </div>

          <!-- Made with & Views -->
          <div class="flex items-center gap-4">
            <VisitorCounter />
            <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
              <span>Built with</span>
              <span class="text-emerald-500">Vue.js</span>
              <span>&</span>
              <span class="text-cyan-500">Tailwind</span>
            </div>
          </div>
        </div>

        <!-- Bottom section -->
        <div class="mt-8 pt-6 border-t border-gray-200/50 dark:border-slate-800/50">
          <div class="flex flex-col md:flex-row items-center justify-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <a href="https://github.com/punitmishra/punitmishra.github.io/blob/main/LICENSE" target="_blank" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              MIT License (Code)
            </a>
            <span class="hidden md:inline">•</span>
            <span>Content &copy; {{ new Date().getFullYear() }} Punit Mishra</span>
            <span class="hidden md:inline">•</span>
            <a href="#contact" @click.prevent="scrollToSection('contact')" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              Licensing Inquiries
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
