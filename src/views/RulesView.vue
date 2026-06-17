<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n()
</script>

<template>
  <div class="bg-cream min-h-screen">

    <!-- HERO -->
    <section class="py-24 px-6 text-center bg-cream-dark">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-brown mb-4">{{ t('rules.hero.title') }}</h1>
        <p class="text-brown/70 text-lg leading-relaxed">{{ t('rules.hero.subtitle') }}</p>
      </div>
    </section>

    <div class="max-w-2xl mx-auto px-6 py-16 space-y-16">

      <!-- MATÉRIEL -->
      <section>
        <h2 class="text-brown mb-6">{{ t('rules.material.title') }}</h2>
        <ul class="space-y-3">
          <li v-for="(item, i) in (tm('rules.material.items') as string[])" :key="i"
            class="flex items-center gap-3 bg-primary/10 rounded-xl px-5 py-4">
            <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
            <span class="text-brown/80">{{ item }}</span>
          </li>
        </ul>
      </section>

      <!-- MISE EN PLACE -->
      <section>
        <h2 class="text-brown mb-4">{{ t('rules.setup.title') }}</h2>
        <p class="text-brown/70 leading-relaxed">{{ t('rules.setup.desc') }}</p>
      </section>

      <!-- À TON TOUR -->
      <section>
        <h2 class="text-brown mb-4">{{ t('rules.turn.title') }}</h2>
        <p class="text-brown/70 mb-6">{{ t('rules.turn.desc') }}</p>
        <div class="grid gap-4 sm:grid-cols-3">
          <div v-for="outcome in ['draw', 'bonus', 'malus']" :key="outcome"
            class="rounded-2xl px-5 py-6 text-center"
            :class="{
              'bg-cream-dark': outcome === 'draw',
              'bg-primary/15': outcome === 'bonus',
              'bg-red/10':     outcome === 'malus',
            }">
            <p class="font-semibold text-brown text-lg mb-2">
              {{ t(`rules.turn.${outcome}.label`) }}
            </p>
            <p class="text-brown/70 text-sm leading-relaxed">
              {{ t(`rules.turn.${outcome}.desc`) }}
            </p>
          </div>
        </div>
      </section>

      <!-- GAGNER -->
      <section>
        <h2 class="text-brown mb-4">{{ t('rules.win.title') }}</h2>
        <p class="text-brown/70 leading-relaxed mb-6">{{ t('rules.win.desc') }}</p>
        <div class="bg-yellow/30 border border-yellow rounded-2xl px-6 py-5">
          <p class="font-semibold text-brown mb-1">{{ t('rules.win.tip_label') }}</p>
          <p class="text-brown/70 leading-relaxed">{{ t('rules.win.tip') }}</p>
        </div>
      </section>

      <!-- CTA -->
      <div class="flex gap-4 flex-wrap justify-center pt-4">
        <RouterLink to="/"
          class="px-7 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors">
          {{ t('rules.cta_home') }}
        </RouterLink>
        <RouterLink to="/cartes"
          class="px-7 py-3 bg-primary text-cream rounded-full font-semibold hover:scale-105 transition-transform">
          {{ t('rules.cta_cards') }}
        </RouterLink>
        <RouterLink to="/jouer"
          class="px-7 py-3 bg-brown text-cream rounded-full font-semibold hover:scale-105 transition-transform">
          {{ t('rules.cta_play') }}
        </RouterLink>
      </div>

    </div>
  </div>
</template>
