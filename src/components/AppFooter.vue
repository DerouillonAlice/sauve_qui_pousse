<script setup lang="ts">
import { RouterLink } from 'vue-router'
import footerImg from '@/assets/img/footer.svg'
import yellowFlowerImg from '@/assets/img/yellow_flower.svg'
import pinkFlowerImg from '@/assets/img/pink_flower.svg'

const menuLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Règles', to: '/regles' },
  { label: 'Cartes', to: '/cartes' },
  { label: 'Jouer', to: '/jouer' },
]

const legalLinks = [
  { label: 'Mentions Légales', to: '/mentions-legales' },
  { label: "Conditions Générales d'Utilisation", to: '/cgu' },
  { label: 'Conditions Générales de Vente', to: '/cgv' },
]
</script>

<template>
  <footer class="relative bg-primary overflow-hidden">

    <!-- Vague scalloped en haut (footer.svg = scallops primary pointant vers le haut) -->
    <img :src="footerImg" aria-hidden="true" class="w-full block" />

    <!-- Fleurs décoratives -->
    <img :src="yellowFlowerImg" aria-hidden="true"
      class="absolute left-0 bottom-16 w-36 sm:w-48 pointer-events-none select-none" />
    <img :src="pinkFlowerImg" aria-hidden="true"
      class="absolute right-0 bottom-12 w-32 sm:w-44 pointer-events-none select-none" />

    <!-- Colonnes -->
    <div class="relative z-10 max-w-4xl mx-auto px-8 pb-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">

      <!-- Menu -->
      <div>
        <p class="font-game text-cream text-2xl mb-6">Menu</p>
        <ul class="space-y-3">
          <li v-for="link in menuLinks" :key="link.to">
            <RouterLink :to="link.to"
              class="text-cream/70 text-sm hover:text-cream transition-colors">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Liens Légaux -->
      <div>
        <p class="font-game text-cream text-2xl mb-6">Liens Légaux</p>
        <ul class="space-y-3">
          <li v-for="link in legalLinks" :key="link.to">
            <RouterLink :to="link.to"
              class="text-cream/70 text-sm hover:text-cream transition-colors leading-snug block">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div>
        <p class="font-game text-cream text-2xl mb-6">Contact</p>
        <ul class="space-y-3 text-cream/70 text-sm">
          <li>
            <a href="mailto:contact@sauvequipousse.fr"
              class="hover:text-cream transition-colors">
              contact@sauvequipousse.fr
            </a>
          </li>
          <li>04 12 34 56 78</li>
          <li>67 Rue de Poitiers</li>
        </ul>
      </div>

    </div>
  </footer>
</template>
