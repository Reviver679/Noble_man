'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Bottom action bar that appears once the hero has scrolled out of view. */
export default function StickyBar() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToUpload = () => {
    document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          exit={{ y: 80 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-md"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="hidden min-w-0 md:block">
              <p className="eyebrow">{t('sticky_label')}</p>
              <p className="truncate font-serif text-sm italic text-foreground">{t('sticky_hint')}</p>
            </div>
            <div className="flex flex-1 items-center justify-end gap-2 md:flex-none">
              <Link
                href="/styles"
                className="rounded-full border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {t('home_browse_styles')}
              </Link>
              <button
                type="button"
                onClick={scrollToUpload}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground"
              >
                <Upload className="h-3.5 w-3.5" />
                {t('sticky_upload')}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
