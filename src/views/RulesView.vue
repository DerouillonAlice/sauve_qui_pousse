<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import WaveEdge from '@/components/WaveEdge.vue'
import hornet2Img   from '@/assets/img/hornet_2.svg'
import ladybugImg   from '@/assets/img/ladybug.svg'
import beeImg       from '@/assets/img/bee.svg'
import wormImg      from '@/assets/img/worm.svg'
import scarecrowImg from '@/assets/img/scarecrow.svg'
import yellowFlower from '@/assets/img/yellow_flower.svg'
import pinkFlower   from '@/assets/img/pink_flower.svg'
import wheelImg     from '@/assets/img/spinning_wheel.svg'
import pesticideImg from '@/assets/img/pesticide.svg'

const { t, tm } = useI18n()

type CardItem = { name: string; points: string }

const cardGroups = [
  { key: 'positive', color: 'bg-primary/15 border-primary/30', pointColor: 'text-primary' },
  { key: 'neutral',  color: 'bg-yellow/20 border-yellow/40',   pointColor: 'text-brown/60' },
  { key: 'negative', color: 'bg-red/10 border-red/30',         pointColor: 'text-red' },
] as const

const winSteps = computed(() => tm('rules.win.steps') as string[])
</script>

<template>
  <div class="bg-white min-h-screen">

    <!-- HERO -->
    <section class="relative overflow-hidden py-20 px-6 text-center bg-cream-dark">
      <img :src="hornet2Img" aria-hidden="true"
        class="absolute top-0 left-8 w-40 sm:w-56 pointer-events-none select-none hidden lg:block" />
      <div class="relative z-10 max-w-2xl mx-auto">
        <h1 class="text-brown mb-2">{{ t('rules.hero.title') }}</h1>
        <p class="text-primary font-semibold mb-6">{{ t('rules.hero.subtitle') }}</p>
        <p class="text-brown/70 text-lg leading-relaxed">{{ t('rules.hero.intro') }}</p>
      </div>
    </section>
    <WaveEdge color="var(--color-cream-dark)" :size="48" />

    <!-- VIDEO -->
    <section class="py-16 px-6">
      <div class="max-w-2xl mx-auto">
        <iframe
          class="w-full aspect-video rounded-2xl shadow-md"
          src="https://www.youtube.com/embed/qtWtEbnrTac"
          title="Tutoriel Sauve qui Pousse"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowfullscreen>
        </iframe>
      </div>
    </section>

    <!-- PRINCIPE — carte brune centrée -->
    <section class="py-16 px-6 relative">
      <div class="max-w-2xl mx-auto bg-brown rounded-3xl px-8 sm:px-12 py-10 relative overflow-hidden">
        <img :src="yellowFlower" aria-hidden="true"
          class="absolute right-0 bottom-0 w-52 pointer-events-none select-none rotate-6" />
        <div class="relative z-10 flex flex-col sm:flex-row items-center gap-8">
          <img :src="wheelImg" alt="" class="w-28 sm:w-36 shrink-0" />
          <div>
            <h2 class="text-cream mb-3">{{ t('rules.principle.title') }}</h2>
            <p class="text-cream/70 leading-relaxed text-lg">{{ t('rules.principle.desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ROUE — blanc -->
    <section class="py-16 px-6 relative">
      <img :src="beeImg" aria-hidden="true"
        class="absolute right-4 top-4 w-52 pointer-events-none select-none -rotate-6 hidden lg:block" />
      <div class="max-w-2xl mx-auto">
        <h2 class="text-brown mb-2">{{ t('rules.wheel.title') }}</h2>
        <p class="text-brown/60 mb-6">{{ t('rules.wheel.desc') }}</p>
        <div class="flex flex-col gap-3">
          <div class="flex items-start gap-4 rounded-2xl px-5 py-4 bg-cream border border-brown/20">
            <img :src="scarecrowImg" aria-hidden="true" class="w-10 h-10 shrink-0 object-contain" />
            <div>
              <p class="font-semibold text-brown mb-0.5">{{ t('rules.wheel.neutral.label') }}</p>
              <p class="text-brown/60 text-sm leading-relaxed">{{ t('rules.wheel.neutral.desc') }}</p>
            </div>
          </div>
          <div class="flex items-start gap-4 rounded-2xl px-5 py-4 bg-primary/10 border border-primary/30">
            <img :src="ladybugImg" aria-hidden="true" class="w-10 h-10 shrink-0 object-contain" />
            <div>
              <p class="font-semibold text-brown mb-0.5">{{ t('rules.wheel.bonus.label') }}</p>
              <p class="text-brown/60 text-sm leading-relaxed">{{ t('rules.wheel.bonus.desc') }}</p>
            </div>
          </div>
          <div class="flex items-start gap-4 rounded-2xl px-5 py-4 bg-red/10 border border-red/30">
            <img :src="pesticideImg" aria-hidden="true" class="w-10 h-10 shrink-0 object-contain" />
            <div>
              <p class="font-semibold text-brown mb-0.5">{{ t('rules.wheel.trap.label') }}</p>
              <p class="text-brown/60 text-sm leading-relaxed">{{ t('rules.wheel.trap.desc') }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CARTES — beige avec vagues -->
    <WaveEdge color="var(--color-cream)" position="top" :size="48" />
    <section class="bg-cream py-16 px-6 relative overflow-hidden">
      <img :src="scarecrowImg" aria-hidden="true"
        class="absolute left-0 bottom-0 w-60 pointer-events-none select-none hidden lg:block" />
      <div class="max-w-2xl mx-auto">
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
      </div>
    </section>
    <WaveEdge color="var(--color-cream)" :size="48" />

    <!-- BONUS / MALUS — blanc -->
    <section class="py-16 px-6 relative">
      <img :src="pinkFlower" aria-hidden="true"
        class="absolute left-0 bottom-0 w-56 pointer-events-none select-none -rotate-6 hidden lg:block" />
      <div class="max-w-2xl mx-auto">
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
      </div>
    </section>

    <!-- COMMENT GAGNER — beige -->
    <section class="bg-cream py-16 px-6 relative overflow-hidden">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-brown mb-6">{{ t('rules.win.title') }}</h2>
        <ol class="space-y-3 mb-6">
          <li v-for="(step, i) in winSteps" :key="i"
            class="flex gap-4 items-start bg-white rounded-xl px-5 py-4 shadow-sm">
            <span class="w-7 h-7 rounded-full bg-primary text-cream text-sm font-bold flex items-center justify-center shrink-0">
              {{ i + 1 }}
            </span>
            <span class="text-brown/80 leading-relaxed">{{ step }}</span>
          </li>
        </ol>
        <div class="bg-yellow/30 border border-yellow rounded-2xl px-6 py-4 flex gap-3 items-start relative overflow-visible">
          <img :src="wormImg" aria-hidden="true"
            class="absolute -right-8 -bottom-6 w-32 pointer-events-none select-none rotate-12 hidden lg:block" />
          <span class="text-xl">⚖️</span>
          <div>
            <p class="font-semibold text-brown mb-1">{{ t('rules.win.tiebreak_label') }}</p>
            <p class="text-brown/70 text-sm">{{ t('rules.win.tiebreak') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- JOUER CTA — blanc -->
    <section class="bg-white py-20 px-6 text-center relative overflow-hidden">
      <img :src="beeImg" aria-hidden="true"
        class="absolute left-0 top-0 w-40 pointer-events-none select-none rotate-12 hidden lg:block" />
      <img :src="ladybugImg" aria-hidden="true"
        class="absolute right-0 bottom-0 w-44 pointer-events-none select-none -rotate-12 hidden lg:block" />
      <div class="relative z-10 max-w-lg mx-auto">
        <p class="font-game text-brown text-3xl sm:text-4xl mb-3">Prêt à jouer ?</p>
        <p class="text-brown/60 mb-8">Tu connais les règles, maintenant c'est à toi.</p>
        <RouterLink to="/jouer"
          class="inline-block px-10 py-4 bg-primary text-cream rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary/30">
          {{ t('rules.cta_play') }}
        </RouterLink>
      </div>
    </section>

    <!-- LIENS SECONDAIRES -->
    <section class="py-10 px-6 border-t border-brown/10">
      <div class="flex gap-4 flex-wrap justify-center">
        <RouterLink to="/"
          class="px-7 py-3 border-2 border-brown text-brown rounded-full font-semibold hover:bg-brown hover:text-cream transition-colors">
          {{ t('rules.cta_home') }}
        </RouterLink>
        <RouterLink to="/cartes"
          class="px-7 py-3 bg-primary text-cream rounded-full font-semibold hover:scale-105 transition-transform">
          {{ t('rules.cta_cards') }}
        </RouterLink>
      </div>
    </section>

  </div>
</template>
