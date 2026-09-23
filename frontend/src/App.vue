<template>
  <div class="relative w-full h-[100svh] bg-[#05080c] overflow-hidden select-none">
    <IsometricWorld
      ref="scene"
      :quality="quality"
      @open="openSection"
      @hover="hovered = $event"
    />

    <div class="pointer-events-none absolute inset-0 z-[2] opacity-[0.035] mix-blend-overlay"
         :style="{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/ %3E%3C/svg%3E")' }"></div>
    <div class="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,transparent_52%,rgba(0,0,0,0.62)_100%)]"></div>
    <div class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#05080c]/10 via-transparent to-[#05080c]/70"></div>
    <div class="pointer-events-none absolute inset-0 z-[1] opacity-40"
         style="background:radial-gradient(900px 500px at 50% 45%,rgba(124,250,255,0.07),transparent 60%)"></div>

    <PortfolioHUD v-model="quality" :hovered="hovered" @action="activateNode" />

    <PortfolioModal
      :open="!!active"
      :title="titles[active] || active"
      @close="closeSection"
    >
      <ModalContent :section="active" />
    </PortfolioModal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import IsometricWorld from './components/IsometricWorld.vue'
import PortfolioHUD from './components/PortfolioHUD.vue'
import PortfolioModal from './components/PortfolioModal.vue'
import ModalContent from './views/ModalContent.vue'

const scene = ref(null)
const quality = ref('HIGH')
const hovered = ref(null)
const active = ref(null)

const titles = {
  'ABOUT ME': 'ABOUT ME // HUMAN NODE',
  PROJECTS: 'PROJECTS [06]',
  SKILLS: 'SKILLS // CHIP CORE',
  EXPERIENCE: 'EXPERIENCE',
  RESUME: 'RESUME',
  CONTACT: 'CONTACT',
  BACKSTACK: 'BACKSTACK',
  TESTIMONIALS: 'TESTIMONIALS'
}

function activateNode(id) {
  scene.value?.triggerEnergyFlow?.(id)
}

function openSection(id) {
  active.value = id
}

function closeSection() {
  active.value = null
}
</script>
