'use client';

import { motion } from 'framer-motion';
import HomeHero from './HomeHero';
import HowItWorksSection from './HowItWorksSection';
import ReviewsSection from './ReviewsSection';
import FaqSection from './FaqSection';
import SiteFooter from './SiteFooter';
import StickyBar from './StickyBar';

export default function HomeLanding() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <HomeHero />
      <HowItWorksSection />
      <ReviewsSection />
      <FaqSection />
      <SiteFooter />
      <StickyBar />
    </motion.div>
  );
}
