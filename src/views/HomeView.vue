<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n()
</script>

<template>
  <!-- HERO -->
  <section class="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-cream">
    <p class="text-primary font-semibold tracking-widest uppercase text-sm mb-4">
      {{ t('home.hero.tagline') }}
    </p>
    <h1 class="text-brown max-w-3xl mb-6">
      {{ t('home.hero.title') }}
    </h1>
    <p class="text-brown/70 text-lg max-w-xl mb-10 leading-relaxed">
      {{ t('home.hero.subtitle') }}
    </p>
    <div class="flex gap-4 flex-wrap justify-center">
      <RouterLink to="/regles"
        class="px-8 py-3 bg-primary text-cream rounded-full font-semibold hover:scale-105 transition-transform">
        {{ t('home.hero.cta_rules') }}
      </RouterLink>
      <RouterLink to="/jouer"
        class="px-8 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors">
        {{ t('home.hero.cta_play') }}
      </RouterLink>
    </div>
  </section>

  <!-- CONCEPT -->
  <section class="py-24 px-6 bg-cream-dark">
    <div class="max-w-2xl mx-auto">
      <h2 class="text-brown mb-8">{{ t('home.concept.title') }}</h2>
      <p class="text-brown/80 mb-5 leading-relaxed">{{ t('home.concept.p1') }}</p>
      <p class="text-brown/80 mb-5 leading-relaxed">{{ t('home.concept.p2') }}</p>
      <p class="text-brown/80 mb-5 leading-relaxed">{{ t('home.concept.p3') }}</p>
      <p class="text-primary font-semibold text-xl mt-8">{{ t('home.concept.p4') }}</p>
    </div>
  </section>

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
        <li v-for="(fact, i) in (tm('home.pedagogy.facts') as string[])" :key="i"
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
