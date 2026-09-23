<template>
  <div class="relative w-full h-[100svh] bg-[#05080c] overflow-hidden select-none">
    <IsometricWorld ref="scene" :quality="quality" @open="openSection" @hover="hovered = $event" @close="closeSection" />
    <PortfolioHUD v-model="quality" :hovered="hovered" @action="activateNode" />
    <PortfolioModal :open="!!active" :title="titles[active] || active" @close="closeSection">
      <ModalContent :section="active" />
    </PortfolioModal>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import IsometricWorld from './IsometricWorld.vue'
import PortfolioHUD from './PortfolioHUD.vue'
import PortfolioModal from './PortfolioModal.vue'
import ModalContent from '../views/ModalContent.vue'
const scene = ref(null)
const quality = ref('HIGH')
const hovered = ref(null)
const active = ref(null)
const titles = { 'ABOUT ME':'ABOUT ME // HUMAN NODE', PROJECTS:'PROJECTS [06]', SKILLS:'SKILLS // CHIP CORE', EXPERIENCE:'EXPERIENCE', RESUME:'RESUME', CONTACT:'CONTACT', BACKSTACK:'BACKSTACK', TESTIMONIALS:'TESTIMONIALS' }
function activateNode(id) { scene.value?.triggerEnergyFlow(id) }
function openSection(id) { active.value = id }
function closeSection() { active.value = null }
</script>
