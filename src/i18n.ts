import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { en, vi } from './locales'
import { loadLanguageFromStorage } from './utils/helpers'

const initI18n = async () => {
  const savedLanguage = await loadLanguageFromStorage()

  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      lng: savedLanguage,
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['navigator'],
        caches: []
      },
      resources: {
        en: {
          translation: en
        },
        vi: {
          translation: vi
        }
      }
    })
}

export default initI18n
