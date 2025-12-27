<!-- Copilot instructions for AI coding agents working on this repo -->
# Copilot / AI Agent Quick Guide

This repository is a personal portfolio built with Vue 3, Vite and Tailwind. The guidance below focuses on project-specific conventions, important files, developer workflows, and examples you can use when making changes.

- **Big picture:** Single-page Vue 3 app served as static assets in `dist/` for production. Dev uses `vite` (fast HMR); production served with the simple Express server in [server.js](server.js).
- **Key frameworks:** Vue 3, Vite, Pinia for state, Tailwind CSS. Code uses the alias `@` -> `src/` (see [vite.config.js](vite.config.js)).

Build & run (explicit):

- Install: `npm install` (Node >= 18, npm >= 9 per `package.json`).
- Dev: `npm run dev` — launches Vite dev server (HMR).
- Build: `npm run build` — produces `dist/`.
- Preview (vite): `npm run preview` — serves production bundle on port 4173.
- Production server: `npm run start` runs [server.js](server.js) which serves `dist/` and handles SPA routing.

Important files and why they matter:

- [package.json](package.json): scripts, engine requirements, and deps; use it for canonical commands.
- [vite.config.js](vite.config.js): alias configuration (`@`), manual chunking rules, and PWA plugin currently disabled (commented). When changing bundles, inspect `rollupOptions.manualChunks`.
- [src/main.js](src/main.js): app bootstrap — registers Pinia, router, directives, and initializes performance/analytics. Many runtime features are lazy-initialized here (service worker registration is commented out).
- [server.js](server.js): simple Express static server used for local production-style runs and deployments that expect a Node server.
- [scripts/publish-to-medium.mjs](scripts/publish-to-medium.mjs): CLI pattern for publishing blog markdown from `public/content/blog`. Use examples in the script for token usage and `--dry-run`.
- [scripts/post-to-twitter.mjs](scripts/post-to-twitter.mjs): automated Twitter posting flow (check script header for usage).

Project-specific patterns & conventions:

- Import alias: prefer `@/...` imports (e.g., `@/stores/main.js`) — configured in `vite.config.js` and used widely in `src/`.
- Lazy loading: heavy libs (charts, markdown, mermaid, pdf) are loaded on demand — follow existing pattern of dynamic imports when adding similar features.
- Performance-first: `src/main.js` wraps many initializers in try/catch and defers to DOMContentLoaded; mirror that defensive pattern when adding front-end initialization code.
- PWA: currently disabled (both in `vite.config.js` and in `src/main.js`). If re-enabling, update both locations and verify Workbox/build settings.

Quick editing examples you can use:

- Add a new store: create `src/stores/myStore.js` and import using `import { useMyStore } from "@/stores/myStore.js";` and register with Pinia as other stores do.
- Publish an article to Medium (example):

```bash
node scripts/publish-to-medium.mjs --slug my-article-slug --token "$MEDIUM_TOKEN"
```

- Run lint autofix: `npm run lint`.

Testing & CI notes:

- There are no automated test scripts in `package.json`. Keep changes small and test locally using `npm run dev` and `npm run build` + `npm run start` to validate production output.

When changing build or deployment:

- Check `vite.config.js` (chunking and optimizeDeps). Large dependency changes may require updating `optimizeDeps.include` or adjusting manualChunks.
- If enabling PWA, resolve Workbox build issues first; see the commented blocks in `vite.config.js` and service worker registration in `src/main.js`.

When opening PRs or making edits for the author:

- Keep bundle-size conscious changes (prefer dynamic imports for large libs).
- Reference the affected files in the PR description (use the repo paths above).

If anything here is unclear or you'd like more examples (component lifecycle patterns, store examples, or build output layout), say which area and I will expand the file.
