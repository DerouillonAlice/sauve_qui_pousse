<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const families = ['main', 'bonus', 'malus'] as const
</script>

<template>
  <div class="bg-cream min-h-screen">

    <!-- HERO -->
    <section class="py-24 px-6 text-center bg-cream-dark">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-brown mb-4">{{ t('cards.hero.title') }}</h1>
        <p class="text-brown/70 text-lg leading-relaxed">{{ t('cards.hero.subtitle') }}</p>
      </div>
    </section>

    <!-- FAMILLES -->
    <section class="py-16 px-6 max-w-3xl mx-auto">
      <h2 class="text-brown mb-10 text-center">{{ t('cards.families.title') }}</h2>
      <div class="grid gap-6 sm:grid-cols-3">
        <div v-for="fam in families" :key="fam"
          class="rounded-2xl p-6 text-center border border-primary/20 bg-white/60">
          <div class="w-12 h-12 rounded-full bg-primary/15 mx-auto mb-4 flex items-center justify-center">
            <span class="text-2xl">
              {{ fam === 'main' ? '🪲' : fam === 'bonus' ? '🌸' : '⛈️' }}
            </span>
          </div>
          <p class="font-semibold text-brown text-lg mb-1">{{ t(`cards.families.${fam}.label`) }}</p>
          <p class="text-brown/60 text-sm">{{ t(`cards.families.${fam}.desc`) }}</p>
        </div>
      </div>
    </section>

    <!-- GALERIE PLACEHOLDER -->
    <section class="pb-24 px-6 max-w-3xl mx-auto">
      <div class="rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 py-20 text-center">
        <p class="text-4xl mb-4">🌱</p>
        <p class="text-brown/60 font-medium">{{ t('cards.wip') }}</p>
      </div>
    </section>

  </div>
</template>
