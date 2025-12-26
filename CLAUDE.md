# Project Context: Punit Mishra Portfolio

## Overview
Personal portfolio website showcasing software engineering expertise, projects, and blog articles.

**Live URL**: https://punitmishra.github.io
**Repository**: https://github.com/punitmishra/punitmishra.github.io

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Vue 3.5 (Composition API, script setup) |
| Build Tool | Vite 5.3 |
| Styling | Tailwind CSS 3.4 |
| State | Pinia 3.0 |
| Routing | Vue Router 4.4 (hash mode for GitHub Pages) |
| Icons | Material Design Icons (@mdi/js) |

## Commands

```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build to /dist
npm run preview  # Preview production build
npm run lint     # ESLint with auto-fix
```

## Project Structure

```
/
├── src/
│   ├── components/     # 70+ Vue components
│   ├── views/          # Page components (5 main views)
│   ├── stores/         # Pinia stores (main.js, style.js)
│   ├── router/         # Vue Router config
│   ├── css/            # Tailwind layers + custom CSS
│   ├── utils/          # Utilities (analytics, seo, performance)
│   └── directives/     # Custom Vue directives
├── public/
│   ├── content/blog/   # Markdown blog articles
│   └── data-sources/   # JSON data files
├── medium-articles/    # Medium-ready article versions
└── .github/workflows/  # GitHub Actions (deploy, twitter)
```

## Key Files

### Views
- `src/views/PortfolioView.vue` - Main landing page (hero, projects, blog, contact)
- `src/views/BlogArticleView.vue` - Blog article renderer
- `src/views/ProjectDetailView.vue` - Project detail page
- `src/views/PhotoGalleryView.vue` - Photo gallery page
- `src/views/ResumeView.vue` - Interactive resume

### Configuration
- `tailwind.config.js` - Design tokens, fonts, animations
- `vite.config.js` - Build config, chunking strategy
- `postcss.config.js` - PostCSS plugins

### Styling
- `src/css/main.css` - Entry point, imports Tailwind layers
- `src/css/tailwind/_base.css` - Base styles, fonts, global rules

## Design System

### Fonts
- **Display/Body**: Plus Jakarta Sans
- **Headings**: Space Grotesk
- **Code**: JetBrains Mono

### Colors (Primary)
- Blue: `#3b82f6` (primary accent)
- Indigo: `#6366f1` (secondary)
- Neutral: Tailwind gray scale

### Design Principles
- Minimalist & Clean aesthetic
- Generous whitespace (py-32 for sections)
- Subtle animations (scale 1.01, 200-300ms transitions)
- Glassmorphism with reduced intensity
- Dark mode support via `dark:` classes

### Key Components
- `BentoCard.vue` - Grid cards with gradient/glass/dark variants
- `SkillRing.vue` - SVG skill visualization
- `TypingAnimation.vue` - Typewriter effect
- `CloudinaryImage.vue` - Optimized images from Cloudinary
- `PhotoGallery.vue` - Masonry image grid
- `PhotoLightbox.vue` - Full-screen image viewer

## API Integrations

### Cloudinary (Image CDN)
```
Cloud Name: [configured in .env]
Usage: All photos (professional, projects, personal)
Utils: src/utils/cloudinary.js
```

### EmailJS (Contact Form)
```
Service: EmailJS
Component: ContactForm.vue
```

### GitHub API
```
Used for: Profile data, contribution graph
Fetched in: PortfolioView.vue
```

### Twitter/X API
```
Workflow: .github/workflows/twitter-post.yml
Secrets: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
```

#### Twitter Secrets Setup
1. Go to: https://github.com/punitmishra/punitmishra.github.io/settings/secrets/actions
2. Click "New repository secret" and add these 4 secrets:

| Secret Name | Description | Get From |
|-------------|-------------|----------|
| `TWITTER_API_KEY` | API Key (Consumer Key) | Twitter Developer Portal |
| `TWITTER_API_SECRET` | API Secret (Consumer Secret) | Twitter Developer Portal |
| `TWITTER_ACCESS_TOKEN` | Access Token | Twitter Developer Portal |
| `TWITTER_ACCESS_SECRET` | Access Token Secret | Twitter Developer Portal |

3. Get credentials from: https://developer.twitter.com/en/portal/projects
4. Test with: Run workflow manually with `dry_run=true`

## Content

### Blog Articles
Location: `public/content/blog/`
Format: Markdown with YAML frontmatter
Index: `public/content/blog/index.json`

### Medium Articles
Location: `medium-articles/`
Purpose: Cross-posting ready versions (no frontmatter)

### Data Sources
- `public/data-sources/photos.json` - Photo gallery data
- `public/data-sources/resume.json` - Resume/CV data
- `public/data-sources/clients.json` - Testimonials
- `public/data-sources/history.json` - Timeline data

## Deployment

**Primary**: Vercel (auto-deploy from main)
**Secondary**: GitHub Pages (hash routing)

Build output: `/dist`

## Development Notes

### Adding New Pages
1. Create view in `src/views/`
2. Add route in `src/router/index.js`
3. Add nav link in `NavBar.vue` and `FooterBar.vue`

### Adding Blog Articles
1. Create `.md` file in `public/content/blog/`
2. Add entry to `index.json`
3. Optionally create Medium version in `medium-articles/`

### Image Handling
Use CloudinaryImage component for all images:
```vue
<CloudinaryImage
  public-id="portfolio/headshot"
  alt="Profile photo"
  :width="400"
  aspect-ratio="1:1"
/>
```

### State Management
- `useMainStore()` - User data, fetched content
- `useStyleStore()` - Theme, dark mode (persisted to localStorage)

## Performance Optimizations
- Lazy-loaded routes via `defineAsyncComponent`
- Chunked vendor bundles (vue, ui, markdown, pdf, chart)
- Image lazy loading with Intersection Observer
- Preconnect to external APIs in index.html
