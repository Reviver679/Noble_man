'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Home, User, Info, MessageSquare, 
  FileText, Palette, DollarSign, LogIn, ChevronDown, 
  ChevronUp, PawPrint, Users, Baby, Heart, ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import { useUploadContext, StyleType } from '@/lib/uploadContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { setStyle, style } = useUploadContext();
  const [isCreateOpen, setIsCreateOpen] = useState(true);
  const [isPoliciesOpen, setIsPoliciesOpen] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  // Prevent scrolling when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCreateSelect = (selectedStyle: StyleType) => {
    setStyle(selectedStyle);
    router.push('/');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[90] backdrop-blur-sm"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-background border-l border-border z-[100] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-muted-foreground">{t('nav_navigation')}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-2">
              
              <div className="px-4 py-2 space-y-1 border-b border-border pb-6">
                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 text-foreground hover:bg-secondary/50 rounded-xl transition-colors group"
                >
                  <Home size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">{t('nav_home')}</span>
                </Link>

                {/* Create Accordion */}
                <div className="flex flex-col">
                  <button
                    onClick={() => setIsCreateOpen(!isCreateOpen)}
                    className="flex items-center justify-between px-4 py-3 text-foreground hover:bg-secondary/50 rounded-xl transition-colors group w-full"
                  >
                    <div className="flex items-center gap-4">
                      <Palette size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="font-medium">{t('nav_create')}</span>
                    </div>
                    {isCreateOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  <AnimatePresence>
                    {isCreateOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-10 space-y-1 mt-1"
                      >
                        <button
                          onClick={() => handleCreateSelect('Pet Portraits')}
                          className={`flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-lg transition-colors ${style === 'Pet Portraits' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}`}
                        >
                          <PawPrint size={18} />
                          <span className="text-sm font-medium">{t('style_pet')}</span>
                        </button>
                        <button
                          onClick={() => handleCreateSelect('Family Portraits')}
                          className={`flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-lg transition-colors ${style === 'Family Portraits' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}`}
                        >
                          <Users size={18} />
                          <span className="text-sm font-medium">{t('style_family')}</span>
                        </button>
                        <button
                          onClick={() => handleCreateSelect('Children\'s Portraits')}
                          className={`flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-lg transition-colors ${style === 'Children\'s Portraits' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}`}
                        >
                          <Baby size={18} />
                          <span className="text-sm font-medium">{t('style_children')}</span>
                        </button>
                        <button
                          onClick={() => handleCreateSelect('Couple Portraits')}
                          className={`flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-lg transition-colors ${style === 'Couple Portraits' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}`}
                        >
                          <Heart size={18} />
                          <span className="text-sm font-medium">{t('style_couple')}</span>
                        </button>
                        <button
                          onClick={() => handleCreateSelect('Self-Portraits')}
                          className={`flex items-center gap-3 px-4 py-2.5 w-full text-left rounded-lg transition-colors ${style === 'Self-Portraits' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'}`}
                        >
                          <User size={18} />
                          <span className="text-sm font-medium">{t('style_self')}</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  href="/pricing"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 text-foreground hover:bg-secondary/50 rounded-xl transition-colors group"
                >
                  <DollarSign size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">{t('nav_pricing')}</span>
                </Link>

                <Link
                  href="/cart"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 text-foreground hover:bg-secondary/50 rounded-xl transition-colors group"
                >
                  <ShoppingBag size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">{t('nav_cart')}</span>
                </Link>
              </div>

              {/* Language Switcher Dropdown */}
              <div className="px-2 py-4 border-b border-border">
                <LanguageSwitcher />
              </div>

              {/* Legal & Support */}
              <div className="px-4 py-6 space-y-1">
                <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  {t('nav_legal_support')}
                </span>
                
                <Link
                  href="/about"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 text-foreground hover:bg-secondary/50 rounded-xl transition-colors group"
                >
                  <Info size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">{t('nav_about')}</span>
                </Link>

                <Link
                  href="/support"
                  onClick={onClose}
                  className="flex items-center gap-4 px-4 py-3 text-foreground hover:bg-secondary/50 rounded-xl transition-colors group"
                >
                  <MessageSquare size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-medium">{t('nav_support')}</span>
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-border bg-muted/20">
              <p className="text-xs text-center text-muted-foreground">
                © {new Date().getFullYear()} Nobilified. All rights reserved.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
