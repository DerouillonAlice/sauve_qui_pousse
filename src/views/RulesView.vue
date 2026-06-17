<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { t, tm } = useI18n()

type CardItem = { name: string; points: string }

const cardGroups = [
  { key: 'positive', color: 'bg-primary/15 border-primary/30', pointColor: 'text-primary' },
  { key: 'neutral',  color: 'bg-yellow/20 border-yellow/40',   pointColor: 'text-brown/60' },
  { key: 'negative', color: 'bg-red/10 border-red/30',         pointColor: 'text-red' },
] as const

const wheelCases = ['neutral', 'bonus', 'trap'] as const

const winSteps = computed(() => tm('rules.win.steps') as string[])
</script>

<template>
  <div class="bg-cream min-h-screen">

    <!-- HERO -->
    <section class="py-20 px-6 text-center bg-cream-dark">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-brown mb-2">{{ t('rules.hero.title') }}</h1>
        <p class="text-primary font-semibold mb-6">{{ t('rules.hero.subtitle') }}</p>
        <p class="text-brown/70 text-lg leading-relaxed">{{ t('rules.hero.intro') }}</p>
      </div>
    </section>

    <div class="max-w-2xl mx-auto px-6 py-16 space-y-16">

      <!-- PRINCIPE -->
      <section>
        <h2 class="text-brown mb-4">{{ t('rules.principle.title') }}</h2>
        <p class="text-brown/70 leading-relaxed text-lg">{{ t('rules.principle.desc') }}</p>
      </section>

      <!-- ROUE -->
      <section>
        <h2 class="text-brown mb-2">{{ t('rules.wheel.title') }}</h2>
        <p class="text-brown/60 mb-6">{{ t('rules.wheel.desc') }}</p>
        <div class="grid gap-4 sm:grid-cols-3">
          <div v-for="c in wheelCases" :key="c"
            class="rounded-2xl px-5 py-5 border"
            :class="{
              'bg-cream-dark border-brown/20': c === 'neutral',
              'bg-primary/10 border-primary/30': c === 'bonus',
              'bg-red/10 border-red/30': c === 'trap',
            }">
            <p class="font-semibold text-brown mb-1">{{ t(`rules.wheel.${c}.label`) }}</p>
            <p class="text-brown/60 text-sm leading-relaxed">{{ t(`rules.wheel.${c}.desc`) }}</p>
          </div>
        </div>
      </section>

      <!-- CARTES -->
      <section>
        <h2 class="text-brown mb-8">{{ t('rules.cards.title') }}</h2>
        <div class="space-y-6">
          <div v-for="group in cardGroups" :key="group.key">
            <h3 class="text-brown mb-3">{{ t(`rules.cards.${group.key}.title`) }}</h3>
            <div class="space-y-2">
              <div v-for="(card, i) in (tm(`rules.cards.${group.key}.items`) as CardItem[])" :key="i"
                class="flex items-center justify-between rounded-xl px-5 py-3 border"
                :class="group.color">
                <span class="text-brown/80 font-medium">{{ card.name }}</span>
                <span class="font-bold text-lg" :class="group.pointColor">{{ card.points }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- BONUS / MALUS -->
      <section>
        <h2 class="text-brown mb-6">{{ t('rules.bonusmalus.title') }}</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl px-5 py-5 bg-primary/10 border border-primary/30">
            <p class="font-semibold text-brown mb-1">{{ t('rules.bonusmalus.bonus.label') }}</p>
            <p class="text-brown/60 text-sm leading-relaxed">{{ t('rules.bonusmalus.bonus.desc') }}</p>
          </div>
          <div class="rounded-2xl px-5 py-5 bg-red/10 border border-red/30">
            <p class="font-semibold text-brown mb-1">{{ t('rules.bonusmalus.malus.label') }}</p>
            <p class="text-brown/60 text-sm leading-relaxed">{{ t('rules.bonusmalus.malus.desc') }}</p>
          </div>
        </div>
      </section>

      <!-- COMMENT GAGNER -->
      <section>
        <h2 class="text-brown mb-6">{{ t('rules.win.title') }}</h2>
        <ol class="space-y-3 mb-6">
          <li v-for="(step, i) in winSteps" :key="i"
            class="flex gap-4 items-start bg-white/60 rounded-xl px-5 py-4">
            <span class="w-7 h-7 rounded-full bg-primary text-cream text-sm font-bold flex items-center justify-center shrink-0">
              {{ i + 1 }}
            </span>
            <span class="text-brown/80 leading-relaxed">{{ step }}</span>
          </li>
        </ol>
        <div class="bg-yellow/30 border border-yellow rounded-2xl px-6 py-4 flex gap-3 items-start">
          <span class="text-xl">⚖️</span>
          <div>
            <p class="font-semibold text-brown mb-1">{{ t('rules.win.tiebreak_label') }}</p>
            <p class="text-brown/70 text-sm">{{ t('rules.win.tiebreak') }}</p>
          </div>
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
