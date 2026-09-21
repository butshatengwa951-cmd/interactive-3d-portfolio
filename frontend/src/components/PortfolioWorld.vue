<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as THREE from 'three'
import { createWorld } from '../composables/usePortfolioWorld'
import { nodes } from '../data/portfolio'

const canvas=ref(null), active=ref(null), hovered=ref(null), hint=ref('DRAG TO ROTATE • SCROLL TO ZOOM • CLICK A NODE')
let world, raf, clock, drag=false, lastX=0,lastY=0, yaw=.62, pitch=.62, radius=15, selected=null
const mouse=new THREE.Vector2(), ray=new THREE.Raycaster()
function setActive(n){active.value=n; hovered.value=n}
function down(e){drag=true;lastX=e.clientX;lastY=e.clientY;canvas.value.classList.add('dragging')}
function move(e){
 const r=canvas.value.getBoundingClientRect();mouse.x=((e.clientX-r.left)/r.width)*2-1;mouse.y=-((e.clientY-r.top)/r.height)*2+1
 ray.setFromCamera(mouse,world.camera); const hits=ray.intersectObjects(world.root.children,true); const hit=hits.find(x=>x.object.userData.node); hovered.value=hit?.object.userData.node||null
 if(drag){yaw-=(e.clientX-lastX)*.006;pitch-=(e.clientY-lastY)*.004;pitch=Math.max(.2,Math.min(1.35,pitch));lastX=e.clientX;lastY=e.clientY}
}
function up(e){if(drag&&Math.abs(e.clientX-lastX)<4&&Math.abs(e.clientY-lastY)<4){if(hovered.value)select(hovered.value)}drag=false;canvas.value.classList.remove('dragging')}
function wheel(e){radius=Math.max(8,Math.min(24,radius+e.deltaY*.012))}
function select(n){selected=n;active.value=n;hint.value=`OPEN ${n.label} • CLICK AGAIN OR PRESS ENTER`}
function key(e){if(e.key==='Escape'){selected=null;active.value=null} if((e.key==='Enter'||e.key===' ')&&hovered.value)select(hovered.value)}
onMounted(()=>{
 world=createWorld(canvas.value); clock=new THREE.Clock()
 nodes.forEach(n=>world.createNode(n));
 const center=[0,0,0]; nodes.forEach((n,i)=>{const next=nodes[(i+1)%nodes.length]; world.makeLine([n.position[0],.05,n.position[2]],[next.position[0],.05,next.position[2]])})
 world.resize(); window.addEventListener('resize',world.resize); canvas.value.addEventListener('pointerdown',down);canvas.value.addEventListener('pointermove',move);canvas.value.addEventListener('pointerup',up);canvas.value.addEventListener('pointercancel',up);canvas.value.addEventListener('wheel',wheel,{passive:true});window.addEventListener('keydown',key)
 const animate=()=>{raf=requestAnimationFrame(animate);const t=clock.getElapsedTime();world.nodes.forEach((n,i)=>{n.core.rotation.x=t*(.5+i*.03);n.core.rotation.y=t*(.7+i*.04);n.core.position.y=.35+Math.sin(t*1.7+i)*.07;const h=hovered.value?.id===n.data.id||selected?.id===n.data.id;n.ring.material.opacity=h?.98:.55;n.glow.intensity=h?4.5:1.8;n.group.scale.lerp(new THREE.Vector3(h?1.09:1,h?1.09:1,h?1.09:1),.08)});const cp=Math.cos(pitch);const target=new THREE.Vector3(0,0,0);world.camera.position.lerp(new THREE.Vector3(Math.sin(yaw)*cp*radius,Math.sin(pitch)*radius,Math.cos(yaw)*cp*radius),.08);world.camera.lookAt(target);world.renderer.render(world.scene,world.camera)};animate()
})
onBeforeUnmount(()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',world.resize);window.removeEventListener('keydown',key);world?.dispose()})
</script>
<template>
<section class="world-shell">
  <div class="topbar"><div class="brand"><span class="dot"></span> INTERACTIVE PORTFOLIO</div><div class="status">ONLINE <span></span></div></div>
  <div class="viewport"><canvas ref="canvas"></canvas><div class="crosshair">+</div><div class="instructions"><span>◉</span> {{ hint }}</div><div v-if="active" class="node-card"><div class="eyebrow">PORTFOLIO NODE</div><h2>{{active.label}}</h2><p>{{active.subtitle}}</p><button @click="select(active)">EXPLORE</button></div><div class="legend"><div><i></i> ACTIVE PATH</div><div><i></i> INTERACTIVE NODE</div></div></div>
  <footer><div>WASD <span>MOVE</span></div><div>MOUSE <span>CAMERA</span></div><div>SCROLL <span>ZOOM</span></div><div>CLICK <span>EXPLORE</span></div></footer>
</section>
</template>
<style scoped>
.world-shell{height:100vh;min-height:700px;background:#02070a;color:#dffcff;display:flex;flex-direction:column;overflow:hidden;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.topbar{height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;border-bottom:1px solid #123238;background:rgba(2,7,10,.92);z-index:4}.brand{font-size:11px;letter-spacing:.18em;font-weight:800}.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#73faff;box-shadow:0 0 12px #73faff;margin-right:9px}.status{font-size:9px;letter-spacing:.18em;color:#6f888d}.status span{display:inline-block;width:5px;height:5px;border-radius:50%;background:#65f5b5;margin-left:7px}.viewport{position:relative;flex:1;min-height:0}.viewport canvas{width:100%;height:100%;display:block;cursor:grab}.viewport canvas.dragging{cursor:grabbing}.crosshair{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:17px;color:#b8fbff;opacity:.5;pointer-events:none}.instructions{position:absolute;left:22px;bottom:25px;font-size:9px;letter-spacing:.15em;color:#719297}.instructions span{color:#78fbff;margin-right:6px}.node-card{position:absolute;right:25px;top:25px;width:230px;padding:18px;border:1px solid #28545b;background:rgba(3,10,13,.82);backdrop-filter:blur(12px);box-shadow:0 0 30px rgba(0,255,255,.05)}.eyebrow{font-size:8px;letter-spacing:.2em;color:#6e999e}.node-card h2{font-size:21px;margin:8px 0 4px;letter-spacing:.05em}.node-card p{font-size:9px;letter-spacing:.12em;color:#6f9398;margin:0 0 16px}.node-card button{background:#c9ffff;border:0;padding:8px 13px;font-size:9px;font-weight:900;letter-spacing:.12em;color:#031014;cursor:pointer}.legend{position:absolute;right:25px;bottom:25px;font-size:8px;line-height:2.1;letter-spacing:.12em;color:#55767b}.legend i{display:inline-block;width:8px;height:2px;background:#54e8ee;margin-right:6px}.legend div+div i{height:8px;width:8px;border-radius:50%;background:#b8a2ff}footer{height:38px;display:flex;gap:30px;align-items:center;padding:0 24px;border-top:1px solid #123238;color:#59757a;font-size:8px;letter-spacing:.15em}footer span{color:#8aa4a8;margin-left:5px}@media(max-width:700px){.node-card{width:190px}.legend{display:none}footer{gap:12px;overflow:hidden;white-space:nowrap}.topbar{padding:0 13px}}
</style>
