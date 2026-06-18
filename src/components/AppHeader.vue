<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageSelector from './LanguageSelector.vue'
import logoBlanc from '@/assets/logo_blanc.png'

const { t } = useI18n()

const links = [
  { to: '/',       i18nKey: 'nav.home' },
  { to: '/regles', i18nKey: 'nav.rules' },
  { to: '/cartes', i18nKey: 'nav.cards' },
  { to: '/jouer',  i18nKey: 'nav.play' },
  { to: '/compte', i18nKey: 'nav.account' },
]
</script>

<template>
  <header class="flex items-center justify-between px-8 py-4 bg-primary">
    <!-- Logo visible uniquement sur mobile (desktop : caché car intégré dans hero_desktop.svg) -->
    <RouterLink to="/" class="md:hidden">
      <img :src="logoBlanc" alt="Sauve qui pousse" class="h-12 w-auto" />
    </RouterLink>
    <!-- Nav liens à gauche sur desktop -->
    <nav class="hidden md:flex gap-8 items-center">
      <RouterLink v-for="link in links" :key="link.to" :to="link.to"
        class="text-cream no-underline hover:underline font-medium text-lg"
        style="font-family: 'Nunito', sans-serif; font-weight: 700"
        active-class="font-bold underline">
        {{ t(link.i18nKey) }}
      </RouterLink>
    </nav>
    <LanguageSelector />
  </header>
</template>
