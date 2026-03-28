'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n/client';
import { isRTL, resolveLocale } from '@/types/i18n';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateDocumentLang = (lng: string) => {
      const resolvedLng = resolveLocale(lng);
      document.documentElement.dir = isRTL(resolvedLng) ? 'rtl' : 'ltr';
      document.documentElement.lang = resolvedLng;
    };

    updateDocumentLang(i18n.language || 'en');

    const handleLangChange = (lng: string) => {
      updateDocumentLang(lng);
    };

    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, []);

  // We render children immediately to avoid LCP delay.
  // Suspense is handled by react-i18next for the translations themselves.
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
