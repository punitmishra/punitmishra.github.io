# Portfolio Development Guide

## Project Overview
Professional portfolio website for Punit Mishra - Senior Software Engineer @ SAP.

## Tech Stack
- **Framework:** Vue 3.5 with Composition API
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS 3.4 with custom utilities
- **Fonts:** Plus Jakarta Sans (body), Space Grotesk (headings), JetBrains Mono (code)
- **Deployment:** Vercel (primary), GitHub Pages

## Key Features
- Command Palette (Cmd+K) for quick navigation
- Typing animation in hero section
- Animated gradient mesh background
- Scroll reveal animations
- Dark mode with humorous toggle messages
- Real-time GitHub data fetching
- GitHub contribution graph
- Contact form with EmailJS
- Extensive technical blog content

## Project Structure
```
.
├── content/                    # Markdown content
│   ├── blog/                   # Technical articles
│   │   ├── index.json          # Article metadata
│   │   ├── multi-agent-systems.md
│   │   ├── rust-ai-infrastructure.md
│   │   ├── vector-search-scale.md
│   │   ├── silicon-to-software.md
│   │   ├── ai-security-production.md
│   │   └── microservices-patterns.md
│   ├── presentations/          # Slide decks
│   └── projects/               # Project details
├── src/
│   ├── components/
│   │   ├── TypingAnimation.vue
│   │   ├── ParticleBackground.vue
│   │   ├── CommandPalette.vue
│   │   ├── GradientMesh.vue
│   │   ├── BentoCard.vue
│   │   ├── SkillRing.vue
│   │   ├── StatsGrid.vue
│   │   ├── NowSection.vue
│   │   ├── DarkModeToggle.vue
│   │   ├── GitHubContributionGraph.vue
│   │   └── ...
│   ├── directives/
│   │   └── scrollReveal.js
│   ├── views/
│   │   └── PortfolioView.vue
│   ├── css/
│   │   └── main.css
│   └── main.js
├── public/
│   ├── content/               # Static content files
│   └── ...
├── README.md                  # Elegant GitHub profile README
├── DEVELOPMENT.md             # This file
└── package.json
```

## Content System

### Blog Articles
Technical articles are stored as Markdown in `content/blog/`. Each article has:
- YAML frontmatter with metadata
- Full Markdown content with code examples
- Categories: AI/ML, Technical, Personal, Security

### Current Articles
1. **Building Secure Multi-Agent Systems** - LangGraph, security patterns
2. **Rust for AI Infrastructure** - Performance benchmarks, real results
3. **Vector Search at Scale** - CLIP, FAISS, production systems
4. **From Silicon to Software** - Personal journey from hardware to AI
5. **AI Security in Production** - Practical security guide
6. **Enterprise Microservices Patterns** - Lessons from SAP

### Adding New Articles
1. Create `content/blog/your-article.md`
2. Add frontmatter:
```yaml
---
title: "Your Article Title"
date: "2024-XX-XX"
category: "Technical"
tags: ["tag1", "tag2"]
readTime: "10 min"
featured: true
---
```
3. Update `content/blog/index.json`

## Design System

### Colors
- Primary: Blue (#3b82f6) to Cyan (#06b6d4) gradients
- Dark mode: Slate backgrounds with enhanced glows
- Accents: Indigo, Violet, Emerald for categories

### CSS Utilities
```css
.glass-premium        /* Premium glassmorphism */
.gradient-border      /* Animated gradient border */
.gradient-animate     /* Color-shifting gradient */
.text-gradient-animate /* Animated text gradient */
.glow-blue, .glow-indigo, .glow-cyan
.float, .float-delayed
.shine               /* Hover shine effect */
.shadow-elegant, .shadow-elegant-lg
.hover-lift
.card-glow
```

### Dark Mode
- Smooth transitions with `html { transition: ... }`
- Enhanced glows and shadows in dark mode
- Proper color-scheme declaration
- Funny toggle messages ("Dark mode: Because light attracts bugs!")

## Development

### Commands
```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

### Environment
- Node.js 20+
- npm 9+

## Deployment

### Automatic Deployment
Push to `main` triggers:
- **Vercel:** https://punitmishragithubio.vercel.app
- **GitHub Pages:** https://punitmishra.github.io

### Manual Steps
1. `npm run build`
2. Commit and push to `main`
3. GitHub Actions handles deployment

## Profile Data

### Verified Information
- **Name:** Punit Mishra
- **Company:** SAP (Senior Software Engineer)
- **Location:** Pleasanton, CA
- **Education:** UC Berkeley (CS), Ohlone College
- **GitHub:** punitmishra (29 repos)
- **LinkedIn:** mishrapunit

### Experience Highlights
- 12+ years enterprise software development
- AI/ML infrastructure architect
- Built v1 of core SAP toolkit
- Led security compliance initiatives
- Mentored engineers for 2+ years

## Version History

### v1.3.0-content (Current)
- Cleaned up repository (removed temp docs)
- Elegant GitHub README with badges
- Technical blog system (6 articles)
- Content directory structure

### v1.2.0-elite
- Bento grid layout
- Glassmorphism effects
- Animated gradients
- Skill rings and stats

### v1.1.0-refined
- Professional fonts
- Real GitHub/LinkedIn data
- Dark mode toggle
- Command palette

### v1.0.0-elite
- Initial elite design
- Core components
- Basic styling

## Future Enhancements
- [ ] Markdown rendering in Vue (marked/remark)
- [ ] Article search/filter
- [ ] Reading progress indicator
- [ ] Newsletter signup
- [ ] RSS feed for articles
- [ ] Presentations viewer
- [ ] Project case studies
