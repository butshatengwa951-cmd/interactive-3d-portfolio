<template>
  <div v-if="section === 'ABOUT ME'">
    <p class="text-[13px] leading-[1.7] text-[#a0c0c8] font-mono">
      I'm the human on the chip. Product-focused creative developer building immersive web worlds that feel like premium game maps — not portfolios.<br><br>
      Current stack: Three.js, R3F, GLSL, Next.js. Obsessed with 1px details, soft shadows, and that motherboard trace feeling.<br><br>
      Based in Berlin — available for freelance & full-time.
    </p>
    <div class="mt-6 grid grid-cols-2 gap-3">
      <div class="border border-[#7cfaff]/20 bg-[#080a0f] p-3"><div class="text-[10px] text-[#5a7a82] font-mono">LOCATION</div><div class="text-[12px] text-white font-mono mt-1">Berlin, DE</div></div>
      <div class="border border-[#7cfaff]/20 bg-[#080a0f] p-3"><div class="text-[10px] text-[#5a7a82] font-mono">FOCUS</div><div class="text-[12px] text-white font-mono mt-1">Three.js / UI / Chip Design</div></div>
    </div>
  </div>
  <div v-else-if="section === 'PROJECTS'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <div v-for="p in projects" :key="p.n" class="group border border-white/10 hover:border-[#7cfaff]/50 bg-[#0e1216] p-4 transition-colors">
      <div class="flex justify-between"><div class="text-[11px] font-mono text-white tracking-widest">{{p.n}}</div><div class="text-[10px] font-mono text-[#5a7a82]">{{p.y}}</div></div>
      <div class="text-[11px] font-mono text-[#7a9aaa] mt-2">{{p.d}}</div>
      <div class="mt-3 h-[1px] w-full bg-gradient-to-r from-[#7cfaff]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  </div>
  <div v-else-if="section === 'SKILLS'" class="space-y-6">
    <div v-for="group in skills" :key="group.k">
      <div class="text-[10px] font-mono tracking-[0.2em] text-[#7cfaff] mb-3">└ {{group.k}} ┘</div>
      <div class="flex flex-wrap gap-2"><span v-for="s in group.v" :key="s" class="px-2.5 py-1 border border-white/10 bg-white/[0.03] text-[11px] font-mono text-zinc-300">{{s}}</span></div>
    </div>
  </div>
  <div v-else-if="section === 'EXPERIENCE'" class="space-y-5 font-mono">
    <div v-for="e in experience" :key="e.role" class="flex gap-4 border-l border-[#7cfaff]/30 pl-4 py-1"><div class="flex-1"><div class="text-[12px] text-white">{{e.role}}</div><div class="text-[11px] text-[#5a7a82] mt-1">{{e.desc}}</div></div><div class="text-[10px] text-[#7cfaff]/70 whitespace-nowrap">{{e.time}}</div></div>
  </div>
  <div v-else-if="section === 'RESUME'" class="font-mono">
    <p class="text-[12px] text-[#7a9aaa]">Clean one-pager, chip-stamped PDF. Monitor glow edition.</p>
    <div class="mt-5 flex gap-3"><button class="px-4 py-2 bg-[#e8fdff] text-black text-[11px] tracking-widest hover:bg-white transition-colors">DOWNLOAD PDF</button><button class="px-4 py-2 border border-white/15 text-white text-[11px] tracking-widest hover:border-[#7cfaff]/50 transition-colors">VIEW ONLINE</button></div>
    <div class="mt-8 p-4 bg-[#080a0f] border border-white/10 text-[10px] leading-6 text-[#5a7a82]">EDUCATION — B.Sc. Media Informatics, TU Berlin — 2015-2019<br>AWARDS — Awwwards SOTD x2, FWA x1<br>LANGS — EN / DE / ES</div>
  </div>
  <div v-else-if="section === 'CONTACT'" class="font-mono space-y-4">
    <p class="text-[12px] text-[#a0c0c8]">Let's build something weird and precise. Best via email — response &lt; 24h.</p>
    <div class="space-y-2 mt-4"><div v-for="c in contacts" :key="c.label" class="flex justify-between border border-white/10 bg-[#080a0f] p-3"><span class="text-[10px] text-[#5a7a82]">{{c.label}}</span><span :class="['text-[12px]', c.accent ? 'text-[#7cfaff]' : 'text-white']">{{c.value}}</span></div></div>
  </div>
  <div v-else-if="section === 'BACKSTACK'" class="font-mono">
    <p class="text-[12px] text-[#7a9aaa]">Tools, infra, and things that power the front — minimal, fast, reliable.</p>
    <div class="mt-6 grid grid-cols-2 gap-2"><div v-for="s in backstack" :key="s" class="text-[11px] border border-white/5 bg-white/[0.02] p-2.5 text-zinc-300">{{s}}</div></div>
  </div>
  <div v-else-if="section === 'TESTIMONIALS'" class="space-y-4 font-mono">
    <div v-for="t in testimonials" :key="t.q" class="border-l-2 border-[#7cfaff]/30 pl-4 py-2 bg-[#080a0f]/60"><div class="text-[12px] text-zinc-200 italic">"{{t.q}}"</div><div class="text-[10px] text-[#5a7a82] mt-2">{{t.a}}</div></div>
  </div>
</template>
<script setup>
defineProps({ section: { type: String, default: '' } })
const projects=[{n:'NEON GRID',d:'Isometric city builder',y:'2024'},{n:'VOID ATLAS',d:'WebGL data viz for climate',y:'2024'},{n:'LUMEN OS',d:'Design system + 3D docs',y:'2023'},{n:'DRIFT LABS',d:'E-commerce with physics',y:'2023'},{n:'SIGNAL FM',d:'Audio reactive portfolio',y:'2022'},{n:'ORTHO',d:'Figma plugin for iso export',y:'2022'}]
const skills=[{k:'FRONTEND',v:['Three.js','React','Next.js','TypeScript','WebGL','GLSL']},{k:'3D / MOTION',v:['Blender','R3F','Framer Motion','GSAP','Spline']},{k:'TOOLING',v:['Figma','Vercel','Git','ShaderToy','Node']}]
const experience=[{role:'Senior Frontend @ LUMEN',time:'2022 — NOW',desc:'Led 3D web platform, +240% engagement'},{role:'Creative Dev @ DRIFT',time:'2020 — 2022',desc:'Built WebGL commerce experiences'},{role:'UI Engineer @ SIGNAL',time:'2019 — 2020',desc:'Design system, React + Motion'}]
const contacts=[{label:'EMAIL',value:'hello@portfolio.is',accent:true},{label:'X / TWITTER',value:'@isometric_dev'},{label:'GITHUB',value:'/isometric'}]
const backstack=['Next.js 14','Vercel Edge','Supabase','Drizzle ORM','Turso','Cloudflare R2','Resend','Upstash']
const testimonials=[{q:'The only dev who made 3D feel like product, not gimmick.',a:'— PM @ LUMEN'},{q:'Shipped our WebGL drop in 3 weeks. Unreal.',a:'— Founder @ DRIFT'},{q:'Attention to 1px and 1ms. Rare combo.',a:'— Design Lead @ SIGNAL'}]
</script>
