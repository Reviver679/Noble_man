'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const FAQS = [
  { qKey: 'faq_1_q', aKey: 'faq_1_a' },
  { qKey: 'faq_2_q', aKey: 'faq_2_a' },
  { qKey: 'faq_3_q', aKey: 'faq_3_a' },
  { qKey: 'faq_4_q', aKey: 'faq_4_a' },
] as const;

export default function FaqSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr] md:gap-16 lg:px-8">
        <div>
          <p className="eyebrow mb-3">{t('faq_eyebrow')}</p>
          <h2 className="font-serif text-3xl text-foreground md:text-4xl">
            {t('faq_title_1')} <em className="italic">{t('faq_title_em')}</em>
          </h2>
        </div>

        <div className="divide-y divide-border border-y border-border">
          {FAQS.map((faq, i) => {
            const open = openIndex === i;
            return (
              <div key={faq.qKey}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-sm font-medium text-foreground md:text-base">
                    {t(faq.qKey)}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-muted-foreground">
                        {t(faq.aKey)}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
