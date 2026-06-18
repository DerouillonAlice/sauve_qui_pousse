<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Home, Gamepad2, Layers, User, LogIn } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const route  = useRoute()
const router = useRouter()
const { isAuthenticated } = useAuth()

const navItems = computed(() => [
  { to: '/',       icon: Home,                                        label: 'Accueil' },
  { to: '/jouer',  icon: Gamepad2,                                    label: 'Jouer'   },
  { to: '/cartes', icon: Layers,                                      label: 'Cartes'  },
  { to: isAuthenticated.value ? '/compte' : '/jouer',
    icon: isAuthenticated.value ? User : LogIn,                       label: isAuthenticated.value ? 'Compte' : 'Connexion' },
])

const activeIndex = computed(() => {
  const idx = navItems.value.findIndex(item => item.to === route.path)
  return idx === -1 ? 0 : idx
})
</script>

<template>
  <nav class="lg:hidden fixed bottom-0 inset-x-0 z-50">
    <div class="bg-primary rounded-t-3xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)] h-16 flex items-center justify-around px-4">
      <RouterLink
        v-for="(item, i) in navItems"
        :key="item.label"
        :to="item.to"
        :aria-label="item.label"
        class="flex flex-col items-center justify-center relative transition-all duration-300 ease-out"
        :class="activeIndex === i ? '-translate-y-5' : 'translate-y-0'"
      >
        <div
          class="flex items-center justify-center rounded-full transition-all duration-300"
          :class="activeIndex === i ? 'w-14 h-14 bg-white shadow-lg shadow-black/15' : 'w-10 h-10'"
        >
          <component
            :is="item.icon"
            :stroke-width="activeIndex === i ? 2 : 1.5"
            class="transition-all duration-300"
            :class="activeIndex === i ? 'w-6 h-6 text-primary' : 'w-5 h-5 text-white/80'"
          />
        </div>
      </RouterLink>
    </div>
  </nav>
</template>
