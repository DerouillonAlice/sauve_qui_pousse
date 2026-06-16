<template>
  <header class="flex items-center justify-between px-8 py-4 bg-primary">
    <span class="font-serif text-xl text-cream">Sauve qui pousse</span>
    <nav class="flex gap-6">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="text-cream no-underline hover:underline"
        active-class="font-bold underline"
      >
        {{ link.label }}
      </RouterLink>
    </nav>
  </header>
</template>

<script setup lang="ts">
const links = [
  { to: '/',       label: 'Accueil' },
  { to: '/regles', label: 'Règles' },
  { to: '/cartes', label: 'Cartes' },
  { to: '/jouer',  label: 'Jouer' },
]
</script>
