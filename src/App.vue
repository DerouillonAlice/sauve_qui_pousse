<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppBottomNav from '@/components/AppBottomNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import WaveEdge from '@/components/WaveEdge.vue'
import yellowFlowerImg from '@/assets/img/yellow_flower.svg'
import pinkFlowerImg from '@/assets/img/pink_flower.svg'
</script>

<template>
  <AppHeader />
  <main class="w-full pb-16 lg:pb-0">
    <RouterView />
  </main>

  <!-- Zone footer : fleurs derrière la vague et le fond vert -->
  <div class="relative">
    <img :src="yellowFlowerImg" aria-hidden="true"
      class="absolute -top-56 left-2 sm:left-6 w-64 sm:w-80 z-0 pointer-events-none select-none" />
    <img :src="pinkFlowerImg" aria-hidden="true"
      class="absolute -top-52 right-2 sm:right-6 w-56 sm:w-80 z-0 pointer-events-none select-none" />
    <WaveEdge class="relative z-10" color="var(--color-primary)" position="top" :size="60" />
    <AppFooter class="relative z-10" />
  </div>

  <AppBottomNav />
</template>

<style scoped>
</style>
