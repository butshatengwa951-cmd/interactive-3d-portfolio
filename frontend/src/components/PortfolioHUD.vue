<template>
  <div>
    <div class="absolute top-0 left-0 right-0 z-20 flex justify-between p-4 md:p-5 pointer-events-none">
      <div class="pointer-events-auto font-mono">
        <div class="flex items-center gap-3">
          <div class="h-2 w-2 bg-[#7cfaff] shadow-[0_0_10px_#7cfaff] animate-pulse"></div>
          <div class="leading-[1.2]">
            <div class="text-[11px] tracking-[0.22em] text-[#e8fdff] font-mono">NERVEGEAR v1.0</div>
            <div class="text-[9px] tracking-[0.18em] text-[#5a7a82] font-mono mt-0.5">ISOMETRIC PORTFOLIO • EST 2024 • BERLIN</div>
          </div>
        </div>
      </div>
      <div class="hidden md:flex pointer-events-auto items-center gap-5 font-mono text-[10px] tracking-widest">
        <span class="text-[#3a5a6a]">SYS.STATUS: <span class="text-[#7cfaff]">ONLINE</span></span>
        <span class="text-[#5a7a82] hover:text-white transition-colors cursor-pointer" @click="emit('action','ABOUT ME')">INDEX</span>
        <span class="text-[#5a7a82] hover:text-white transition-colors cursor-pointer" @click="emit('action','CONTACT')">CONTACT</span>
      </div>
    </div>
    <div class="absolute left-1/2 top-[11%] -translate-x-1/2 z-10 pointer-events-none hidden md:block">
      <div class="font-mono text-[9px] tracking-[0.35em] text-[#3a5a6a] text-center border border-[#0f2a33] bg-[#05080c]/60 px-3 py-1 backdrop-blur">
        └ CHIP MAP • CENTRAL IS PLAYER • DRAG TO EXPLORE • CLICK NODE ┘
      </div>
    </div>
    <div class="absolute bottom-0 left-0 right-0 z-20 flex flex-col md:flex-row justify-between items-start md:items-end gap-3 p-4 md:p-5">
      <div class="flex items-center gap-3 font-mono">
        <div class="flex border border-white/10 bg-black/40 backdrop-blur px-2 py-1">
          <button @click="setQuality('LOW')" :class="['px-2.5 py-1 text-[10px] tracking-widest transition-colors', quality==='LOW' ? 'bg-[#e8fdff] text-black' : 'text-[#5a7a82] hover:text-white']">LOW</button>
          <button @click="setQuality('HIGH')" :class="['px-2.5 py-1 text-[10px] tracking-widest transition-colors', quality==='HIGH' ? 'bg-[#e8fdff] text-black' : 'text-[#5a7a82] hover:text-white']">HIGH</button>
        </div>
        <div class="hidden md:block text-[10px] text-[#3a5a6a] tracking-widest">QUALITY • CHIP RENDER</div>
      </div>
      <div class="font-mono text-[10px] tracking-[0.18em] text-[#3a5a6a] text-center order-first md:order-none border border-[#0f2a33]/50 bg-[#05080c]/50 px-2.5 py-1 backdrop-blur">
        <span class="text-[#7a9aaa]">LMB</span> ROTATE • <span class="text-[#7a9aaa]">SCROLL</span> ZOOM • <span class="text-[#7a9aaa]">CLICK</span> NODE
      </div>
      <button @click="emit('action','CONTACT')" class="group flex items-center gap-3 border border-[#7cfaff]/30 bg-[#7cfaff]/[0.06] hover:bg-[#7cfaff]/[0.12] hover:border-[#7cfaff]/50 backdrop-blur px-4 py-2.5 transition-all">
        <span class="h-1.5 w-1.5 rounded-full bg-[#7cfaff] shadow-[0_0_8px_#7cfaff] animate-pulse"></span>
        <span class="font-mono text-[11px] tracking-[0.2em] text-[#7cfaff] group-hover:text-white">CONTACT ME</span>
        <span class="font-mono text-[11px] text-[#7cfaff]/60 group-hover:translate-x-0.5 transition-transform">↗</span>
      </button>
    </div>
    <div v-if="hovered" class="absolute left-1/2 bottom-[86px] -translate-x-1/2 z-20 pointer-events-none">
      <div class="font-mono text-[10px] tracking-widest text-[#7cfaff] bg-black/70 border border-[#7cfaff]/20 px-3 py-1.5 backdrop-blur">
        └ CLICK TO OPEN [{{ hovered }}] ┘
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
const emit = defineEmits(['update:modelValue', 'action'])
const props = defineProps({ modelValue: { type: String, default: 'HIGH' }, hovered: { type: String, default: null } })
const quality = ref(props.modelValue)
function setQuality(value) { quality.value = value; emit('update:modelValue', value) }
</script>
