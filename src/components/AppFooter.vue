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
  { label: "Conditions Générales d'Utilisation", to: '/cgu' },
  { label: 'Conditions Générales de Vente', to: '/cgv' },
]
</script>

<template>
  <footer class="bg-primary pt-10 pb-12">
    <div class="max-w-4xl mx-auto px-8 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">

      <div>
        <p class="font-game text-white text-2xl mb-6">Menu</p>
        <ul class="space-y-3">
          <li v-for="link in menuLinks" :key="link.to">
            <RouterLink :to="link.to"
              class="text-white text-sm hover:font-bold transition-all">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="font-game text-white text-2xl mb-6">Liens Légaux</p>
        <ul class="space-y-3">
          <li v-for="link in legalLinks" :key="link.to">
            <RouterLink :to="link.to"
              class="text-white text-sm hover:font-bold transition-all leading-snug block">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <div>
        <p class="font-game text-white text-2xl mb-6">Contact</p>
        <ul class="space-y-3 text-white text-sm">
          <li>
            <a href="mailto:contact@sauvequipousse.fr"
              class="hover:font-bold transition-all">
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
