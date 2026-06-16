import { createI18n } from 'vue-i18n'
import type { I18n, I18nOptions } from 'vue-i18n'
import fr from './fr.json'
import en from './en.json'

// Détecter la langue du navigateur
const getLocale = (): string => {
  const browserLocale = navigator.language?.split('-')[0] ?? 'en'
  const supportedLocales = ['fr', 'en']
  return supportedLocales.includes(browserLocale) ? browserLocale : 'en'
}

const messages = {
  fr,
  en
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
