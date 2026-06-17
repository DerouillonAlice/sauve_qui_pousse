<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import imgAbeilles    from '@/assets/img/cards/VersoAbeilles.webp'
import imgCoccinelles from '@/assets/img/cards/VersoCoccinelles.webp'
import imgVers        from '@/assets/img/cards/VersoVers.webp'
import imgAgricole    from '@/assets/img/cards/VersoAgricole.webp'
import imgFrelons     from '@/assets/img/cards/VersoFrelons.webp'
import imgPesticides  from '@/assets/img/cards/VersoPesticides.webp'
import imgEpouvantail from '@/assets/img/cards/VersoEpouvantail.webp'
import imgVerso       from '@/assets/img/cards/feuille.webp'

const { t } = useI18n()

type Category = 'Insecte' | 'Événement' | 'Action'

interface CardData {
  id:         number
  name:       string
  category:   Category
  points:     string
  effect:     string
  img:        string
  frontBg:    string
  frontText:  string
  badge:      string
  pointColor: string
}

const allCards: CardData[] = [
  {
    id: 1, name: 'Abeilles', category: 'Insecte', points: '+3 pts',
    effect: 'Pollinisateurs essentiels. Sans elles, 80 % des plantes à fleurs ne se reproduiraient pas.',
    img: imgAbeilles,
    frontBg: 'bg-primary', frontText: 'text-cream', badge: 'bg-lime/40 text-brown', pointColor: 'text-lime',
  },
  {
    id: 2, name: 'Coccinelles', category: 'Insecte', points: '+2 pts',
    effect: 'Prédateurs naturels des pucerons. Elles protègent tes cultures sans chimie.',
    img: imgCoccinelles,
    frontBg: 'bg-primary/80', frontText: 'text-cream', badge: 'bg-lime/40 text-brown', pointColor: 'text-lime',
  },
  {
    id: 3, name: 'Vers de terre', category: 'Insecte', points: '+1 pt',
    effect: 'Décomposeurs indispensables. Ils aèrent et fertilisent le sol naturellement.',
    img: imgVers,
    frontBg: 'bg-primary/60', frontText: 'text-cream', badge: 'bg-lime/40 text-brown', pointColor: 'text-lime',
  },
  {
    id: 4, name: 'Agriculteurs', category: 'Action', points: '0 pt',
    effect: 'Ni bénéfiques ni néfastes. Les agriculteurs maintiennent l\'équilibre du jardin.',
    img: imgAgricole,
    frontBg: 'bg-cream-dark', frontText: 'text-brown', badge: 'bg-brown/20 text-brown', pointColor: 'text-brown/50',
  },
  {
    id: 5, name: 'Frelons asiatiques', category: 'Événement', points: '-1 pt voisin',
    effect: 'Espèces invasives. Tous les voisins perdent un insecte de leur main.',
    img: imgFrelons,
    frontBg: 'bg-yellow', frontText: 'text-brown', badge: 'bg-brown/20 text-brown', pointColor: 'text-red',
  },
  {
    id: 6, name: 'Pesticides systémiques', category: 'Action', points: '-2 pts',
    effect: 'Contaminent les sols et éliminent insectes utiles comme nuisibles.',
    img: imgPesticides,
    frontBg: 'bg-red/70', frontText: 'text-cream', badge: 'bg-cream/20 text-cream', pointColor: 'text-yellow',
  },
  {
    id: 7, name: 'Épouvantail', category: 'Action', points: 'Protection',
    effect: 'Transfère une carte négative de ta main vers un adversaire de ton choix.',
    img: imgEpouvantail,
    frontBg: 'bg-brown', frontText: 'text-cream', badge: 'bg-cream/20 text-cream', pointColor: 'text-yellow',
  },
]

type Filter = 'Toutes' | Category
const filters: { key: Filter; label: string }[] = [
  { key: 'Toutes',    label: t('cards.filter.all') },
  { key: 'Insecte',   label: t('cards.filter.insects') },
  { key: 'Événement', label: t('cards.filter.events') },
  { key: 'Action',    label: t('cards.filter.actions') },
]

const activeFilter  = ref<Filter>('Toutes')
const selectedCard  = ref<CardData | null>(allCards[0] ?? null)
const flippedCards  = ref<Set<number>>(new Set())
const detailFlipped = ref(false)

const filteredCards = computed(() =>
  activeFilter.value === 'Toutes'
    ? allCards
    : allCards.filter(c => c.category === activeFilter.value)
)

function isFlipped(id: number) {
  return flippedCards.value.has(id)
}

function handleCardClick(card: CardData) {
  if (selectedCard.value?.id === card.id) {
    // Même carte : toggle le flip
    const next = new Set(flippedCards.value)
    if (next.has(card.id)) { next.delete(card.id) } else { next.add(card.id) }
    flippedCards.value = next
  } else {
    // Nouvelle carte : remet toutes les autres à l'endroit, retourne seulement celle-ci
    flippedCards.value = new Set([card.id])
    selectedCard.value = card
    detailFlipped.value = false
  }
}

function setFilter(f: Filter) {
  activeFilter.value = f
  selectedCard.value = null
  flippedCards.value = new Set()
}

const selectedIndex = computed(() =>
  filteredCards.value.findIndex(c => c.id === selectedCard.value?.id)
)

function prevCard() {
  const prev = filteredCards.value[selectedIndex.value - 1]
  if (prev) { selectedCard.value = prev; detailFlipped.value = false; flippedCards.value = new Set() }
}
function nextCard() {
  const next = filteredCards.value[selectedIndex.value + 1]
  if (next) { selectedCard.value = next; detailFlipped.value = false; flippedCards.value = new Set() }
}
</script>

<template>
  <div class="bg-cream min-h-screen">

    <!-- HERO -->
    <section class="py-12 px-4 text-center">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-brown mb-3">{{ t('cards.hero.title') }}</h1>
        <p class="text-brown/70 text-base leading-relaxed">{{ t('cards.hero.subtitle') }}</p>
      </div>
    </section>

    <!-- STICKY FILTER BAR -->
    <div class="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-brown/10 px-4 py-2.5 shadow-sm">
      <div class="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-brown/40 text-xs hidden sm:inline">Filtrer :</span>
          <button
            v-for="f in filters" :key="f.key"
            @click="setFilter(f.key)"
            class="px-3 py-1 rounded-full text-xs font-semibold border transition-all"
            :class="activeFilter === f.key
              ? 'bg-primary text-cream border-primary'
              : 'text-brown/60 border-brown/20 hover:border-primary hover:text-primary'"
          >{{ f.label }}</button>
        </div>
        <span class="text-brown/40 text-xs tabular-nums">
          {{ filteredCards.length }} {{ t('cards.filter.count') }}
        </span>
      </div>
    </div>

    <!-- MAIN CONTENT -->
    <div class="max-w-6xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 items-start">

      <!-- CARD GRID -->
      <div class="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div
          v-for="card in filteredCards" :key="card.id"
          class="flex flex-col items-center cursor-pointer group"
          @click="handleCardClick(card)"
        >
          <!-- Flip wrapper -->
          <div class="w-full [perspective:900px]">
            <div
              class="relative w-full aspect-[8/15] [transform-style:preserve-3d] transition-[transform] duration-500 rounded-xl"
              :class="isFlipped(card.id) ? '[transform:rotateY(180deg)]' : ''"
            >
              <!-- RECTO: illustration -->
              <div class="absolute inset-0 [backface-visibility:hidden] rounded-xl overflow-hidden group-hover:shadow-md transition-shadow"
                :class="selectedCard?.id === card.id ? 'ring-2 ring-primary ring-offset-2' : ''"
              >
                <img :src="card.img" :alt="card.name" class="w-full h-full object-cover" />
              </div>
              <!-- VERSO: dos commun à toutes les cartes -->
              <div class="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl overflow-hidden">
                <img :src="imgVerso" alt="Verso" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>
          <p class="mt-1.5 text-center text-[11px] font-medium text-brown/50 group-hover:text-brown transition-colors leading-tight">
            {{ card.name }}
          </p>
        </div>
      </div>

      <!-- DETAIL PANEL -->
      <div class="w-full lg:w-64 xl:w-72 lg:sticky lg:top-12 shrink-0">
        <!-- Placeholder -->
        <div v-if="!selectedCard"
          class="rounded-2xl border border-dashed border-brown/20 px-6 py-12 text-center flex flex-col items-center gap-3">
          <span class="text-3xl opacity-40">🃏</span>
          <p class="text-brown/40 text-sm leading-relaxed">Clique sur une carte pour voir ses détails</p>
        </div>

        <!-- Card detail -->
        <div v-else class="flex flex-col gap-5">

          <!-- Miniature statique -->
          <div class="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0">
            <img :src="selectedCard.img" :alt="selectedCard.name" class="w-full h-full object-cover" />
          </div>

          <!-- Info -->
          <div class="bg-white/60 rounded-2xl p-4 flex flex-col gap-2 shadow-sm">
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full border border-brown/20 text-brown/60 self-start">
              {{ selectedCard.category }}
            </span>
            <h3 class="text-brown">{{ selectedCard.name }}</h3>
            <p class="font-bold text-lg text-primary">{{ selectedCard.points }}</p>
            <p class="text-brown/70 text-sm leading-relaxed">{{ selectedCard.effect }}</p>
          </div>

          <!-- Navigation -->
          <div class="flex gap-2">
            <button
              @click="prevCard"
              :disabled="selectedIndex === 0"
              class="flex-1 py-2.5 rounded-xl border-2 border-brown/20 text-brown/60 font-medium text-sm hover:border-brown hover:text-brown transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >{{ t('cards.detail.prev') }}</button>
            <button
              @click="nextCard"
              :disabled="selectedIndex === filteredCards.length - 1"
              class="flex-1 py-2.5 rounded-xl bg-primary text-cream font-medium text-sm hover:scale-105 transition-transform disabled:opacity-30 disabled:cursor-not-allowed"
            >{{ t('cards.detail.next') }}</button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>
