<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import WaveEdge from '@/components/WaveEdge.vue'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-vue-next'

import wheelImg from '@/assets/img/spinning_wheel.svg'
import deckImg from '@/assets/img/deck_of_cards.svg'
import medalImg from '@/assets/img/medal.svg'
import beeLadybugImg from '@/assets/img/bee_ladybug.svg'
import hornet1Img from '@/assets/img/hornet_1.svg'
import branchBee1Img from '@/assets/img/branch_bee_1.svg'
import branchLadybug2Img from '@/assets/img/branch_ladybug_2.svg'
import branchLadybug1Img from '@/assets/img/branch_ladybug_1.svg'
import scarecrowImg from '@/assets/img/scarecrow.svg'
import tractorImg from '@/assets/img/tractor.svg'
import pesticideImg from '@/assets/img/pesticide.svg'
import hornet2Img from '@/assets/img/hornet_2.svg'
import branchBee2Img from '@/assets/img/branch_bee_2.svg'
import leafsImg from '@/assets/img/leafs.svg'
import wormImg from '@/assets/img/worm.svg'
import ladybugImg from '@/assets/img/ladybug.svg'

import imgAbeilles from '@/assets/img/cards/VersoAbeilles.webp'
import imgVers from '@/assets/img/cards/VersoVers.webp'
import imgCoccinelles from '@/assets/img/cards/VersoCoccinelles.webp'
import imgFrelons from '@/assets/img/cards/VersoFrelons.webp'
import imgPesticides from '@/assets/img/cards/VersoPesticides.webp'
import imgAgricole from '@/assets/img/cards/VersoAgricole.webp'
import imgEpouvantail from '@/assets/img/cards/VersoEpouvantail.webp'

const { t, tm, locale } = useI18n()
const currentLocale = locale
function setLocale(l: string) {
  locale.value = l
  localStorage.setItem('locale', l)
}

const pedagogyFacts = computed(() => tm('home.pedagogy.facts') as string[])
const ctaChips = computed(() => tm('home.cta.chips') as string[])
const howSteps = computed(() => [
  {
    label: (tm('home.how.steps') as string[])[0],
    n: '1',
    img: wheelImg,
    badge: 'bg-primary',
    imgClass: 'w-full max-w-[14rem] lg:max-w-[18rem] h-auto',
  },
  {
    label: (tm('home.how.steps') as string[])[1],
    n: '2',
    img: deckImg,
    badge: 'bg-amber-400',
    imgClass: 'w-full max-w-[14rem] lg:max-w-[18rem] h-auto',
  },
  {
    label: (tm('home.how.steps') as string[])[2],
    n: '3',
    img: medalImg,
    badge: 'bg-red',
    imgClass: 'w-full max-w-[14rem] lg:max-w-[18rem] h-auto',
  },
])

/* ── Card slider ── */
const cardImages = [
  imgAbeilles,
  imgVers,
  imgCoccinelles,
  imgFrelons,
  imgPesticides,
  imgAgricole,
  imgEpouvantail,
]
const sliderCards = computed(() => {
  const translations = tm('home.slider.cards') as { name: string; desc: string }[]
  return translations.map((card, i) => ({ ...card, src: cardImages[i] }))
})
const currentIndex = ref(0)
const currentCard = computed(() => sliderCards.value[currentIndex.value] ?? sliderCards.value[0])

const direction = ref<'left' | 'right'>('left')

const windowWidth = ref(window.innerWidth)
function onWindowResize() { windowWidth.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', onWindowResize))
onUnmounted(() => window.removeEventListener('resize', onWindowResize))

const cardWidth = computed(() => windowWidth.value >= 1024 ? 256 : windowWidth.value >= 768 ? 180 : 210)
const cardOffset = computed(() => windowWidth.value >= 1024 ? 190 : windowWidth.value >= 768 ? 135 : 155)

function getVisibleCards() {
  const total = sliderCards.value.length
  return [-2, -1, 0, 1, 2].map((offset) => {
    const idx = (currentIndex.value + offset + total) % total
    return { ...sliderCards.value[idx], offset }
  })
}
const visibleCards = computed(() => getVisibleCards())

function next() {
  direction.value = 'left'
  currentIndex.value = (currentIndex.value + 1) % sliderCards.value.length
}
function prev() {
  direction.value = 'right'
  currentIndex.value =
    (currentIndex.value - 1 + sliderCards.value.length) % sliderCards.value.length
}

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
  if (Math.abs(delta) > 40) {
    delta < 0 ? next() : prev()
  }
}
</script>

<template>
  <!-- HERO MOBILE : SVG complet depuis /public -->
  <div class="block md:hidden w-full">
    <img src="/hero_mobile.svg" alt="Sauve qui Pousse" class="w-full block" />
    <!-- Sélecteur de langue sous le hero, style marron -->
    <div class="flex justify-end gap-2 px-4 py-3 bg-white">
      <button
        v-for="locale in ['fr', 'en', 'es']"
        :key="locale"
        @click="setLocale(locale)"
        :class="[
          'px-3 py-1 rounded text-sm font-semibold transition-colors border',
          currentLocale === locale
            ? 'bg-brown text-cream border-brown'
            : 'bg-transparent text-brown border-brown hover:bg-brown hover:text-cream',
        ]"
      >
        {{ locale.toUpperCase() }}
      </button>
    </div>
  </div>

  <!-- HERO DESKTOP : SVG fond + hornet_1 bas-droite -->
  <div class="hidden md:block relative z-10 w-full">
    <img src="/hero_desktop.svg" alt="Sauve qui Pousse" class="w-full block" />
    <img
      :src="hornet1Img"
      aria-hidden="true"
      class="absolute -bottom-1/4 right-0 w-64 lg:w-80 xl:w-96 pointer-events-none select-none z-30"
    />
  </div>

  <!-- CONCEPT -->
  <section class="relative pt-8 md:pt-40 lg:pt-48 pb-16 px-6 bg-white overflow-visible">
    <!-- branch_ladybug_1 haut-gauche -->
    <img
      :src="branchLadybug1Img"
      aria-hidden="true"
      class="hidden md:block absolute -top-20 lg:-top-28 left-0 w-72 lg:w-[30rem] xl:w-[34rem] pointer-events-none select-none z-0"
    />
    <!-- branch_bee_1 bas-droite -->
    <img
      :src="branchBee1Img"
      aria-hidden="true"
      class="hidden md:block absolute -bottom-40 lg:-bottom-64 right-0 w-72 lg:w-[30rem] xl:w-[34rem] pointer-events-none select-none z-20"
    />
    <div class="max-w-2xl mx-auto text-center relative z-10">
      <h2 class="text-brown mb-8">{{ t('home.concept.title') }}</h2>
      <p class="text-brown/75 mb-4 leading-relaxed">{{ t('home.concept.p1') }}</p>
      <p class="text-brown/75 mb-4 leading-relaxed">{{ t('home.concept.p2') }}</p>
      <p class="text-brown/75 mb-4 leading-relaxed">{{ t('home.concept.p3') }}</p>
      <p class="text-primary font-semibold text-lg mt-8 mb-8">{{ t('home.concept.p4') }}</p>
      <div class="flex flex-wrap gap-4 justify-center">
        <RouterLink
          to="/regles"
          class="px-8 py-3 bg-primary text-cream rounded-full font-semibold hover:scale-105 transition-transform"
        >
          {{ t('home.hero.cta_rules') }}
        </RouterLink>
        <RouterLink
          to="/jouer"
          class="px-8 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors"
        >
          {{ t('home.hero.cta_play') }}
        </RouterLink>
      </div>
    </div>
  </section>

  <!-- LES RÈGLES DU JEU -->
  <section class="pt-8 md:pt-28 pb-8 md:pb-16 pl-4 md:pl-10 pr-4 md:pr-6 bg-white relative overflow-x-hidden overflow-y-visible">
    <h2 class="text-brown mb-3">{{ t('home.how.title') }}</h2>
    <p class="text-brown/55 text-base leading-relaxed mb-12 max-w-2xl">
      {{ t('home.how.desc') }}
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4 mb-12">
      <template v-for="(step, i) in howSteps" :key="step.n">
        <div
          class="bg-cream rounded-3xl flex flex-col items-center justify-between gap-4 px-4 pt-16 pb-6 relative overflow-visible w-full"
          :class="{ 'z-10': true }"
        >
          <span
            class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-md z-10"
            style="font-family: 'Nunito', sans-serif; font-weight: 800"
            :class="step.badge"
            >{{ step.n }}</span
          >
          <img :src="step.img" :alt="step.label" :class="step.imgClass" class="object-contain" />
          <p
            class="text-brown text-center leading-snug"
            style="font-family: 'Nunito', sans-serif; font-weight: 900; font-size: 1.5rem"
          >
            {{ step.label }}
          </p>
          <!-- Ver de terre sur la carte "Gagne !!!" (step 3) -->
          <img
            v-if="step.n === '3'"
            :src="wormImg"
            aria-hidden="true"
            class="hidden md:block absolute -bottom-14 -right-16 w-44 pointer-events-none select-none z-30 -rotate-12"
          />
        </div>
        <ArrowRight
          v-if="i < 2"
          :stroke-width="3"
          class="w-8 h-8 text-brown shrink-0 hidden sm:block justify-self-center"
        />
      </template>
    </div>

    <div class="text-center">
      <RouterLink
        to="/regles"
        class="inline-block px-8 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors"
      >
        {{ t('home.how.cta') }}
      </RouterLink>
    </div>
  </section>

  <!-- PRÊT À JOUER ? — encadré centré + doodles de chaque côté -->
  <section class="py-8 md:py-16 bg-white flex justify-center overflow-hidden">
    <div class="w-full flex items-center justify-center gap-4 lg:gap-8 px-4 lg:px-0">
      <!-- Scarecrow gauche -->
      <div class="hidden md:flex justify-end items-end shrink-0 w-40 lg:w-80">
        <img
          :src="scarecrowImg"
          aria-hidden="true"
          class="h-[18rem] lg:h-[30rem] pointer-events-none select-none"
        />
      </div>

      <!-- Carte brune -->
      <div class="bg-brown rounded-3xl px-6 lg:px-10 py-8 lg:py-10 w-full max-w-sm lg:max-w-lg z-20 shadow-xl">
        <h2 class="text-cream text-center leading-tight mb-4" style="font-size: 2.2rem">
          {{ t('home.cta.title') }}
        </h2>

        <p class="text-cream/60 text-base leading-relaxed mb-6 text-center">
          {{ t('home.cta.subtitle') }}
        </p>

        <!-- Chips -->
        <div class="flex flex-wrap justify-center gap-2 mb-6">
          <span
            v-for="chip in ctaChips"
            :key="chip"
            class="px-5 py-2 rounded-full bg-white/10 text-cream/80 text-base"
            style="font-family: 'Nunito', sans-serif; font-weight: 700"
          >
            {{ chip }}
          </span>
        </div>

        <!-- Boutons -->
        <div class="flex flex-col gap-3">
          <RouterLink
            to="/jouer"
            class="py-4 bg-primary text-cream rounded-full font-semibold hover:scale-105 transition-transform text-center text-lg"
            style="font-family: 'Nunito', sans-serif; font-weight: 800"
          >
            {{ t('home.cta.create') }}
          </RouterLink>
          <RouterLink
            to="/jouer"
            class="py-4 border-2 border-primary text-primary rounded-full hover:bg-primary hover:text-cream transition-colors text-center text-lg"
            style="font-family: 'Nunito', sans-serif; font-weight: 800"
          >
            {{ t('home.cta.join') }}
          </RouterLink>
        </div>
      </div>

      <!-- Pesticide droite -->
      <div class="hidden md:flex justify-start items-end shrink-0 w-40 lg:w-80">
        <img
          :src="pesticideImg"
          aria-hidden="true"
          class="h-[18rem] lg:h-[30rem] pointer-events-none select-none"
        />
      </div>
    </div>
  </section>

  <!-- NOS CARTES -->
  <div class="mt-6 md:mt-20 lg:mt-32"></div>
  <WaveEdge color="var(--color-cream-dark)" position="top" :size="56" />
  <section class="pt-6 md:pt-10 lg:pt-20 pb-6 md:pb-10 lg:pb-16 px-6 bg-cream-dark overflow-visible relative">
    <!-- leafs haut-gauche, à cheval sur le WaveEdge blanc/crème -->
    <img
      :src="leafsImg"
      aria-hidden="true"
      class="hidden md:block absolute -top-72 left-0 w-72 xl:w-80 pointer-events-none select-none z-30"
    />
    <!-- Coccinelle bas-droite, à cheval sur le WaveEdge crème/blanc -->
    <img
      :src="ladybugImg"
      aria-hidden="true"
      class="hidden md:block absolute -bottom-28 right-12 w-52 xl:w-60 pointer-events-none select-none z-30"
    />

    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-10">
        <h2 class="text-brown">{{ t('home.slider.title') }}</h2>
        <RouterLink
          to="/cartes"
          class="px-5 py-2 border-2 border-brown text-brown rounded-full text-sm font-semibold hover:bg-brown hover:text-cream transition-colors whitespace-nowrap"
        >
          {{ t('home.slider.see_all') }}
        </RouterLink>
      </div>

      <div class="relative">
        <div
          class="flex items-center justify-center h-[22rem] lg:h-[30rem] relative select-none touch-pan-y overflow-visible"
          @pointerdown="onPointerDown"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <TransitionGroup :name="'fan-' + direction">
            <div
              v-for="card in visibleCards"
              :key="card.name"
              class="absolute fan-card"
              :style="{
                transform: `translateX(${card.offset * cardOffset}px) scale(${card.offset === 0 ? 1 : Math.abs(card.offset) === 1 ? 0.82 : 0.65}) rotate(${card.offset * 4}deg)`,
                zIndex: 10 - Math.abs(card.offset),
                opacity: Math.abs(card.offset) > 1 ? 0.6 : 1,
              }"
            >
              <img :src="card.src" :alt="card.name" :style="{ width: cardWidth + 'px' }" class="h-auto" draggable="false" />
            </div>
          </TransitionGroup>
        </div>
        <button
          @click="prev"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-all cursor-pointer z-20"
        >
          <ChevronLeft :stroke-width="2" class="w-5 h-5 text-brown" />
        </button>
        <button
          @click="next"
          class="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 shadow flex items-center justify-center hover:bg-white transition-all cursor-pointer z-20"
        >
          <ChevronRight :stroke-width="2" class="w-5 h-5 text-brown" />
        </button>
      </div>

      <div class="text-center mt-6 h-24">
        <h3 class="text-brown mb-2">{{ currentCard?.name }}</h3>
        <p class="text-brown/50 text-lg max-w-sm mx-auto line-clamp-2 leading-relaxed">
          {{ currentCard?.desc }}
        </p>
      </div>
      <div class="flex justify-center gap-3 mt-4">
        <button
          v-for="(_, i) in sliderCards"
          :key="i"
          @click="currentIndex = i"
          class="w-4 h-4 rounded-full transition-all cursor-pointer"
          :class="i === currentIndex ? 'bg-brown scale-110' : 'bg-brown/25 hover:bg-brown/40'"
        />
      </div>
    </div>
  </section>
  <div class="relative z-20"><WaveEdge color="var(--color-cream-dark)" :size="56" /></div>

  <!-- PÉDAGOGIE -->
  <section class="relative pt-8 md:pt-44 lg:pt-48 pb-8 md:pb-16 px-6 bg-white overflow-visible z-10">
    <!-- branch_bee_2 haut-gauche -->
    <img
      :src="branchBee2Img"
      aria-hidden="true"
      class="hidden md:block absolute -top-20 lg:-top-28 left-0 w-72 lg:w-[30rem] xl:w-[34rem] pointer-events-none select-none z-10"
    />
    <!-- branch_ladybug_2 bas-droite -->
    <img
      :src="branchLadybug2Img"
      aria-hidden="true"
      class="hidden md:block absolute -bottom-40 lg:-bottom-64 right-0 w-72 lg:w-[30rem] xl:w-[34rem] pointer-events-none select-none z-20"
    />

    <div class="max-w-2xl mx-auto relative z-10">
      <!-- Titre + intro -->
      <h2 class="text-brown mb-2">{{ t('home.pedagogy.title') }}</h2>
      <p class="text-brown/55 text-sm italic mb-10" style="font-family: 'Nunito', sans-serif">
        {{ t('home.pedagogy.intro') }}
      </p>

      <!-- Faits : cards avec numéro -->
      <ul class="flex flex-col gap-4 mb-10">
        <li
          v-for="(fact, i) in pedagogyFacts"
          :key="i"
          class="flex items-start gap-4 bg-primary/10 border border-primary/30 rounded-2xl px-5 py-4"
        >
          <span
            class="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-cream text-sm mt-0.5"
            style="font-family: 'Nunito', sans-serif; font-weight: 800"
          >
            {{ i + 1 }}
          </span>
          <span
            class="text-brown text-sm leading-relaxed"
            style="font-family: 'Nunito', sans-serif; font-weight: 600"
          >
            {{ fact }}
          </span>
        </li>
      </ul>

      <!-- Conclusion -->
      <div class="bg-brown rounded-2xl px-6 py-5">
        <p
          class="text-cream/90 leading-relaxed text-sm"
          style="font-family: 'Nunito', sans-serif; font-weight: 600"
        >
          {{ t('home.pedagogy.conclusion') }}
        </p>
      </div>
    </div>
  </section>

  <!-- INSCRIVEZ VOUS -->
  <section class="relative pt-8 md:pt-36 lg:pt-48 pb-8 md:pb-16 px-4 bg-white overflow-visible">
    <!-- Carte brune centrée + assets positionnés par rapport à elle -->
    <div class="relative max-w-xl lg:max-w-2xl mx-auto bg-brown rounded-3xl px-6 sm:px-10 py-8 lg:py-10 z-20">
      <!-- hornet_2 haut-gauche, déborde sur le coin -->
      <img
        :src="hornet2Img"
        aria-hidden="true"
        class="hidden md:block absolute -top-28 lg:-top-35 -left-24 lg:-left-32 w-48 lg:w-64 xl:w-72 pointer-events-none select-none z-30"
      />
      <!-- Tracteur bas-droite, déborde sur le coin -->
      <img
        :src="tractorImg"
        aria-hidden="true"
        class="hidden md:block absolute -bottom-16 lg:-bottom-24 -right-24 lg:-right-32 w-48 lg:w-64 xl:w-72 pointer-events-none select-none z-30"
      />
      <!-- Titre centré -->
      <div class="text-center mb-8">
        <h2 class="font-game text-white text-4xl">{{ t('play.register.title') }}</h2>
      </div>

      <form class="space-y-5" @submit.prevent>
        <!-- Prénom + Nom -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-cream text-sm mb-1"
              style="font-family: 'Nunito', sans-serif; font-weight: 700"
            >
              {{ t('play.register.firstname') }} <span class="text-primary">*</span>
            </label>
            <input
              type="text"
              autocomplete="given-name"
              placeholder="Lucie"
              class="w-full px-4 py-3 rounded-xl bg-white text-brown placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              style="font-family: 'Nunito', sans-serif"
            />
          </div>
          <div>
            <label
              class="block text-cream text-sm mb-1"
              style="font-family: 'Nunito', sans-serif; font-weight: 700"
            >
              {{ t('play.register.lastname') }} <span class="text-primary">*</span>
            </label>
            <input
              type="text"
              autocomplete="family-name"
              placeholder="Dupont"
              class="w-full px-4 py-3 rounded-xl bg-white text-brown placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              style="font-family: 'Nunito', sans-serif"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label
            class="block text-cream text-sm mb-1"
            style="font-family: 'Nunito', sans-serif; font-weight: 700"
          >
            {{ t('play.register.email') }} <span class="text-primary">*</span>
          </label>
          <input
            type="email"
            autocomplete="email"
            placeholder="lucie@exemple.com"
            class="w-full px-4 py-3 rounded-xl bg-white text-brown placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
            style="font-family: 'Nunito', sans-serif"
          />
        </div>

        <!-- Mot de passe + Confirmer -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              class="block text-cream text-sm mb-1"
              style="font-family: 'Nunito', sans-serif; font-weight: 700"
            >
              {{ t('play.register.password') }} <span class="text-primary">*</span>
            </label>
            <input
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl bg-white text-brown placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              style="font-family: 'Nunito', sans-serif"
            />
            <p class="text-white/40 text-xs mt-1" style="font-family: 'Nunito', sans-serif">
              {{ t('play.register.password_hint') }}
            </p>
          </div>
          <div>
            <label
              class="block text-cream text-sm mb-1"
              style="font-family: 'Nunito', sans-serif; font-weight: 700"
            >
              {{ t('play.register.confirm_password') }} <span class="text-primary">*</span>
            </label>
            <input
              type="password"
              autocomplete="new-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 rounded-xl bg-white text-brown placeholder:text-brown/30 focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm"
              style="font-family: 'Nunito', sans-serif"
            />
          </div>
        </div>

        <!-- Submit -->
        <RouterLink
          to="/jouer"
          class="block w-full sm:w-2/3 mx-auto px-8 py-4 bg-primary text-white rounded-full text-center hover:scale-[1.03] transition-transform mt-4"
          style="font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 1rem"
        >
          {{ t('play.register.submit') }}
        </RouterLink>

        <!-- Légal -->
        <p
          class="text-white/50 text-xs text-center leading-relaxed"
          style="font-family: 'Nunito', sans-serif"
        >
          {{ t('play.register.legal') }}
        </p>
        <p
          class="text-center text-sm text-white/60"
          style="font-family: 'Nunito', sans-serif; font-weight: 600"
        >
          {{ t('play.register.switch_login') }}
          <RouterLink
            to="/jouer"
            class="text-primary font-semibold hover:underline"
            style="font-family: 'Nunito', sans-serif; font-weight: 700"
          >
            {{ t('play.register.switch_login_link') }}
          </RouterLink>
        </p>
      </form>
    </div>
  </section>

  <!-- NEWSLETTER -->
  <section class="relative py-8 md:py-12 px-4 md:px-6 bg-white overflow-visible">
    <div class="max-w-lg mx-auto">
      <div class="bg-cream rounded-3xl px-6 py-6 sm:px-8 sm:py-8 relative overflow-hidden">
        <!-- Titre + bee_ladybug sur la même ligne -->
        <div class="flex items-start justify-between mb-6">
          <h3 class="font-game text-brown text-3xl">{{ t('home.newsletter.title') }}</h3>
          <img
            :src="beeLadybugImg"
            aria-hidden="true"
            class="w-16 sm:w-20 shrink-0 pointer-events-none select-none rotate-[-15deg] -mt-1"
          />
        </div>

        <p
          class="text-brown text-sm mb-1"
          style="font-family: 'Nunito', sans-serif; font-weight: 700"
        >
          Email <span class="text-red">*</span>
        </p>
        <div class="flex gap-2 mb-5">
          <input
            type="email"
            :placeholder="t('home.newsletter.placeholder')"
            class="flex-1 min-w-0 px-3 py-2.5 rounded-xl border border-brown/20 bg-white text-brown placeholder:text-brown/35 focus:outline-none focus:border-primary text-sm transition-colors"
            style="font-family: 'Nunito', sans-serif"
          />
          <button
            class="px-5 py-2.5 bg-brown text-white rounded-xl font-bold hover:bg-brown/90 transition-colors cursor-pointer shrink-0 text-sm"
            style="font-family: 'Nunito', sans-serif; font-weight: 800"
          >
            {{ t('home.newsletter.submit') }}
          </button>
        </div>

        <!-- Toggle switch -->
        <label class="flex items-center gap-3 cursor-pointer w-fit">
          <div class="relative w-11 h-6 flex-shrink-0" @click="newsletterTerms = !newsletterTerms">
            <div
              class="w-11 h-6 rounded-full transition-colors"
              :class="newsletterTerms ? 'bg-primary' : 'bg-brown/20'"
            />
            <div
              class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform"
              :class="newsletterTerms ? 'translate-x-5' : 'translate-x-0'"
            />
          </div>
          <span class="text-brown/60 text-sm" style="font-family: 'Nunito', sans-serif">
            {{ t('home.newsletter.terms') }}
          </span>
        </label>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Éventail : transition commune sur la position */
.fan-card {
  transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity   500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Carte qui ENTRE par la droite (direction = left / next) */
.fan-left-enter-from {
  transform: translateX(600px) scale(0.5) rotate(16deg) !important;
  opacity: 0 !important;
}
.fan-left-enter-active { transition: transform 500ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 500ms ease; }
.fan-left-leave-to {
  transform: translateX(-600px) scale(0.5) rotate(-16deg) !important;
  opacity: 0 !important;
}
.fan-left-leave-active { transition: transform 500ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 500ms ease; position: absolute; }

/* Carte qui ENTRE par la gauche (direction = right / prev) */
.fan-right-enter-from {
  transform: translateX(-600px) scale(0.5) rotate(-16deg) !important;
  opacity: 0 !important;
}
.fan-right-enter-active { transition: transform 500ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 500ms ease; }
.fan-right-leave-to {
  transform: translateX(600px) scale(0.5) rotate(16deg) !important;
  opacity: 0 !important;
}
.fan-right-leave-active { transition: transform 500ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 500ms ease; position: absolute; }
</style>
