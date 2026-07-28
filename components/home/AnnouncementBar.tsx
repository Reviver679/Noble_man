'use client';

import { useTranslation } from 'react-i18next';

/**
 * Ivory promo band above the header on every page. It renders during SSR, before
 * i18next has fetched any locale file, so it needs a literal fallback — otherwise
 * `t()` returns the bare key and the page paints "home_ticker".
 */
const FALLBACK = 'Free preview · Digital from $20 · Hand-painted canvas from $299';

export default function AnnouncementBar() {
  const { t } = useTranslation();
  return (
    <div className="w-full bg-primary py-2.5 text-center">
      <p className="px-4 text-[10px] font-semibold uppercase tracking-[0.25em] text-primary-foreground md:text-[11px]">
        {t('home_ticker', { defaultValue: FALLBACK })}
      </p>
    </div>
  );
}
