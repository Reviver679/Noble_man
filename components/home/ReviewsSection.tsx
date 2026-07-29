'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TESTIMONIALS = [
  { nameKey: 'testimonial_1_name', quoteKey: 'testimonial_1_quote' },
  { nameKey: 'testimonial_2_name', quoteKey: 'testimonial_2_quote' },
  { nameKey: 'testimonial_3_name', quoteKey: 'testimonial_3_quote' },
  { nameKey: 'testimonial_4_name', quoteKey: 'testimonial_4_quote' },
  { nameKey: 'testimonial_5_name', quoteKey: 'testimonial_5_quote' },
  { nameKey: 'testimonial_6_name', quoteKey: 'testimonial_6_quote' },
] as const;

const PRESS_NAMES = [
  'COSMOPOLITAN',
  'USA TODAY',
  'Esquire',
  'VOGUE',
  'METRO',
  'NEW YORK POST',
] as const;

function GreenStars() {
  return (
    <span className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="flex h-5 w-5 items-center justify-center bg-[#00b67a]">
          <Star className="h-3.5 w-3.5 fill-white text-white" />
        </span>
      ))}
    </span>
  );
}

export default function ReviewsSection() {
  const { t } = useTranslation();
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 'left' | 'right') => {
    scrollerRef.current?.scrollBy({ left: dir === 'left' ? -640 : 640, behavior: 'smooth' });
  };

  return (
    <section className="glow-ember py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="eyebrow mb-3">{t('reviews_eyebrow')}</p>
          <h2 className="font-serif text-4xl text-foreground md:text-5xl">
            {t('reviews_title_1')} <em className="italic">{t('reviews_title_em')}</em>
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-foreground">
            <span className="font-semibold italic">{t('home_trust_excellent')}</span>
            <GreenStars />
            <span className="text-muted-foreground">{t('trust_rating')}</span>
          </div>
        </div>

        {/* Light cards on the dark ember background */}
        <div className="relative mt-10">
          <div
            ref={scrollerRef}
            className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-proximity"
          >
            {TESTIMONIALS.map((item, i) => {
              const name = t(item.nameKey);
              const quote = t(item.quoteKey);
              return (
                <motion.div
                  key={item.nameKey}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-xl bg-[#f6f2ea] p-5 shadow-lg md:w-[320px]"
                >
                  <div className="space-y-3">
                    <GreenStars />
                    <p className="text-sm leading-relaxed text-neutral-700 line-clamp-6">
                      &ldquo;{quote}&rdquo;
                    </p>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-800 font-serif text-sm text-white">
                      {name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">{name}</p>
                      <p className="flex items-center gap-1 text-[11px] text-emerald-700">
                        <CheckCircle className="h-3 w-3" />
                        {t('testimonial_verified')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-2 hidden items-center justify-center gap-2 md:flex">
            <button
              type="button"
              aria-label="Scroll reviews left"
              onClick={() => scrollBy('left')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Scroll reviews right"
              onClick={() => scrollBy('right')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* As seen in */}
        <div className="mt-16 space-y-5">
          <p className="eyebrow text-center">{t('home_as_seen_in')}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {PRESS_NAMES.map((name) => (
              <span key={name} className="whitespace-nowrap text-base font-semibold text-muted-foreground/60">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
