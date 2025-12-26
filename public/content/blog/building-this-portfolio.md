---
title: "Building This Portfolio: Vue 3, Vite, and Tailwind CSS"
date: "2025-01-16"
category: "Technical"
tags: ["Vue.js", "Vite", "Tailwind CSS", "Portfolio", "Frontend"]
readTime: "15 min read"
featured: true
---

# Building This Portfolio: Vue 3, Vite, and Tailwind CSS

After years of using template-based portfolios, I decided to build something from scratch that truly represents my engineering philosophy: fast, modern, and maintainable. Here's a complete walkthrough of how I built this portfolio using Vue 3, Vite, and Tailwind CSS.

## Why These Technologies?

### Vue 3 with Composition API

Vue 3's Composition API offers a more intuitive way to organize code by logical concern rather than component options. This matters for a portfolio because:

```javascript
// Clean, reusable composables
import { ref, onMounted } from 'vue';

export function useGitHubProfile(username) {
  const profile = ref(null);
  const loading = ref(true);

  onMounted(async () => {
    const response = await fetch(`https://api.github.com/users/${username}`);
    profile.value = await response.json();
    loading.value = false;
  });

  return { profile, loading };
}
```

### Vite for Lightning-Fast Development

Vite's dev server starts in milliseconds, not seconds. For a portfolio where you're constantly tweaking styles and content, this makes a massive difference:

```bash
npm create vite@latest my-portfolio -- --template vue
cd my-portfolio
npm install
npm run dev  # Server ready in ~300ms
```

### Tailwind CSS for Rapid Styling

Utility-first CSS means I can style components without context-switching to CSS files:

```vue
<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-white
              dark:from-slate-950 dark:to-slate-900">
    <h1 class="text-5xl font-bold text-transparent bg-clip-text
               bg-gradient-to-r from-blue-600 to-cyan-500">
      Hello, World
    </h1>
  </div>
</template>
```

## Project Structure

Here's how I organized the codebase:

```
src/
├── components/          # Reusable UI components
│   ├── BaseIcon.vue     # SVG icon wrapper
│   ├── BentoCard.vue    # Grid card component
│   ├── BlogSection.vue  # Blog listing
│   ├── ContactForm.vue  # EmailJS integration
│   └── ...
├── views/               # Page components
│   ├── PortfolioView.vue    # Main landing page
│   ├── BlogArticleView.vue  # Article renderer
│   ├── ResumeView.vue       # Interactive resume
│   └── PhotoGalleryView.vue # Image gallery
├── stores/              # Pinia state management
│   ├── main.js          # Global state
│   └── style.js         # Theme/dark mode
├── css/                 # Tailwind layers
│   ├── main.css         # Entry point
│   └── tailwind/        # Custom utilities
└── utils/               # Helper functions
    ├── analytics.js     # Event tracking
    ├── cloudinary.js    # Image CDN
    └── resumeGenerator.js # PDF export
```

## Key Features Implementation

### 1. Dark Mode with Persistence

Dark mode that remembers user preference:

```javascript
// stores/style.js
import { defineStore } from 'pinia';

export const useStyleStore = defineStore('style', {
  state: () => ({
    darkMode: localStorage.getItem('darkMode') === 'true'
  }),

  actions: {
    setDarkMode(value) {
      this.darkMode = value ?? !this.darkMode;
      localStorage.setItem('darkMode', this.darkMode);
      document.documentElement.classList.toggle('dark', this.darkMode);
    }
  }
});
```

### 2. GitHub Integration

Real-time GitHub stats without authentication:

```javascript
const fetchGitHubProfile = async () => {
  const [profile, repos] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`).then(r => r.json()),
    fetch(`https://api.github.com/users/${username}/repos?per_page=100`).then(r => r.json())
  ]);

  const stats = {
    repos: profile.public_repos,
    followers: profile.followers,
    totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    languages: repos.reduce((acc, repo) => {
      if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
      return acc;
    }, {})
  };

  return { profile, stats };
};
```

### 3. Blog with Markdown

Articles stored as Markdown with frontmatter:

```markdown
---
title: "My Article Title"
date: "2025-01-16"
tags: ["Vue.js", "Tutorial"]
---

# Content here...
```

Rendered using `marked` with syntax highlighting:

```javascript
import { marked } from 'marked';
import hljs from 'highlight.js';

marked.setOptions({
  highlight: (code, lang) => {
    return hljs.highlightAuto(code, [lang]).value;
  }
});

const html = marked.parse(markdown);
```

### 4. PDF Resume Generation

FAANG-quality resume PDF export:

```javascript
import html2pdf from 'html2pdf.js';

export async function downloadResumePDF() {
  const resumeData = await fetch('/data-sources/resume.json').then(r => r.json());
  const html = generateResumeHTML(resumeData);

  const options = {
    margin: [0, 0, 0, 0],
    filename: 'Punit_Mishra_Resume.pdf',
    image: { type: 'jpeg', quality: 1 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  await html2pdf().set(options).from(html).save();
}
```

### 5. Photo Gallery with Cloudinary

Optimized images with automatic format and quality:

```javascript
// utils/cloudinary.js
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

export function getImageUrl(publicId, options = {}) {
  const { width, height, quality = 'auto', format = 'auto' } = options;

  const transforms = [
    'f_' + format,
    'q_' + quality,
    width && 'w_' + width,
    height && 'h_' + height,
    'c_fill'
  ].filter(Boolean).join(',');

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}
```

## Performance Optimizations

### 1. Code Splitting

Lazy-load routes and heavy components:

```javascript
// router/index.js
const routes = [
  {
    path: '/blog/:slug',
    component: () => import('@/views/BlogArticleView.vue')
  },
  {
    path: '/resume',
    component: () => import('@/views/ResumeView.vue')
  }
];
```

### 2. Image Lazy Loading

Intersection Observer for images:

```vue
<script setup>
const imageRef = ref(null);
const isVisible = ref(false);

onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      isVisible.value = true;
      observer.disconnect();
    }
  });
  observer.observe(imageRef.value);
});
</script>

<template>
  <div ref="imageRef">
    <img v-if="isVisible" :src="imageSrc" :alt="alt" />
    <div v-else class="animate-pulse bg-gray-200 h-48" />
  </div>
</template>
```

### 3. Preconnect to External APIs

```html
<!-- index.html -->
<link rel="preconnect" href="https://api.github.com" />
<link rel="preconnect" href="https://res.cloudinary.com" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
```

## Deployment

### GitHub Pages

Automated deployment via GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v4
        with:
          path: './dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

### Vercel (Alternative)

Zero-config deployment:

```bash
npm i -g vercel
vercel --prod
```

## Lessons Learned

1. **Start Simple**: Built the core structure first, added features incrementally
2. **Mobile-First**: Used Tailwind's responsive utilities from the start
3. **Performance Matters**: Lighthouse scores above 90 on all metrics
4. **Content is King**: The best portfolio is one you'll actually update

## Source Code

The complete source code is available on GitHub:
- Repository: [github.com/punitmishra/punitmishra.github.io](https://github.com/punitmishra/punitmishra.github.io)
- Live Site: [punitmishra.com](https://punitmishra.com)

Feel free to fork it and make it your own!

---

*Building a portfolio from scratch taught me more about modern web development than any tutorial. The key is to start simple and iterate.*
