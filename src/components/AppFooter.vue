<script setup lang="ts">
import { RouterLink } from 'vue-router'
import footerImg from '@/assets/img/footer.svg'
import pinkFlowerImg from '@/assets/img/pink_flower.svg'
import yellowFlowerImg from '@/assets/img/yellow_flower.svg'

const menuLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Règles', to: '/regles' },
  { label: 'Cartes', to: '/cartes' },
  { label: 'Jouer', to: '/jouer' },
]

const legalLinks = [
  { label: 'Mentions légales', to: '/mentions-legales' },
  { label: 'CGU', to: '/cgu' },
  { label: 'Politique de confidentialité', to: '/confidentialite' },
]
</script>

<template>
  <footer class="relative overflow-hidden bg-brown">
    <!-- Wave image top -->
    <img :src="footerImg" aria-hidden="true"
      class="w-full pointer-events-none select-none" />

    <!-- Flower decorations — positionnées dans la zone des colonnes, pas sur la vague -->
    <img :src="pinkFlowerImg" aria-hidden="true"
      class="absolute bottom-16 left-4 w-14 pointer-events-none select-none hidden lg:block opacity-70" />
    <img :src="yellowFlowerImg" aria-hidden="true"
      class="absolute bottom-12 right-6 w-10 pointer-events-none select-none hidden lg:block opacity-70" />

    <!-- Columns -->
    <div class="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-3 gap-8">
      <!-- Menu -->
      <div>
        <p class="text-cream font-semibold mb-4 text-sm uppercase tracking-wider">Menu</p>
        <ul class="space-y-2">
          <li v-for="link in menuLinks" :key="link.to">
            <RouterLink :to="link.to"
              class="text-cream/55 text-sm hover:text-primary transition-colors">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Liens Légaux -->
      <div>
        <p class="text-cream font-semibold mb-4 text-sm uppercase tracking-wider">Liens Légaux</p>
        <ul class="space-y-2">
          <li v-for="link in legalLinks" :key="link.to">
            <RouterLink :to="link.to"
              class="text-cream/55 text-sm hover:text-primary transition-colors">
              {{ link.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- Contact -->
      <div class="col-span-2 sm:col-span-1">
        <p class="text-cream font-semibold mb-4 text-sm uppercase tracking-wider">Contact</p>
        <a href="mailto:info@sauvequipousse.fr"
          class="text-cream/55 text-sm hover:text-primary transition-colors block mb-3">
          info@sauvequipousse.fr
        </a>
        <!-- Réseaux sociaux -->
        <div class="flex gap-3 mt-2">
          <a href="#" aria-label="Instagram"
            class="w-8 h-8 rounded-full border border-cream/20 flex items-center justify-center text-cream/50 hover:border-primary hover:text-primary transition-colors text-xs font-bold">
            IG
          </a>
          <a href="#" aria-label="Facebook"
            class="w-8 h-8 rounded-full border border-cream/20 flex items-center justify-center text-cream/50 hover:border-primary hover:text-primary transition-colors text-xs font-bold">
            FB
          </a>
        </div>
      </div>
    </div>

    <div class="border-t border-cream/10 py-4 px-6 text-center">
      <p class="text-cream/30 text-xs">© {{ new Date().getFullYear() }} Sauve qui Pousse. Tous droits réservés.</p>
    </div>
  </footer>
</template>
