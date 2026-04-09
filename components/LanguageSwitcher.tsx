'use client';

import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, resolveLocale } from '@/types/i18n';
import { Globe, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

// Names mapping for better UI display
const LOCALE_NAMES: Record<string, string> = {
  'en': 'English',
  'de-DE': 'Deutsch (Deutschland)',
  'de-AT': 'Deutsch (Österreich)',
  'de-CH': 'Deutsch (Schweiz)',
  'es-MX': 'Español (México)',
  'es-CO': 'Español (Colombia)',
  'es-ES': 'Español (España)',
  'es-US': 'Español (EE.UU.)',
  'fr-FR': 'Français (France)',
  'fr-CA': 'Français (Canada)',
  'fr-BE': 'Français (Belgique)',
  'fr-CH': 'Français (Suisse)',
  'nl-NL': 'Nederlands (Nederland)',
  'nl-BE': 'Nederlands (België)',
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)',
  'it-IT': 'Italiano',
  'sv-SE': 'Svenska',
  'pl-PL': 'Polski',
  'tl-PH': 'Tagalog',
  'ar-SA': 'العربية (السعودية)',
  'ar-AE': 'العربية (الإمارات)',
  'ar-EG': 'العربية (مصر)',
  'ml-IN': 'മലയാളം'
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = resolveLocale(e.target.value);
    i18n.changeLanguage(locale);
  };

  if (!mounted) {
    return <div className="h-12 w-full animate-pulse bg-secondary/20 rounded-xl" />;
  }

  const currentLang = i18n.resolvedLanguage || i18n.language || 'en';

  return (
    <div className="relative group">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4">
        <Globe size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <select
        value={currentLang}
        onChange={handleLanguageChange}
        className="block w-full appearance-none bg-transparent py-3 pl-12 pr-10 text-foreground font-medium hover:bg-secondary/50 rounded-xl transition-colors cursor-pointer focus:outline-none"
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option
            key={locale}
            value={locale}
            className="text-foreground bg-background"
          >
            {LOCALE_NAMES[locale] || locale}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
        <ChevronDown size={16} className="text-muted-foreground" />
      </div>
    </div>
  );
}
