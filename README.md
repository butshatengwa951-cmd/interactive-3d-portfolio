# Interactive 3D Portfolio

A Vue 3 + Three.js portfolio concept inspired by the supplied futuristic portfolio reference: dark spatial environment, glowing cyan/purple nodes, connected paths, floating points, interactive camera and portfolio sections represented as explorable nodes.

## Stack
- Vue 3
- Vite
- Three.js
- Plain CSS

## Run
```bash
npm install
npm run dev
```
Then open the Vite URL shown in the terminal.

## Build
```bash
npm run build
npm run preview
```

## Folder structure
```text
interactive-3d-portfolio/
├── public/
│   └── assets/
├── src/
│   ├── components/
│   │   └── PortfolioWorld.vue
│   ├── composables/
│   │   └── usePortfolioWorld.js
│   ├── data/
│   │   └── portfolio.js
│   ├── styles/
│   │   └── global.css
│   ├── App.vue
│   └── main.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Next development steps
1. Replace procedural nodes with imported GLB/GLTF models.
2. Add a real controllable humanoid character.
3. Turn each node into a separate portfolio scene/room.
4. Add cinematic camera transitions between nodes.
5. Add project cards and live project previews.
6. Add post-processing bloom and particles.
7. Add mobile joystick/touch controls.
