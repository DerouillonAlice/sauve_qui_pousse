<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAuth } from '@/composables/useAuth'
import LanguageSelector from './LanguageSelector.vue'
import logoBlanc from '@/assets/logo_blanc.png'
import { LogOut, User } from 'lucide-vue-next'

const { t } = useI18n()
const { state: auth, isAuthenticated, logout } = useAuth()

const links = [
  { to: '/',       i18nKey: 'nav.home' },
  { to: '/regles', i18nKey: 'nav.rules' },
  { to: '/cartes', i18nKey: 'nav.cards' },
  { to: '/jouer',  i18nKey: 'nav.play' },
]
</script>

<template>
  <header class="hidden lg:flex items-center justify-between px-8 py-4 bg-primary">
    <RouterLink to="/">
      <img :src="logoBlanc" alt="Sauve qui pousse" class="h-12 w-auto" />
    </RouterLink>
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

      <!-- Auth status -->
      <div v-if="isAuthenticated" class="flex items-center gap-3 ml-2 pl-4 border-l border-cream/30">
        <RouterLink
          to="/jouer"
          class="flex items-center gap-2 text-cream no-underline hover:underline text-sm"
        >
          <div class="w-7 h-7 rounded-full bg-cream/20 flex items-center justify-center text-xs font-bold text-cream">
            {{ auth.user?.pseudo?.charAt(0)?.toUpperCase() }}
          </div>
          <span>{{ auth.user?.pseudo }}</span>
        </RouterLink>
        <button
          @click="logout"
          class="text-cream/60 hover:text-cream transition-colors cursor-pointer"
          :title="t('nav.logout')"
        >
          <LogOut :stroke-width="1.5" class="w-4 h-4" />
        </button>
      </div>
      <RouterLink
        v-else
        to="/jouer"
        class="flex items-center gap-1.5 px-4 py-1.5 bg-cream/20 text-cream rounded-full text-sm font-medium hover:bg-cream/30 transition-colors no-underline"
      >
        <User :stroke-width="1.5" class="w-4 h-4" />
        {{ t('nav.login') }}
      </RouterLink>

      <LanguageSelector />
    </nav>
  </header>
</template>
