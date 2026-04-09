export const SUPPORTED_LOCALES = [
  'en',
  'de-DE', 'de-AT', 'de-CH',
  'es-MX', 'es-CO', 'es-ES', 'es-US',
  'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH',
  'nl-NL', 'nl-BE',
  'pt-BR', 'pt-PT',
  'it-IT',
  'sv-SE',
  'pl-PL',
  'tl-PH',
  'ar-SA', 'ar-AE', 'ar-EG',
  'ml-IN'
] as const;

export type Locale = typeof SUPPORTED_LOCALES[number];

const localeMap: Record<string, Locale> = {
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
  nl: 'nl-NL',
  pt: 'pt-BR',
  it: 'it-IT',
  sv: 'sv-SE',
  pl: 'pl-PL',
  tl: 'tl-PH',
  ar: 'ar-SA',
  ml: 'ml-IN'
};

export function resolveLocale(lang: string | undefined): Locale {
  if (!lang) return 'en';
  
  // Exact match (case-insensitive)
  const exactMatch = SUPPORTED_LOCALES.find(l => l.toLowerCase() === lang.toLowerCase());
  if (exactMatch) {
    return exactMatch;
  }
  
  // Base language match
  const baseLang = lang.split('-')[0].toLowerCase();
  
  // Try to find a localeMap match
  if (localeMap[baseLang]) {
    return localeMap[baseLang];
  }
  
  return 'en';
}

export const RTL_LOCALES = ['ar-SA', 'ar-AE', 'ar-EG'];

export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale);
}
