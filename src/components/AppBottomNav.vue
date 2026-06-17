<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Home, Gamepad2, Layers, BookOpen } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { to: '/',       icon: Home,     label: 'Accueil' },
  { to: '/jouer',  icon: Gamepad2, label: 'Jouer'   },
  { to: '/cartes', icon: Layers,   label: 'Cartes'  },
  { to: '/regles', icon: BookOpen, label: 'Règles'  },
]

const activeIndex = computed(() => {
  const idx = navItems.findIndex(item => item.to === route.path)
  return idx === -1 ? 0 : idx
})

// SVG 400×64 — 4 items centrés à x = 50, 150, 250, 350
// preserveAspectRatio="none" → s'étire à la largeur écran
// Les positions flex justify-around coïncident exactement avec le SVG
const barPath = computed(() => {
  const cx = [50, 150, 250, 350][activeIndex.value]
  const nr = 36  // demi-largeur du creux
  const nd = 22  // profondeur du creux
  return (
    `M 0,0 ` +
    `H ${cx - nr - 6} ` +
    `C ${cx - nr - 2},0 ${cx - nr},${nd} ${cx},${nd} ` +
    `C ${cx + nr},${nd} ${cx + nr + 2},0 ${cx + nr + 6},0 ` +
    `H 400 V 64 H 0 Z`
  )
})
</script>

<template>
  <nav class="lg:hidden fixed bottom-0 inset-x-0 z-50 h-16" style="bottom: -1px">

    <!-- Barre SVG avec creux dynamique -->
    <svg
      class="absolute inset-0 w-full h-full"
      style="filter: drop-shadow(0 -2px 10px rgba(0,0,0,0.10))"
      viewBox="0 0 400 64"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path :d="barPath" fill="var(--color-primary)" />
    </svg>

    <!-- Items -->
    <div class="relative h-full flex items-center justify-around px-2">
      <RouterLink
        v-for="(item, i) in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center justify-center relative z-10 transition-transform duration-300"
        :class="activeIndex === i ? '-translate-y-5' : 'translate-y-0'"
        :aria-label="item.label"
      >
        <div
          class="flex items-center justify-center rounded-full transition-all duration-300"
          :class="activeIndex === i ? 'w-14 h-14 bg-white shadow-lg' : 'w-10 h-10'"
        >
          <component
            :is="item.icon"
            :stroke-width="1.5"
            class="transition-all duration-300"
            :class="activeIndex === i ? 'w-6 h-6 text-primary' : 'w-5 h-5 text-white/90'"
          />
        </div>
      </RouterLink>
    </div>

  </nav>
</template>
