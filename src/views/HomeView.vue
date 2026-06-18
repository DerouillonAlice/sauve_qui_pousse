<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import WaveEdge from '@/components/WaveEdge.vue'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-vue-next'

import wheelImg          from '@/assets/img/spinning_wheel.svg'
import deckImg            from '@/assets/img/deck_of_cards.svg'
import medalImg           from '@/assets/img/medal.svg'
import beeLadybugImg      from '@/assets/img/bee_ladybug.svg'
import hornet1Img         from '@/assets/img/hornet_1.svg'
import branchBee1Img      from '@/assets/img/branch_bee_1.svg'
import branchLadybug2Img  from '@/assets/img/branch_ladybug_2.svg'
import scarecrowImg       from '@/assets/img/scarecrow.svg'
import pesticideImg       from '@/assets/img/pesticide.svg'
import beeImg             from '@/assets/img/bee.svg'

import imgAbeilles from '@/assets/img/cards/VersoAbeilles.webp'
import imgVers from '@/assets/img/cards/VersoVers.webp'
import imgCoccinelles from '@/assets/img/cards/VersoCoccinelles.webp'
import imgFrelons from '@/assets/img/cards/VersoFrelons.webp'
import imgPesticides from '@/assets/img/cards/VersoPesticides.webp'
import imgAgricole from '@/assets/img/cards/VersoAgricole.webp'
import imgEpouvantail from '@/assets/img/cards/VersoEpouvantail.webp'

const { t, tm } = useI18n()

const pedagogyFacts = computed(() => tm('home.pedagogy.facts') as string[])
const ctaChips = computed(() => tm('home.cta.chips') as string[])
const howSteps = computed(() => [
  { label: (tm('home.how.steps') as string[])[0], n: '1', img: wheelImg, badge: 'bg-primary',   imgClass: 'w-32 h-32' },
  { label: (tm('home.how.steps') as string[])[1], n: '2', img: deckImg,  badge: 'bg-amber-400', imgClass: 'w-36 h-36' },
  { label: (tm('home.how.steps') as string[])[2], n: '3', img: medalImg, badge: 'bg-red',        imgClass: 'w-32 h-32' },
])

/* ── Card slider ── */
const cardImages = [imgAbeilles, imgVers, imgCoccinelles, imgFrelons, imgPesticides, imgAgricole, imgEpouvantail]
const sliderCards = computed(() => {
  const translations = tm('home.slider.cards') as { name: string; desc: string }[]
  return translations.map((card, i) => ({ ...card, src: cardImages[i] }))
})
const currentIndex = ref(0)
const currentCard = computed(() => sliderCards.value[currentIndex.value] ?? sliderCards.value[0])

function getVisibleCards() {
  const total = sliderCards.value.length
  return [-2, -1, 0, 1, 2].map(offset => {
    const idx = (currentIndex.value + offset + total) % total
    return { ...sliderCards.value[idx], offset }
  })
}
const visibleCards = computed(() => getVisibleCards())
function next() { currentIndex.value = (currentIndex.value + 1) % sliderCards.value.length }
function prev() { currentIndex.value = (currentIndex.value - 1 + sliderCards.value.length) % sliderCards.value.length }

const newsletterTerms = ref(false)

let dragStartX = 0
let isDragging = false
function onPointerDown(e: PointerEvent) {
  isDragging = true
  dragStartX = e.clientX
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onPointerUp(e: PointerEvent) {
  if (!isDragging) return
  isDragging = false
  const delta = e.clientX - dragStartX
  if (Math.abs(delta) > 40) { delta < 0 ? next() : prev() }
}
</script>

<template>

  <!-- HERO -->
  <section class="relative overflow-hidden bg-primary py-20 px-6 text-center">
    <img :src="beeLadybugImg" aria-hidden="true" class="absolute top-0 left-0 w-28 sm:w-40 pointer-events-none select-none" />
    <img :src="hornet1Img"    aria-hidden="true" class="absolute top-0 right-0 w-24 sm:w-36 pointer-events-none select-none" />
    <img :src="branchBee1Img" aria-hidden="true" class="absolute bottom-0 left-0 w-36 sm:w-52 pointer-events-none select-none" />
    <img :src="branchLadybug2Img" aria-hidden="true" class="absolute bottom-0 right-0 w-36 sm:w-52 pointer-events-none select-none" />
    <div class="relative z-10">
      <h1 class="font-game text-cream text-7xl sm:text-9xl leading-none">SAUVE</h1>
      <p class="font-game text-cream/80 text-4xl sm:text-5xl italic my-1">qui</p>
      <h1 class="font-game text-cream text-7xl sm:text-9xl leading-none">POUSSE&nbsp;!</h1>
      <p class="text-cream/70 mt-6 text-base max-w-lg mx-auto leading-relaxed">{{ t('home.hero.tagline') }}</p>
    </div>
  </section>
  <WaveEdge color="var(--color-primary)" :size="56" />

  <!-- CONCEPT -->
  <section class="py-16 px-6 bg-white">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-brown mb-8">{{ t('home.concept.title') }}</h2>
      <p class="text-brown/75 mb-4 leading-relaxed">{{ t('home.concept.p1') }}</p>
      <p class="text-brown/75 mb-4 leading-relaxed">{{ t('home.concept.p2') }}</p>
      <p class="text-brown/75 mb-4 leading-relaxed">{{ t('home.concept.p3') }}</p>
      <p class="text-primary font-semibold text-lg mt-8 mb-8">{{ t('home.concept.p4') }}</p>
      <div class="flex flex-wrap gap-4 justify-center">
        <RouterLink to="/regles"
          class="px-8 py-3 bg-primary text-cream rounded-full font-semibold hover:scale-105 transition-transform">
          {{ t('home.hero.cta_rules') }}
        </RouterLink>
        <RouterLink to="/jouer"
          class="px-8 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors">
          {{ t('home.hero.cta_play') }}
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- LES RÈGLES DU JEU -->
  <section class="py-16 px-6 bg-white">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-brown text-center mb-3">{{ t('home.how.title') }}</h2>
      <p class="text-brown/55 text-center text-sm leading-relaxed mb-12 max-w-xl mx-auto">{{ t('home.how.desc') }}</p>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2 mb-12">
        <template v-for="(step, i) in howSteps" :key="step.n">
          <div class="bg-cream rounded-3xl flex flex-col items-center justify-between gap-4 px-6 pt-8 pb-6 w-48 h-64 relative shrink-0 overflow-visible">
            <span
              class="absolute -top-5 -left-5 w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md z-10"
              :class="step.badge"
            >{{ step.n }}</span>
            <img :src="step.img" :alt="step.label" :class="step.imgClass" class="object-contain" />
            <p class="text-brown font-bold text-sm text-center leading-snug">{{ step.label }}</p>
          </div>
          <ArrowRight v-if="i < 2" :stroke-width="1.5" class="w-7 h-7 text-brown/25 shrink-0 rotate-90 sm:rotate-0" />
        </template>
      </div>

      <div class="text-center">
        <RouterLink to="/regles"
          class="inline-block px-8 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors">
          {{ t('home.how.cta') }}
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- PRÊT À JOUER ? — encadré centré + doodles de chaque côté -->
  <section class="py-16 px-4 bg-white">
    <div class="max-w-5xl mx-auto flex items-center justify-center">

      <!-- Scarecrow gauche — slot de largeur fixe pour garder la carte centrée -->
      <div class="hidden md:flex justify-end items-end w-52 lg:w-64 shrink-0 pr-6">
        <img :src="scarecrowImg" aria-hidden="true"
          class="h-64 lg:h-72 pointer-events-none select-none" />
      </div>

      <!-- Carte brune -->
      <div class="bg-brown rounded-3xl px-10 py-12 text-center w-full max-w-lg z-20 shadow-xl">
        <h2 class="text-cream mb-3">{{ t('home.cta.title') }}</h2>
        <p class="text-cream/60 text-sm mb-8 leading-relaxed">{{ t('home.cta.subtitle') }}</p>
        <div class="flex flex-wrap justify-center gap-3 mb-8">
          <span v-for="chip in ctaChips" :key="chip"
            class="px-4 py-1.5 rounded-full border border-cream/25 text-cream/70 text-sm font-medium">
            {{ chip }}
          </span>
        </div>
        <div class="flex flex-col gap-3">
          <RouterLink to="/jouer"
            class="px-8 py-4 bg-primary text-cream rounded-full font-semibold hover:scale-105 transition-transform shadow-lg shadow-primary/20 text-center">
            {{ t('home.cta.create') }}
          </RouterLink>
          <RouterLink to="/jouer"
            class="px-8 py-4 border-2 border-primary text-primary rounded-full font-semibold hover:bg-primary hover:text-cream transition-colors text-center">
            {{ t('home.cta.join') }}
          </RouterLink>
        </div>
      </div>

      <!-- Pesticide droite — même largeur que le slot scarecrow -->
      <div class="hidden md:flex justify-start items-end w-52 lg:w-64 shrink-0 pl-6">
        <img :src="pesticideImg" aria-hidden="true"
          class="h-56 lg:h-64 pointer-events-none select-none" />
      </div>

    </div>
  </section>

  <!-- NOS CARTES -->
  <section class="py-16 px-6 bg-white overflow-hidden">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-10">
        <h2 class="text-brown">{{ t('home.slider.title') }}</h2>
        <RouterLink to="/cartes"
          class="px-5 py-2 border-2 border-brown text-brown rounded-full text-sm font-semibold hover:bg-brown hover:text-cream transition-colors whitespace-nowrap">
          {{ t('home.slider.see_all') }}
        </RouterLink>
      </div>

      <div class="relative">
        <div class="flex items-center justify-center h-85 relative select-none touch-pan-y"
          @pointerdown="onPointerDown"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <TransitionGroup name="card-slide">
            <div v-for="card in visibleCards" :key="(card.name ?? '') + card.offset"
              class="absolute transition-all duration-500 ease-out"
              :style="{
                transform: `translateX(${card.offset * 140}px) scale(${card.offset === 0 ? 1 : 0.82}) rotate(${card.offset * 4}deg)`,
                zIndex: 10 - Math.abs(card.offset),
              }"
            >
              <img :src="card.src" :alt="card.name" class="w-44 h-auto" draggable="false" />
            </div>
          </TransitionGroup>
        </div>
        <button @click="prev" class="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-all cursor-pointer z-20">
          <ChevronLeft :stroke-width="2" class="w-5 h-5 text-brown" />
        </button>
        <button @click="next" class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-all cursor-pointer z-20">
          <ChevronRight :stroke-width="2" class="w-5 h-5 text-brown" />
        </button>
      </div>

      <div class="text-center mt-6 h-20">
        <h3 class="text-brown mb-1">{{ currentCard?.name }}</h3>
        <p class="text-brown/50 text-sm max-w-xs mx-auto line-clamp-2 leading-relaxed">{{ currentCard?.desc }}</p>
      </div>
      <div class="flex justify-center gap-2 mt-4">
        <button v-for="(_, i) in sliderCards" :key="i" @click="currentIndex = i"
          class="w-2.5 h-2.5 rounded-full transition-all cursor-pointer"
          :class="i === currentIndex ? 'bg-brown scale-110' : 'bg-brown/25 hover:bg-brown/40'" />
      </div>
    </div>
  </section>

  <!-- PÉDAGOGIE -->
  <section class="py-16 px-6 bg-white">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-brown mb-3">{{ t('home.pedagogy.title') }}</h2>
      <p class="text-brown/55 text-sm italic mb-8">{{ t('home.pedagogy.intro') }}</p>
      <ul class="flex flex-col gap-3 mb-10">
        <li v-for="(fact, i) in pedagogyFacts" :key="i"
          class="flex items-center gap-3 bg-primary rounded-full px-5 py-3">
          <span class="text-cream text-sm leading-snug">{{ fact }}</span>
        </li>
      </ul>
      <p class="text-brown/70 leading-relaxed">{{ t('home.pedagogy.conclusion') }}</p>
    </div>
  </section>

  <!-- INSCRIVEZ VOUS -->
  <section class="py-16 px-6 bg-brown">
    <div class="max-w-md mx-auto">
      <h2 class="text-cream mb-1">{{ t('play.register.title') }}</h2>
      <p class="text-cream/50 text-sm mb-8">{{ t('play.register.subtitle') }}</p>
      <form class="space-y-3" @submit.prevent>
        <div class="grid grid-cols-2 gap-3">
          <input type="text" :placeholder="t('play.register.firstname')"
            class="px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm w-full" />
          <input type="text" :placeholder="t('play.register.lastname')"
            class="px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm w-full" />
        </div>
        <input type="email" :placeholder="t('play.register.email')"
          class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
        <input type="password" :placeholder="t('play.register.password')"
          class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
        <input type="password" :placeholder="t('play.register.confirm_password')"
          class="w-full px-4 py-3 rounded-xl border-2 border-primary bg-cream text-brown placeholder:text-brown/40 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
        <RouterLink to="/jouer"
          class="block w-full py-4 bg-primary text-cream rounded-full font-bold text-center hover:scale-[1.02] transition-transform">
          {{ t('play.register.submit') }}
        </RouterLink>
        <p class="text-cream/35 text-xs text-center">{{ t('play.register.legal') }}</p>
        <p class="text-center text-sm text-cream/55">
          {{ t('play.register.switch_login') }}
          <RouterLink to="/jouer" class="text-primary font-semibold hover:underline">
            {{ t('play.register.switch_login_link') }}
          </RouterLink>
        </p>
      </form>
    </div>
  </section>

  <!-- NEWSLETTER -->
  <section class="py-12 px-6 bg-white">
    <div class="max-w-2xl mx-auto">
      <div class="bg-cream rounded-3xl p-8 sm:p-10 relative overflow-hidden">

        <!-- Bee doodle coin haut-droit -->
        <img :src="beeImg" aria-hidden="true"
          class="absolute top-3 right-3 w-20 sm:w-28 pointer-events-none select-none rotate-[-20deg]" />

        <h3 class="font-game text-brown text-3xl mb-8">{{ t('home.newsletter.title') }}</h3>

        <p class="text-brown font-semibold text-sm mb-1">
          Email <span class="text-red">*</span>
        </p>
        <div class="flex gap-3 mb-6">
          <input type="email" :placeholder="t('home.newsletter.placeholder')"
            class="flex-1 min-w-0 px-4 py-3 rounded-xl border border-brown/20 bg-white text-brown placeholder:text-brown/35 focus:outline-none focus:border-primary text-sm transition-colors" />
          <button class="px-6 py-3 bg-brown text-white rounded-xl font-bold hover:bg-brown/90 transition-colors cursor-pointer shrink-0 text-sm">
            {{ t('home.newsletter.submit') }}
          </button>
        </div>

        <!-- Toggle switch -->
        <label class="flex items-center gap-3 cursor-pointer w-fit">
          <div class="relative w-11 h-6 flex-shrink-0" @click="newsletterTerms = !newsletterTerms">
            <div class="w-11 h-6 rounded-full transition-colors"
              :class="newsletterTerms ? 'bg-primary' : 'bg-brown/20'" />
            <div class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
              :class="newsletterTerms ? 'translate-x-5' : 'translate-x-0'" />
          </div>
          <span class="text-brown/60 text-sm">
            {{ t('home.newsletter.terms') }} <span class="text-red text-xs">*</span>
          </span>
        </label>

      </div>
    </div>
  </section>

</template>

<style scoped>
.card-slide-enter-active,
.card-slide-leave-active { transition: all 0.5s ease; }
.card-slide-enter-from { opacity: 0; transform: translateX(100px) scale(0.7); }
.card-slide-leave-to { opacity: 0; transform: translateX(-100px) scale(0.7); }
</style>
