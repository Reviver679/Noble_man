import Header from '@/components/header/Header';
import { UploadProvider } from '@/lib/uploadContext';

export default function PricingPage() {
  return (
    <UploadProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Simple, transparent pricing for your royal masterpieces.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            {/* Digital Only */}
            <div className="p-8 rounded-2xl border border-border bg-card">
              <h3 className="font-serif text-2xl font-bold mb-2">Digital Masterpiece</h3>
              <div className="text-4xl font-bold mb-4">$20<span className="text-sm font-normal text-muted-foreground">.00</span></div>
              <p className="text-muted-foreground mb-6">High-resolution digital file ready to print or share instantly.</p>
              <ul className="text-left space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">✓ 4K Resolution</li>
                <li className="flex items-center gap-2">✓ Turnaround in seconds</li>
                <li className="flex items-center gap-2">✓ Multiple style variations</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors">
                Get Started
              </button>
            </div>

            {/* Canvas Print */}
            <div className="p-8 rounded-2xl border-2 border-primary bg-primary/5 relative">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Most Popular
              </div>
              <h3 className="font-serif text-2xl font-bold mb-2">Hand-Painted Canvas</h3>
              <div className="text-4xl font-bold mb-4">from $299<span className="text-sm font-normal text-muted-foreground">.00</span></div>
              <p className="text-muted-foreground mb-6">Gallery-quality gallery-wrapped canvas delivered to your door.</p>
              <ul className="text-left space-y-3 mb-8 text-sm">
                <li className="flex items-center gap-2">✓ Everything in Digital</li>
                <li className="flex items-center gap-2">✓ Museum-grade canvas</li>
                <li className="flex items-center gap-2">✓ Free global shipping</li>
              </ul>
              <button className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors relative z-10">
                Get Started
              </button>
            </div>
          </div>
        </main>
      </div>
    </UploadProvider>
  );
}
