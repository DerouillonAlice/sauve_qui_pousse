<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import WaveEdge from '@/components/WaveEdge.vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import imgAbeilles from '@/assets/img/cards/VersoAbeilles.webp'
import imgVers from '@/assets/img/cards/VersoVers.webp'
import imgCoccinelles from '@/assets/img/cards/VersoCoccinelles.webp'
import imgFrelons from '@/assets/img/cards/VersoFrelons.webp'
import imgPesticides from '@/assets/img/cards/VersoPesticides.webp'
import imgAgricole from '@/assets/img/cards/VersoAgricole.webp'
import imgEpouvantail from '@/assets/img/cards/VersoEpouvantail.webp'
const { t, tm } = useI18n()

const pedagogyFacts = computed(() => tm('home.pedagogy.facts') as string[])

/* ── Card slider ── */
const cardImages = [imgAbeilles, imgVers, imgCoccinelles, imgFrelons, imgPesticides, imgAgricole, imgEpouvantail]
const sliderCards = computed(() => {
  const translations = tm('home.slider.cards') as { name: string; desc: string }[]
  return translations.map((card, i) => ({ ...card, src: cardImages[i] }))
})

const currentIndex = ref(0)
const currentCard = computed(() => sliderCards.value[currentIndex.value])

function getVisibleCards() {
  const total = sliderCards.value.length
  return [-2, -1, 0, 1, 2].map(offset => {
    const idx = (currentIndex.value + offset + total) % total
    return { ...sliderCards.value[idx], offset }
  })
}

const visibleCards = computed(() => getVisibleCards())

function next() {
  currentIndex.value = (currentIndex.value + 1) % sliderCards.value.length
}
function prev() {
  currentIndex.value = (currentIndex.value - 1 + sliderCards.value.length) % sliderCards.value.length
}
</script>

<template>
  <!-- HERO -->
  <section class="py-20 flex flex-col items-center justify-center text-center px-6 bg-primary">
    <p class="text-cream/80 font-semibold tracking-widest uppercase text-sm mb-4">
      {{ t('home.hero.tagline') }}
    </p>
    <h1 class="text-cream max-w-3xl mb-6">
      {{ t('home.hero.title') }}
    </h1>
    <p class="text-cream/70 text-lg max-w-xl mb-10 leading-relaxed">
      {{ t('home.hero.subtitle') }}
    </p>
    <div class="flex gap-4 flex-wrap justify-center">
      <RouterLink to="/regles"
        class="px-8 py-3 bg-cream text-brown rounded-full font-semibold hover:scale-105 transition-transform">
        {{ t('home.hero.cta_rules') }}
      </RouterLink>
      <RouterLink to="/jouer"
        class="px-8 py-3 border-2 border-cream text-cream rounded-full font-semibold hover:bg-cream hover:text-brown transition-colors">
        {{ t('home.hero.cta_play') }}
      </RouterLink>
    </div>
  </section>
  <WaveEdge color="var(--color-primary)" :size="80" />

  <!-- SECTION BLANCHE -->
  <section class="py-24 px-6 bg-white">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-brown mb-8">{{ t('home.concept.title') }}</h2>
      <p class="text-brown/80 mb-5 leading-relaxed">{{ t('home.concept.p1') }}</p>
      <p class="text-brown/80 mb-5 leading-relaxed">{{ t('home.concept.p2') }}</p>
      <p class="text-brown/80 mb-5 leading-relaxed">{{ t('home.concept.p3') }}</p>
      <p class="text-primary font-semibold text-xl mt-8">{{ t('home.concept.p4') }}</p>
    </div>
  </section>

  <!-- NOS CARTES — Slider -->
  <WaveEdge color="var(--color-cream-dark)" position="top" :size="80" />
  <section class="py-20 px-6 bg-cream-dark overflow-hidden">
    <div class="max-w-5xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-12">
        <h2 class="text-brown">{{ t('home.slider.title') }}</h2>
        <RouterLink to="/cartes"
          class="px-6 py-2 border-2 border-brown text-brown rounded-full font-semibold text-sm hover:bg-brown hover:text-cream transition-colors">
          {{ t('home.slider.see_all') }}
        </RouterLink>
      </div>

      <!-- Slider -->
      <div class="relative">
        <!-- Cards fan -->
        <div class="flex items-center justify-center gap-0 h-[380px] relative">
          <TransitionGroup name="card-slide">
            <div
              v-for="card in visibleCards"
              :key="card.name + card.offset"
              class="absolute transition-all duration-500 ease-out"
              :style="{
                transform: `translateX(${card.offset * 160}px) scale(${card.offset === 0 ? 1 : 0.85}) rotate(${card.offset * 4}deg)`,
                opacity: card.offset === 0 ? 1 : Math.abs(card.offset) === 1 ? 0.6 : 0.3,
                zIndex: 10 - Math.abs(card.offset),
              }"
            >
              <img
                :src="card.src"
                :alt="card.name"
                class="w-48 h-auto"
                draggable="false"
              />
            </div>
          </TransitionGroup>
        </div>

        <!-- Nav arrows -->
        <button
          @click="prev"
          class="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer z-20"
        >
          <ChevronLeft :stroke-width="2" class="w-6 h-6 text-brown" />
        </button>
        <button
          @click="next"
          class="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 shadow-md flex items-center justify-center hover:bg-white hover:scale-110 transition-all cursor-pointer z-20"
        >
          <ChevronRight :stroke-width="2" class="w-6 h-6 text-brown" />
        </button>
      </div>

      <!-- Card info -->
      <div class="text-center mt-8">
        <h3 class="text-brown mb-2">{{ currentCard.name }}</h3>
        <p class="text-brown/60 max-w-md mx-auto leading-relaxed">{{ currentCard.desc }}</p>
      </div>

      <!-- Dots -->
      <div class="flex justify-center gap-2 mt-6">
        <button
          v-for="(card, i) in sliderCards"
          :key="i"
          @click="currentIndex = i"
          class="w-3 h-3 rounded-full transition-all cursor-pointer"
          :class="i === currentIndex ? 'bg-brown scale-110' : 'bg-brown/30 hover:bg-brown/50'"
        />
      </div>
    </div>
  </section>
  <WaveEdge color="var(--color-cream-dark)" :size="80" />

  <!-- COMMENT ON JOUE -->
  <section class="py-24 px-6 bg-cream">
    <div class="max-w-2xl mx-auto text-center">
      <h2 class="text-brown mb-6">{{ t('home.how.title') }}</h2>
      <p class="text-brown/70 text-lg mb-10 leading-relaxed">{{ t('home.how.desc') }}</p>
      <RouterLink to="/regles"
        class="inline-block px-8 py-3 bg-brown text-cream rounded-full font-semibold hover:scale-105 transition-transform">
        {{ t('home.how.cta') }}
      </RouterLink>
    </div>
  </section>

  <!-- PÉDAGOGIE -->
  <section class="py-24 px-6 bg-primary/10">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-brown mb-4">{{ t('home.pedagogy.title') }}</h2>
      <p class="text-brown/70 mb-8 italic">{{ t('home.pedagogy.intro') }}</p>
      <ul class="space-y-4 mb-10">
        <li v-for="(fact, i) in pedagogyFacts" :key="i"
          class="flex gap-3 items-start bg-cream rounded-xl px-5 py-4 shadow-sm">
          <span class="text-primary text-xl mt-0.5">🌿</span>
          <span class="text-brown/80 leading-relaxed">{{ fact }}</span>
        </li>
      </ul>
      <p class="text-brown/70 leading-relaxed">{{ t('home.pedagogy.conclusion') }}</p>
    </div>
  </section>

  <!-- POUR QUI -->
  <section class="py-24 px-6 bg-cream text-center">
    <div class="max-w-xl mx-auto">
      <h2 class="text-brown mb-4">{{ t('home.audience.title') }}</h2>
      <p class="text-brown/70 text-lg mb-10 leading-relaxed">{{ t('home.audience.desc') }}</p>
      <div class="flex gap-4 flex-wrap justify-center">
        <RouterLink to="/cartes"
          class="px-8 py-3 bg-primary text-cream rounded-full font-semibold hover:scale-105 transition-transform">
          {{ t('home.audience.cta_cards') }}
        </RouterLink>
        <RouterLink to="/jouer"
          class="px-8 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors">
          {{ t('home.audience.cta_play') }}
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.card-slide-enter-active,
.card-slide-leave-active {
  transition: all 0.5s ease;
}
.card-slide-enter-from {
  opacity: 0;
  transform: translateX(100px) scale(0.7);
}
.card-slide-leave-to {
  opacity: 0;
  transform: translateX(-100px) scale(0.7);
}
</style>
