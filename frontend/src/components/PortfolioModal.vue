<template>
  <div v-if="open" class="absolute inset-0 z-50 flex items-center justify-center p-4 md:p-8">
    <div class="absolute inset-0 bg-[#05080c]/88 backdrop-blur-[14px]" @click="emit('close')"></div>
    <div class="relative w-full max-w-[720px] max-h-[84vh] flex flex-col border border-white/10 bg-[#080a0f]/95 shadow-[0_0_0_1px_rgba(124,250,255,0.14),0_20px_80px_rgba(0,0,0,0.85),0_0_80px_rgba(124,250,255,0.09)] overflow-hidden animate-[in_.35s_cubic-bezier(0.16,1,0.3,1)]">
      <div class="flex items-center justify-between border-b border-white/10 px-5 md:px-7 py-4 bg-[#0a0e14]/80">
        <div class="flex items-center gap-3">
          <div class="h-2 w-2 bg-[#7cfaff] shadow-[0_0_10px_#7cfaff]"></div>
          <div class="font-mono text-[12px] tracking-[0.22em] text-white">└ {{ title }} ┘</div>
          <div class="hidden md:block h-[1px] w-12 bg-gradient-to-r from-[#7cfaff]/50 to-transparent ml-2"></div>
        </div>
        <button @click="emit('close')" class="font-mono text-[11px] tracking-widest text-[#5a7a82] hover:text-white border border-white/10 hover:border-white/20 px-2.5 py-1 transition-colors">CLOSE [ESC]</button>
      </div>
      <div class="overflow-y-auto px-5 md:px-7 py-6 md:py-8 custom-scrollbar"><slot /></div>
      <div class="h-[2px] w-full bg-gradient-to-r from-[#7cfaff] via-[#e8fdff]/50 to-transparent opacity-60"></div>
    </div>
  </div>
</template>
<script setup>
defineProps({ open: Boolean, title: { type: String, default: '' } })
const emit = defineEmits(['close'])
</script>
