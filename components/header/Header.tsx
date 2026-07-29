'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUploadContext } from '@/lib/uploadContext';
import { Menu, AlertTriangle } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { step, reset } = useUploadContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [rateLimitedMsg, setRateLimitedMsg] = useState<string | null>(null);
  const { t } = useTranslation();

  // Poll rate limit once on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/face/rate-limit', { method: 'POST' });
        const data = await res.json();
        const status = data.message;
        if (status && !status.can_generate) {
          const msg =
            status.errors && status.errors.length > 0
              ? status.errors.map((e: { message: string }) => e.message).join('  ·  ')
              : 'Generation is temporarily unavailable. Please try again later.';
          setRateLimitedMsg(msg);
        }
      } catch {
        // silently fail — don't block the UI
      }
    })();
  }, []);

  const stepLabels = [t('step_upload'), t('step_preview'), t('step_download')];
  const currentStepIndex =
    step === 'generating' || step === 'preview' ? 1 : step === 'checkout' || step === 'success' ? 2 : 0;
  const showBreadcrumb = step !== 'idle';

  return (
    <header
      className={`z-50 w-full bg-background/90 backdrop-blur-md ${
        step === 'preview' || step === 'checkout' ? 'relative' : 'sticky top-0'
      }`}
    >
      {/* Rate-limit marquee banner */}
      {rateLimitedMsg && (
        <div className="overflow-hidden border-b border-border bg-secondary/40 py-2">
          <div className="marquee-track flex gap-16 whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, i) => (
              <span
                key={i}
                className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-muted-foreground"
              >
                <AlertTriangle size={12} className="shrink-0 opacity-60" />
                {rateLimitedMsg}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Main header */}
      <div className="border-b border-border px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Wordmark */}
          <div
            onClick={() => {
              if (pathname !== '/') {
                router.push('/');
              } else {
                localStorage.removeItem('noblified_request_id');
                reset();
              }
            }}
            className="cursor-pointer transition-opacity hover:opacity-80"
          >
            <span className="font-serif text-2xl tracking-tight text-foreground md:text-3xl">
              Nobilified
            </span>
          </div>

          {/* Breadcrumb — only while creating */}
          {showBreadcrumb && (
            <div className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
              {stepLabels.map((label, index) => (
                <React.Fragment key={label}>
                  <span
                    className={
                      index <= currentStepIndex ? 'font-medium text-foreground' : 'text-muted-foreground'
                    }
                  >
                    {label}
                  </span>
                  {index < stepLabels.length - 1 && <span>›</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Menu */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 transition-colors hover:bg-secondary"
            aria-label="Open menu"
          >
            <Menu size={20} className="text-foreground" />
          </button>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </header>
  );
}
