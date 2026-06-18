<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'

import imgAbeilles    from '@/assets/img/cards/VersoAbeilles.webp'
import imgCoccinelles from '@/assets/img/cards/VersoCoccinelles.webp'
import imgVers        from '@/assets/img/cards/VersoVers.webp'
import imgAgricole    from '@/assets/img/cards/VersoAgricole.webp'
import imgFrelons     from '@/assets/img/cards/VersoFrelons.webp'
import imgPesticides  from '@/assets/img/cards/VersoPesticides.webp'
import imgEpouvantail from '@/assets/img/cards/VersoEpouvantail.webp'
import beeImg         from '@/assets/img/bee.svg'
import ladybugImg     from '@/assets/img/ladybug.svg'
import wormImg        from '@/assets/img/worm.svg'

const { t } = useI18n()

type Group = 'Bénéfique' | 'Nuisible' | 'Neutre'
type Role  = 'Pollinisateur' | 'Prédateur' | 'Décomposeur' | 'Cultivateur' | 'Invasif' | 'Polluant' | 'Stratégie'

interface CardData {
  id:         number
  name:       string
  role:       Role
  group:      Group
  points:     string
  effect:     string
  img:        string
  pointColor: string
}

const allCards: CardData[] = [
  {
    id: 1, name: 'Abeilles', role: 'Pollinisateur', group: 'Bénéfique', points: '+3 pts',
    effect: 'Pollinisateurs essentiels. Sans elles, 80 % des plantes à fleurs ne se reproduiraient pas.',
    img: imgAbeilles, pointColor: 'text-primary',
  },
  {
    id: 2, name: 'Coccinelles', role: 'Prédateur', group: 'Bénéfique', points: '+2 pts',
    effect: 'Prédateurs naturels des pucerons. Elles protègent tes cultures sans chimie.',
    img: imgCoccinelles, pointColor: 'text-primary',
  },
  {
    id: 3, name: 'Vers de terre', role: 'Décomposeur', group: 'Bénéfique', points: '+1 pt',
    effect: 'Décomposeurs indispensables. Ils aèrent et fertilisent le sol naturellement.',
    img: imgVers, pointColor: 'text-primary',
  },
  {
    id: 4, name: 'Agriculteurs', role: 'Cultivateur', group: 'Neutre', points: '0 pt',
    effect: "Ni bénéfiques ni néfastes. Les agriculteurs maintiennent l'équilibre du jardin.",
    img: imgAgricole, pointColor: 'text-brown/50',
  },
  {
    id: 5, name: 'Frelons asiatiques', role: 'Invasif', group: 'Nuisible', points: '-1 pt / voisin',
    effect: 'Espèces invasives. Tous les voisins perdent un insecte de leur main.',
    img: imgFrelons, pointColor: 'text-red',
  },
  {
    id: 6, name: 'Pesticides systémiques', role: 'Polluant', group: 'Nuisible', points: '-2 pts',
    effect: 'Contaminent les sols et éliminent insectes utiles comme nuisibles.',
    img: imgPesticides, pointColor: 'text-red',
  },
  {
    id: 7, name: 'Épouvantail', role: 'Stratégie', group: 'Neutre', points: 'Protection',
    effect: 'Transfère une carte négative de ta main vers un adversaire de ton choix.',
    img: imgEpouvantail, pointColor: 'text-brown',
  },
]

const roleMeta: Record<Role, { color: string; dot: string }> = {
  'Pollinisateur': { color: 'text-primary', dot: 'bg-primary'    },
  'Prédateur':     { color: 'text-primary', dot: 'bg-primary'    },
  'Décomposeur':   { color: 'text-primary', dot: 'bg-primary'    },
  'Cultivateur':   { color: 'text-brown',   dot: 'bg-brown'      },
  'Invasif':       { color: 'text-red',     dot: 'bg-red'        },
  'Polluant':      { color: 'text-red',     dot: 'bg-red'        },
  'Stratégie':     { color: 'text-brown',   dot: 'bg-brown'      },
}

type Filter = 'Toutes' | Group
const filters: { key: Filter; label: string }[] = [
  { key: 'Toutes',    label: t('cards.filter.all')        },
  { key: 'Bénéfique', label: t('cards.filter.beneficial') },
  { key: 'Nuisible',  label: t('cards.filter.harmful')    },
  { key: 'Neutre',    label: t('cards.filter.neutral')    },
]

const activeFilter = ref<Filter>('Toutes')
const selectedCard = ref<CardData | null>(null)

const filteredCards = computed(() =>
  activeFilter.value === 'Toutes'
    ? allCards
    : allCards.filter(c => c.group === activeFilter.value)
)

function setFilter(f: Filter) {
  activeFilter.value = f
  selectedCard.value = null
}

const selectedIndex = computed(() =>
  filteredCards.value.findIndex(c => c.id === selectedCard.value?.id)
)

function prevCard() {
  const prev = filteredCards.value[selectedIndex.value - 1]
  if (prev) selectedCard.value = prev
}
function nextCard() {
  const next = filteredCards.value[selectedIndex.value + 1]
  if (next) selectedCard.value = next
}
</script>

<template>
  <div class="bg-cream min-h-screen">

    <!-- HERO -->
    <section class="relative overflow-hidden py-16 px-6 text-center bg-cream-dark">
      <img :src="beeImg" aria-hidden="true"
        class="absolute top-3 left-4 w-20 sm:w-28 opacity-60 pointer-events-none select-none rotate-12" />
      <img :src="ladybugImg" aria-hidden="true"
        class="absolute top-2 right-6 w-16 sm:w-24 opacity-60 pointer-events-none select-none -rotate-6" />
      <img :src="wormImg" aria-hidden="true"
        class="absolute bottom-1 right-16 w-14 sm:w-20 opacity-40 pointer-events-none select-none" />
      <div class="relative z-10 max-w-xl mx-auto">
        <h1 class="text-brown mb-3">{{ t('cards.hero.title') }}</h1>
        <p class="text-brown/70 text-base leading-relaxed">{{ t('cards.hero.subtitle') }}</p>
      </div>
    </section>

    <!-- FILTER BAR -->
    <div class="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-brown/10 px-4 py-3 shadow-sm">
      <div class="max-w-5xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-2 flex-wrap">
          <button
            v-for="f in filters" :key="f.key"
            @click="setFilter(f.key)"
            class="px-4 py-1.5 rounded-full text-sm font-semibold border transition-all"
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

    <!-- GRID -->
    <div class="max-w-5xl mx-auto px-4 py-10">
      <TransitionGroup
        tag="div"
        class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        move-class="transition-all duration-300"
        enter-active-class="transition duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 absolute"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0 scale-95"
      >
        <button
          v-for="card in filteredCards" :key="card.id"
          class="group text-left rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          @click="selectedCard = card"
        >
          <!-- Illustration -->
          <div class="aspect-[3/4] overflow-hidden bg-cream-dark">
            <img :src="card.img" :alt="card.name"
              class="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300" />
          </div>
          <!-- Info -->
          <div class="px-3 pt-2.5 pb-3">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="w-1.5 h-1.5 rounded-full shrink-0" :class="roleMeta[card.role].dot" />
              <span class="text-[10px] font-semibold uppercase tracking-wide"
                :class="roleMeta[card.role].color">
                {{ card.role }}
              </span>
            </div>
            <p class="text-brown font-semibold text-sm leading-snug">{{ card.name }}</p>
            <p class="font-bold text-base mt-0.5" :class="card.pointColor">{{ card.points }}</p>
          </div>
        </button>
      </TransitionGroup>
    </div>

    <!-- MODAL -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="selectedCard"
        class="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm"
        @click.self="selectedCard = null"
      >
        <div class="bg-cream w-full sm:w-96 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">

          <!-- Image -->
          <div class="aspect-[16/9] overflow-hidden shrink-0">
            <img :src="selectedCard.img" :alt="selectedCard.name" class="w-full h-full object-cover" />
          </div>

          <!-- Body -->
          <div class="px-6 py-5 overflow-y-auto">
            <div class="flex items-start justify-between mb-1">
              <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="roleMeta[selectedCard.role].dot" />
                <span class="text-xs font-semibold uppercase tracking-wide"
                  :class="roleMeta[selectedCard.role].color">
                  {{ selectedCard.role }}
                </span>
              </div>
              <button @click="selectedCard = null"
                class="p-1.5 rounded-full hover:bg-brown/10 transition-colors -mr-1">
                <X class="w-5 h-5 text-brown/50" />
              </button>
            </div>

            <h3 class="text-brown text-2xl mb-1">{{ selectedCard.name }}</h3>
            <p class="font-bold text-3xl mb-4" :class="selectedCard.pointColor">{{ selectedCard.points }}</p>
            <p class="text-brown/70 text-sm leading-relaxed">{{ selectedCard.effect }}</p>

            <!-- Nav -->
            <div class="flex gap-3 mt-6 pb-1">
              <button
                @click="prevCard"
                :disabled="selectedIndex === 0"
                class="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl border-2 border-brown/20 text-brown/60 font-semibold text-sm hover:border-brown hover:text-brown transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronLeft class="w-4 h-4" />{{ t('cards.detail.prev') }}
              </button>
              <button
                @click="nextCard"
                :disabled="selectedIndex === filteredCards.length - 1"
                class="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl bg-primary text-cream font-semibold text-sm hover:scale-105 transition-transform disabled:opacity-25 disabled:cursor-not-allowed"
              >
                {{ t('cards.detail.next') }}<ChevronRight class="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

  </div>
</template>
