<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import AppBottomNav from '@/components/AppBottomNav.vue'
</script>

<template>
  <AppHeader />
  <main class="w-full pb-16 lg:pb-0">
    <RouterView />
  </main>
  <AppBottomNav />
</template>

<style scoped>
</style>
