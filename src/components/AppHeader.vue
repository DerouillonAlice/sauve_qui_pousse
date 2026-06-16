<template>
  <header class="flex items-center justify-between px-8 py-4 bg-primary">
    <span class="font-serif text-xl text-cream">Sauve qui pousse</span>
    <nav class="flex gap-6 items-center">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="text-cream no-underline hover:underline"
        active-class="font-bold underline"
      >
        {{ t(link.i18nKey) }}
      </RouterLink>
      <LanguageSelector />
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import LanguageSelector from './LanguageSelector.vue'

const { t } = useI18n()

const links = [
  { to: '/',       i18nKey: 'nav.home' },
  { to: '/regles', i18nKey: 'nav.rules' },
  { to: '/cartes', i18nKey: 'nav.cards' },
  { to: '/jouer',  i18nKey: 'nav.play' },
]
</script>
