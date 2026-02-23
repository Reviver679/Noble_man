'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useUploadContext } from '@/lib/uploadContext';
import { addWatermark, blobToDataUrl } from '@/lib/watermark';
import { ChevronLeft, Loader2, Download, Printer, Frame, Check, Sparkles } from 'lucide-react';

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max

export default function PreviewStep() {
  const {
    setStep,
    uploadedImage,
    setGeneratedImage,
    generatedImage,
    setWatermarkedImage,
    setGeneratedImageUrl,
    generatedImageUrl,
    setRequestId,
    requestId,
    setError,
    setProcessing,
    processing,
  } = useUploadContext();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('Submitting your photo...');
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollCountRef = useRef(0);
  const isSubmittedRef = useRef(false);

  const products = [
    {
      id: 'digital',
      name: 'Instant Digital High-Res',
      price: 29,
      originalPrice: 49,
      icon: Download,
      description: 'The digital masterpiece. Perfect for social media and DIY printing.',
      benefits: [
        'No Watermark',
        'Commercial License',
        '8K Ultra-High Resolution',
      ],
      buttonLabel: 'Get Digital Copy',
      highlighted: false,
    },
    {
      id: 'print',
      name: 'Fine Art Print',
      price: 89,
      originalPrice: 129,
      icon: Printer,
      description: 'Museum-quality archival paper with fade-resistant inks.',
      benefits: [
        'Includes Digital Copy', // Upsell benefit
        'Premium Matte Finish',
        'Ships in 3-5 days',
      ],
      buttonLabel: 'Order Fine Art Print',
      highlighted: false,
    },
    {
      id: 'canvas',
      name: 'Gallery Canvas',
      price: 299,
      originalPrice: 399,
      icon: Frame,
      description: 'Hand-stretched on a 1.25" wood frame. Arrives ready to hang.',
      benefits: [
        'Includes Digital Copy', // Upsell benefit
        'Life-time Warranty',
        'Free Express Shipping',
      ],
      buttonLabel: 'Order Gallery Canvas',
      highlighted: true,
    },
  ];

  // (Keeping your existing logic functions: fileToBase64, pollStatus, useEffects, handleBack)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const pollStatus = useCallback(async (reqId: string) => {
    if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
      setError('Generation timed out. Please try again.');
      setProcessing(false);
      return;
    }
    pollCountRef.current += 1;
    try {
      const res = await fetch('/api/face/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ request_id: reqId }),
      });
      if (!res.ok) throw new Error(`Status check failed: ${res.statusText}`);
      const data = await res.json();
      const status = data.message?.status;

      if (status === 'Completed') {
        const imageDataUrl = data.message.image_data_url;
        setGeneratedImageUrl(imageDataUrl);
        setStatusMessage('Applying watermark...');
        const imgResponse = await fetch(imageDataUrl);
        const imgBlob = await imgResponse.blob();
        setGeneratedImage(imgBlob);
        const watermarked = await addWatermark(imgBlob);
        setWatermarkedImage(watermarked);
        const wmUrl = await blobToDataUrl(watermarked);
        setPreviewUrl(wmUrl);
        setProcessing(false);
        setStep('preview');
        return;
      } else if (status === 'Failed') {
        setError(data.message?.error || 'Portrait generation failed. Please try again.');
        setProcessing(false);
        return;
      }
      if (status === 'Processing') setStatusMessage('AI is painting your portrait...');
      else if (status === 'Queued') setStatusMessage('Waiting in queue...');
      pollTimerRef.current = setTimeout(() => pollStatus(reqId), POLL_INTERVAL_MS);
    } catch (err) {
      console.error('[PreviewStep] Poll error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check status');
      setProcessing(false);
    }
  }, [setError, setProcessing, setGeneratedImage, setGeneratedImageUrl, setWatermarkedImage, setStep]);

  useEffect(() => {
    const submitImage = async () => {
      if (!uploadedImage || isSubmittedRef.current) return;
      isSubmittedRef.current = true;
      try {
        setProcessing(true);
        setError(null);
        const base64 = await fileToBase64(uploadedImage);
        const userId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const res = await fetch('/api/face/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, user_id: userId }),
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to submit image');
        }
        const data = await res.json();
        const reqId = data.message?.request_id;
        if (!reqId) throw new Error('No request_id returned from API');
        setRequestId(reqId);
        setStatusMessage('Waiting in queue...');
        pollCountRef.current = 0;
        pollTimerRef.current = setTimeout(() => pollStatus(reqId), POLL_INTERVAL_MS);
      } catch (err) {
        console.error('[PreviewStep] Submit error:', err);
        setError(err instanceof Error ? err.message : 'Failed to generate portrait');
        setProcessing(false);
      }
    };
    submitImage();
    return () => { if (pollTimerRef.current) clearTimeout(pollTimerRef.current); };
  }, [uploadedImage, setProcessing, setError, setRequestId, pollStatus]);

  useEffect(() => {
    const showExistingPreview = async () => {
      if (generatedImage && !previewUrl && !processing) {
        const watermarked = await addWatermark(generatedImage);
        setWatermarkedImage(watermarked);
        const url = await blobToDataUrl(watermarked);
        setPreviewUrl(url);
      }
    };
    showExistingPreview();
  }, [generatedImage, previewUrl, processing, setWatermarkedImage]);

  const handleBack = () => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    localStorage.removeItem('noblified_request_id');
    setPreviewUrl(null);
    setRequestId(null);
    isSubmittedRef.current = false;
    setStep('upload');
  };

  if (processing && !previewUrl) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="flex justify-center">
            <Loader2 className="w-16 h-16 text-primary" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-foreground">Creating Your Masterpiece</h2>
            <p className="text-muted-foreground">{statusMessage}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background py-12 px-4 md:px-8"
    >
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header Area */}
        <div className="flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            Start Over
          </button>
          <div className="flex items-center gap-2 text-primary text-sm font-semibold italic">
            <Sparkles className="w-4 h-4" />
            AI Masterpiece Generated
          </div>
        </div>

        {/* Main Grid: Preview on left (or top), Store on right (or bottom) */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">

          {/* Left Side: Preview */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden bg-card border-4 border-white shadow-2xl"
            >
              {previewUrl && (
                <img src={previewUrl} alt="Your portrait" className="w-full h-auto" />
              )}
              <div className="absolute inset-0 pointer-events-none border border-black/5 rounded-2xl" />
            </motion.div>

            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-muted-foreground bg-card rounded-full py-2 border border-border">
              <span>Preview Mode: <span className="text-foreground font-bold">Watermarked</span></span>
            </div>
          </div>

          {/* Right Side: Storefront */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <h3 className="font-serif text-3xl font-bold text-foreground">Own This Portrait</h3>
              <p className="text-muted-foreground">Select a format to remove the watermark and unlock high-resolution files.</p>
            </div>

            <div className="grid gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + (index * 0.1) }}
                  className={`group relative border-2 rounded-xl p-5 cursor-pointer transition-all ${product.highlighted
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/10'
                      : 'border-border hover:border-primary/40 bg-card'
                    }`}
                  onClick={() => setStep('checkout')}
                >
                  {product.highlighted && (
                    <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                      Best Value
                    </div>
                  )}

                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-lg ${product.highlighted ? 'bg-primary text-white' : 'bg-muted text-primary'}`}>
                      <product.icon size={24} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-baseline justify-between">
                        <h4 className="font-bold text-lg text-foreground">{product.name}</h4>
                        <div className="text-right">
                          <span className="text-xl font-bold text-foreground">${product.price}</span>
                          <span className="text-xs line-through text-muted-foreground ml-2">${product.originalPrice}</span>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">{product.description}</p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {product.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] font-medium text-foreground/80">
                            <Check size={12} className="text-primary" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button className={`w-full mt-5 py-3 rounded-lg font-bold text-sm transition-all ${product.highlighted
                      ? 'bg-primary text-primary-foreground hover:shadow-lg'
                      : 'bg-foreground text-background hover:bg-foreground/90'
                    }`}>
                    {product.buttonLabel}
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Generate Another (De-emphasized) */}
            <button
              onClick={handleBack}
              className="w-full py-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border border-dashed border-border rounded-xl"
            >
              Not happy? Try another photo
            </button>
          </div>
        </div>

        {/* Social Proof */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 border-t border-border">
          {[
            { label: 'Created', val: '1M+' },
            { label: 'Rating', val: '4.8★' },
            { label: 'Secure', val: 'SSL' },
            { label: 'Privacy', val: '100%' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-bold text-primary">{stat.val}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}