<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LanguageSelector from './LanguageSelector.vue'
import { useAuth } from '@/composables/useAuth'
import { useGame } from '@/composables/useGame'
import { LogOut } from 'lucide-vue-next'
import logoBlanc from '@/assets/logo_blanc.png'

const { t } = useI18n()
const router = useRouter()
const { isAuthenticated, logout } = useAuth()
const { leaveGame } = useGame()

const links = [
  { to: '/',       i18nKey: 'nav.home' },
  { to: '/regles', i18nKey: 'nav.rules' },
  { to: '/cartes', i18nKey: 'nav.cards' },
]

function handleLogout() {
  leaveGame()
  logout()
  router.push('/')
}
</script>

<template>
  <header class="flex items-center justify-between px-8 py-4 bg-primary">
    <RouterLink to="/">
      <img :src="logoBlanc" alt="Sauve qui pousse" class="h-12 w-auto" />
    </RouterLink>

    <nav class="flex gap-5 items-center">
      <!-- Liens classiques -->
      <RouterLink v-for="link in links" :key="link.to" :to="link.to"
        class="hidden lg:block text-cream no-underline hover:underline"
        active-class="font-bold underline">
        {{ t(link.i18nKey) }}
      </RouterLink>

      <!-- Mon compte / Inscription selon état auth -->
      <RouterLink
        :to="isAuthenticated ? '/compte' : '/jouer'"
        class="hidden lg:block text-cream no-underline hover:underline"
        active-class="font-bold underline">
        {{ isAuthenticated ? t('nav.account') : t('nav.login') }}
      </RouterLink>

      <!-- Bouton Jouer mis en valeur -->
      <RouterLink to="/jouer"
        class="hidden lg:flex items-center px-5 py-2 bg-brown text-cream rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform shadow-md">
        {{ t('nav.play') }}
      </RouterLink>

      <!-- Déconnexion si connecté -->
      <button v-if="isAuthenticated" @click="handleLogout"
        class="hidden lg:flex items-center gap-1.5 text-cream/60 hover:text-cream transition-colors cursor-pointer text-sm"
        :title="t('nav.logout')">
        <LogOut :stroke-width="1.5" class="w-4 h-4" />
      </button>

      <LanguageSelector />
    </nav>
  </header>
</template>
