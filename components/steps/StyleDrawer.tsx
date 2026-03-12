'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { Check, Sparkles, Loader2, X } from 'lucide-react';
import { PROMPTS } from './PromptCarousel';

const API_URL = '/api/face/templates';
const PLACEHOLDER_FRAGMENT = 'placehold.co';

export interface CarouselItem {
  id: string;
  name: string;
  description: string;
  image: string;
  templateName: string;
  isIntelligent?: boolean;
}

function randomFallbackImage(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)].image;
}

interface StyleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StyleDrawer({ isOpen, onClose }: StyleDrawerProps) {
  const { prompt, setPrompt, setPromptTemplate } = useUploadContext();
  const [items, setItems] = useState<CarouselItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isOpen && items.length > 0) return; // Only load once

      setLoading(true);
      try {
        const res = await fetch(API_URL, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const raw: Array<{ template_name: string; template_image: string }> =
          data?.message?.templates ?? [];

        if (!cancelled && raw.length > 0) {
          const mapped: CarouselItem[] = raw.map((t, i) => ({
            id: `api-${i}`,
            name: t.template_name,
            description: 'Classic masterpiece layout',
            image: t.template_image.includes(PLACEHOLDER_FRAGMENT)
              ? randomFallbackImage()
              : t.template_image,
            templateName: t.template_name,
          }));
          
          // Prepend the "Intelligent" default option
          const withIntelligent: CarouselItem[] = [
            {
              id: 'intelligent',
              name: 'Intelligent',
              description: 'Let AI choose the perfect style based on your photos',
              image: '',
              templateName: '',
              isIntelligent: true,
            },
            ...mapped
          ];

          setItems(withIntelligent);
        } else if (!cancelled) {
          useFallback();
        }
      } catch {
        if (!cancelled) useFallback();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    function useFallback() {
      const fallback: CarouselItem[] = [
        {
          id: 'intelligent',
          name: 'Intelligent',
          description: 'Let AI choose the perfect style based on your photos',
          image: '',
          templateName: '',
          isIntelligent: true,
        },
        ...PROMPTS.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          image: p.image,
          templateName: '',
        }))
      ];
      setItems(fallback);
    }

    if (isOpen) {
       load();
    }

    return () => { cancelled = true; };
  }, [isOpen]);

  const handleSelect = (item: CarouselItem) => {
    setPrompt(item.id);
    setPromptTemplate(item.templateName);
    onClose();
  };

  // Prevent background scrolling
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
            className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-[110] bg-background border border-border sm:border-b-0 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col max-h-[85vh] w-full max-w-md mx-auto"
          >
            {/* Handle / Pill */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1.5 bg-border rounded-full" />
            </div>

            <div className="px-6 pb-2 pt-2 flex justify-between items-center shrink-0">
               <div>
                 <h2 className="text-xl font-bold text-foreground">Choose Your Style</h2>
                 <p className="text-sm text-muted-foreground mt-1">Select an artistic style for your portrait</p>
               </div>
               <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground rounded-full bg-secondary/50 transition-colors">
                 <X size={20} />
               </button>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                items.map((item) => {
                  const isActive = prompt === item.id;
                  
                  if (item.isIntelligent) {
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        className={`w-full flex items-center p-5 rounded-2xl border text-left transition-all ${
                          isActive 
                            ? 'bg-primary/5 border-primary' 
                            : 'bg-card border-border hover:border-primary/50'
                        }`}
                      >
                         <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 mr-4 ${isActive ? 'bg-primary/10' : 'bg-secondary/50'}`}>
                            <Sparkles className={`w-8 h-8 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                         </div>
                         <div className="flex-grow">
                            <div className="flex items-center">
                               <h3 className="text-base font-bold text-foreground leading-none">{item.name}</h3>
                               {isActive && <Check className="w-4 h-4 text-primary ml-2" />}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1.5 leading-snug">{item.description}</p>
                         </div>
                      </button>
                    )
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className={`w-full flex items-center p-4 rounded-2xl border text-left transition-all ${
                        isActive 
                          ? 'bg-primary/5 border-primary' 
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                       <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 mr-4 border border-border">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-grow">
                          <div className="flex items-center">
                             <h3 className="text-base font-bold text-foreground leading-none">{item.name}</h3>
                             {isActive && <Check className="w-4 h-4 text-primary ml-2" />}
                          </div>
                       </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
