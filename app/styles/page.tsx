'use client';

import Header from '@/components/header/Header';
import StylePickerStep from '@/components/steps/StylePickerStep';
import SiteFooter from '@/components/home/SiteFooter';

export default function StylesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <StylePickerStep />
      <SiteFooter />
    </main>
  );
}
