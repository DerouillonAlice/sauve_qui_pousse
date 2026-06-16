<template>
  <div class="language-selector">
    <button
      v-for="locale in locales"
      :key="locale"
      :class="{ active: i18n.locale.value === locale }"
      @click="changeLocale(locale)"
      class="px-3 py-1 rounded border transition-colors"
    >
      {{ locale.toUpperCase() }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const i18n = useI18n()
const locales = ['fr', 'en']

const changeLocale = (locale: string) => {
  i18n.locale.value = locale
  localStorage.setItem('locale', locale)
}
</script>

<style scoped>
.language-selector {
  display: flex;
  gap: 0.5rem;
}

.language-selector button {
  cursor: pointer;
  border-color: #ccc;
  background: white;
}

.language-selector button.active {
  background: #333;
  color: white;
  border-color: #333;
}
</style>
