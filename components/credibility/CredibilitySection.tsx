'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Paintbrush, Crown, Landmark, CheckCircle, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const TESTIMONIALS = [
    { nameKey: 'testimonial_1_name', quoteKey: 'testimonial_1_quote', photo: '/testimonials/review-1.jpg' },
    { nameKey: 'testimonial_2_name', quoteKey: 'testimonial_2_quote', photo: '/testimonials/review-2.jpg' },
    { nameKey: 'testimonial_3_name', quoteKey: 'testimonial_3_quote', photo: '/testimonials/review-3.jpg' },
    { nameKey: 'testimonial_4_name', quoteKey: 'testimonial_4_quote', photo: '/testimonials/review-4.jpg' },
    { nameKey: 'testimonial_5_name', quoteKey: 'testimonial_5_quote', photo: '/testimonials/review-5.jpg' },
    { nameKey: 'testimonial_6_name', quoteKey: 'testimonial_6_quote', photo: '/testimonials/review-6.jpg' },
] as const;

function TestimonialQuote({ text, expanded, onToggle }: { text: string; expanded: boolean; onToggle: () => void }) {
    return (
        <div>
            <p className={`text-xs text-muted-foreground leading-relaxed ${expanded ? '' : 'line-clamp-5'}`}>
                &ldquo;{text}&rdquo;
            </p>
            <button
                onClick={onToggle}
                className="text-[10px] font-medium text-primary mt-0.5 hover:underline"
            >
                {expanded ? 'Show less' : 'Read more'}
            </button>
        </div>
    );
}

export default function CredibilitySection() {
    const { t } = useTranslation();
    const [allExpanded, setAllExpanded] = useState(false);
    return (
        <section className="bg-background pt-6 pb-16 px-4 md:px-8 border-t border-border">
            <div className="max-w-6xl mx-auto space-y-20">

                {/* Testimonials Section */}
                <div>
                    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 pl-[1px] scrollbar-hide">
                        {TESTIMONIALS.map((item, i) => (
                            <motion.div
                                key={item.nameKey}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="snap-start shrink-0 w-[180px] md:w-[200px] bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                            >
                                <div className="aspect-[4/5] overflow-hidden">
                                    <img
                                        src={item.photo}
                                        alt={t(item.nameKey)}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-3 space-y-1.5">
                                    <div className="flex gap-0.5 text-yellow-500">
                                        {[...Array(5)].map((_, j) => (
                                            <Star key={j} className="w-3 h-3 fill-current" />
                                        ))}
                                    </div>
                                    <TestimonialQuote text={t(item.quoteKey)} expanded={allExpanded} onToggle={() => setAllExpanded(!allExpanded)} />
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">— {t(item.nameKey)}</p>
                                        <p className="text-[10px] text-green-600 flex items-center gap-1 mt-0.5">
                                            <CheckCircle className="w-2.5 h-2.5" />
                                            {t('testimonial_verified')}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* As Seen On Section */}
                <div className="space-y-8 pt-12 border-t border-border/50">
                    <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        As Seen In
                    </p>

                    {/* Scrolling logo banner (using css animation/ticker) or simple flex wrap */}
                    <div className="flex flex-wrap items-center justify-center auto-cols-max gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Note: Placeholder texts for Logos. Replace with actual SVGs or images when available. */}
                        <div className="text-xl font-bold font-serif whitespace-nowrap">COSMOPOLITAN</div>
                        <div className="text-xl font-bold font-sans tracking-tighter whitespace-nowrap">USA TODAY</div>
                        <div className="text-xl font-bold font-serif italic whitespace-nowrap">INDEPENDENT</div>
                        <div className="text-xl font-bold font-serif whitespace-nowrap">Esquire</div>
                        <div className="text-xl font-bold font-sans uppercase whitespace-nowrap">NEW YORK POST</div>
                        <div className="text-xl font-bold font-sans whitespace-nowrap">METRO</div>
                        <div className="text-xl font-bold tracking-widest whitespace-nowrap">E! Entertainment Television</div>
                        <div className="text-xl font-bold font-sans tracking-tight whitespace-nowrap">Sports Illustrated</div>
                        <div className="text-xl font-bold font-serif whitespace-nowrap">VOGUE</div>
                        <div className="text-xl font-bold font-sans whitespace-nowrap">Philadelphia Eagles</div>
                    </div>
                </div>

            </div>
        </section>
    );
}
