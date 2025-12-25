<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  mdiGithub,
  mdiLinkedin,
  mdiTwitter,
  mdiWeb,
  mdiCodeBraces,
  mdiStar,
  mdiSourceFork,
  mdiMapMarker,
  mdiEmail,
  mdiArrowRight,
  mdiCheckCircle,
  mdiRocket,
  mdiLightningBolt,
  mdiBriefcase,
  mdiSchool,
  mdiCalendar,
  mdiChip,
  mdiShield,
  mdiChartLine,
  mdiAccountGroup,
  mdiServer,
  mdiDatabase,
  mdiCloud,
  mdiRobot,
  mdiClockOutline,
  mdiTrendingUp,
  mdiBrain,
  mdiWeatherNight,
  mdiWeatherSunny,
  mdiMagnify,
} from "@mdi/js";
import BaseIcon from "@/components/BaseIcon.vue";
import AIBotGenerator from "@/components/AIBotGenerator.vue";
import AnimatedCounter from "@/components/AnimatedCounter.vue";
import CodeSnippet from "@/components/CodeSnippet.vue";
import TimelineItem from "@/components/TimelineItem.vue";
import ContactForm from "@/components/ContactForm.vue";
import ProjectFilter from "@/components/ProjectFilter.vue";
import ResumeDownload from "@/components/ResumeDownload.vue";
import GitHubContributionGraph from "@/components/GitHubContributionGraph.vue";
import TypingAnimation from "@/components/TypingAnimation.vue";
import ParticleBackground from "@/components/ParticleBackground.vue";
import GradientMesh from "@/components/GradientMesh.vue";
import CommandPalette from "@/components/CommandPalette.vue";
import BentoCard from "@/components/BentoCard.vue";
import NowSection from "@/components/NowSection.vue";
import StatsGrid from "@/components/StatsGrid.vue";
import SkillRing from "@/components/SkillRing.vue";
import DarkModeToggle from "@/components/DarkModeToggle.vue";
import BlogSection from "@/components/BlogSection.vue";
import { useStyleStore } from "@/stores/style.js";

const commandPaletteRef = ref(null);

// Skill categories for ring visualization
const skillCategories = [
  { name: 'Frontend', level: 95, color: '#3b82f6' },
  { name: 'Backend', level: 90, color: '#10b981' },
  { name: 'AI/ML', level: 85, color: '#8b5cf6' },
  { name: 'DevOps', level: 80, color: '#f59e0b' },
  { name: 'Systems', level: 85, color: '#ec4899' },
];

const router = useRouter();
const styleStore = useStyleStore();
const githubUsername = "punitmishra";
const linkedinUsername = "mishrapunit";

const githubProfile = ref({
  name: "Punit Mishra",
  bio: "Senior Software Engineer @ SAP",
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
  { icon: mdiWeb, label: "Website", url: "https://punitmishra.com", color: "hover:text-cyan-600" },
];

const featuredProjects = [
  {
    name: "Shield AI",
    description: "AI-powered DNS filtering system with real-time threat detection. Built with Rust for high-performance network security monitoring and malicious domain blocking.",
    tech: ["Rust", "AI/ML", "DNS", "Security", "Networking"],
    gradient: "from-rose-500 to-orange-500",
    url: `https://github.com/${githubUsername}/shield-ai`,
    featured: true,
    highlights: [
      "Real-time threat detection",
      "High-performance Rust implementation",
      "DNS-level security filtering",
      "AI-powered analysis",
    ],
  },
  {
    name: "Railroad Arcade",
    description: "Interactive railroad simulation and arcade game built with TypeScript. Features real-time train control, track switching, and dynamic routing systems.",
    tech: ["TypeScript", "Game Development", "Simulation", "Real-time Systems"],
    gradient: "from-emerald-500 to-teal-500",
    url: `https://github.com/${githubUsername}/railroad-arcade`,
    featured: true,
    highlights: [
      "Real-time simulation",
      "Dynamic routing algorithms",
      "Interactive controls",
      "Systems engineering",
    ],
  },
  {
    name: "SAP Commerce Extension",
    description: "Enterprise commerce extension for SAP CX Intelligence & Incubation. Enables tenant credential configuration and UI component integration for visual search capabilities.",
    tech: ["Java", "SAP Commerce", "Enterprise", "REST APIs"],
    gradient: "from-blue-500 to-indigo-500",
    url: `https://github.com/${githubUsername}/cxii-commerce-extn`,
    featured: true,
    highlights: [
      "Enterprise-grade integration",
      "Multi-tenant architecture",
      "Visual search capabilities",
      "SAP ecosystem",
    ],
  },
  {
    name: "SAP Technical Exercises",
    description: "Data engineering and product similarity search implementations using FAISS, HNSW, and multimodal approaches with CLIP embeddings for large-scale datasets.",
    tech: ["Python", "FAISS", "Docker", "Data Engineering", "ML"],
    gradient: "from-violet-500 to-purple-500",
    url: `https://github.com/${githubUsername}/sap-cxii-tech-ex-01`,
    featured: true,
    highlights: [
      "Vector similarity search",
      "CLIP embeddings",
      "Scalable architecture",
      "Data pipelines",
    ],
  },
  {
    name: "Cloud Foundry Deployment",
    description: "Canonical open source deployment manifest for Cloud Foundry. Contributions to enterprise-grade cloud platform infrastructure and deployment automation.",
    tech: ["Go", "Cloud Foundry", "BOSH", "Infrastructure"],
    gradient: "from-cyan-500 to-blue-500",
    url: `https://github.com/${githubUsername}/cf-deployment`,
    featured: true,
    highlights: [
      "Cloud infrastructure",
      "Deployment automation",
      "Enterprise platform",
      "Open source contribution",
    ],
  },
  {
    name: "Kubernetes Deployment",
    description: "Production-ready Kubernetes cluster deployment using Kubespray. Automated cluster provisioning with Ansible for scalable container orchestration.",
    tech: ["Kubernetes", "Ansible", "DevOps", "Container Orchestration"],
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

const skills = [
  { name: "JavaScript/TypeScript", level: 95, category: "Languages", icon: mdiCodeBraces },
  { name: "Vue.js / React", level: 90, category: "Frameworks", icon: mdiCodeBraces },
  { name: "Python", level: 85, category: "Languages", icon: mdiCodeBraces },
  { name: "Rust", level: 80, category: "Languages", icon: mdiCodeBraces },
  { name: "Node.js", level: 90, category: "Backend", icon: mdiServer },
  { name: "AWS / Cloud", level: 85, category: "Infrastructure", icon: mdiCloud },
  { name: "PostgreSQL", level: 85, category: "Database", icon: mdiDatabase },
  { name: "Docker / Kubernetes", level: 80, category: "DevOps", icon: mdiCloud },
  { name: "Redis", level: 85, category: "Database", icon: mdiDatabase },
  { name: "Git / CI/CD", level: 90, category: "Tools", icon: mdiCodeBraces },
  { name: "LangGraph / LangChain", level: 85, category: "AI/ML", icon: mdiLightningBolt },
  { name: "Security & Compliance", level: 90, category: "Security", icon: mdiShield },
  { name: "GPU / System Design", level: 75, category: "Hardware", icon: mdiChip },
  { name: "Microelectronics", level: 70, category: "Hardware", icon: mdiChip },
];

const experience = [
  {
    title: "Senior Software Engineer",
    company: "SAP",
    period: "2013 - Present",
    location: "Pleasanton, CA",
    duration: "11+ years",
    achievements: [
      "Building enterprise-grade AI/ML infrastructure and intelligent applications",
      "Architecting scalable microservices serving global enterprise customers",
      "Leading development of commerce extensions and visual search capabilities",
      "Implementing cloud-native solutions with Kubernetes and Cloud Foundry",
      "Driving security compliance and enterprise-grade standards",
      "Mentoring engineers and establishing engineering best practices",
    ],
    tech: ["Java", "TypeScript", "Python", "Rust", "Kubernetes", "Cloud Foundry", "Docker", "PostgreSQL", "Redis"],
    highlights: [
      "Enterprise AI/ML",
      "Cloud Infrastructure",
      "Team Leadership",
      "Security & Compliance",
    ],
  },
];

const education = [
  {
    degree: "Computer Science",
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
  {
    degree: "Engineering",
    school: "Ohlone College",
    period: "2008 - 2010",
    description: "Foundation in engineering with leadership in robotics and engineering clubs.",
    specializations: [
      "Engineering Fundamentals",
      "VEX Robotics Competition",
      "Engineering Club Vice President",
    ],
    awards: ["Outstanding Engineering Student Award"],
  },
];

const certifications = [
  { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", year: "2020" },
  { name: "Kubernetes Administrator", issuer: "CNCF", year: "2021" },
];

const keyAchievements = [
  {
    title: "Built v1 Core Application",
    description: "Architected and built the first version of core SAP toolkit application from scratch, establishing engineering best practices and SDLC lifecycles",
    icon: mdiRocket,
    gradient: "from-blue-500 to-cyan-500",
    metric: "v1.0",
  },
  {
    title: "Performance Optimization",
    description: "Improved system performance by 40% through optimization and caching strategies, significantly enhancing user experience",
    icon: mdiLightningBolt,
    gradient: "from-cyan-500 to-indigo-500",
    metric: "40%",
  },
  {
    title: "Cost Reduction",
    description: "Reduced infrastructure costs by 30% through efficient resource utilization and optimization techniques",
    icon: mdiChartLine,
    gradient: "from-indigo-500 to-purple-500",
    metric: "30%",
  },
  {
    title: "AI/ML Infrastructure",
    description: "Architected and implemented secure AI infrastructure with LLM-powered applications, built ML containers before LLMs existed",
    icon: mdiRobot,
    gradient: "from-purple-500 to-pink-500",
    metric: "2+ years",
  },
  {
    title: "Team Leadership",
    description: "Mentored new interns and team members for 2+ years, building technical leadership capabilities and knowledge sharing",
    icon: mdiAccountGroup,
    gradient: "from-pink-500 to-red-500",
    metric: "2+ years",
  },
  {
    title: "Security & Compliance",
    description: "Drove security compliance initiatives, ensuring enterprise-grade security standards across all systems",
    icon: mdiShield,
    gradient: "from-red-500 to-orange-500",
    metric: "100%",
  },
];

const technicalExpertise = [
  {
    category: "Software Development",
    items: [
      "Built v1 of core SAP toolkit application from scratch",
      "React, Next.js, Vue.js frontend development",
      "Node.js, Python, Rust backend development",
      "Product development experience",
    ],
  },
  {
    category: "AI/ML Infrastructure",
    items: [
      "LLM-powered applications (2+ years experience)",
      "LangGraph and LangChain expertise",
      "ML containers and systems (pre-LLM era)",
      "Vector search and embeddings",
      "Multi-agent orchestration",
    ],
  },
  {
    category: "Systems Engineering",
    items: [
      "GPU and system design background",
      "Microfabrication and microelectronics",
      "Hardware integration (Raspberry Pi projects)",
      "Systems architecture from silicon to software",
      "Performance optimization and benchmarking",
    ],
  },
  {
    category: "Engineering Leadership",
    items: [
      "Established engineering best practices",
      "SDLC lifecycle implementation",
      "PR review systems and processes",
      "Mentored interns and team members (2+ years)",
      "Technical architecture decisions",
    ],
  },
  {
    category: "Security & Compliance",
    items: [
      "Enterprise-grade security standards",
      "AI security and compliance",
      "Multi-tenant isolation",
      "Encrypted memory persistence",
      "Audit trails and monitoring",
    ],
  },
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
    <section id="hero" class="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
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
                :texts="['Senior Software Engineer @ SAP', 'AI/ML Infrastructure Architect', 'UC Berkeley Alumni', 'Full Stack Developer']"
                :typing-speed="60"
                :deleting-speed="30"
                :pause-duration="3000"
              />
            </div>

            <!-- Description -->
            <p class="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-xl leading-relaxed">
              Building enterprise-grade AI systems and scalable infrastructure.
              {{ totalYearsExperience }}+ years of shipping products that matter.
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
          <div class="hidden lg:block" v-scroll-reveal="{ delay: '200ms' }">
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
          </div>
        </div>

        <!-- Stats Grid below hero -->
        <div class="mt-16" v-scroll-reveal="{ delay: '400ms' }">
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

    <!-- About / Now Section - Bento Grid -->
    <section class="py-24 relative overflow-hidden">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Now Card - Large -->
          <BentoCard span="col" variant="glass" v-scroll-reveal>
            <NowSection />
          </BentoCard>

          <!-- Skills Rings Card -->
          <BentoCard variant="default" v-scroll-reveal="{ delay: '100ms' }">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-6 font-heading">Core Expertise</h3>
            <div class="flex flex-wrap justify-center gap-4">
              <SkillRing
                v-for="skill in skillCategories.slice(0, 3)"
                :key="skill.name"
                :name="skill.name"
                :level="skill.level"
                :color="skill.color"
                :size="80"
                :stroke-width="6"
              />
            </div>
          </BentoCard>

          <!-- Education Highlight -->
          <BentoCard variant="gradient" v-scroll-reveal="{ delay: '200ms' }">
            <div class="text-white">
              <div class="text-sm font-medium opacity-80 mb-2">Education</div>
              <h3 class="text-2xl font-bold mb-2 font-heading">UC Berkeley</h3>
              <p class="text-sm opacity-90 mb-4">Computer Science • AI, Architecture, Networks</p>
              <div class="text-xs opacity-70">International Student Scholarship Recipient</div>
            </div>
          </BentoCard>

          <!-- AI Bot - Wide -->
          <BentoCard span="2" variant="glass" v-scroll-reveal="{ delay: '300ms' }">
            <div class="flex items-center gap-2 mb-4">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">AI Insights</span>
            </div>
            <AIBotGenerator />
          </BentoCard>
        </div>
      </div>
    </section>

    <!-- Latest Projects -->
    <section id="latest" class="py-24 bg-gray-50/50 dark:bg-slate-900/50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 rounded-full mb-4">Recent Work</span>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
            Latest Projects
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400">Most recently updated repositories and contributions</p>
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
    <section id="projects" class="py-24">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4">Showcase</span>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
            Featured Projects
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400">Innovative solutions built with cutting-edge technology</p>
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
    <section class="py-32">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
            Open Source
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 font-display">Recent contributions and repositories</p>
        </div>

        <!-- GitHub Contribution Graph -->
        <div class="mb-12">
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

    <!-- Technical Expertise -->
    <section class="py-24 bg-gradient-to-b from-gray-50/50 to-white dark:from-slate-900/50 dark:to-slate-800/50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-4">Deep Knowledge</span>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
            Technical Expertise
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400">Comprehensive skills across the full stack</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(expertise, index) in technicalExpertise"
            :key="index"
            class="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700/50 overflow-hidden"
            v-scroll-reveal="{ delay: `${index * 75}ms` }"
          >
            <!-- Top gradient accent -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div class="flex items-center gap-3 mb-5">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                <BaseIcon :path="mdiLightningBolt" size="20" class="text-white" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white font-heading group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {{ expertise.category }}
              </h3>
            </div>

            <ul class="space-y-3">
              <li
                v-for="(item, i) in expertise.items"
                :key="i"
                class="flex items-start gap-3 text-gray-600 dark:text-gray-400 text-sm font-display group/item"
              >
                <div class="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                  <BaseIcon :path="mdiCheckCircle" size="12" class="text-emerald-600 dark:text-emerald-400" />
                </div>
                <span class="group-hover/item:text-gray-900 dark:group-hover/item:text-gray-200 transition-colors">{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section id="skills" class="py-24">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-full mb-4">Expertise</span>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
            Skills & Technologies
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400">Technologies I work with daily</p>
        </div>

        <div class="max-w-4xl mx-auto space-y-6">
          <div
            v-for="skill in skills"
            :key="skill.name"
            class="group"
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-3">
                <BaseIcon :path="skill.icon" size="20" class="text-blue-600 dark:text-blue-400" />
                <span class="text-lg font-semibold text-gray-900 dark:text-white font-heading">{{ skill.name }}</span>
                <span class="text-xs text-gray-500 dark:text-gray-500 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded font-display">{{ skill.category }}</span>
              </div>
              <span class="text-sm font-medium text-gray-600 dark:text-gray-400 font-mono">{{ skill.level }}%</span>
            </div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                :style="{ width: `${skill.level}%` }"
                class="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-full transform transition-all duration-1000 group-hover:shadow-lg"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience -->
    <section id="experience" class="py-24 bg-gray-50/50 dark:bg-slate-900/50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-full mb-4">Career</span>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
            Professional Experience
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400">{{ totalYearsExperience }}+ years building enterprise software</p>
        </div>

        <div class="max-w-5xl mx-auto">
          <TimelineItem
            v-for="(exp, index) in experience"
            :key="index"
            :title="exp.title"
            :subtitle="exp.company"
            :period="`${exp.period} (${exp.duration})`"
            :description="exp.location"
            :achievements="exp.achievements"
            :icon="mdiBriefcase"
            :gradient="index === 0 ? 'from-blue-500 to-cyan-500' : index === 1 ? 'from-cyan-500 to-indigo-500' : 'from-indigo-500 to-purple-500'"
            :is-last="index === experience.length - 1"
          />
        </div>

        <!-- Education -->
        <div class="max-w-5xl mx-auto mt-16">
          <h3 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white font-heading">Education</h3>
          <div class="space-y-6">
            <div
              v-for="(edu, index) in education"
              :key="index"
              class="group relative bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700/50"
              v-scroll-reveal="{ delay: `${index * 100}ms` }"
            >
              <!-- Gradient accent -->
              <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-t-3xl"></div>

              <div class="flex flex-col lg:flex-row lg:items-start gap-6">
                <!-- Icon -->
                <div class="flex-shrink-0">
                  <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <BaseIcon :path="mdiSchool" size="32" class="text-white" />
                  </div>
                </div>

                <!-- Content -->
                <div class="flex-1">
                  <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div>
                      <h4 class="text-2xl font-bold text-gray-900 dark:text-white font-heading mb-1">{{ edu.degree }}</h4>
                      <p class="text-xl text-blue-600 dark:text-blue-400 font-semibold font-heading">{{ edu.school }}</p>
                    </div>
                    <div class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700/50 rounded-full text-gray-600 dark:text-gray-400 font-display shrink-0">
                      <BaseIcon :path="mdiCalendar" size="18" />
                      <span class="font-medium text-sm">{{ edu.period }}</span>
                    </div>
                  </div>

                  <p class="text-gray-600 dark:text-gray-400 mb-6 font-display leading-relaxed">{{ edu.description }}</p>

                  <div class="mb-4">
                    <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 font-heading uppercase tracking-wide">Coursework & Focus</h5>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="spec in edu.specializations"
                        :key="spec"
                        class="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium font-display border border-blue-100 dark:border-blue-800/30"
                      >
                        {{ spec }}
                      </span>
                    </div>
                  </div>

                  <!-- Awards -->
                  <div v-if="edu.awards && edu.awards.length > 0" class="pt-4 border-t border-gray-100 dark:border-slate-700">
                    <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <BaseIcon :path="mdiStar" size="18" />
                      <span class="font-medium text-sm">{{ edu.awards[0] }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Certifications -->
        <div class="max-w-5xl mx-auto mt-12">
          <h3 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white font-heading">Certifications</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              v-for="(cert, index) in certifications"
              :key="index"
              class="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-slate-700 overflow-hidden"
              v-scroll-reveal="{ delay: `${index * 100}ms` }"
            >
              <!-- Background gradient on hover -->
              <div class="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div class="relative flex items-start gap-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md shrink-0">
                  <BaseIcon :path="mdiShield" size="24" class="text-white" />
                </div>
                <div class="flex-1">
                  <h4 class="text-lg font-bold text-gray-900 dark:text-white font-heading mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ cert.name }}</h4>
                  <p class="text-gray-600 dark:text-gray-400 text-sm font-display mb-2">{{ cert.issuer }}</p>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs font-mono text-gray-500 dark:text-gray-400">{{ cert.year }}</span>
                    <span class="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                      <BaseIcon :path="mdiCheckCircle" size="14" />
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Code Snippets Showcase -->
    <section id="code" class="py-32 relative overflow-hidden fade-in">
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900/50"></div>
      <div class="relative max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <div class="flex items-center justify-center gap-3 mb-4">
            <BaseIcon :path="mdiCodeBraces" size="48" class="text-blue-600 dark:text-blue-400" />
            <h2 class="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
              Code Showcase
            </h2>
          </div>
          <p class="text-xl text-gray-600 dark:text-gray-400 font-display">Snippets from real projects and systems</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CodeSnippet
            title="Rust Memory Manager"
            language="rust"
            code="// High-performance memory orchestration
async fn persist_memory(
    agent_id: &str,
    memory: &MemoryState,
) -> Result&lt;(), MemoryError&gt; {
    let encrypted = encrypt(memory)?;
    let key = format!(&quot;agent:{}:memory&quot;, agent_id);
    
    redis_client
        .set_ex(&amp;key, encrypted, TTL)
        .await?;
    
    Ok(())
}"
          />
          <CodeSnippet
            title="Vector Search Engine"
            language="python"
            code="# CLIP-based image embeddings
def search_similar_images(
    query_image: np.ndarray,
    top_k: int = 10
) -&gt; List[SearchResult]:
    query_embedding = clip_model.encode(query_image)
    
    # Vector similarity search
    distances, indices = index.search(
        query_embedding.reshape(1, -1),
        top_k
    )
    
    return [
        SearchResult(image_id=idx, score=dist)
        for idx, dist in zip(indices[0], distances[0])
    ]"
          />
          <CodeSnippet
            title="AI Security Monitor"
            language="typescript"
            code="// Real-time bias detection
async function detectBias(
  response: AIResponse
): Promise&lt;BiasScore&gt; {
  const biasIndicators = await analyze({
    content: response.text,
    context: response.context,
    model: response.model
  });
  
  return {
    score: calculateScore(biasIndicators),
    violations: biasIndicators.filter(v =&gt; v.severity &gt; 0.7),
    timestamp: Date.now()
  };
}"
          />
          <CodeSnippet
            title="Multi-Agent Orchestration"
            language="python"
            code="# LangGraph agent coordination
from langgraph.graph import StateGraph

def create_agent_workflow():
    workflow = StateGraph(AgentState)
    
    workflow.add_node(&quot;researcher&quot;, research_agent)
    workflow.add_node(&quot;analyzer&quot;, analysis_agent)
    workflow.add_node(&quot;synthesizer&quot;, synthesis_agent)
    
    workflow.add_edge(&quot;researcher&quot;, &quot;analyzer&quot;)
    workflow.add_edge(&quot;analyzer&quot;, &quot;synthesizer&quot;)
    
    return workflow.compile()"
          />
        </div>
      </div>
    </section>

    <!-- Achievements & Awards -->
    <section id="achievements" class="py-24 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-800/50 dark:to-slate-900/50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-full mb-4">Track Record</span>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
            Key Achievements
          </h2>
          <p class="text-lg text-gray-500 dark:text-gray-400">Notable milestones and impact</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(achievement, index) in keyAchievements"
            :key="index"
            class="group relative bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700/50 overflow-hidden hover:-translate-y-1"
            v-scroll-reveal="{ delay: `${index * 75}ms` }"
          >
            <!-- Gradient overlay on hover -->
            <div :class="`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`"></div>

            <div class="relative">
              <div :class="`w-14 h-14 rounded-2xl bg-gradient-to-br ${achievement.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`">
                <BaseIcon :path="achievement.icon" size="28" class="text-white" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2 font-heading group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{{ achievement.title }}</h3>
              <p class="text-gray-600 dark:text-gray-400 text-sm font-display leading-relaxed">{{ achievement.description }}</p>
              <div v-if="achievement.metric" class="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                <div :class="`text-2xl font-black bg-gradient-to-r ${achievement.gradient} bg-clip-text text-transparent font-heading`">
                  {{ achievement.metric }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog Section - Dynamic articles from content/blog -->
    <BlogSection />

    <!-- Contact -->
    <section id="contact" class="py-24 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-900 dark:to-slate-800/50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-12" v-scroll-reveal>
          <span class="inline-block px-3 py-1 text-sm font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 rounded-full mb-4">Get in Touch</span>
          <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading tracking-tight mb-4">
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
              &copy; {{ new Date().getFullYear() }} Punit Mishra
            </p>
          </div>

          <!-- Quick Links -->
          <div class="flex items-center gap-6 text-sm">
            <button @click="scrollToSection('projects')" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Projects</button>
            <button @click="scrollToSection('experience')" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Experience</button>
            <button @click="scrollToSection('blog')" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Blog</button>
            <button @click="scrollToSection('contact')" class="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</button>
          </div>

          <!-- Made with -->
          <div class="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span>Built with</span>
            <span class="text-emerald-500">Vue.js</span>
            <span>&</span>
            <span class="text-cyan-500">Tailwind</span>
          </div>
        </div>

        <!-- Bottom tagline -->
        <div class="mt-8 pt-6 border-t border-gray-200/50 dark:border-slate-800/50 text-center">
          <p class="text-gray-400 dark:text-gray-600 text-xs">
            Senior Software Engineer @ SAP • UC Berkeley Alumni • AI/ML Infrastructure Architect
          </p>
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
