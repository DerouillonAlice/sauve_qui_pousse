<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import AppBottomNav from '@/components/AppBottomNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import WaveEdge from '@/components/WaveEdge.vue'
import yellowFlowerImg from '@/assets/img/yellow_flower.svg'
import pinkFlowerImg from '@/assets/img/pink_flower.svg'

const windowWidth = ref(window.innerWidth)
function onResize() {
  windowWidth.value = window.innerWidth
}
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))
const isMobile = computed(() => windowWidth.value <= 767)
</script>

<template>
  <AppHeader v-if="!isMobile" />
  <main class="w-full" :class="isMobile ? 'pb-16' : ''">
    <RouterView />
  </main>

  <!-- Zone footer : fleurs derrière la vague et le fond vert -->
  <div class="relative">
    <!-- yellow flower : petite centrée sur mobile, grande à gauche sur md+ -->
    <img
      :src="yellowFlowerImg"
      aria-hidden="true"
      class="absolute z-10 pointer-events-none select-none"
      :class="
        isMobile
          ? 'w-36 -top-28 left-1/2 -translate-x-1/2'
          : '-top-28 lg:-top-90 left-8 w-36 lg:w-80 xl:w-96'
      "
    />
    <img
      v-if="!isMobile"
      :src="pinkFlowerImg"
      aria-hidden="true"
      class="absolute -top-32 lg:-top-96 right-8 w-36 lg:w-80 xl:w-[26rem] z-10 pointer-events-none select-none"
    />
    <WaveEdge class="relative z-20" color="var(--color-primary)" position="top" :size="60" />
    <AppFooter class="relative z-10" />
  </div>

  <AppBottomNav v-if="isMobile" />
</template>

<style scoped></style>
