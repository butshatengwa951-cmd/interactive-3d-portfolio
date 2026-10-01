# Interactive 3D Portfolio — Vue

A from-scratch Vue 3 + Three.js implementation based on the visual architecture of the supplied
`Isometric-3d-Portfolio-Three.html` demo.

## Included

- Orthographic isometric camera
- Constrained OrbitControls rotation and zoom
- Procedural motherboard/circuit-board floor
- Central chip + stylized human assembly
- Eight custom portfolio nodes
- Custom geometry for each node
- Routed PCB-style connection lines
- Cyan additive glow
- UnrealBloom post-processing
- HTML labels projected from 3D positions
- Raycaster hover detection
- Animated energy travelling from the center to a node
- Node click panels
- Floating node animation
- Shadows, tone mapping and responsive resizing

## Run

```bash
npm install
npm run dev
```

Then open the Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Main files

- `src/App.vue` — complete Three.js scene and Vue UI
- `src/style.css` — visual overlay, labels and panel styling
- `src/main.js` — Vue entry point
