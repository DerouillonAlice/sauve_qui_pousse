import { createI18n } from 'vue-i18n'
import type { I18n, I18nOptions } from 'vue-i18n'
import fr from './fr.json'
import en from './en.json'
import es from './es.json'

// Détecter la langue du navigateur
const getLocale = (): string => {
  const saved = localStorage.getItem('locale')
  if (saved && ['fr', 'en', 'es'].includes(saved)) return saved
  const browserLocale = navigator.language?.split('-')[0] ?? 'en'
  const supportedLocales = ['fr', 'en', 'es']
  return supportedLocales.includes(browserLocale) ? browserLocale : 'en'
}

const messages = {
  fr,
  en,
  es
}

const i18n: I18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
  missingWarn: false,
  fallbackWarn: false
} as I18nOptions)

export default i18n
