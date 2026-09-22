
<template>
  <div class="app">
    <IsometricWorld @open="openSection" />
    <div class="hud top-left">NODE_MAP / v1.0<br/>Gift — Portfolio Foundation</div>
    <div class="hud bottom-left"><span>● HIGH QUALITY</span><span>○ PERFORMANCE</span><span style="opacity:.5;margin-top:8px">MUSIC / CREDITS</span></div>
    <div class="hud bottom-center">LMB: ROTATE | RMB: PAN | SCROLL: ZOOM</div>
    <div class="hud top-right"><button class="contact-btn" @click="openSection('contact')">CONTACT ME ↘</button></div>
    <Transition name="modal">
      <div v-if="active" class="modal-overlay" @click.self="active=null">
        <div class="modal"><button class="close" @click="active=null">✕</button><component :is="sections[active]" /></div>
      </div>
    </Transition>
  </div>
</template>
<script setup>
import { ref, defineAsyncComponent } from 'vue'
import IsometricWorld from './components/IsometricWorld.vue'
const active = ref(null)
const sections = {
  about: defineAsyncComponent(()=>import('./views/AboutView.vue')),
  projects: defineAsyncComponent(()=>import('./views/ProjectsView.vue')),
  skills: defineAsyncComponent(()=>import('./views/SkillsView.vue')),
  experience: defineAsyncComponent(()=>import('./views/ExperienceView.vue')),
  contact: defineAsyncComponent(()=>import('./views/ContactView.vue')),
  resume: defineAsyncComponent(()=>import('./views/ResumeView.vue')),
  testimonials: defineAsyncComponent(()=>import('./views/TestimonialsView.vue')),
  backstack: defineAsyncComponent(()=>import('./views/BackstackView.vue')),
}
const openSection = (id) => active.value = id
</script>
<style>
.app{width:100vw;height:100vh;position:relative}
.hud{position:absolute;font-size:10px;letter-spacing:.12em;line-height:1.6;z-index:10;color:#9fb8c5;text-transform:uppercase}
.top-left{top:24px;left:24px}.bottom-left{bottom:24px;left:24px;display:flex;flex-direction:column}
.bottom-center{bottom:24px;left:50%;transform:translateX(-50%);opacity:.6}
.top-right{top:24px;right:24px}
.contact-btn{background:#fff;color:#000;border:0;padding:10px 18px;font-size:11px;letter-spacing:.1em;cursor:pointer;font-family:inherit}
.modal-overlay{position:fixed;inset:0;background:rgba(2,6,10,.88);backdrop-filter:blur(12px);z-index:100;display:flex;align-items:center;justify-content:center;padding:40px}
.modal{background:#0a1016;border:1px solid #1e3a4a;width:min(900px,90vw);max-height:85vh;overflow:auto;padding:40px;position:relative;box-shadow:0 0 80px rgba(122,252,255,.15)}
.close{position:absolute;top:16px;right:16px;background:transparent;border:1px solid #234;color:#7afcff;width:32px;height:32px;cursor:pointer}
.modal-enter-active,.modal-leave-active{transition:.35s}.modal-enter-from,.modal-leave-to{opacity:0;transform:translateY(10px)}
</style>
