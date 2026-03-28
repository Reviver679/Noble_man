'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { SUPPORTED_LOCALES, resolveLocale } from '@/types/i18n';

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
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
      order: ['localStorage', 'navigator', 'htmlTag'],
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
