'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Paintbrush, Crown, Landmark } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CredibilitySection() {
    const { t } = useTranslation();
    return (
        <section className="bg-background py-16 px-4 md:px-8 border-t border-border">
            <div className="max-w-6xl mx-auto space-y-20">

                {/* Who We Are Section */}
                <div className="text-center space-y-8 max-w-3xl mx-auto">
                    <div className="space-y-4">
                        <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                            {t('cred_title_1')}
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            {t('cred_desc_1')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="space-y-3 flex flex-col items-center text-center"
                        >
                            <div className="p-4 bg-primary/10 text-primary rounded-full mb-2">
                                <Paintbrush className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">{t('cred_title_2')}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t('cred_desc_2')}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="space-y-3 flex flex-col items-center text-center"
                        >
                            <div className="p-4 bg-primary/10 text-primary rounded-full mb-2">
                                <Crown className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">{t('cred_title_3')}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t('cred_desc_3')}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="space-y-3 flex flex-col items-center text-center"
                        >
                            <div className="p-4 bg-primary/10 text-primary rounded-full mb-2">
                                <Landmark className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg text-foreground">{t('cred_title_4')}</h3>
                            <p className="text-sm text-muted-foreground">
                                {t('cred_desc_4')}
                            </p>
                        </motion.div>
                    </div>
                </div>

                {/* As Seen On Section */}
                <div className="space-y-8 pt-12 border-t border-border/50">
                    <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        As Seen On
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
