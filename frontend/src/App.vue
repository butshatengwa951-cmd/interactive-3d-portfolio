<template>
<main class="portfolio">
<canvas ref="canvas" class="scene"></canvas><div ref="labels" class="labels"></div>
<div class="hud"><div class="brand"><i></i> INTERACTIVE PORTFOLIO</div><div>DRAG TO ROTATE · SCROLL TO ZOOM</div></div>
<Transition name="panel"><section v-if="selected" class="info-panel"><button @click="selected=null">×</button><small>SYSTEM NODE</small><h1>{{selected.title}}</h1><p>{{selected.description}}</p><hr><span>{{selected.meta}}</span></section></Transition>
<div class="vignette"></div><div class="grain"></div>
</main>
</template>

<script setup>
import {ref,onMounted,onBeforeUnmount} from "vue";
import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer.js";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass.js";
import {UnrealBloomPass} from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const canvas=ref(),labels=ref(),selected=ref();
let scene,camera,renderer,controls,composer,raycaster,mouse,clock,raf;
const C="#7cfaff", W="#eaffff";
const nodes=[
{id:"BACKSTACK",p:[-6,-4],s:.95,meta:"Architecture · APIs · Systems",description:"Backend, infrastructure, services and data flow behind the portfolio."},
{id:"TESTIMONIALS",p:[-8,-1],s:.92,meta:"Feedback · Collaboration",description:"Feedback and collaboration highlights from people and teams."},
{id:"EXPERIENCE",p:[-6.5,4],s:1,meta:"Journey · Practice",description:"Practical experience, technical growth and projects that shaped the work."},
{id:"SKILLS",p:[-1.5,3],s:1,meta:"Vue · JavaScript · Three.js",description:"Technologies and capabilities used to build interactive experiences."},
{id:"PROJECTS",p:[-1,-5.5],s:1.05,meta:"Selected work",description:"Applications, experiments and portfolio pieces built across technologies."},
{id:"CONTACT",p:[5,-3.5],s:.92,meta:"Start a conversation",description:"Reach out for collaboration, development work, ideas or opportunities."},
{id:"RESUME",p:[6,0],s:.95,meta:"Experience · Education",description:"Experience, education, technologies and professional development."},
{id:"ABOUT ME",p:[3.5,4.5],s:1,meta:"Profile · Story",description:"The person behind the interface, background, interests and goals."}
];
const groups=new Map(), lines=new Map(), labelEls=new Map();
const meshMat=(color,em=color)=>new THREE.MeshStandardMaterial({color,roughness:.48,metalness:.62,emissive:em,emissiveIntensity:.1});
const glow=(opacity=.3)=>new THREE.MeshBasicMaterial({color:C,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false});
const shadow=g=>{const m=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:"#000",transparent:true,opacity:.5,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.y=-.76;return m};

function boardTexture(){
 const c=document.createElement("canvas");c.width=c.height=1024;const x=c.getContext("2d");
 x.fillStyle="#05080c";x.fillRect(0,0,1024,1024);
 for(let n=0;n<=1024;n+=64){x.strokeStyle="rgba(38,91,110,.32)";x.lineWidth=1;x.beginPath();x.moveTo(n,0);x.lineTo(n,1024);x.moveTo(0,n);x.lineTo(1024,n);x.stroke()}
 for(let n=0;n<=1024;n+=16){x.strokeStyle="rgba(25,65,82,.14)";x.beginPath();x.moveTo(n,0);x.lineTo(n,1024);x.moveTo(0,n);x.lineTo(1024,n);x.stroke()}
 for(let i=0;i<150;i++){let a=Math.random()*1024,b=Math.floor(Math.random()*64)*16,cx=a>512?a-80:a+80;x.strokeStyle="rgba(47,143,169,.25)";x.lineWidth=2;x.beginPath();x.moveTo(a,b);x.lineTo(cx,b);x.lineTo(cx,b+(Math.random()>.5?48:-48));x.stroke();x.fillStyle="rgba(89,226,255,.45)";x.fillRect(cx-2,b-2,4,4)}
 return new THREE.CanvasTexture(c);
}
function createBoard(){
 const m=new THREE.Mesh(new THREE.PlaneGeometry(110,110),new THREE.MeshStandardMaterial({map:boardTexture(),color:"#05080c",roughness:.95,metalness:.05}));
 m.rotation.x=-Math.PI/2;m.position.y=-.88;m.receiveShadow=true;scene.add(m);
}
function base(){
 const g=new THREE.Group(),b=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.08,.44,6),meshMat("#0d151c","#061018"));
 b.position.y=-.22;b.castShadow=b.receiveShadow=true;g.add(b);
 const t=new THREE.Mesh(new THREE.CylinderGeometry(1.16,1.16,.012,6),glow(.32));t.position.y=.01;g.add(t);g.add(shadow(new THREE.CircleGeometry(1.42,24)));return g;
}
function details(g,id){
 const dark=meshMat("#10171d","#061018");
 if(id==="PROJECTS"){for(let i=0;i<6;i++){let h=.45+Math.random()*.55,m=new THREE.Mesh(new THREE.BoxGeometry(.32,h,.32),dark);m.position.set(-.6+(i%3)*.55,h/2,.1+Math.floor(i/3)*.5);m.castShadow=true;g.add(m)}}
 else if(id==="BACKSTACK"){let b=new THREE.Mesh(new THREE.BoxGeometry(.62,.7,.46),dark);b.position.y=.35;g.add(b);let a=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.55,8),dark);a.position.set(.35,.48,.1);a.rotation.z=.55;g.add(a)}
 else if(["TESTIMONIALS","CONTACT"].includes(id)){let p=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.5,8),dark);p.position.y=.25;g.add(p);let d=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12,0,Math.PI*2,0,Math.PI*.52),dark);d.position.y=.54;d.rotation.z=id==="CONTACT"?-.3:.3;g.add(d);let r=new THREE.Mesh(new THREE.TorusGeometry(.34,.014,6,20),glow(.42));r.position.copy(d.position);r.rotation.copy(d.rotation);g.add(r)}
 else if(["EXPERIENCE","SKILLS","ABOUT ME"].includes(id)){let s=new THREE.Mesh(new THREE.BoxGeometry(.8,.05,.48),dark);s.position.y=.28;g.add(s);[-.28,.28].forEach(x=>{let q=new THREE.Mesh(new THREE.BoxGeometry(.05,.28,.05),dark);q.position.set(x,.14,-.1);g.add(q)});let screen=new THREE.Mesh(new THREE.BoxGeometry(.52,.32,.04),dark);screen.position.set(0,.55,-.1);g.add(screen);let gl=new THREE.Mesh(new THREE.PlaneGeometry(.44,.24),glow(.5));gl.position.set(0,.55,-.075);g.add(gl)}
 else if(id==="RESUME"){let stand=new THREE.Mesh(new THREE.BoxGeometry(.72,.12,.48),dark);stand.position.y=.08;g.add(stand);let paper=new THREE.Mesh(new THREE.BoxGeometry(.5,.7,.05),dark);paper.position.set(0,.43,0);paper.rotation.x=-.08;g.add(paper);let page=new THREE.Mesh(new THREE.PlaneGeometry(.4,.58),glow(.48));page.position.set(0,.43,.035);page.rotation.x=-.08;g.add(page)}
 const l=new THREE.PointLight(C,.28,1.5);l.position.set(0,.7,.1);g.add(l);
}
function human(){const g=new THREE.Group(),m=meshMat("#d8f8f8","#284c50");let b=new THREE.Mesh(new THREE.CylinderGeometry(.11,.28,.4,8),m);b.position.y=.36;g.add(b);let h=new THREE.Mesh(new THREE.SphereGeometry(.105,14,14),m);h.position.y=.68;g.add(h);for(const x of[-.07,.07]){let l=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.22,6),m);l.position.set(x,.14,0);g.add(l)}for(const x of[-.16,.16]){let a=new THREE.Mesh(new THREE.CylinderGeometry(.032,.032,.18,6),m);a.position.set(x,.38,0);a.rotation.z=x<0?-.25:.25;g.add(a)}let c=new THREE.Mesh(new THREE.SphereGeometry(.02,8,8),glow(.8));c.position.set(0,.72,.08);g.add(c);return g}
function central(){
 const g=new THREE.Group();let a=new THREE.Mesh(new THREE.BoxGeometry(1.2,.15,1.2),meshMat("#0b1117","#071a22"));a.position.y=-.08;g.add(a);let b=new THREE.Mesh(new THREE.BoxGeometry(.6,.08,.6),meshMat("#101a20","#0a2228"));b.position.y=.02;g.add(b);
 for(const r of[1.45,2.2]){let q=new THREE.Mesh(new THREE.RingGeometry(r-.015,r,.04,64),glow(.16));q.rotation.x=-Math.PI/2;q.position.y=.03;g.add(q)}const h=human();h.position.y=.18;h.scale.setScalar(1.15);g.add(h);scene.add(g);return [g,h]}
function createNodes(){
 nodes.forEach(n=>{const g=base();g.userData.id=n.id;g.position.set(n.p[0],0,n.p[1]);g.scale.setScalar(n.s);details(g,n.id);groups.set(n.id,g);scene.add(g);const e=document.createElement("div");e.className="node-label";e.textContent=n.id;e.dataset.id=n.id;labels.value.appendChild(e);labelEls.set(n.id,e)})
}
function route(n){
 const x=n.p[0],z=n.p[1],e=new THREE.Vector3();
 if(n.id==="PROJECTS"||n.id==="BACKSTACK")e.set(x*.55,0,-2.2);
 else if(n.id==="TESTIMONIALS")e.set(-4.2,0,z*.45);
 else if(n.id==="EXPERIENCE")e.set(-3,0,2);
 else if(n.id==="SKILLS")e.set(x*.4,0,1.2);
 else if(n.id==="ABOUT ME")e.set(1.8,0,z*.45);
 else if(n.id==="RESUME")e.set(2.8,0,0);
 else e.set(x*.5,0,-1.5);
 return [new THREE.Vector3(0,.06,0),e,new THREE.Vector3(x,0,z)]
}
function connections(){
 nodes.forEach(n=>{const p=route(n),geo=new THREE.BufferGeometry().setFromPoints(p),lm=new THREE.LineBasicMaterial({color:"#123c54",transparent:true,opacity:.9}),gm=new THREE.LineBasicMaterial({color:C,transparent:true,opacity:.28,blending:THREE.AdditiveBlending});
 const line=new THREE.Line(geo,lm),gl=new THREE.Line(geo,gm);scene.add(line,gl);let dot=new THREE.Mesh(new THREE.SphereGeometry(.07,8,8),new THREE.MeshBasicMaterial({color:"#3a9ab2"}));dot.position.copy(p[2]);scene.add(dot);
 lines.set(n.id,{points:p,lineMat:lm,glowMat:gm,dot})})}
function findId(o){while(o){if(o.userData?.id)return o.userData.id;o=o.parent}return null}
function hover(id){groups.forEach((g,k)=>{g.scale.setScalar(nodes.find(n=>n.id===k).s*(k===id?1.07:1));labelEls.get(k)?.classList.toggle("hovered",k===id)})}
function pointer(e){const r=renderer.domElement.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*2-1;mouse.y=-(e.clientY-r.top)/r.height*2+1;raycaster.setFromCamera(mouse,camera);const objs=[];groups.forEach(g=>g.traverse(o=>o.isMesh&&objs.push(o)));hover((raycaster.intersectObjects(objs,false)[0]&&findId(raycaster.intersectObjects(objs,false)[0].object))||null)}
function click(){const r=renderer.domElement.getBoundingClientRect();raycaster.setFromCamera(mouse,camera);const objs=[];groups.forEach(g=>g.traverse(o=>o.isMesh&&objs.push(o)));const h=raycaster.intersectObjects(objs,false)[0];if(h){const id=findId(h.object);activate(id)}}
function activate(id){selected.value=nodes.find(n=>n.id===id);const d=lines.get(id);if(!d)return;const p=new THREE.Mesh(new THREE.SphereGeometry(.1,12,12),new THREE.MeshBasicMaterial({color:C}));const light=new THREE.PointLight(C,4,2);p.add(light);scene.add(p);let start=performance.now();const dur=700;function step(now){let t=Math.min((now-start)/dur,1),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;let pts=d.points,seg0=pts[0].distanceTo(pts[1]),total=seg0+pts[1].distanceTo(pts[2]),dist=e*total,pos=dist<seg0?new THREE.Vector3().lerpVectors(pts[0],pts[1],dist/seg0):new THREE.Vector3().lerpVectors(pts[1],pts[2],(dist-seg0)/(total-seg0));p.position.set(pos.x,pos.y+.08,pos.z);if(t<1)requestAnimationFrame(step);else scene.remove(p)}requestAnimationFrame(step)}
function updateLabels(){const v=new THREE.Vector3();nodes.forEach(n=>{const e=labelEls.get(n.id);const g=groups.get(n.id);v.copy(g.position).project(camera);e.style.transform=`translate3d(${(v.x*.5+.5)*innerWidth}px,${(-v.y*.5+.5)*innerHeight}px,0)`;e.style.opacity=v.z<1?"1":"0"})}
function resize(){const w=innerWidth,h=innerHeight,a=w/h,f=15;camera.left=-f*a/2;camera.right=f*a/2;camera.top=f/2;camera.bottom=-f/2;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(w,h,false);composer.setSize(w,h)}
function animate(){raf=requestAnimationFrame(animate);let t=clock.getElapsedTime();groups.forEach(g=>g.position.y=Math.sin(t*.6+g.position.x*.2)*.06);if(window._human)window._human.position.y=.18+Math.sin(t*1.5)*.025;updateLabels();controls.update();composer.render()}
function init(){
 scene=new THREE.Scene();scene.background=new THREE.Color("#030609");const a=innerWidth/innerHeight,f=15;
 camera=new THREE.OrthographicCamera(-f*a/2,f*a/2,f/2,-f/2,.1,100);camera.position.set(10,10,10);camera.lookAt(0,0,0);camera.zoom=1.05;camera.updateProjectionMatrix();
 renderer=new THREE.WebGLRenderer({canvas:canvas.value,antialias:true,powerPreference:"high-performance"});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight,false);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
 controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.09;controls.enablePan=false;controls.minZoom=.7;controls.maxZoom=1.9;controls.minPolarAngle=Math.PI*.22;controls.maxPolarAngle=Math.PI*.42;controls.minAzimuthAngle=-.85;controls.maxAzimuthAngle=.85;controls.rotateSpeed=.55;
 scene.add(new THREE.AmbientLight("#fff",.42));let sun=new THREE.DirectionalLight("#cfefff",1.1);sun.position.set(6,14,4);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);scene.add(sun);let pl=new THREE.PointLight(C,2.2,12);pl.position.set(0,1,0);scene.add(pl);
 composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.62,.35,.12));raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();clock=new THREE.Clock();
 createBoard();const [cg,h]=central();window._human=h;centralGroup=cg;createNodes();connections();renderer.domElement.addEventListener("pointermove",pointer);renderer.domElement.addEventListener("click",click);addEventListener("resize",resize);animate()
}
onMounted(init);onBeforeUnmount(()=>{cancelAnimationFrame(raf);removeEventListener("resize",resize);renderer?.dispose()});
</script>