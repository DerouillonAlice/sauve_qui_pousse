<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppBottomNav from '@/components/AppBottomNav.vue'
import AppFooter from '@/components/AppFooter.vue'
import WaveEdge from '@/components/WaveEdge.vue'
</script>

<template>
  <AppHeader />
  <main class="w-full pb-16 lg:pb-0">
    <RouterView />
  </main>
  <WaveEdge color="var(--color-primary)" position="top" :size="60" />
  <AppFooter />
  <AppBottomNav />
</template>

<style scoped>
</style>
