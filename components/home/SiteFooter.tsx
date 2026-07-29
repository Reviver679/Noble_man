'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const columns = [
    {
      titleKey: 'footer_col_portraits',
      links: [
        { labelKey: 'footer_link_styles', href: '/styles' },
        { labelKey: 'style_pet', href: '/styles' },
        { labelKey: 'style_family', href: '/styles' },
        { labelKey: 'style_couple', href: '/styles' },
        { labelKey: 'style_self', href: '/styles' },
      ],
    },
    {
      titleKey: 'footer_col_company',
      links: [
        { labelKey: 'nav_about', href: '/about' },
        { labelKey: 'nav_pricing', href: '/pricing' },
        { labelKey: 'nav_cart', href: '/cart' },
      ],
    },
    {
      titleKey: 'footer_col_help',
      links: [
        { labelKey: 'nav_support', href: '/support' },
        { labelKey: 'footer_link_how', href: '/about' },
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-border bg-background">
      {/* Brand block */}
      <div className="py-14 text-center md:py-20">
        <Link href="/" className="inline-block">
          <span className="font-serif text-4xl tracking-tight text-foreground md:text-5xl">
            Nobilified
          </span>
        </Link>
        <p className="eyebrow mt-2">{t('footer_tagline')}</p>
      </div>

      {/* Link columns */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-4 pb-14 sm:px-6 md:grid-cols-3 lg:px-8">
        {columns.map((col) => (
          <div key={col.titleKey} className="space-y-3">
            <p className="eyebrow">{t(col.titleKey)}</p>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.labelKey}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {t(link.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-[11px] uppercase tracking-widest text-muted-foreground sm:px-6 md:flex-row lg:px-8">
          <p>© {year} Nobilified · {t('footer_rights')}</p>
          <div className="flex gap-6">
            <Link href="/support" className="transition-colors hover:text-foreground">
              {t('footer_terms')}
            </Link>
            <Link href="/support" className="transition-colors hover:text-foreground">
              {t('footer_privacy')}
            </Link>
            <Link href="/support" className="transition-colors hover:text-foreground">
              {t('footer_refunds')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
