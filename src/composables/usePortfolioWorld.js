import * as THREE from 'three'

export function createWorld(canvas, onNodeHover, onNodeSelect) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap
  const scene=new THREE.Scene(); scene.background=new THREE.Color(0x02070a)
  scene.fog=new THREE.FogExp2(0x02070a,0.045)
  const camera=new THREE.PerspectiveCamera(52,1,.1,100); camera.position.set(8,9,12)
  const root=new THREE.Group(); scene.add(root)
  const ambient=new THREE.HemisphereLight(0x83c8d4,0x030507,1.05); scene.add(ambient)
  const key=new THREE.DirectionalLight(0xffffff,2.0); key.position.set(4,10,5); key.castShadow=true; scene.add(key)
  const cyan=new THREE.PointLight(0x55f8ff,12,18); cyan.position.set(0,2,0); scene.add(cyan)
  const purple=new THREE.PointLight(0x816cff,8,15); purple.position.set(-6,2,-5); scene.add(purple)

  const floorMat=new THREE.MeshStandardMaterial({color:0x071014,roughness:.82,metalness:.25})
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(40,40),floorMat); floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; root.add(floor)

  const grid=new THREE.GridHelper(34,34,0x1c555c,0x0c2c31); grid.material.transparent=true; grid.material.opacity=.48; grid.position.y=.012; root.add(grid)
  const grid2=new THREE.GridHelper(34,17,0x1a4a50,0x082125); grid2.material.transparent=true; grid2.material.opacity=.28; grid2.position.y=.014; root.add(grid2)

  const starsGeo=new THREE.BufferGeometry(), starCount=700, pos=new Float32Array(starCount*3)
  for(let i=0;i<starCount;i++){pos[i*3]=(Math.random()-.5)*34;pos[i*3+1]=Math.random()*12+.3;pos[i*3+2]=(Math.random()-.5)*30}
  starsGeo.setAttribute('position',new THREE.BufferAttribute(pos,3)); const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x7bcbd3,size:.035,transparent:true,opacity:.75})); scene.add(stars)

  const nodes=[]; const connections=[]
  const lineMat=new THREE.LineBasicMaterial({color:0x28545a,transparent:true,opacity:.7})
  function makeLine(a,b,highlight=false){ const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a),new THREE.Vector3(...b)]); const m=highlight?new THREE.LineBasicMaterial({color:0x7efcff,transparent:true,opacity:.95}):lineMat; const l=new THREE.Line(g,m);l.position.y=.035;root.add(l);return l }

  function createNode(data){
    const g=new THREE.Group(); g.position.set(...data.position); g.userData=data
    const plate=new THREE.Mesh(new THREE.BoxGeometry(2.35,.055,1.35),new THREE.MeshStandardMaterial({color:0x0a171b,roughness:.42,metalness:.5,emissive:data.color,emissiveIntensity:.025})); plate.receiveShadow=true; g.add(plate)
    const ring=new THREE.Mesh(new THREE.RingGeometry(.52,.57,48),new THREE.MeshBasicMaterial({color:data.color,transparent:true,opacity:.7,side:THREE.DoubleSide})); ring.rotation.x=-Math.PI/2; ring.position.y=.07; g.add(ring)
    const core=new THREE.Mesh(new THREE.OctahedronGeometry(.22,0),new THREE.MeshStandardMaterial({color:0xd9ffff,emissive:data.color,emissiveIntensity:2.3,roughness:.2,metalness:.65})); core.position.y=.35; core.castShadow=true; g.add(core)
    const glow=new THREE.PointLight(data.color,1.8,3.8); glow.position.y=.35; g.add(glow)
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.8,8),new THREE.MeshBasicMaterial({color:data.color,transparent:true,opacity:.65})); beam.position.y=.75; g.add(beam)
    g.traverse(o=>{if(o.isMesh)o.userData.node=data}); root.add(g); nodes.push({group:g,data,ring,core,glow}); return g
  }
  return {renderer,scene,camera,root,nodes,connections,makeLine,createNode,resize(){const r=canvas.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix()},dispose(){renderer.dispose()}}
}
