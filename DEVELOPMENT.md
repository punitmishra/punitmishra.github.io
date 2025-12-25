# Portfolio Development Guide

## Project Overview
Professional portfolio website for Punit Mishra - Senior Software Engineer @ SAP.

## Tech Stack
- **Framework:** Vue 3.5 with Composition API
- **Build Tool:** Vite 5.4
- **Styling:** Tailwind CSS 3.4 with custom utilities
- **Fonts:** Plus Jakarta Sans (body), Space Grotesk (headings), JetBrains Mono (code)
- **Deployment:** Vercel (primary), GitHub Pages, Railway

## Key Features
- Command Palette (Cmd+K) for quick navigation
- Typing animation in hero section
- Particle background effect
- Scroll reveal animations
- Dark mode with toggle in navigation
- Real-time GitHub data fetching
- Contact form with EmailJS

## Data Sources
- **GitHub API:** Profile, repos, stats fetched dynamically
- **LinkedIn:** UC Berkeley CS coursework, SAP experience, awards

## Profile Data (verified)
- **Name:** Punit Mishra
- **Company:** SAP
- **Location:** Pleasanton, CA
- **Education:** UC Berkeley (CS courses), Ohlone College (Engineering)
- **GitHub:** punitmishra (29 repos, 10 followers)
- **LinkedIn:** mishrapunit

## Key Projects
1. **Shield AI** - Rust-based AI DNS filtering
2. **Railroad Arcade** - TypeScript game/simulation
3. **SAP Commerce Extension** - Java enterprise integration
4. **Cloud Foundry/Kubernetes** - Infrastructure contributions

## Design System
- **Colors:** Neutral grays with blue accents
- **Shadows:** `.shadow-elegant` and `.shadow-elegant-lg`
- **Effects:** `.hover-lift`, `.glass`, `.card-glow`
- **Animations:** Scroll reveal directive (`v-scroll-reveal`)

## File Structure
```
src/
├── components/
│   ├── TypingAnimation.vue    # Hero typing effect
│   ├── ParticleBackground.vue # Canvas particle system
│   ├── CommandPalette.vue     # Cmd+K search
│   └── ...
├── directives/
│   └── scrollReveal.js        # Scroll animation directive
├── views/
│   └── PortfolioView.vue      # Main portfolio page
├── css/
│   └── main.css               # Custom CSS utilities
└── main.js                    # App entry with directive registration
```

## Development Commands
```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

## Deployment
Push to `main` triggers automatic deployments:
- Vercel: https://punitmishragithubio.vercel.app
- GitHub Pages: https://punitmishra.github.io

## Refinement Status (Dec 2024)
- [x] Professional fonts (Plus Jakarta Sans, Space Grotesk)
- [x] Dark mode toggle in desktop nav
- [x] Command palette (Cmd+K)
- [x] Typing animation
- [x] Particle background
- [x] Scroll reveal animations
- [x] Real GitHub/LinkedIn data
- [x] Elite shadow system
- [ ] Performance optimization (lazy loading)
- [ ] Blog integration
- [ ] Testimonials section

## Next Steps
1. Continue visual polish refinements
2. Add lazy loading for images
3. Optimize bundle size
4. Add testimonials/recommendations
5. Integrate real blog content
