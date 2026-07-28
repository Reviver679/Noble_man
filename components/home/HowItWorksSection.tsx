'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ImagePlus, Play, Sparkles, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

/** Drop the real clip at public/how-it-works.mp4 (portrait, 3:4) — the poster shows until then. */
const VIDEO_SRC = '/how-it-works.mp4';
const POSTER_SRC = '/loading/loading-mand_and_dog.jpg';

const STEPS = [
  { icon: ImagePlus, titleKey: 'hiw_1_title', descKey: 'hiw_1_desc' },
  { icon: Sparkles, titleKey: 'hiw_2_title', descKey: 'hiw_2_desc' },
  { icon: LayoutGrid, titleKey: 'hiw_3_title', descKey: 'hiw_3_desc' },
] as const;

function PortraitVideo() {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-xl border border-border bg-muted shadow-2xl">
      {playing ? (
        <video
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          autoPlay
          controls
          playsInline
          onError={() => setPlaying(false)}
          className="h-full w-full object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={t('hiw_play')}
          className="group absolute inset-0"
        >
          <img src={POSTER_SRC} alt="" className="h-full w-full object-cover" loading="lazy" />
          <span className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/10" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/30 backdrop-blur-sm transition-transform group-hover:scale-110">
            <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
          </span>
        </button>
      )}
    </div>
  );
}

export default function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section className="glow-ember-soft w-full py-14 md:py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 md:gap-16 lg:px-8">
        <PortraitVideo />

        <div>
          <p className="eyebrow mb-3">{t('hiw_eyebrow')}</p>
          <h2 className="font-serif text-3xl text-foreground md:text-4xl">{t('hiw_title')}</h2>

          <div className="mt-10 space-y-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.titleKey}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border">
                  <step.icon className="h-4 w-4 text-foreground" />
                </div>
                <h3 className="self-center font-serif text-lg italic text-foreground md:text-xl">
                  {t(step.titleKey)}
                </h3>
                <span className="pt-1 text-center text-[10px] tracking-[0.2em] text-muted-foreground">
                  0{i + 1}
                </span>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {t(step.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
