<template>
  <div ref="root" class="world">
    <canvas ref="canvas"></canvas>
    <div ref="labels" class="labels"></div>
    <div class="noise"></div>
    <div class="vignette"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, defineExpose } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

const emit = defineEmits(['open', 'hover'])
const props = defineProps({ quality: { type: String, default: 'HIGH' } })

const root = ref(null)
const canvas = ref(null)
const labels = ref(null)

let renderer, scene, camera, controls, composer, raf = 0
let raycaster, pointer
let cleanup = () => {}
let triggerEnergyFlow = () => {}
let hoveredId = null

const NODE_LAYOUT = [
  { id: 'BACKSTACK', pos: [-6, -4], scale: .95 },
  { id: 'TESTIMONIALS', pos: [-8, -1], scale: .92 },
  { id: 'EXPERIENCE', pos: [-6.5, 4], scale: 1 },
  { id: 'SKILLS', pos: [-1.5, 3], scale: 1 },
  { id: 'PROJECTS', pos: [-1, -5.5], scale: 1.05 },
  { id: 'CONTACT', pos: [5, -3.5], scale: .92 },
  { id: 'RESUME', pos: [6, 0], scale: .95 },
  { id: 'ABOUT ME', pos: [3.5, 4.5], scale: 1 }
]

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, ...extra })
}

function glowPlane(geometry, y = 0, opacity = .18) {
  const m = new THREE.MeshBasicMaterial({
    color: 0x7cfaff, transparent: true, opacity,
    depthTest: false, blending: THREE.AdditiveBlending
  })
  const mesh = new THREE.Mesh(geometry, m)
  mesh.position.y = y
  return mesh
}

function makePlate(size = 1.18, height = .44) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(size, size * .92, height, 6),
    mat(0x080a0f, { roughness: .92, metalness: .06 })
  )
  body.position.y = -height / 2
  body.castShadow = body.receiveShadow = true
  g.add(body)

  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(size * .985, size * .985, .012, 6),
    mat(0x0c1a1e, { emissive: 0x7cfaff, emissiveIntensity: 1.15, roughness: .4 })
  )
  top.position.y = .002
  g.add(top)

  g.add(glowPlane(new THREE.CircleGeometry(size * 1.2, 24), -height - .73, .55))
  return g
}

function makeHuman(scale = 1) {
  const g = new THREE.Group()
  g.scale.setScalar(scale)

  const dark = mat(0x080808, { roughness: .85, metalness: .08, emissive: 0x0a2a33, emissiveIntensity: .22 })
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.11, .28, 4, 8), dark)
  body.position.y = .36
  body.userData.breathe = true
  g.add(body)

  const head = new THREE.Mesh(new THREE.SphereGeometry(.105, 14, 14), dark)
  head.position.y = .68
  g.add(head)

  const arm = new THREE.Mesh(new THREE.CapsuleGeometry(.032, .18, 4, 6), dark)
  const left = arm.clone(); left.position.set(-.16, .38, 0); left.rotation.z = -.25
  const right = arm.clone(); right.position.set(.16, .38, 0); right.rotation.z = .25
  g.add(left, right)

  const leg = new THREE.Mesh(new THREE.CapsuleGeometry(.038, .22, 4, 6), dark)
  const l = leg.clone(); l.position.set(-.07, .14, 0)
  const r = leg.clone(); r.position.set(.07, .14, 0)
  g.add(l, r)

  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(.018, .018, .018, 6),
    new THREE.MeshBasicMaterial({ color: 0x7cfaff, transparent: true, opacity: .8 })
  )
  ring.position.set(0, .72, .05)
  g.add(ring)
  g.userData.breathe = true
  return g
}

function addNodeModel(group, id, scale) {
  group.add(makePlate(id === 'PROJECTS' ? 1.35 : 1.18, .44))

  const dark = mat(0x080a0f, { roughness: .9, metalness: .06 })
  const black = mat(0x080808, { roughness: .85, metalness: .08, emissive: 0x0a2a33, emissiveIntensity: .22 })
  const cyan = mat(0x0c1a1e, { emissive: 0x7cfaff, emissiveIntensity: 1.15, roughness: .4 })

  if (id === 'PROJECTS') {
    const buildings = [
      [-.5, .25, -.4, .7], [.1, .32, -.5, .9], [.55, .28, -.2, .6],
      [-.35, .22, .3, .55], [.25, .38, .35, 1], [.65, .2, .55, .45]
    ]
    buildings.forEach((v, i) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(.32, v[3], .32), dark)
      b.position.set(v[0], v[3] / 2 + .02, v[2])
      b.castShadow = true
      group.add(b)
      group.add(glowPlane(new THREE.BoxGeometry(.32, .01, .32), v[3] + .03, .15))
      if (i === 1) {
        const sign = glowPlane(new THREE.BoxGeometry(.22, .14, .012), v[3] + .04, .55)
        sign.position.z += .17
        sign.rotation.x = -.35
        group.add(sign)
      }
    })
    const tower = new THREE.Mesh(new THREE.BoxGeometry(.12, .9, .12), dark)
    tower.position.set(-.8, .46, .7); group.add(tower)
    const towerGlow = new THREE.PointLight(0x7cfaff, .35, 1.2)
    towerGlow.position.set(-.8, .92, .7); group.add(towerGlow)
  } else if (id === 'BACKSTACK') {
    const box = new THREE.Mesh(new THREE.BoxGeometry(.56, .72, .42), dark)
    box.position.y = .38
    box.castShadow = true
    group.add(box)
    group.add(glowPlane(new THREE.BoxGeometry(.56, .72, .42), .38, .22))
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .5, 8), dark)
    mast.position.set(.32, .45, .12); mast.rotation.z = .6
    group.add(mast)
  }
  } else if (id === 'TESTIMONIALS' || id === 'CONTACT') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .48, 8), dark)
    pole.position.y = .24
    group.add(pole)
    const dish = new THREE.Mesh(
      new THREE.SphereGeometry(.34, 16, 16, 0, Math.PI * 2, 0, Math.PI * .52),
      mat(0x0e141a, { roughness: .55, metalness: .18 })
    )
    dish.position.y = .53
    dish.rotation.x = Math.PI * .22
    dish.rotation.z = id === 'CONTACT' ? -.32 : .28
    group.add(dish)
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.34, .014, 6, 20), cyan)
    rim.position.copy(dish.position); rim.rotation.copy(dish.rotation)
    group.add(rim)
    const box = new THREE.Mesh(new THREE.BoxGeometry(.2, .11, .16), dark)
    box.position.set(.14, .08, .13)
    group.add(box)
  } else if (id === 'EXPERIENCE' || id === 'SKILLS' || id === 'ABOUT ME') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(.78, .05, .46), dark)
    base.position.y = .26; base.castShadow = true; group.add(base)
    ;[-.28, .28].forEach(x => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(.05, .26, .05), dark)
      leg.position.set(x, .13, -.12); group.add(leg)
    })
    if (id === 'SKILLS' || id === 'EXPERIENCE') {
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(id === 'SKILLS' ? .46 : .52, .32, .04),
        dark
      )
      screen.position.set(0, .54 + (id === 'EXPERIENCE' ? .04 : 0), -.1)
      screen.rotation.x = -.08
      group.add(screen)
      group.add(glowPlane(new THREE.BoxGeometry(id === 'SKILLS' ? .38 : .44, id === 'SKILLS' ? .22 : .26, .008),
        id === 'SKILLS' ? .55 : .59, id === 'SKILLS' ? .62 : .45))
    } else {
      const screen = new THREE.Mesh(new THREE.BoxGeometry(.36, .24, .04), dark)
      screen.position.set(-.05, .5, -.08); screen.rotation.x = -.06
      group.add(screen)
    }
    const chair = new THREE.Mesh(new THREE.CapsuleGeometry(.095, .18, 4, 8), mat(0x12141c))
    chair.position.set(0, .19, .32); group.add(chair)
    const person = makeHuman(.62); person.position.set(0, .18, .28); group.add(person)
  } else if (id === 'RESUME') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(.84, .05, .54), dark)
    base.position.y = .3; group.add(base)
    const paper = new THREE.Mesh(new THREE.BoxGeometry(.34, .24, .04), dark)
    paper.position.set(-.04, .56, -.09); group.add(paper)
    group.add(glowPlane(new THREE.BoxGeometry(.27, .17, .008), .57, .88))
    const chair = new THREE.Mesh(new THREE.CapsuleGeometry(.085, .16, 4, 8), dark)
    chair.position.set(.09, .2, .33); group.add(chair)
  }
  group.scale.setScalar(scale)
}

function createFloor() {
  const c = document.createElement('canvas')
  c.width = c.height = 1024
  const x = c.getContext('2d')
  x.fillStyle = '#05080c'
  x.fillRect(0, 0, 1024, 1024)

  x.strokeStyle = '#0a1318'
  x.lineWidth = 1
  for (let i = 0; i < 1024; i += 64) {
    x.globalAlpha = .55
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1024); x.stroke()
    x.beginPath(); x.moveTo(0, i); x.lineTo(1024, i); x.stroke()
  }

  x.strokeStyle = '#081219'
  x.lineWidth = .5
  for (let i = 0; i < 1024; i += 16) {
    x.globalAlpha = .18
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1024); x.stroke()
    x.beginPath(); x.moveTo(0, i); x.lineTo(1024, i); x.stroke()
  }

  x.strokeStyle = '#0a1f26'
  for (let i = 0; i < 140; i++) {
    const a = Math.random() * 1024
    const b = Math.random() * 1024
    const o = 40 + Math.random() * 120
    const horizontal = Math.random() > .5
    x.globalAlpha = .22 + Math.random() * .18
    x.lineWidth = 1
    x.beginPath()
    x.moveTo(a, b)
    if (horizontal) {
      x.lineTo(a + o, b)
      x.lineTo(a + o, b + (Math.random() > .5 ? o * .6 : -o * .6))
    } else {
      x.lineTo(a, b + o)
      x.lineTo(a + (Math.random() > .5 ? o * .6 : -o * .6), b + o)
    }
    x.stroke()
    x.fillStyle = '#0f2a33'
    x.globalAlpha = .7
    x.fillRect(a - 1.5, b - 1.5, 3, 3)
  }

  x.fillStyle = '#0f2a33'
  for (let i = 8; i < 1024; i += 32) {
    for (let j = 8; j < 1024; j += 32) {
      if (Math.random() > .75) {
        x.globalAlpha = .55 + Math.random() * .3
        x.beginPath()
        x.arc(i + (Math.random() - .5) * 2, j + (Math.random() - .5) * 2, 1.2, 0, Math.PI * 2)
        x.fill()
      }
    }
  }

  x.globalAlpha = .04
  for (let i = 0; i < 8000; i++) {
    const px = Math.random() * 1024
    const py = Math.random() * 1024
    x.fillStyle = Math.random() > .5 ? '#7cfaff' : '#ffffff'
    x.fillRect(px, py, .8, .8)
  }

  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2.5, 2.5)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(110, 110),
    new THREE.MeshStandardMaterial({ map: tex, color: 0x05080c, roughness: .95, metalness: .05 })
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -.88
  floor.receiveShadow = true
  return floor
}

function addCentralChip() {
  const centralGroup = new THREE.Group()
  centralGroup.userData.isCentralChip = true

  const white = mat(0xeaffff, { emissive: 0x7afcff, emissiveIntensity: 1.2, roughness: .22, metalness: .05 })
  const white2 = mat(0xf8ffff, { emissive: 0x7cfaff, emissiveIntensity: .9, roughness: .2 })

  const chip = new THREE.Mesh(new THREE.BoxGeometry(1.2, .15, 1.2), white)
  chip.position.y = .075; chip.castShadow = chip.receiveShadow = true
  centralGroup.add(chip, glowPlane(new THREE.BoxGeometry(1.2, .012, 1.2), .075, .85))

  const core = new THREE.Mesh(new THREE.BoxGeometry(.6, .08, .6), white2)
  core.position.y = .19; core.castShadow = true
  centralGroup.add(core, glowPlane(new THREE.BoxGeometry(.6, .01, .6), .19, .6))

  const halo = glowPlane(new THREE.CircleGeometry(.725, 24), .2, .14)
  centralGroup.add(halo)
  centralGroup.add(glowPlane(new THREE.CircleGeometry(1.1, 24), .18, .06))

  const human = makeHuman(1.15)
  human.position.set(0, .19, .05)
  human.userData.isCentralHuman = true
  centralGroup.add(human)

  const light = new THREE.PointLight(0xeaffff, 1.2, 3.5)
  light.position.set(0, .9, 0)
  centralGroup.add(light)

  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(.31, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .45 })
  )
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.6
  centralGroup.add(shadow)

  scene.add(centralGroup)
  return centralGroup
}

function projectLabel(node, element) {
  const p = new THREE.Vector3(node.pos[0], .95, node.pos[1])
  if (node.id === 'PROJECTS') p.z -= .35
  p.project(camera)
  const w = root.value.clientWidth, h = root.value.clientHeight
  const x = (p.x * .5 + .5) * w
  const y = (-p.y * .5 + .5) * h
  element.style.transform = `translate(${x}px,${y}px) translate(-50%,-100%)`
  element.style.opacity = p.z < 1 ? '1' : '0'
}

function makeLabel(node, data) {
  const el = document.createElement('div')
  el.className = 'label-tag'
  el.dataset.id = node.id
  el.innerHTML = '<span class="bracket">└ </span>' + node.id + '<span class="bracket"> ┘</span>'
  el.addEventListener('mouseenter', () => setHover(node.id))
  el.addEventListener('mouseleave', () => setHover(null))
  el.addEventListener('click', e => { e.stopPropagation(); triggerEnergyFlow(node.id) })
  labels.value.appendChild(el)
  data.label = el
  return el
}

function setHover(id) {
  hoveredId = id
  labels.value?.querySelectorAll('.label-tag').forEach(el => el.classList.toggle('hovered', el.dataset.id === id))
  emit('hover', id)
  if (renderer) renderer.domElement.style.cursor = id ? 'pointer' : 'grab'
}

function createPath(node) {
  const a = new THREE.Vector3(0, .06, 0)
  const x = node.pos[0], z = node.pos[1]
  let p = 0, o = 0
  if (node.id === 'PROJECTS') p = x, o = -2.2
  else if (node.id === 'BACKSTACK') p = x, o = -2.2
  else if (node.id === 'TESTIMONIALS') p = -4.2, o = z
  else if (node.id === 'EXPERIENCE') p = -3, o = z
  else if (node.id === 'SKILLS') p = x, o = 1.2
  else if (node.id === 'ABOUT ME') p = 1.8, o = z
  else if (node.id === 'RESUME') p = 2.8, o = z
  else if (node.id === 'CONTACT') p = x, o = -1.5
  else Math.abs(x) > Math.abs(z) ? (p = 0, o = z) : (p = x, o = 0)
  const b = new THREE.Vector3(p, .06, o)
  const c = new THREE.Vector3(x, .06, z)
  return [a, b, c]
}

function animateEnergy(data) {
  const pts = data.points
  const lengths = []
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) {
    const l = pts[i].distanceTo(pts[i + 1]); lengths.push(l); total += l
  }

  const bright = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(pts),
    new THREE.LineBasicMaterial({ color: 0x7cfaff, transparent: true, opacity: 1 })
  )
  scene.add(bright)

  const tracer = new THREE.Mesh(
    new THREE.SphereGeometry(.09, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xaaffff })
  )
  tracer.add(new THREE.PointLight(0x7cfaff, 2, 3))
  scene.add(tracer)

  const start = performance.now(), duration = 850
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  function tick() {
    const raw = Math.min((performance.now() - start) / duration, 1)
    const dist = ease(raw) * total
    let acc = 0, index = 0, local = 0
    for (; index < lengths.length; index++) {
      if (dist <= acc + lengths[index]) { local = (dist - acc) / lengths[index]; break }
      acc += lengths[index]
    }
    index = Math.min(index, pts.length - 2)
    tracer.position.lerpVectors(pts[index], pts[index + 1], local)

    if (raw < 1) requestAnimationFrame(tick)
    else {
      data.group.scale.setScalar(data.originalScale * 1.12)
      setTimeout(() => {
        data.group.scale.setScalar(data.originalScale)
        scene.remove(tracer); scene.remove(bright)
        bright.geometry.dispose(); bright.material.dispose()
        tracer.geometry.dispose(); tracer.material.dispose()
        data.animating = false
        controls.enabled = true
        emit('open', data.id)
      }, 180)
    }
  }
  tick()
}

function setupInteraction(nodeMap) {
  raycaster = new THREE.Raycaster()
  pointer = new THREE.Vector2()

  const move = e => {
    const r = renderer.domElement.getBoundingClientRect()
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1
    pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.intersectObjects([...nodeMap.values()].map(x => x.group), true)[0]
    let id = null
    if (hit) {
      let o = hit.object
      while (o && !o.userData.id) o = o.parent
      id = o?.userData.id || null
    }
    setHover(id)
  }

  const click = e => {
    if (hoveredId) triggerEnergyFlow(hoveredId)
  }

  renderer.domElement.addEventListener('pointermove', move)
  renderer.domElement.addEventListener('click', click)
  return () => {
    renderer.domElement.removeEventListener('pointermove', move)
    renderer.domElement.removeEventListener('click', click)
  }
}

onMounted(() => {
  const el = root.value
  const width = el.clientWidth
  const height = el.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#05080c')
  scene.fog = new THREE.Fog('#05080c', 18, 36)

  camera = new THREE.OrthographicCamera(-7.5, 7.5, 7.5, -7.5, .1, 100)
  camera.position.set(10, 10, 10)
  camera.lookAt(0, 0, 0)
  camera.zoom = 1.05
  camera.updateProjectionMatrix()

  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(props.quality === 'HIGH' ? Math.min(devicePixelRatio, 2) : 1)
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1

  controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0)
  controls.enableDamping = true
  controls.dampingFactor = .09
  controls.enablePan = false
  controls.minZoom = .7
  controls.maxZoom = 1.9
  controls.minPolarAngle = Math.PI * .22
  controls.maxPolarAngle = Math.PI * .42
  controls.minAzimuthAngle = -.85
  controls.maxAzimuthAngle = .85
  controls.rotateSpeed = .55
  controls.update()

  scene.add(new THREE.AmbientLight(0xffffff, .42))

  const key = new THREE.DirectionalLight(0xcfefff, 1.1)
  key.position.set(6, 14, 4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = .5
  key.shadow.camera.far = 40
  key.shadow.camera.left = -14; key.shadow.camera.right = 14
  key.shadow.camera.top = 14; key.shadow.camera.bottom = -14
  scene.add(key)

  const centerLight = new THREE.PointLight(0x7cfaff, 2.2, 12)
  centerLight.position.set(0, 2, 0); scene.add(centerLight)
  const sideLight = new THREE.PointLight(0x7cfaff, 1, 10)
  sideLight.position.set(5.5, 1.2, 5.2); scene.add(sideLight)

  scene.add(createFloor())

  const count = 96 * 96
  const positions = new Float32Array(count * 3)
  let k = 0
  for (let z = -48; z < 48; z++) for (let x = -48; x < 48; x++) {
    positions[k++] = x * .62 + (Math.random() - .5) * .06
    positions[k++] = -.86
    positions[k++] = z * .62 + (Math.random() - .5) * .06
  }
  const dotGeo = new THREE.BufferGeometry()
  dotGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  scene.add(new THREE.Points(dotGeo, new THREE.PointsMaterial({ color: 0x0f2a33, size: .042, sizeAttenuation: true, transparent: true, opacity: .62 })))
  scene.add(new THREE.Points(dotGeo.clone(), new THREE.PointsMaterial({ color: 0x7cfaff, size: .06, sizeAttenuation: true, transparent: true, opacity: .08, blending: THREE.AdditiveBlending })))

  const central = addCentralChip()
  const nodeMap = new Map()
  const baseLine = new THREE.LineBasicMaterial({ color: 0x17333e, transparent: true, opacity: .55 })

  NODE_LAYOUT.forEach(node => {
    const group = new THREE.Group()
    group.position.set(node.pos[0], 0, node.pos[1])
    group.userData.id = node.id
    group.userData.baseY = 0
    group.userData.floatOffset = Math.random() * Math.PI * 2
    group.userData.breathe = true
    addNodeModel(group, node.id, node.scale)

    const end = new THREE.Vector3(node.pos[0], 0, node.pos[1])
    const points = createPath(node)
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), baseLine.clone())
    scene.add(line)
    scene.add(group)

    const data = {
      id: node.id, group, line, points,
      originalScale: node.scale,
      animating: false,
      label: null
    }
    group.userData.nodeData = data
    nodeMap.set(node.id, data)
    makeLabel(node, data)
  })

  triggerEnergyFlow = id => {
    const data = nodeMap.get(id)
    if (!data || data.animating) return
    data.animating = true
    controls.enabled = false
    animateEnergy(data)
  }

  const interactionCleanup = setupInteraction(nodeMap)

  const onResize = () => {
    const w = el.clientWidth, h = el.clientHeight
    const aspect = w / h, size = 15
    camera.left = -size * aspect / 2
    camera.right = size * aspect / 2
    camera.top = size / 2
    camera.bottom = -size / 2
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
    composer?.setSize(w, h)
  }

  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), .62, .35, .12)
  composer.addPass(bloom)

  const clock = new THREE.Clock()
  const animate = () => {
    raf = requestAnimationFrame(animate)
    const t = clock.getElapsedTime()
    controls.update()

    nodeMap.forEach(data => {
      const g = data.group
      g.position.y = g.userData.baseY + Math.sin(t * .6 + g.userData.floatOffset) * .06
      g.traverse(child => {
        if (child.userData?.breathe) child.scale.y = 1 + Math.sin(t * 1.6 + g.userData.floatOffset) * .035
      })
    })

    central.traverse(child => {
      if (child.userData?.isCentralHuman) {
        child.position.y = .24 + Math.sin(t * 1.5) * .025
        child.scale.y = 1 + Math.sin(t * 1.6) * .03
      }
    })
    if (!nodeMap.values().some(d => d.animating)) central.position.y = Math.sin(t * .5) * .04

    nodeMap.forEach(data => projectLabel({ pos: data.group.position }, data.label))
    composer.render()
  }
  animate()

  window.addEventListener('resize', onResize)
  cleanup = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    interactionCleanup()
    labels.value?.replaceChildren()
    scene.traverse(o => {
      if (o.geometry) o.geometry.dispose()
      if (o.material) {
        const materials = Array.isArray(o.material) ? o.material : [o.material]
        materials.forEach(m => { m.map?.dispose(); m.dispose() })
      }
    })
    composer?.dispose()
    controls?.dispose()
    renderer?.dispose()
  }
})

watch(() => props.quality, value => {
  if (renderer) renderer.setPixelRatio(value === 'HIGH' ? Math.min(devicePixelRatio, 2) : 1)
})

defineExpose({ triggerEnergyFlow: id => triggerEnergyFlow(id) })

onBeforeUnmount(() => {
  cleanup()
  triggerEnergyFlow = () => {}
})
</script>

<style scoped>
.world {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background: #05080c;
  user-select: none;
}
.world canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  cursor: grab;
}
.world canvas:active { cursor: grabbing; }
.labels {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
}
.label-tag {
  position: absolute;
  left: 0;
  top: 0;
  pointer-events: auto;
  cursor: pointer;
  font-family: "Geist Mono", ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: .18em;
  color: #7a9aaa;
  background: rgba(5,8,12,.78);
  border: 1px solid rgba(15,42,51,.9);
  padding: 4px 8px;
  backdrop-filter: blur(6px);
  transition: all .2s ease;
  white-space: nowrap;
  line-height: 1;
  box-shadow: 0 0 0 1px rgba(0,0,0,.6) inset;
}
.label-tag .bracket { color: #3a5a6a; }
.label-tag:hover,
.label-tag.hovered {
  color: #e8fdff;
  border-color: rgba(124,250,255,.65);
  background: rgba(124,250,255,.10);
  box-shadow: 0 0 18px rgba(124,250,255,.28), 0 0 0 1px rgba(124,250,255,.15) inset;
  transform: translate(-50%,-100%) scale(1.06) !important;
}
.label-tag:hover .bracket,
.label-tag.hovered .bracket { color: #7cfaff; }
.noise {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 2;
  opacity: .035;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.vignette {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 3;
  background: radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,.62) 100%);
}
</style>
