<script setup>
import { ref, onMounted, computed, watch, nextTick, createApp, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
import yaml from 'highlight.js/lib/languages/yaml';
import sql from 'highlight.js/lib/languages/sql';
import go from 'highlight.js/lib/languages/go';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import { mdiArrowLeft, mdiClockOutline, mdiCalendar, mdiTagOutline, mdiGithub, mdiShareVariant, mdiPlay } from '@mdi/js';
import BaseIcon from '@/components/BaseIcon.vue';

// Register languages
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('shell', bash);
hljs.registerLanguage('json', json);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('go', go);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('docker', dockerfile);

// Language display names
const languageNames = {
  javascript: 'JavaScript',
  js: 'JavaScript',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  python: 'Python',
  py: 'Python',
  rust: 'Rust',
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  json: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  sql: 'SQL',
  go: 'Go',
  dockerfile: 'Dockerfile',
  docker: 'Dockerfile',
  mermaid: 'Diagram',
  asciinema: 'Terminal Recording',
  terminal: 'Terminal',
};

// Track asciinema instances for later initialization
const asciinemaInstances = ref([]);

const route = useRoute();
const router = useRouter();

const article = ref(null);
const content = ref('');
const loading = ref(true);
const error = ref(null);

// Configure marked with custom renderer using modern API
marked.use({
  gfm: true,
  breaks: true,
  renderer: {
    code(token) {
      const code = token.text || '';
      const language = token.lang || '';
      const langName = languageNames[language.toLowerCase()] || language.toUpperCase() || 'Code';

      // Handle mermaid diagrams
      if (language.toLowerCase() === 'mermaid') {
        return `<div class="mermaid-wrapper"><div class="code-lang-label">Diagram</div><div class="mermaid">${code}</div></div>`;
      }

      // Handle asciinema recordings
      if (language.toLowerCase() === 'asciinema' || language.toLowerCase() === 'terminal') {
        const lines = code.trim().split('\n');
        const src = lines[0].trim();
        const title = lines[1]?.trim() || 'Terminal Demo';
        const id = `asciinema-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        return `<div class="asciinema-embed" data-id="${id}" data-src="${src}" data-title="${title}">
          <div class="asciinema-placeholder">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-3 h-3 rounded-full bg-red-500"></span>
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span class="w-3 h-3 rounded-full bg-green-500"></span>
              <span class="ml-2 text-sm font-medium text-gray-400 font-mono">${title}</span>
            </div>
            <div class="flex items-center justify-center h-48 bg-gray-900 rounded-lg border border-gray-700">
              <div class="text-center">
                <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                </div>
                <p class="text-gray-400 text-sm font-mono">Click to load terminal recording</p>
                <p class="text-gray-500 text-xs mt-1">${src}</p>
              </div>
            </div>
          </div>
        </div>`;
      }

      // Syntax highlight code
      let highlighted = code;
      if (language && hljs.getLanguage(language)) {
        try {
          highlighted = hljs.highlight(code, { language: language }).value;
        } catch (e) {
          console.warn('Highlighting failed:', e);
        }
      } else {
        try {
          highlighted = hljs.highlightAuto(code).value;
        } catch (e) {
          // Keep original code
        }
      }

      return `<div class="code-block-wrapper"><div class="code-lang-label">${langName}</div><pre><code class="hljs language-${language}">${highlighted}</code></pre></div>`;
    }
  }
});

// Initialize mermaid after content loads
const initMermaid = async () => {
  try {
    const mermaid = (await import('mermaid')).default;
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
    });
    await nextTick();
    mermaid.run({ querySelector: '.mermaid' });
  } catch (e) {
    console.warn('Mermaid not available:', e);
  }
};

// Initialize asciinema players
const initAsciinema = async () => {
  try {
    const AsciinemaPlayer = await import('asciinema-player');

    const embeds = document.querySelectorAll('.asciinema-embed');
    embeds.forEach((embed) => {
      const placeholder = embed.querySelector('.asciinema-placeholder');
      if (!placeholder) return;

      placeholder.style.cursor = 'pointer';
      placeholder.addEventListener('click', async () => {
        const src = embed.dataset.src;
        const title = embed.dataset.title;

        // Replace placeholder with player
        embed.innerHTML = `
          <div class="asciinema-player-container">
            <div class="flex items-center gap-2 mb-3">
              <span class="w-3 h-3 rounded-full bg-red-500"></span>
              <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span class="w-3 h-3 rounded-full bg-green-500"></span>
              <span class="ml-2 text-sm font-medium text-gray-400 font-mono">${title}</span>
            </div>
            <div class="asciinema-player-wrapper"></div>
          </div>
        `;

        const wrapper = embed.querySelector('.asciinema-player-wrapper');

        try {
          AsciinemaPlayer.create(
            src,
            wrapper,
            {
              cols: 100,
              rows: 24,
              autoPlay: true,
              loop: false,
              speed: 1.5,
              theme: 'monokai',
              fit: 'width',
              terminalFontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            }
          );
        } catch (err) {
          console.error('Failed to create asciinema player:', err);
          wrapper.innerHTML = `
            <div class="text-center py-8">
              <p class="text-red-400 mb-2">Failed to load recording</p>
              <a href="${src}" target="_blank" class="text-blue-400 hover:underline text-sm">View on asciinema.org</a>
            </div>
          `;
        }
      });
    });
  } catch (e) {
    console.warn('Asciinema player not available:', e);
  }
};

const categoryColors = {
  'AI/ML': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'Technical': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'Personal': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  'Security': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'Projects': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  'Career': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const parseFrontmatter = (markdown) => {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (match) {
    const frontmatter = {};
    match[1].split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        let value = valueParts.join(':').trim();
        // Remove quotes
        value = value.replace(/^["']|["']$/g, '');
        // Parse arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
        // Parse booleans
        if (value === 'true') value = true;
        if (value === 'false') value = false;

        frontmatter[key.trim()] = value;
      }
    });
    return { frontmatter, content: match[2] };
  }

  return { frontmatter: {}, content: markdown };
};

const fetchArticle = async (slug) => {
  loading.value = true;
  error.value = null;

  try {
    // Fetch article index to get metadata
    const indexResponse = await fetch('/content/blog/index.json');
    const indexData = await indexResponse.json();
    const articleMeta = indexData.articles.find(a => a.slug === slug);

    if (!articleMeta) {
      error.value = 'Article not found';
      loading.value = false;
      return;
    }

    // Fetch markdown content
    const contentResponse = await fetch(`/content/blog/${slug}.md`);
    if (!contentResponse.ok) {
      throw new Error('Failed to load article content');
    }

    const markdown = await contentResponse.text();
    const { frontmatter, content: articleContent } = parseFrontmatter(markdown);

    article.value = { ...articleMeta, ...frontmatter };
    content.value = marked(articleContent);

    loading.value = false;

    // Initialize interactive elements after content is rendered
    await nextTick();
    initMermaid();
    initAsciinema();
  } catch (err) {
    console.error('Failed to load article:', err);
    error.value = err.message;
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/#blog');
};

const shareArticle = async () => {
  if (navigator.share) {
    await navigator.share({
      title: article.value?.title,
      url: window.location.href
    });
  } else {
    // Fallback: copy to clipboard
    await navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  }
};

onMounted(() => {
  fetchArticle(route.params.slug);
});

watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    fetchArticle(newSlug);
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white dark:from-slate-900 dark:via-slate-800/30 dark:to-slate-900">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-gray-200/50 dark:border-slate-800/50">
      <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          @click="goBack"
        >
          <BaseIcon
            :path="mdiArrowLeft"
            size="20"
          />
          <span class="font-medium">Back</span>
        </button>

        <div class="flex items-center gap-3">
          <button
            class="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="Share article"
            @click="shareArticle"
          >
            <BaseIcon
              :path="mdiShareVariant"
              size="20"
            />
          </button>
          <a
            v-if="article"
            :href="`https://github.com/punitmishra/punitmishra.github.io/blob/main/public/content/blog/${route.params.slug}.md`"
            target="_blank"
            class="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            title="View source on GitHub"
          >
            <BaseIcon
              :path="mdiGithub"
              size="20"
            />
          </a>
        </div>
      </div>
    </nav>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="pt-24 pb-16"
    >
      <div class="max-w-4xl mx-auto px-6">
        <div class="animate-pulse">
          <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
          <div class="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4" />
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="pt-24 pb-16"
    >
      <div class="max-w-4xl mx-auto px-6 text-center">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Article Not Found
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">
          {{ error }}
        </p>
        <button
          class="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium"
          @click="goBack"
        >
          Go Back
        </button>
      </div>
    </div>

    <!-- Article Content -->
    <article
      v-else-if="article"
      class="pt-24 pb-16"
    >
      <div class="max-w-4xl mx-auto px-6">
        <!-- Header -->
        <header class="mb-12">
          <!-- Category -->
          <div class="flex items-center gap-3 mb-4">
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', categoryColors[article.category] || categoryColors['Technical']]">
              {{ article.category }}
            </span>
            <span
              v-if="article.featured"
              class="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-full"
            >
              Featured
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white font-heading leading-tight mb-6">
            {{ article.title }}
          </h1>

          <!-- Meta -->
          <div class="flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400 text-sm mb-6">
            <div class="flex items-center gap-1.5">
              <BaseIcon
                :path="mdiCalendar"
                size="16"
              />
              <span>{{ formatDate(article.date) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <BaseIcon
                :path="mdiClockOutline"
                size="16"
              />
              <span>{{ article.readTime }}</span>
            </div>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in (Array.isArray(article.tags) ? article.tags : [])"
              :key="tag"
              class="px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 rounded-lg text-sm"
            >
              {{ tag }}
            </span>
          </div>
        </header>

        <!-- Content -->
        <div
          class="prose prose-lg dark:prose-invert max-w-none
            prose-headings:font-heading prose-headings:font-bold
            prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-gray-600 dark:prose-p:text-gray-300
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-gray-900 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-slate-700 prose-pre:rounded-xl
            prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
            prose-table:border prose-table:border-gray-200 dark:prose-table:border-slate-700
            prose-th:bg-gray-100 dark:prose-th:bg-slate-800 prose-th:px-4 prose-th:py-2
            prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-gray-200 dark:prose-td:border-slate-700
            prose-img:rounded-xl prose-img:shadow-lg
            prose-hr:border-gray-200 dark:prose-hr:border-slate-700"
          v-html="content"
        />

        <!-- Footer -->
        <footer class="mt-16 pt-8 border-t border-gray-200 dark:border-slate-700">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <img
                src="https://github.com/punitmishra.png"
                alt="Punit Mishra"
                class="w-12 h-12 rounded-full"
              >
              <div>
                <p class="font-semibold text-gray-900 dark:text-white">
                  Punit Mishra
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Senior Software Engineer @ SAP
                </p>
              </div>
            </div>
            <button
              class="flex items-center gap-2 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
              @click="goBack"
            >
              <BaseIcon
                :path="mdiArrowLeft"
                size="18"
              />
              <span>Back to Articles</span>
            </button>
          </div>
        </footer>
      </div>
    </article>
  </div>
</template>

<style>
/* Code block wrapper with language label */
.code-block-wrapper {
  position: relative;
  margin: 1.5rem 0;
}

.code-lang-label {
  position: absolute;
  top: 0;
  right: 0;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #8b949e;
  background: #161b22;
  border-bottom-left-radius: 0.5rem;
  border-top-right-radius: 0.75rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  z-index: 10;
}

/* Mermaid diagram wrapper */
.mermaid-wrapper {
  position: relative;
  margin: 1.5rem 0;
  background: #f8fafc;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.dark .mermaid-wrapper {
  background: #1e293b;
  border-color: #334155;
}

.mermaid {
  display: flex;
  justify-content: center;
  overflow-x: auto;
}

.mermaid svg {
  max-width: 100%;
  height: auto;
}

/* Code block styling with better readability */
.code-block-wrapper pre,
.prose pre {
  overflow-x: auto;
  background: #0d1117 !important;
  border-radius: 0.75rem;
  padding: 1.5rem;
  padding-top: 2.5rem;
  margin: 0;
  border: 1px solid #30363d;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.code-block-wrapper pre code,
.prose pre code {
  background: transparent !important;
  padding: 0 !important;
  font-size: 0.875rem !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', 'Consolas', monospace;
  line-height: 1.75;
  color: #e6edf3;
  display: block;
  white-space: pre;
}

/* Syntax highlighting colors - GitHub Dark inspired */
.prose pre code .hljs-keyword,
.prose pre code .hljs-selector-tag,
.prose pre code .hljs-built_in,
.prose pre code .hljs-name {
  color: #ff7b72;
}

.prose pre code .hljs-string,
.prose pre code .hljs-title,
.prose pre code .hljs-section,
.prose pre code .hljs-attribute,
.prose pre code .hljs-literal,
.prose pre code .hljs-template-tag,
.prose pre code .hljs-template-variable,
.prose pre code .hljs-addition {
  color: #a5d6ff;
}

.prose pre code .hljs-comment,
.prose pre code .hljs-quote,
.prose pre code .hljs-deletion,
.prose pre code .hljs-meta {
  color: #8b949e;
  font-style: italic;
}

.prose pre code .hljs-number,
.prose pre code .hljs-symbol,
.prose pre code .hljs-bullet {
  color: #79c0ff;
}

.prose pre code .hljs-function,
.prose pre code .hljs-title.function_ {
  color: #d2a8ff;
}

.prose pre code .hljs-class,
.prose pre code .hljs-title.class_ {
  color: #ffa657;
}

.prose pre code .hljs-variable,
.prose pre code .hljs-attr {
  color: #7ee787;
}

.prose pre code .hljs-type,
.prose pre code .hljs-params {
  color: #ffa657;
}

.prose pre code .hljs-punctuation,
.prose pre code .hljs-operator {
  color: #e6edf3;
}

/* Inline code */
.prose :not(pre) > code {
  background: #f1f5f9;
  color: #0f172a;
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.875em;
  font-weight: 500;
  font-family: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;
  border: 1px solid #e2e8f0;
}

.dark .prose :not(pre) > code {
  background: #1e293b;
  color: #f1f5f9;
  border-color: #334155;
}

/* Better table styling */
.prose table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.925rem;
}

.prose th {
  background: #f8fafc;
  font-weight: 600;
  text-align: left;
  padding: 0.875rem 1rem;
  border-bottom: 2px solid #e2e8f0;
}

.dark .prose th {
  background: #1e293b;
  border-bottom-color: #334155;
}

.prose td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark .prose td {
  border-bottom-color: #334155;
}

.prose tr:hover td {
  background: #f8fafc;
}

.dark .prose tr:hover td {
  background: #1e293b;
}

/* Better blockquote styling */
.prose blockquote {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(to right, #eff6ff, transparent);
  padding: 1rem 1.5rem;
  margin: 1.5rem 0;
  border-radius: 0 0.5rem 0.5rem 0;
  font-style: italic;
}

.dark .prose blockquote {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.1), transparent);
  border-left-color: #60a5fa;
}

/* Heading anchors */
.prose h2 {
  margin-top: 2.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark .prose h2 {
  border-bottom-color: #334155;
}

.prose h3 {
  margin-top: 2rem;
}

/* List styling */
.prose ul {
  list-style-type: disc;
  padding-left: 1.5rem;
}

.prose ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
}

.prose li {
  margin: 0.5rem 0;
}

/* Link hover effect */
.prose a {
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.prose a:hover {
  border-bottom-color: currentColor;
}

/* Image captions */
.prose img {
  margin: 2rem auto;
  display: block;
}

/* Horizontal rule */
.prose hr {
  margin: 3rem 0;
  border: none;
  height: 1px;
  background: linear-gradient(to right, transparent, #e2e8f0, transparent);
}

.dark .prose hr {
  background: linear-gradient(to right, transparent, #334155, transparent);
}

/* Strong/bold text */
.prose strong {
  color: #0f172a;
  font-weight: 600;
}

.dark .prose strong {
  color: #f1f5f9;
}

/* Plain text code blocks without language */
.prose pre code:not([class*="hljs"]):not([class*="language-"]) {
  color: #e6edf3;
}

/* Asciinema player styling */
.asciinema-embed {
  margin: 1.5rem 0;
}

.asciinema-placeholder {
  background: #0d1117;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #30363d;
  transition: all 0.2s;
}

.asciinema-placeholder:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}

.asciinema-player-container {
  background: #0d1117;
  border-radius: 0.75rem;
  padding: 1rem;
  border: 1px solid #30363d;
}

.asciinema-player-wrapper {
  border-radius: 0.5rem;
  overflow: hidden;
}

/* Override asciinema player defaults */
.asciinema-player-wrapper .ap-wrapper {
  border-radius: 0.5rem;
}

.asciinema-player-wrapper .ap-player {
  font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace !important;
}
</style>
