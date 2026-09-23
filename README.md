# Isometric 3D Portfolio

A clean rebuild of the portfolio around the supplied demo as the source of truth.

## Structure

frontend/
- index.html — minimal Vite entry
- src/demo.js — extracted demo application bundle
- src/style.css — demo styling
- src/external-links.js — external-link handling
- vite.config.js — Vite configuration
- package.json — frontend dependencies

The previous Vue scene/component stack has been removed from the active application path. The supplied demo remains the visual and interaction backbone.

## Run

```bash
cd frontend
npm install
npm run dev
```

Build with `npm run build`.
