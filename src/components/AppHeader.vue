<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import LanguageSelector from './LanguageSelector.vue'
import logoBlanc from '@/assets/logo_blanc.png'

const { t } = useI18n()
const { isAuthenticated } = useAuth()

const basicLinks = [
  { to: '/',       i18nKey: 'nav.home' },
  { to: '/regles', i18nKey: 'nav.rules' },
  { to: '/cartes', i18nKey: 'nav.cards' },
]
</script>

<template>
  <header class="flex items-center justify-between px-8 py-4 bg-primary">
    <RouterLink to="/">
      <img :src="logoBlanc" alt="Sauve qui pousse" class="h-12 w-auto" />
    </RouterLink>
    <nav class="flex gap-6 items-center">
      <RouterLink v-for="link in basicLinks" :key="link.to" :to="link.to"
        class="hidden lg:block text-cream no-underline hover:underline"
        active-class="font-bold underline">
        {{ t(link.i18nKey) }}
      </RouterLink>

      <template v-if="!isAuthenticated">
        <RouterLink to="/jouer"
          class="hidden lg:block bg-brown text-cream px-5 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform shadow-md">
          Connexion / Inscription
        </RouterLink>
      </template>

      <template v-else>
        <RouterLink to="/compte"
          class="hidden lg:block text-cream no-underline hover:underline"
          active-class="font-bold underline">
          {{ t('nav.account') }}
        </RouterLink>
        <RouterLink to="/jouer"
          class="hidden lg:block bg-brown text-cream px-5 py-2.5 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform shadow-md flex items-center gap-2">
          {{ t('nav.play') }}
        </RouterLink>
      </template>

      <LanguageSelector />
    </nav>
  </header>
</template>
