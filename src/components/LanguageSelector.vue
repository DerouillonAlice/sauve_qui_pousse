<template>
  <div class="flex gap-2">
    <button
      v-for="locale in locales"
      :key="locale"
      @click="changeLocale(locale)"
      :class="[
        'px-3 py-1 rounded transition-colors font-semibold',
        i18n.locale.value === locale
          ? 'bg-cream text-primary'
          : 'bg-transparent text-cream border border-cream hover:bg-cream hover:text-primary'
      ]"
    >
      {{ locale.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const i18n = useI18n()
const locales = ['fr', 'en', 'es']

const changeLocale = (locale: string) => {
  i18n.locale.value = locale
  localStorage.setItem('locale', locale)
}
</script>

