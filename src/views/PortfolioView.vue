<script setup>
import { ref, onMounted, computed } from "vue";
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
} from "@mdi/js";
import BaseIcon from "@/components/BaseIcon.vue";
import AIBotGenerator from "@/components/AIBotGenerator.vue";

const router = useRouter();
const githubUsername = "punitmishra";
const linkedinUsername = "mishrapunit";

const githubProfile = ref({
  name: "Punit Mishra",
  bio: "Software Engineer",
  avatar: `https://github.com/${githubUsername}.png`,
  followers: 0,
  following: 0,
  publicRepos: 0,
  location: null,
  company: null,
  blog: "https://punitmishra.com",
  htmlUrl: `https://github.com/${githubUsername}`,
  createdAt: null,
});

const githubRepos = ref([]);
const latestRepos = ref([]);
const githubStats = ref({ totalStars: 0, totalForks: 0, languages: {} });
const loading = ref({ profile: true, repos: true });

const socialLinks = [
  { icon: mdiGithub, label: "GitHub", url: `https://github.com/${githubUsername}`, color: "hover:text-gray-900 dark:hover:text-white" },
  { icon: mdiLinkedin, label: "LinkedIn", url: `https://linkedin.com/in/${linkedinUsername}`, color: "hover:text-blue-600" },
  { icon: mdiTwitter, label: "Twitter", url: "https://twitter.com/punitmishra", color: "hover:text-sky-400" },
  { icon: mdiWeb, label: "Website", url: "https://punitmishra.com", color: "hover:text-cyan-600" },
];

const featuredProjects = [
  {
    name: "LangGraph Rust Memory Manager",
    description: "High-performance Rust-based memory orchestration for AI agents with encrypted persistence, multi-tenant isolation, and real-time monitoring. Achieved 3-5x performance improvement over Python implementations. Features secure agent isolation, memory persistence across sessions, and comprehensive audit trails.",
    tech: ["Rust", "LangGraph", "LangChain", "Redis", "PostgreSQL", "Docker"],
    gradient: "from-blue-500 via-cyan-500 to-indigo-500",
    url: `https://github.com/${githubUsername}?tab=repositories&q=langraph`,
    featured: true,
    highlights: [
      "Multi-tenant agent orchestration",
      "Rust-based memory persistence layer",
      "3-5x performance improvement",
      "Secure agent isolation",
      "Performance benchmarking",
    ],
  },
  {
    name: "Vector Image Search Engine",
    description: "Multimodal image search engine with CLIP embeddings, vector similarity search using FAISS, custom object detection pipeline, and relevancy reranking algorithms. Handles millions of images with sub-second query times. Built for product similarity search at scale.",
    tech: ["Python", "Rust", "FAISS", "CLIP", "PostgreSQL", "Object Detection"],
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    url: `https://github.com/${githubUsername}?tab=repositories&q=vector`,
    featured: true,
    highlights: [
      "CLIP-based image embeddings",
      "Vector similarity search",
      "Custom object detection",
      "Relevancy reranking",
      "Real-time search API",
    ],
  },
  {
    name: "AI Security Compliance Dashboard",
    description: "Enterprise-grade security compliance dashboard with real-time bias detection, compliance scoring, audit trail visualization, and policy violation alerts. Built for secure AI infrastructure with multi-tenant support and encrypted memory persistence.",
    tech: ["Next.js", "React", "Rust", "PostgreSQL", "Redis", "Docker"],
    gradient: "from-indigo-500 via-blue-500 to-cyan-500",
    url: `https://github.com/${githubUsername}?tab=repositories&q=security`,
    featured: true,
    highlights: [
      "Real-time bias detection",
      "Compliance scoring system",
      "Audit trail visualization",
      "Security metrics dashboard",
      "Policy violation alerts",
    ],
  },
  {
    name: "SAP Product Similarity Search",
    description: "Technical exercise implementing product similarity search using FAISS, HNSW, and multimodal approaches. Includes text-based similarity with TF-IDF and transformer embeddings, plus image-based similarity with CLIP. Built for handling large-scale product datasets.",
    tech: ["Python", "FAISS", "CLIP", "HNSW", "NLP", "Computer Vision"],
    gradient: "from-indigo-500 via-blue-500 to-cyan-500",
    url: `https://github.com/${githubUsername}/sap-cxii-tech-ex-01`,
    featured: true,
    highlights: [
      "Multimodal similarity search",
      "FAISS and HNSW implementation",
      "CLIP image embeddings",
      "Text and image fusion",
      "Scalable architecture",
    ],
  },
  {
    name: "Core SAP Toolkit Application (v1)",
    description: "Built the v1 of core SAP toolkit application from scratch. Established engineering best practices, SDLC lifecycles, PR review systems, and design architecture. Development including React/Next.js frontend and robust backend infrastructure.",
    tech: ["React", "Next.js", "Node.js", "SAP Technologies", "Docker", "CI/CD"],
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    url: "https://punitmishra.com",
    featured: true,
    highlights: [
      "Built from scratch",
      "Engineering best practices",
      "SDLC implementation",
      "Frontend and backend development",
      "Team leadership",
    ],
  },
  {
    name: "Raspberry Pi Railway System",
    description: "Complete home railway system built with Raspberry Pi controllers. Demonstrates systems engineering skills, hardware integration, and passion for engineering from silicon to software. Personal hobby project showcasing engineering capabilities.",
    tech: ["Raspberry Pi", "Python", "Hardware Integration", "IoT", "Systems Design"],
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    url: "https://punitmishra.com",
    featured: true,
    highlights: [
      "Hardware integration",
      "IoT systems",
      "Real-time control",
      "Systems engineering",
      "Personal passion project",
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
    location: "San Francisco Bay Area, CA",
    duration: "11+ years",
    achievements: [
      "Built v1 of core SAP toolkit application from scratch, establishing engineering best practices and SDLC lifecycles",
      "Led development of scalable microservices architecture serving enterprise customers globally",
      "Architected and implemented secure AI infrastructure with LLM-powered applications (2+ years focus)",
      "Established PR review systems, design architecture, and engineering best practices across teams",
      "Mentored new interns and team members for 2+ years, building technical leadership capabilities",
      "Improved system performance by 40% through optimization and caching strategies",
      "Designed and implemented real-time data processing pipelines for AI/ML workloads",
      "Reduced infrastructure costs by 30% through efficient resource utilization and optimization",
      "Built ML containers and systems before LLMs existed, demonstrating early AI/ML expertise",
      "Drove security compliance initiatives, ensuring enterprise-grade security standards",
    ],
    tech: ["Vue.js", "React", "Next.js", "Node.js", "Python", "Rust", "AWS", "Docker", "Kubernetes", "PostgreSQL", "Redis", "LangGraph", "LangChain"],
    highlights: [
      "Product development",
      "Engineering team leadership",
      "AI/ML infrastructure",
      "Security & compliance",
      "Systems architecture",
    ],
  },
  {
    title: "Software Engineer",
    company: "IBM",
    period: "2011 - 2013",
    location: "United States",
    duration: "1.5 years",
    achievements: [
      "Developed enterprise software solutions for large-scale clients",
      "Contributed to system design and architecture decisions",
      "Collaborated with cross-functional teams on complex projects",
      "Gained foundational experience in enterprise software development",
    ],
    tech: ["Java", "JavaScript", "SQL", "Enterprise Systems"],
    highlights: [
      "Enterprise software",
      "System design",
      "Team collaboration",
    ],
  },
];

const education = [
  {
    degree: "Bachelor's in Computer Engineering",
    school: "University",
    period: "2007 - 2011",
    description: "Focus on computer engineering with specialization in GPU and system design, microfabrication, and microelectronics. Final year focused on GPU architecture and system design.",
    specializations: [
      "GPU and System Design (1 year specialization)",
      "Microfabrication and Microelectronics",
      "Hardware Engineering",
      "Systems Architecture",
    ],
  },
];

const certifications = [
  { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", year: "2020" },
  { name: "Kubernetes Administrator", issuer: "CNCF", year: "2021" },
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
    const response = await axios.get(
      `https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=15&type=all`
    );
    const allRepos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || "No description",
      language: repo.language || "Other",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      updated: new Date(repo.updated_at).toLocaleDateString(),
      topics: repo.topics || [],
      createdAt: repo.created_at,
      pushedAt: repo.pushed_at,
    }));

    githubRepos.value = allRepos.slice(0, 10);
    latestRepos.value = allRepos.slice(0, 6);

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
    loading.value.repos = false;
  }
};


const totalYearsExperience = computed(() => {
  return 12.5;
});

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
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 font-display">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-slate-700/50">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button 
          @click="scrollToSection('hero')"
          class="text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight cursor-pointer hover:opacity-80 transition-opacity"
        >
          PM
        </button>
        
        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center gap-6">
          <button 
            @click="scrollToSection('projects')" 
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display relative group"
          >
            Projects
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button 
            @click="scrollToSection('latest')" 
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display relative group"
          >
            Latest
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button 
            @click="scrollToSection('skills')" 
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display relative group"
          >
            Skills
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button 
            @click="scrollToSection('experience')" 
            class="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium font-display relative group"
          >
            Experience
            <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 group-hover:w-full transition-all duration-300"></span>
          </button>
          <button 
            @click="scrollToSection('contact')" 
            class="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 text-white rounded-full font-semibold hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all font-display"
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
      <!-- Animated Background Gradients -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.2),transparent_60%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(6,182,212,0.15),transparent_60%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.15),transparent_60%)]"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <!-- Hero Image - Prominent & Styled -->
        <div class="mb-12 relative inline-block group">
          <!-- Glowing Background Effect -->
          <div class="absolute -inset-4 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 animate-pulse-slow"></div>
          <!-- Outer Ring -->
          <div class="absolute -inset-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
          <!-- Image Container -->
          <div class="relative">
            <img
              :src="githubProfile.avatar || `https://github.com/${githubUsername}.png`"
              :alt="githubProfile.name || 'Punit Mishra'"
              class="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-8 border-white dark:border-slate-900 shadow-2xl transform group-hover:scale-105 transition-transform duration-500 object-cover"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
            <!-- Inner Glow -->
            <div class="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 via-cyan-400/20 to-indigo-400/20 pointer-events-none"></div>
          </div>
        </div>
        
        <!-- Name -->
        <h1 class="text-6xl md:text-8xl lg:text-9xl font-black mb-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent leading-tight font-heading tracking-tighter">
          {{ githubProfile.name || "Punit Mishra" }}
        </h1>
        
        <!-- Bio -->
        <p class="text-2xl md:text-3xl lg:text-4xl text-gray-700 dark:text-gray-300 mb-6 font-semibold font-display">
          {{ githubProfile.bio || "Software Engineer" }}
        </p>
        
        <!-- Description -->
        <p class="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto font-display leading-relaxed">
          Computer Engineer with {{ totalYearsExperience }}+ years building scalable applications from silicon to software
        </p>

        <!-- Social Links -->
        <div class="flex flex-wrap justify-center gap-4 mb-12">
          <a
            v-for="link in socialLinks"
            :key="link.label"
            :href="link.url"
            target="_blank"
            :class="`group flex items-center gap-2 px-6 py-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all ${link.color} text-gray-700 dark:text-gray-300 font-display`"
          >
            <BaseIcon :path="link.icon" size="20" />
            <span class="font-semibold">{{ link.label }}</span>
          </a>
        </div>

        <!-- Stats -->
        <div class="flex flex-wrap justify-center gap-6 text-center">
          <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl px-8 py-5 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
            <div class="text-4xl font-black text-blue-600 dark:text-blue-400 font-heading">{{ githubProfile.publicRepos || 0 }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1 font-display">Repositories</div>
          </div>
          <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl px-8 py-5 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
            <div class="text-4xl font-black text-cyan-600 dark:text-cyan-400 font-heading">{{ githubStats.totalStars }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1 font-display">Stars</div>
          </div>
          <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl px-8 py-5 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
            <div class="text-4xl font-black text-cyan-600 dark:text-cyan-400 font-heading">{{ githubProfile.followers || 0 }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1 font-display">Followers</div>
          </div>
          <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-2xl px-8 py-5 shadow-xl border border-gray-200/50 dark:border-slate-700/50">
            <div class="text-4xl font-black text-indigo-600 dark:text-indigo-400 font-heading">{{ totalYearsExperience }}+</div>
            <div class="text-sm text-gray-600 dark:text-gray-400 mt-1 font-display">Years</div>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>

    <!-- What's in Punit's Mind -->
    <section class="py-32 relative overflow-hidden fade-in">
      <!-- Background Effects -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-cyan-50/50 to-indigo-50/50 dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900/50"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(147,51,234,0.1),transparent_50%)]"></div>
      
      <div class="relative max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 via-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
              <BaseIcon :path="mdiBrain" size="28" class="text-white" />
            </div>
            <h2 class="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
              What's in Punit's Mind
            </h2>
          </div>
          <p class="text-xl text-gray-600 dark:text-gray-400 font-display max-w-2xl mx-auto">
            Peek into current thoughts, active projects, and engineering insights. Get a glimpse of what's happening behind the code.
          </p>
        </div>
        <AIBotGenerator />
      </div>
    </section>

    <!-- Latest Projects -->
    <section id="latest" class="py-32 fade-in">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <div class="flex items-center justify-center gap-3 mb-4">
            <BaseIcon :path="mdiTrendingUp" size="48" class="text-blue-600 dark:text-blue-400" />
            <h2 class="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
              Latest Projects
            </h2>
          </div>
          <p class="text-xl text-gray-600 dark:text-gray-400 font-display">Most recently updated repositories and contributions</p>
        </div>

        <div v-if="loading.repos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="repo in latestRepos"
            :key="repo.id"
            @click="goToProject(repo.name)"
            class="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-300 border border-gray-200 dark:border-slate-700 cursor-pointer"
          >
            <div class="flex items-start justify-between mb-4">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-heading">
                {{ repo.name }}
              </h3>
              <BaseIcon :path="mdiGithub" size="24" class="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <p class="text-gray-600 dark:text-gray-400 mb-4 text-sm font-display line-clamp-3">
              {{ repo.description }}
            </p>
            <div v-if="repo.topics && repo.topics.length > 0" class="flex flex-wrap gap-2 mb-4">
              <span
                v-for="topic in repo.topics.slice(0, 3)"
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
            <div class="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 font-semibold">
              <span>View Details</span>
              <BaseIcon :path="mdiArrowRight" size="18" class="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Projects -->
    <section id="projects" class="py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm fade-in">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
            Featured Projects
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 font-display">Innovative solutions built with cutting-edge technology</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <a
            v-for="(project, index) in featuredProjects"
            :key="index"
            :href="project.url"
            target="_blank"
            :class="`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${project.gradient} p-8 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 cursor-pointer`"
          >
            <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
            <div class="relative z-10">
              <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                <BaseIcon :path="mdiRocket" size="32" />
              </div>
              <h3 class="text-2xl font-bold mb-3 font-heading">{{ project.name }}</h3>
              <p class="text-white/90 mb-6 leading-relaxed text-sm font-display">{{ project.description }}</p>
              <div class="space-y-2 mb-6">
                <div class="text-xs font-semibold text-white/80 mb-2 font-display">Key Features:</div>
                <ul class="space-y-1">
                  <li v-for="(highlight, i) in project.highlights" :key="i" class="flex items-start gap-2 text-sm text-white/90">
                    <BaseIcon :path="mdiCheckCircle" size="16" class="mt-0.5 flex-shrink-0" />
                    <span class="font-display">{{ highlight }}</span>
                  </li>
                </ul>
              </div>
              <div class="flex flex-wrap gap-2 mb-6">
                <span
                  v-for="tech in project.tech"
                  :key="tech"
                  class="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold font-display"
                >
                  {{ tech }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm font-semibold opacity-90 group-hover:opacity-100">
                <span class="font-display">View Project</span>
                <BaseIcon :path="mdiArrowRight" size="18" class="transform group-hover:translate-x-1 transition-transform" />
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

        <div v-if="loading.repos" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="i in 4" :key="i" class="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
            <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </section>

    <!-- Technical Expertise -->
    <section class="py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
            Technical Expertise
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 font-display">Comprehensive skills across software development</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div
            v-for="(expertise, index) in technicalExpertise"
            :key="index"
            class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
          >
            <h3 class="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2 font-heading">
              <BaseIcon :path="mdiLightningBolt" size="24" class="text-blue-600 dark:text-blue-400" />
              {{ expertise.category }}
            </h3>
            <ul class="space-y-2">
              <li
                v-for="(item, i) in expertise.items"
                :key="i"
                class="flex items-start gap-2 text-gray-700 dark:text-gray-300 text-sm font-display"
              >
                <BaseIcon :path="mdiCheckCircle" size="16" class="text-green-500 mt-0.5 flex-shrink-0" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <section id="skills" class="py-32 fade-in">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
            Skills & Technologies
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 font-display">Technologies I work with</p>
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
    <section id="experience" class="py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm fade-in">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-20">
          <h2 class="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
            Professional Experience
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-400 font-display">{{ totalYearsExperience }}+ years building enterprise software</p>
        </div>

        <div class="max-w-5xl mx-auto space-y-12">
          <div
            v-for="(exp, index) in experience"
            :key="index"
            class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border-l-4 border-blue-600"
          >
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div>
                <h3 class="text-3xl font-bold mb-2 text-gray-900 dark:text-white font-heading">{{ exp.title }}</h3>
                <p class="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-2 font-heading">{{ exp.company }}</p>
                <div class="flex items-center gap-4 text-gray-500 dark:text-gray-400 font-display">
                  <div class="flex items-center gap-2">
                    <BaseIcon :path="mdiMapMarker" size="18" />
                    <span>{{ exp.location }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <BaseIcon :path="mdiCalendar" size="18" />
                    <span>{{ exp.period }} ({{ exp.duration }})</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mb-6">
              <h4 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2 font-heading">
                <BaseIcon :path="mdiChartLine" size="20" class="text-blue-600" />
                Key Achievements
              </h4>
              <ul class="space-y-3">
                <li
                  v-for="(achievement, i) in exp.achievements"
                  :key="i"
                  class="flex items-start gap-3 text-gray-700 dark:text-gray-300 font-display"
                >
                  <BaseIcon :path="mdiCheckCircle" size="24" class="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{{ achievement }}</span>
                </li>
              </ul>
            </div>

            <div class="mb-6">
              <h4 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2 font-heading">
                <BaseIcon :path="mdiLightningBolt" size="20" class="text-cyan-600" />
                Highlights
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="highlight in exp.highlights"
                  :key="highlight"
                  class="px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-full text-sm font-semibold font-display"
                >
                  {{ highlight }}
                </span>
              </div>
            </div>

            <div>
              <h4 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2 font-heading">
                <BaseIcon :path="mdiCodeBraces" size="20" class="text-indigo-600" />
                Technologies
              </h4>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tech in exp.tech"
                  :key="tech"
                  class="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold font-display"
                >
                  {{ tech }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Education -->
        <div class="max-w-5xl mx-auto mt-16">
          <h3 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white font-heading">Education</h3>
          <div class="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl">
            <div
              v-for="(edu, index) in education"
              :key="index"
              class="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
            >
              <div class="flex-1">
                <h4 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white font-heading">{{ edu.degree }}</h4>
                <p class="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-3 font-heading">{{ edu.school }}</p>
                <p class="text-gray-600 dark:text-gray-400 mb-4 font-display">{{ edu.description }}</p>
                <div class="mb-4">
                  <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 font-heading">Specializations:</h5>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="spec in edu.specializations"
                      :key="spec"
                      class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium font-display"
                    >
                      {{ spec }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2 text-gray-500 dark:text-gray-400 font-display">
                <BaseIcon :path="mdiCalendar" size="20" />
                <span class="font-medium">{{ edu.period }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Certifications -->
        <div class="max-w-5xl mx-auto mt-12">
          <h3 class="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white font-heading">Certifications</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(cert, index) in certifications"
              :key="index"
              class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-slate-700"
            >
              <div class="flex items-center gap-3 mb-2">
                <BaseIcon :path="mdiShield" size="24" class="text-blue-600 dark:text-blue-400" />
                <h4 class="text-lg font-bold text-gray-900 dark:text-white font-heading">{{ cert.name }}</h4>
              </div>
              <p class="text-gray-600 dark:text-gray-400 text-sm font-display">{{ cert.issuer }}</p>
              <p class="text-gray-500 dark:text-gray-500 text-xs mt-1 font-mono">{{ cert.year }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact -->
    <section id="contact" class="py-32 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h2 class="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent font-heading tracking-tight">
          Let's Connect
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-400 mb-4 font-display">
          Ready to collaborate on your next project? Let's build something amazing together.
        </p>
        <p class="text-gray-500 dark:text-gray-500 mb-12 font-display">
          Open to opportunities in AI/ML infrastructure, software development, and systems engineering.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a
            v-for="link in socialLinks"
            :key="link.label"
            :href="link.url"
            target="_blank"
            :class="`group flex items-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all ${link.color} text-gray-700 dark:text-gray-300 font-semibold font-display`"
          >
            <BaseIcon :path="link.icon" size="24" />
            <span>{{ link.label }}</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 border-t border-gray-200 dark:border-slate-700">
      <div class="max-w-7xl mx-auto px-6 text-center text-gray-600 dark:text-gray-400 font-display">
        <p>&copy; {{ new Date().getFullYear() }} Punit Mishra. Built with Vue.js & Tailwind CSS</p>
        <p class="mt-2 text-sm">Computer Engineer • Software Developer • Systems Architect • AI/ML Infrastructure Expert</p>
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
