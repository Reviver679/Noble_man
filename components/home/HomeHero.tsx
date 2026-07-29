'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera,
  Check,
  Loader2,
  Mail,
  Star,
  Upload,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUploadContext } from '@/lib/uploadContext';

const MAX_FILES = 5;
const MAX_FILE_SIZE_MB = 10;
const TEMPLATES_URL = '/api/face/templates';
const PLACEHOLDER_FRAGMENT = 'placehold.co';

type Category = 'Human' | 'Pets' | null;
type Filter = 'all' | 'Human' | 'Pets';

interface Template {
  templateName: string;
  templateImage: string;
  category: Category;
}

const FILTERS: { id: Filter; labelKey: 'home_filter_all' | 'style_human' | 'style_pets' }[] = [
  { id: 'all', labelKey: 'home_filter_all' },
  { id: 'Pets', labelKey: 'style_pets' },
  { id: 'Human', labelKey: 'style_human' },
];

export default function HomeHero() {
  const { t } = useTranslation();
  const {
    setUploadedImages,
    setStep,
    setError,
    error,
    customerEmail,
    setCustomerEmail,
    promptTemplate,
    setPromptTemplate,
  } = useUploadContext();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isEmailPromptOpen, setIsEmailPromptOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);

  // Load the style strip
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(TEMPLATES_URL, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        const raw: Array<{ template_name: string; template_image: string; category?: string | null }> =
          data?.message?.templates ?? [];
        if (cancelled) return;
        setTemplates(
          raw
            .filter((x) => x.template_name && x.template_image && !x.template_image.includes(PLACEHOLDER_FRAGMENT))
            .map((x) => ({
              templateName: x.template_name,
              templateImage: x.template_image,
              category: (x.category === 'Human' || x.category === 'Pets' ? x.category : null) as Category,
            }))
        );
      } catch {
        // strip is optional — hero still works without it
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const processFiles = (newFiles: File[]) => {
    setError(null);
    const combined = [...files, ...newFiles];
    if (combined.length > MAX_FILES) {
      setError(t('upload_max_error', { max: MAX_FILES }) as string);
      combined.splice(MAX_FILES);
    }
    for (const file of combined) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(t('upload_type_error') as string);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(t('upload_size_error', { max: MAX_FILE_SIZE_MB }) as string);
        return;
      }
    }
    setFiles(combined);
    setUploadedImages(combined);
    previews.forEach((p) => URL.revokeObjectURL(p));
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index: number) => {
    const nextFiles = [...files];
    const nextPreviews = [...previews];
    URL.revokeObjectURL(nextPreviews[index]);
    nextFiles.splice(index, 1);
    nextPreviews.splice(index, 1);
    setFiles(nextFiles);
    setPreviews(nextPreviews);
    setUploadedImages(nextFiles);
    if (nextFiles.length === 0 && fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
    else if (e.type === 'dragleave') setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files?.length) processFiles(Array.from(e.dataTransfer.files));
  };

  // Clone File objects into memory-backed copies so they survive DOM input element GC
  const cloneFilesIntoMemory = async (filesToClone: File[]): Promise<File[]> =>
    Promise.all(
      filesToClone.map(async (f) => {
        const buffer = await f.arrayBuffer();
        return new File([buffer], f.name, { type: f.type, lastModified: f.lastModified });
      })
    );

  const startGeneration = async () => {
    try {
      const durableFiles = await cloneFilesIntoMemory(files);
      setUploadedImages(durableFiles);
    } catch {
      /* files already in context from processFiles */
    }
    setStep('generating');
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError(t('upload_select_error') as string);
      document.getElementById('upload-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    try {
      setIsCheckingLimit(true);
      setError(null);
      const res = await fetch('/api/face/rate-limit', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (t('upload_rate_limit_check_error') as string));

      const limitStatus = data.message;
      if (limitStatus && !limitStatus.can_generate) {
        setError(
          limitStatus.errors?.length
            ? limitStatus.errors[0].message
            : (t('upload_rate_limit_reached') as string)
        );
        return;
      }
      if (limitStatus && limitStatus.daily_used >= 1 && !customerEmail) {
        setIsEmailPromptOpen(true);
        return;
      }
      await startGeneration();
    } catch (err) {
      console.error('Rate limit check failed:', err);
      // Backend process route enforces limits as well — proceed.
      await startGeneration();
    } finally {
      setIsCheckingLimit(false);
    }
  };

  const handleEmailSubmit = async () => {
    if (!emailInput || !emailInput.includes('@')) return;
    setCustomerEmail(emailInput);
    setIsEmailPromptOpen(false);
    await startGeneration();
  };

  const toggleTemplate = (name: string) => {
    setPromptTemplate(promptTemplate === name ? '' : name);
  };

  const heroStripItems = useMemo(() => {
    const scoped = filter === 'all' ? templates : templates.filter((x) => x.category === filter);
    return scoped.slice(0, 12);
  }, [templates, filter]);

  return (
    <section className="glow-hero relative overflow-hidden pb-16 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero title */}
        <div className="pt-14 pb-10 text-center md:pt-24 md:pb-14">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="font-serif text-5xl leading-[1.05] tracking-tight text-foreground md:text-7xl"
          >
            {t('home_hero_title_1')}{' '}
            <em className="italic">{t('home_hero_title_em')}</em>{' '}
            {t('home_hero_title_2')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-4 text-sm text-muted-foreground md:text-base"
          >
            {t('home_hero_subtitle')}
          </motion.p>
        </div>

        {/* Style strip */}
        <div id="style-strip" className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="eyebrow">{t('home_pick_style')}</p>
            <Link href="/styles" className="eyebrow transition-colors hover:text-foreground">
              {t('home_see_all')} →
            </Link>
          </div>
          {/* Category pills */}
          <div className="flex gap-2">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t(f.labelKey)}
                </button>
              );
            })}
          </div>

          <div className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 scrollbar-hide snap-x snap-proximity">
            {templates.length === 0
              ? [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/5] w-36 shrink-0 animate-pulse rounded-lg bg-muted md:w-44"
                  />
                ))
              : heroStripItems.length === 0
              ? <p className="py-10 text-sm text-muted-foreground">{t('home_no_styles')}</p>
              : heroStripItems.map((tpl) => {
                  const selected = promptTemplate === tpl.templateName;
                  return (
                    <button
                      key={tpl.templateName}
                      type="button"
                      onClick={() => toggleTemplate(tpl.templateName)}
                      className={`group relative aspect-[4/5] w-36 shrink-0 snap-start overflow-hidden rounded-lg border transition-all md:w-44 ${
                        selected
                          ? 'border-primary ring-2 ring-primary'
                          : 'border-border hover:border-foreground/40'
                      }`}
                    >
                      <img
                        src={tpl.templateImage}
                        alt={tpl.templateName}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-8">
                        <p className="truncate text-left text-xs font-medium text-white/90">
                          {tpl.templateName}
                        </p>
                      </div>
                      {selected && (
                        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
          </div>
        </div>

        {/* Below the strip: choose-for-me pills (left) + upload card (right) */}
        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-14">
          <div className="order-2 space-y-3 md:order-1">
            <p className="eyebrow">{t('home_or_decide')}</p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setPromptTemplate('')}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                  promptTemplate === ''
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-foreground hover:bg-secondary'
                }`}
              >
                ✦ {t('home_automatch')}
              </button>
              <Link
                href="/styles"
                className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {t('home_browse_styles')}
              </Link>
            </div>
            {promptTemplate && (
              <p className="text-xs text-muted-foreground">
                {t('home_selected_style')}: <span className="text-foreground">{promptTemplate}</span>
              </p>
            )}
          </div>

          <div className="order-1 space-y-4 md:order-2">
            <p className="eyebrow">{t('home_upload_label')}</p>

            {/* Upload card */}
            <div
              id="upload-card"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => previews.length === 0 && fileInputRef.current?.click()}
              className={`rounded-2xl border bg-card/60 p-6 backdrop-blur-sm transition-colors md:p-8 ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border'
              } ${previews.length === 0 ? 'cursor-pointer hover:border-foreground/30' : ''}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(e) => e.target.files?.length && processFiles(Array.from(e.target.files))}
                className="hidden"
              />

              {previews.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {previews.map((preview, idx) => (
                        <motion.div
                          key={preview}
                          initial={{ opacity: 0, scale: 0.85 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border md:h-24 md:w-24"
                        >
                          <img src={preview} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(idx);
                            }}
                            className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <X size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {previews.length < MAX_FILES && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                        className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground md:h-24 md:w-24"
                      >
                        <Upload size={16} />
                        <span className="text-[10px] font-medium">{t('upload_add_photo')}</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('upload_selected_text', { current: previews.length, max: MAX_FILES })}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <div className="rounded-full border border-border bg-background/60 p-3">
                    <Camera className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t('home_upload_title')}{' '}
                      <span className="font-normal text-muted-foreground">
                        · {t('home_upload_hint')}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{t('home_upload_sub')}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* CTA */}
            <button
              onClick={handleSubmit}
              disabled={isCheckingLimit}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              {isCheckingLimit ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t('upload_btn_checking')}
                </>
              ) : (
                <>
                  {t('home_cta')}
                  <span className="rounded-full border border-primary-foreground/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                    {t('home_cta_badge')}
                  </span>
                </>
              )}
            </button>

            {/* Trust line */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold italic text-foreground">{t('home_trust_excellent')}</span>
              <span className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="flex h-4 w-4 items-center justify-center bg-[#00b67a]">
                    <Star className="h-3 w-3 fill-white text-white" />
                  </span>
                ))}
              </span>
              <span>{t('trust_rating')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Email gate */}
      <AnimatePresence>
        {isEmailPromptOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-foreground" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="font-serif text-xl text-foreground">{t('email_prompt_title')}</h3>
                <p className="text-sm text-muted-foreground">{t('email_prompt_desc')}</p>
              </div>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSubmit()}
                placeholder={t('email_prompt_placeholder') as string}
                className="w-full rounded-full border border-border bg-background px-5 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setIsEmailPromptOpen(false)}
                  className="flex-1 rounded-full border border-border px-4 py-3 font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  {t('email_prompt_cancel')}
                </button>
                <button
                  onClick={handleEmailSubmit}
                  disabled={!emailInput || !emailInput.includes('@')}
                  className="flex-1 rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground transition-colors disabled:opacity-50"
                >
                  {t('email_prompt_continue')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
