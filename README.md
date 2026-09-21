# Interactive 3D Portfolio

A Vue 3 + Three.js interactive portfolio presented as a futuristic 3D world with glowing nodes, connected paths, floating points, interactive camera controls, and portfolio sections represented as explorable nodes.

## Structure

```text
interactive-3d-portfolio/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── PortfolioWorld.vue
│   │   ├── composables/
│   │   │   └── usePortfolioWorld.js
│   │   ├── data/
│   │   │   └── portfolio.js
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.vue
│   │   └── main.js
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   └── server.js
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Stack

- Frontend: Vue 3, Vite, Three.js, CSS
- Backend: Node.js, Express, CORS

## Install

From the repository root:

```bash
npm install
```

## Run both

```bash
npm run dev
```

Frontend development server:

```bash
npm run dev:frontend
```

Backend development server:

```bash
npm run dev:backend
```

The backend exposes `GET /api/health` on port 3001 by default.

## Build frontend

```bash
npm run build
```

## Next development steps

1. Replace procedural nodes with imported GLB/GLTF models.
2. Add the controllable humanoid character.
3. Turn each node into a separate portfolio scene/room.
4. Add cinematic camera transitions between nodes.
5. Add project cards and live project previews.
6. Connect portfolio/contact data to the backend API.
7. Add post-processing bloom and particles.
8. Add mobile joystick/touch controls.
