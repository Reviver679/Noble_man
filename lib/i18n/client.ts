'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { SUPPORTED_LOCALES, resolveLocale } from '@/types/i18n';

const languageDetector = new LanguageDetector();
languageDetector.addDetector({
  name: 'noblified_navigator',
  lookup() {
    if (typeof window !== 'undefined' && window.navigator) {
      const browserLang = window.navigator.languages ? window.navigator.languages[0] : window.navigator.language;
      return resolveLocale(browserLang);
    }
    return undefined;
  }
});

i18next
  .use(initReactI18next)
  .use(languageDetector)
  .use(
    resourcesToBackend(async (language: string, namespace: string) => {
      try {
        const response = await fetch(`/locales/${language}/${namespace}.json`);
        if (!response.ok) {
          throw new Error('Fallback to default');
        }
        return response.json();
      } catch (error) {
        console.error(`Failed to load translation for ${language}/${namespace}`, error);
        throw error;
      }
    })
  )
  .init({
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LOCALES,
    defaultNS: 'common',
    fallbackNS: 'common',
    ns: ['common'],
    detection: {
      order: ['localStorage', 'noblified_navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

i18next.on('languageChanged', (lng) => {
  const resolvedLng = resolveLocale(lng);
  if (lng && lng !== resolvedLng) {
    i18next.changeLanguage(resolvedLng);
  }
});

export default i18next;
