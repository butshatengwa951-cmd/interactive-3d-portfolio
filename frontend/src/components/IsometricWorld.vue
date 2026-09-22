
<template>
  <div ref="root" class="world">
    <canvas ref="canvas" class="canvas"></canvas>
    <div ref="labels" class="labels"></div>
    <div v-if="hovered" class="tooltip" :style="{left: tooltip.x + 'px', top: tooltip.y + 'px'}">
      └ CLICK TO OPEN [{{ hovered }}] ┘
    </div>
  </div>
</template>
<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
const emit = defineEmits(['open'])
const root = ref(null)
const canvas = ref(null)
const labels = ref(null)
const hovered = ref(null)
const tooltip = ref({ x: 0, y: 0 })
defineExpose({ triggerEnergyFlow })

onBeforeUnmount(() => cleanup?.())

let controls
let composer
let animationId
let cleanup

onMounted(()=>{
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x05080c)
  scene.fog = new THREE.Fog(0x05080c, 18, 36)

  const width = root.value?.clientWidth || window.innerWidth
  const height = root.value?.clientHeight || window.innerHeight
  const aspect = width / height
  const viewSize = 15
  const camera = new THREE.OrthographicCamera(
    -viewSize * aspect / 2, viewSize * aspect / 2,
    viewSize / 2, -viewSize / 2, 0.1, 100
  )
  camera.position.set(10,10,10)
  camera.lookAt(0,0,0)
  camera.zoom = 1.05
  camera.updateProjectionMatrix()

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas.value,
    antialias:true,
    alpha:false,
    powerPreference:'high-performance'
  })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0,0,0)
  controls.enableDamping = true
  controls.dampingFactor = 0.09
  controls.enablePan = false
  controls.minZoom = 0.7
  controls.maxZoom = 1.9
  controls.minPolarAngle = Math.PI * 0.22
  controls.maxPolarAngle = Math.PI * 0.42
  controls.minAzimuthAngle = -0.85
  controls.maxAzimuthAngle = 0.85
  controls.rotateSpeed = 0.55
  controls.update()

  // PCB floor texture
  const floorCanvas = document.createElement('canvas'); floorCanvas.width=1024; floorCanvas.height=1024
  const fctx = floorCanvas.getContext('2d')
  fctx.fillStyle='#05070a'; fctx.fillRect(0,0,1024,1024)
  fctx.strokeStyle='#0a151c'; fctx.lineWidth=1
  for(let i=0;i<1024;i+=48){ fctx.beginPath(); fctx.moveTo(i,0); fctx.lineTo(i,1024); fctx.stroke(); fctx.beginPath(); fctx.moveTo(0,i); fctx.lineTo(1024,i); fctx.stroke() }
  fctx.fillStyle='#0e2530'
  for(let x=0;x<1024;x+=48) for(let y=0;y<1024;y+=48){ fctx.beginPath(); fctx.arc(x,y,2,0,Math.PI*2); fctx.fill() }
  const floorTex = new THREE.CanvasTexture(floorCanvas); floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping; floorTex.repeat.set(4,4)
  const floorMat = new THREE.MeshBasicMaterial({ map: floorTex })
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(110,110), floorMat); floor.rotation.x=-Math.PI/2; floor.position.y=-0.15; scene.add(floor)

  // dot grid points
  const dots=[]; for(let x=-20;x<=20;x+=0.7) for(let z=-20;z<=20;z+=0.7) dots.push(x,0,z)
  const dotGeo = new THREE.BufferGeometry(); dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dots,3))
  scene.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({ color:0x122a36, size:0.04, transparent:true, opacity:0.6 })))

  scene.add(new THREE.AmbientLight(0x556677,1.1))
  const dir = new THREE.DirectionalLight(0x7afcff,0.9); dir.position.set(5,12,5); scene.add(dir)
  const rim = new THREE.DirectionalLight(0x0a2a3a,1); rim.position.set(-8,5,-8); scene.add(rim)

  const glowMat = new THREE.MeshStandardMaterial({ color:0x0a0a0f, emissive:0x0a1a20, emissiveIntensity:0.4 })
  const baseLineMat = new THREE.LineBasicMaterial({ color:0x253a45, transparent:true, opacity:0.55 })

  // Central white chip - YOU
  const centerGroup = new THREE.Group()
  const whiteChip = new THREE.Mesh(new THREE.BoxGeometry(1.3,0.16,1.3), new THREE.MeshStandardMaterial({ color:0xeaffff, emissive:0x7afcff, emissiveIntensity:1.2 }))
  whiteChip.position.y=0.16
  const innerChip = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.18,0.6), new THREE.MeshStandardMaterial({ color:0xffffff, emissive:0x7afcff, emissiveIntensity:1.8 }))
  innerChip.position.y=0.32
  // corner brackets around center
  const bracketGeo = new THREE.BoxGeometry(0.2,0.04,0.04)
  const bracketMat = new THREE.MeshBasicMaterial({ color:0x7afcff })
  const brackets=[]
  ;[[-0.8,-0.8],[0.8,-0.8],[-0.8,0.8],[0.8,0.8]].forEach(([x,z])=>{
    const b = new THREE.Mesh(bracketGeo, bracketMat); b.position.set(x,0.35,z); brackets.push(b)
  })
  // humanoid on center
  const human = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.14,0.45,4,8), new THREE.MeshStandardMaterial({ color:0x07070a, emissive:0x0a2230, emissiveIntensity:0.3 }))
  body.position.y=0.75
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.14,12,12), new THREE.MeshStandardMaterial({ color:0x0a0a0a, emissive:0x111111, emissiveIntensity:0.2 }))
  head.position.y=1.12
  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.04,0.25,3,6), new THREE.MeshStandardMaterial({ color:0x07070a })); armL.position.set(-0.18,0.75,0); armL.rotation.z=0.3
  const armR = new THREE.Mesh(new THREE.CapsuleGeometry(0.04,0.25,3,6), new THREE.MeshStandardMaterial({ color:0x07070a })); armR.position.set(0.18,0.75,0); armR.rotation.z=-0.3
  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.05,0.28,3,6), new THREE.MeshStandardMaterial({ color:0x07070a })); legL.position.set(-0.07,0.35,0)
  const legR = new THREE.Mesh(new THREE.CapsuleGeometry(0.05,0.28,3,6), new THREE.MeshStandardMaterial({ color:0x07070a })); legR.position.set(0.07,0.35,0)
  human.add(body, head, armL, armR, legL, legR)
  centerGroup.add(whiteChip, innerChip, human, ...brackets)
  scene.add(centerGroup)

  const nodes = [
    { id:'backstack', pos:[-6,0,-4], label:'BACKSTACK', model:'gate' },
    { id:'testimonials', pos:[-8,0,-1], label:'TESTIMONIALS', model:'dish' },
    { id:'experience', pos:[-6.5,0,4], label:'EXPERIENCE', model:'exp' },
    { id:'skills', pos:[-1.5,0,3.2], label:'SKILLS', model:'desk' },
    { id:'projects', pos:[-1,0,-5.5], label:'PROJECTS', model:'city' },
    { id:'contact', pos:[5,0,-3.5], label:'CONTACT', model:'dish' },
    { id:'resume', pos:[6,0,0], label:'RESUME', model:'desk2' },
    { id:'about', pos:[3.5,0,4.5], label:'ABOUT ME', model:'about' },
  ]

  const interactives=[]
  const nodeDataMap = new Map()

  nodes.forEach(n=>{
    const g = new THREE.Group(); g.position.set(...n.pos); g.userData.id=n.id
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(n.id==='PROJECTS'?1.35:1.18,(n.id==='PROJECTS'?1.35:1.18)*0.92,0.44,6), glowMat)
    // edge glow
    const edges = new THREE.EdgesGeometry(new THREE.CylinderGeometry(0.86,0.86,0.12,6))
    const edgeLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color:0x1a3a4a, transparent:true, opacity:0.6 })); edgeLine.position.y=0.01
    g.add(plat, edgeLine)

    if(n.model==='gate'){
      const gate = new THREE.Mesh(new THREE.BoxGeometry(1.1,1.4,0.18), new THREE.MeshStandardMaterial({ color:0x0e0e12, emissive:0x102030, emissiveIntensity:0.3 })); gate.position.y=0.8; g.add(gate)
      const door = new THREE.Mesh(new THREE.PlaneGeometry(0.5,0.85), new THREE.MeshBasicMaterial({ color:0x7afcff, side:THREE.DoubleSide, transparent:true, opacity:0.85 })); door.position.set(0,0.82,0.11); g.add(door)
    } else if(n.model==='dish'){
      const dish = new THREE.Mesh(new THREE.TorusGeometry(0.45,0.07,8,20,Math.PI), new THREE.MeshStandardMaterial({ color:0x1a1a1e })); dish.rotation.x=Math.PI/1.7; dish.position.y=0.75; g.add(dish)
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,0.5,8), glowMat); pole.position.y=0.4; g.add(pole)
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.22,0.08,12), new THREE.MeshStandardMaterial({ color:0x111 })); base.position.y=0.16; g.add(base)
    } else if(n.model==='city'){
      for(let i=0;i<6;i++){ const h=0.45+Math.random()*1.1; const b=new THREE.Mesh(new THREE.BoxGeometry(0.38, h, 0.38), new THREE.MeshStandardMaterial({ color:0x08080a })); b.position.set((i%3)*0.46-0.46, h/2+0.12, Math.floor(i/3)*0.46-0.23); if(i===2){ const win=new THREE.Mesh(new THREE.PlaneGeometry(0.12,0.12), new THREE.MeshBasicMaterial({ color:0x7afcff })); win.position.set(b.position.x, b.position.y, b.position.z+0.2); g.add(win) } g.add(b) }
    } else if(n.model==='exp'){
      const desk = new THREE.Mesh(new THREE.BoxGeometry(0.7,0.12,0.5), glowMat); desk.position.y=0.5; g.add(desk)
      const mon = new THREE.Mesh(new THREE.PlaneGeometry(0.35,0.22), new THREE.MeshBasicMaterial({ color:0x7afcff, side:THREE.DoubleSide })); mon.position.set(0,0.75,0); mon.rotation.y=0.2; g.add(mon)
      const fig = new THREE.Mesh(new THREE.CapsuleGeometry(0.09,0.25,3,6), new THREE.MeshStandardMaterial({ color:0x07070a })); fig.position.set(0.15,0.55,0.15); g.add(fig)
    } else {
      const desk = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.12,0.5), glowMat); desk.position.y=0.48; g.add(desk)
      const fig = new THREE.Mesh(new THREE.CapsuleGeometry(0.09,0.22,3,6), new THREE.MeshStandardMaterial({ color:0x07070a })); fig.position.set(0.1,0.52,0.18); g.add(fig)
      if(n.id==='skills' || n.id==='resume'){ const mon = new THREE.Mesh(new THREE.PlaneGeometry(0.3,0.2), new THREE.MeshBasicMaterial({ color:0x7afcff })); mon.position.set(0,0.7,0); g.add(mon) }
    }

    g.userData.baseY=0; g.userData.t=Math.random()*10; scene.add(g); interactives.push(g)

    // line with elbow
    const start = new THREE.Vector3(0,0.18,0)
    const elbow = new THREE.Vector3(n.pos[0]*0.35, 0.06, n.pos[2]*0.35)
    const end = new THREE.Vector3(...n.pos)
    const pts = [start, elbow, end]
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
    const line = new THREE.Line(lineGeo, baseLineMat.clone())
    scene.add(line)

    // store for energy flow
    const segLens = []; let total=0
    for(let i=0;i<pts.length-1;i++){ const l=pts[i].distanceTo(pts[i+1]); segLens.push(l); total+=l }
    nodeDataMap.set(n.id, { group:g, line, pts, segLens, totalLen: total, baseLineMat: line.material })

    // label sprite
    const c = document.createElement('canvas'); c.width=256; c.height=64
    const ctx = c.getContext('2d'); ctx.clearRect(0,0,256,64); ctx.fillStyle='#7fa3b3'; ctx.font='10px JetBrains Mono'; ctx.fillText('└ '+n.label+' ┘',10,32)
    const tex = new THREE.CanvasTexture(c)
    const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map:tex, transparent:true, opacity:0.9 })); spr.position.set(n.pos[0], 1.65, n.pos[2]); spr.scale.set(2.1,0.5,1); scene.add(spr)
  })

  // energy flow system
  let isAnimating=false
  function easeInOutCubic(x){ return x<0.5 ? 4*x*x*x : 1-Math.pow(-2*x+2,3)/2 }
  function triggerEnergyFlow(nodeId, onComplete){
    if(isAnimating) return; isAnimating=true
    const data = nodeDataMap.get(nodeId); if(!data){ isAnimating=false; onComplete(); return }
    const { pts, segLens, totalLen, line, group } = data

    // bright line overlay
    const brightMat = new THREE.LineBasicMaterial({ color:0x7afcff, transparent:true, opacity:1 })
    const brightLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), brightMat); scene.add(brightLine)

    // tracer
    const tracerGeo = new THREE.SphereGeometry(0.09,12,12)
    const tracerMat = new THREE.MeshBasicMaterial({ color:0xaaffff })
    const tracer = new THREE.Mesh(tracerGeo, tracerMat); scene.add(tracer)
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.05,10,10), new THREE.MeshBasicMaterial({ color:0xffffff })); tracer.add(core)
    const light = new THREE.PointLight(0x7afcff, 2, 3); tracer.add(light)

    // trail points
    const trail=[]
    const trailCount=6
    for(let i=0;i<trailCount;i++){ const s=new THREE.Mesh(new THREE.SphereGeometry(0.04-i*0.004,6,6), new THREE.MeshBasicMaterial({ color:0x7afcff, transparent:true, opacity:0.6-i*0.08 })); scene.add(s); trail.push(s) }

    const startTime = performance.now()
    const duration = 700

    function animateTracer(){
      const elapsed = performance.now()-startTime
      let t = Math.min(elapsed/duration,1)
      const eased = easeInOutCubic(t)
      const dist = eased*totalLen
      // find segment
      let acc=0, segIdx=0, segT=0
      for(let i=0;i<segLens.length;i++){ if(dist <= acc+segLens[i]){ segIdx=i; segT=(dist-acc)/segLens[i]; break } acc+=segLens[i] }
      if(segIdx>=pts.length-1){ segIdx=pts.length-2; segT=1 }
      const p0=pts[segIdx], p1=pts[segIdx+1]
      tracer.position.lerpVectors(p0,p1,segT)
      tracer.scale.setScalar(1+Math.sin(elapsed*0.02)*0.15)

      // trail follows
      for(let i=0;i<trail.length;i++){
        const tt = Math.max(0, t - (i+1)*0.07)
        const d2 = tt*totalLen
        let a2=0, s2=0, st2=0
        for(let j=0;j<segLens.length;j++){ if(d2 <= a2+segLens[j]){ s2=j; st2=(d2-a2)/segLens[j]; break } a2+=segLens[j] }
        if(s2<pts.length-1){ trail[i].position.lerpVectors(pts[s2], pts[s2+1], st2) }
      }

      if(t<1) requestAnimationFrame(animateTracer)
      else {
        // burst
        group.scale.set(1.15,1.15,1.15)
        const origEmissive = whiteChip ? whiteChip.material.emissiveIntensity : 0
        setTimeout(()=>{ group.scale.set(1,1,1); scene.remove(tracer); brightLine.material.opacity=0; trail.forEach(s=>scene.remove(s)); setTimeout(()=>{ scene.remove(brightLine); isAnimating=false; onComplete() }, 200) }, 180)
      }
    }
    animateTracer()
  }

  // interaction — reference-style hover, click and constrained orbit controls
  const ray = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  const labelEls = new Map()
  nodes.forEach(n => {
    const el = document.createElement('button')
    el.type = 'button'
    el.className = 'label-tag'
    el.innerHTML = '<span class="bracket">└</span> ' + n.label + ' <span class="bracket">┘</span>'
    el.addEventListener('click', () => {
      if (!isAnimating) triggerEnergyFlow(n.id, () => emit('open', n.id))
    })
    labels.value.appendChild(el)
    labelEls.set(n.id, el)
  })

  const updatePointer = (e) => {
    const rect = canvas.value.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    ray.setFromCamera(mouse, camera)
    const hits = ray.intersectObjects(interactives, true)

    if (!hits.length || isAnimating) {
      hovered.value = null
      canvas.value.style.cursor = isAnimating ? 'wait' : 'grab'
      return
    }

    let nodeId = null
    for (const hit of hits) {
      let o = hit.object
      while (o) {
        if (o.userData && o.userData.id) { nodeId = o.userData.id; break }
        o = o.parent
      }
      if (nodeId) break
    }

    hovered.value = nodeId
    canvas.value.style.cursor = nodeId ? 'pointer' : 'grab'
    if (nodeId) {
      const rr = root.value.getBoundingClientRect()
      tooltip.value = { x: e.clientX - rr.left, y: e.clientY - rr.top + 18 }
    }
  }

  const handleClick = () => {
    if (isAnimating) return
    ray.setFromCamera(mouse, camera)
    const hits = ray.intersectObjects(interactives, true)
    for (const hit of hits) {
      let o = hit.object
      while (o) {
        if (o.userData && o.userData.id) {
          triggerEnergyFlow(o.userData.id, () => emit('open', o.userData.id))
          return
        }
        o = o.parent
      }
    }
  }

  canvas.value.addEventListener('pointermove', updatePointer)
  canvas.value.addEventListener('click', handleClick)

  const clock=new THREE.Clock()
  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene,camera))
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(width,height),0.62,0.35,0.12))

  const projectLabels = () => {
    const v = new THREE.Vector3()
    nodes.forEach(n => {
      const g = nodeDataMap.get(n.id)?.group
      const el = labelEls.get(n.id)
      if (!g || !el) return
      g.getWorldPosition(v)
      v.y += 1
      if (n.id === 'PROJECTS') v.z -= 0.35
      v.project(camera)
      if (v.z > 1) { el.style.opacity = '0'; return }
      el.style.opacity = '1'
      el.style.left = ((v.x * 0.5 + 0.5) * width) + 'px'
      el.style.top = ((v.y * -0.5 + 0.5) * height) + 'px'
    })
  }

  const animate = () => {
    animationId = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()
    controls.update()
    interactives.forEach(g => {
      g.position.y = g.userData.baseY + Math.sin(t + g.userData.t) * 0.06
    })
    human.position.y = Math.sin(t * 1.2) * 0.04
    centerGroup.rotation.y += 0.0015
    projectLabels()
    composer.render()
  }
  animate()

  const onResize = () => {
    const w = root.value?.clientWidth || innerWidth
    const h = root.value?.clientHeight || innerHeight
    const asp = w / h
    camera.left = -viewSize * asp / 2
    camera.right = viewSize * asp / 2
    camera.top = viewSize / 2
    camera.bottom = -viewSize / 2
    camera.updateProjectionMatrix()
    renderer.setSize(w,h)
    composer.setSize(w,h)
  }
  window.addEventListener('resize', onResize)

  cleanup = () => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', onResize)
    canvas.value?.removeEventListener('pointermove', updatePointer)
    canvas.value?.removeEventListener('click', handleClick)
    controls?.dispose()
    composer?.dispose()
    renderer.dispose()
    labelEls.forEach(el => el.remove())
  }
})
</script>
<style>
.world{position:relative;width:100%;height:100svh;overflow:hidden;background:#05080c;user-select:none}
.canvas{width:100%;height:100%;display:block;cursor:grab}
.canvas:active{cursor:grabbing}
.labels{position:absolute;inset:0;z-index:10;pointer-events:none}
.label-tag{position:absolute;transform:translate(-50%,-100%);pointer-events:auto;border:0;background:transparent;padding:0;color:#7a9aaa;font:10px/1.2 'JetBrains Mono',monospace;letter-spacing:.12em;white-space:nowrap;cursor:pointer;text-shadow:0 0 10px rgba(124,250,255,.06)}
.label-tag:hover{color:#e8fdff}.label-tag .bracket{color:#3a5a6a}
.tooltip{position:absolute;z-index:20;transform:translate(-50%,0);padding:6px 10px;pointer-events:none;border:1px solid rgba(124,250,255,.2);background:rgba(0,0,0,.7);color:#7cfaff;font:10px/1.2 'JetBrains Mono',monospace;letter-spacing:.1em;backdrop-filter:blur(8px);white-space:nowrap}
</style>
