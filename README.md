# Interactive Weekly To-Do Dashboard

A production-ready, interactive, and self-saving Weekly, Monthly, and Yearly To-Do List web application with 4 customizable color themes, real-time progress analytics, Pomodoro focus timer, drag-and-drop task reordering, and CSV/HTML export capabilities.

![Interactive Weekly To-Do Dashboard](public/favicon.svg)

---

## ✨ Features

- **Multi-Horizon Task Management**: Weekly daily columns (Monday through Sunday), monthly goal planning, and yearly milestone tracking.
- **Visual Analytics**: Interactive daily completion rings, weekly progress percentage bars, and 4-week historical trend charts (powered by Recharts).
- **Themes & Dark Mode**: 4 aesthetic color palettes (*Terracotta*, *Candy Pastel*, *Lavender Mist*, *Soft Neutral*) with automatic dark/light mode detection and manual toggle.
- **Focus & Productivity**:
  - Integrated Pomodoro focus timer (25 min focus, 5 min short break) with sound cues.
  - Multi-level undo/redo history (`Ctrl+Z` / `Ctrl+Y`).
  - Native drag-and-drop task reordering between days using `@dnd-kit`.
  - Recurrence engine (`@daily`, `@weekly`, `#monthly`) that auto-regenerates completed recurring tasks.
  - Optional Web Audio completion bell with mute toggle.
- **Offline & Self-Saving**: Instant `localStorage` auto-persistence with graceful corrupted-data recovery and built-in ErrorBoundary.
- **Export & Backup**: One-click CSV spreadsheet export and standalone offline HTML export.
- **PWA & Production Ready**: Web app manifest, SEO Open Graph / Twitter meta tags, responsive typography, and cross-platform SPA routing support.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or higher (v22+ recommended)
- **npm**: v10 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/gouvkimsea/To-do-list-.git
cd To-do-list-

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```

Starts the local development server at `http://localhost:3000`.

### Running Tests

```bash
npm test
```

Runs the test suite (68 unit tests) covering state management, audio synthesis, fullscreen APIs, Pomodoro logic, recurring tasks, undo/redo, and CSV exports.

### Typecheck & Linting

```bash
npm run lint
```

### Production Build

```bash
npm run build
```

Performs TypeScript validation (`tsc --noEmit`) and compiles optimized static assets into the `dist/` directory with code splitting (`vendor-react`, `vendor-charts`, `vendor-dnd`).

### Preview Production Build

```bash
npm run preview
```

Serves the built `dist/` bundle locally for verification.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Type System**: [TypeScript](https://www.typescriptlang.org/)
- **Drag & Drop**: [@dnd-kit](https://dndkit.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Motion](https://motion.dev/) & [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 🚢 Production Deployment

### 1. Vercel
The repository includes a preconfigured [`vercel.json`](file:///d:/learn/To%20do%20list/vercel.json) with client-side rewrites, security headers, and asset caching rules:
```bash
npx vercel deploy
```

### 2. Netlify / Cloudflare Pages
The repository includes [`public/_redirects`](file:///d:/learn/To%20do%20list/public/_redirects) for instant client-side route fallback:
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 3. Docker
A multi-stage [`Dockerfile`](file:///d:/learn/To%20do%20list/Dockerfile) and [`nginx.conf`](file:///d:/learn/To%20do%20list/nginx.conf) are provided:
```bash
# Build Docker image
docker build -t interactive-todo:latest .

# Run container
docker run -p 8080:80 interactive-todo:latest
```

---

## 📁 Project Structure

```
├── .github/workflows/       # GitHub Actions CI workflow
├── public/
│   ├── favicon.svg          # Vector favicon & application icon
│   ├── manifest.webmanifest # PWA Web App Manifest
│   ├── robots.txt           # Search crawler directives
│   ├── sitemap.xml          # XML sitemap for SEO
│   └── _redirects           # Netlify SPA redirect rules
├── src/
│   ├── components/          # Reusable UI components (Dashboard, Pomodoro, Modals, etc.)
│   ├── hooks/               # Custom hooks (useUndoRedo)
│   ├── pages/               # Section views & marketing pages
│   ├── utils/               # Pure business logic, unit tests & audio helpers
│   ├── App.tsx              # Root state provider and route coordinator
│   ├── main.tsx             # DOM mount & ErrorBoundary wrapper
│   └── index.css            # Tailwind theme tokens & custom utilities
├── Dockerfile               # Production multi-stage Docker build
├── nginx.conf               # Nginx server configuration with gzip & headers
├── package.json             # NPM package scripts and dependencies
├── tsconfig.json            # Strict TypeScript configuration
├── vercel.json              # Vercel deployment configuration
└── vite.config.ts           # Vite bundler configuration & manual chunks
```

---

## 📄 License

Apache-2.0

