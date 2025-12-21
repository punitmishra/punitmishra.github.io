# Punit Mishra - Portfolio Website

Modern Vue.js 3 portfolio website deployed to GitHub Pages at [punitmishra.com](https://punitmishra.com).

## Features

- 🎨 **Modern UI** - Blue-cyan-indigo gradient theme
- 🧠 **What's in Punit's Mind** - AI-powered context generator
- 📱 **Responsive Design** - Works on all devices
- ⚡ **Fast Performance** - Optimized with Vite
- 🔗 **GitHub Integration** - Live repository data
- 📄 **Project Details** - Individual project pages
- 🎯 **Smooth Navigation** - Hash-based routing for GitHub Pages

## Tech Stack

- **Vue.js 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Vue Router** - Hash-based routing
- **Pinia** - State management
- **Axios** - HTTP client for GitHub API

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

The site is automatically deployed to GitHub Pages via GitHub Actions when you push to the `main` branch.

### Manual Deployment

1. Build the project: `npm run build`
2. The `dist/` folder contains the production build
3. GitHub Actions will automatically deploy it

## Custom Domain

The site uses a custom domain configured via the `CNAME` file:
- punitmishra.com
- www.punitmishra.com

## Project Structure

```
.
├── src/
│   ├── components/     # Vue components
│   ├── views/          # Page views
│   ├── router/         # Vue Router configuration
│   └── css/            # Styles
├── public/             # Static assets
├── index.html          # Entry point
├── vite.config.js     # Vite configuration
└── package.json        # Dependencies
```

## License

All rights reserved - Punit Mishra
