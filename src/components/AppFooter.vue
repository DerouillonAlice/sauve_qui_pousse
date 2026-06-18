<script setup lang="ts">
import { RouterLink } from 'vue-router'

const menuLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Règles', to: '/regles' },
  { label: 'Cartes', to: '/cartes' },
  { label: 'Jouer', to: '/jouer' },
]

const legalLinks = [
  { label: 'Mentions Légales', to: '/mentions-legales' },
  { label: "CGU", to: '/cgu' },
  { label: 'CGV', to: '/cgv' },
]
</script>

<template>
  <!-- pb-16 lg:pb-0 → marge pour la bottom nav mobile -->
  <footer class="bg-primary pt-10 pb-20 lg:pb-12">
    <div class="max-w-4xl mx-auto px-8 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center">

      <!-- Menu -->
      <div>
        <p class="font-game text-white text-xl sm:text-2xl mb-5">Menu</p>
        <ul class="space-y-2">
          <li v-for="link in menuLinks" :key="link.to">
            <RouterLink :to="link.to" class="text-white/80 text-sm hover:text-white hover:font-bold transition-all">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Liens Légaux -->
      <div>
        <p class="font-game text-white text-xl sm:text-2xl mb-5">Légal</p>
        <ul class="space-y-2">
          <li v-for="link in legalLinks" :key="link.to">
            <RouterLink :to="link.to" class="text-white/80 text-sm hover:text-white hover:font-bold transition-all leading-snug block">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Contact + Boutique -->
      <div class="col-span-2 sm:col-span-1">
        <p class="font-game text-white text-xl sm:text-2xl mb-5">Contact</p>
        <ul class="space-y-2 text-white/80 text-sm">
          <li>
            <a href="mailto:contact@sauvequipousse.fr" class="hover:text-white hover:font-bold transition-all">
              contact@sauvequipousse.fr
            </a>
          </li>
          <li class="pt-2">
            <a href="https://shop.sauvequipousse.fr" target="_blank" rel="noopener"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-full text-sm font-semibold transition-colors">
              🛒 Notre boutique
            </a>
          </li>
        </ul>
      </div>

    </div>

    <div class="border-t border-white/10 mt-8 pt-5 text-center">
      <p class="text-white/70 text-xs">© {{ new Date().getFullYear() }} Sauve qui Pousse · Projet SAE6 BUT3 MMI · IUT Troyes & Castres</p>
    </div>
  </footer>
</template>
