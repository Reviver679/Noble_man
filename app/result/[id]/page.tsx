'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Download, RotateCcw, Loader2, Lock } from 'lucide-react';

interface ResultData {
    status: string;
    image_data_url?: string;
    payment_status?: 'Paid' | 'Unpaid';
    images?: Array<{
        prompt_template?: string;
        image_data_url?: string;
        status?: string;
        error_message?: string;
    }>;
}

export default function ResultPage() {
    const params = useParams();
    const requestId = params.id as string;
    const [result, setResult] = useState<ResultData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await fetch('/api/face/status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ request_id: requestId }),
                });

                if (!res.ok) throw new Error('Failed to fetch result');

                const data = await res.json();
                setResult(data.message);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load result');
            } finally {
                setLoading(false);
            }
        };

        if (requestId) {
            fetchResult();
        }
    }, [requestId]);

    const handleDownload = () => {
        const imagesToDownload = result?.images?.filter(i => i.status === 'Completed' && i.image_data_url) || [];
        const urls = imagesToDownload.length > 0
            ? imagesToDownload.map(i => i.image_data_url)
            : (result?.image_data_url ? [result.image_data_url] : []);

        if (urls.length === 0) return;

        urls.forEach((url, i) => {
            if (!url) return;
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = url;
                link.download = `noblified-portrait-${requestId}-${i + 1}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, i * 200); // 200ms delay to prevent browser blocking multiple downloads
        });
    };

    const handleSingleDownload = (url: string, index: number = 0) => {
        if (!url) return;
        const link = document.createElement('a');
        link.href = url;
        link.download = `noblified-portrait-${requestId}-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Loading your portrait...</p>
                </div>
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="text-center space-y-4 max-w-md">
                    <h1 className="font-serif text-3xl font-bold text-foreground">
                        Something went wrong
                    </h1>
                    <p className="text-muted-foreground">{error || 'Result not found'}</p>
                    <a
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 md:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Check className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="font-serif text-4xl font-bold text-foreground">
                        Your Portrait is Ready!
                    </h1>
                    <p className="text-muted-foreground font-mono text-sm">
                        Request: {requestId}
                    </p>
                </motion.div>

                {/* Portraits Grid */}
                {((result.images?.filter(i => i.status === 'Completed' && i.image_data_url).length ?? 0) > 0 || result.image_data_url) && (
                    <div className={`grid gap-6 ${result.images && result.images.filter(i => i.status === 'Completed').length > 1 ? 'md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
                        {result.images && result.images.length > 0 ? (
                            result.images
                                .filter(img => img.status === 'Completed' && img.image_data_url)
                                .map((img, idx) => (
                                    <div key={idx} className="relative">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.2 + idx * 0.1 }}
                                            className="rounded-lg overflow-hidden border-4 border-white shadow-xl bg-card"
                                        >
                                            <img
                                                src={img.image_data_url}
                                                alt={`Portrait option ${idx + 1}`}
                                                className="w-full h-auto"
                                            />
                                        </motion.div>

                                        {result.payment_status !== 'Paid' && (
                                            <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-border">
                                                <Lock className="w-4 h-4 text-primary" />
                                                <span className="text-xs font-bold uppercase tracking-wider text-foreground">Watermarked Preview</span>
                                            </div>
                                        )}
                                        {result.payment_status === 'Paid' && (
                                            <button
                                                onClick={() => handleSingleDownload(img.image_data_url || '', idx)}
                                                className="absolute top-4 right-4 bg-background/90 hover:bg-background backdrop-blur-sm p-2 rounded-full cursor-pointer shadow-sm border border-border group transition-all"
                                                title="Download this image"
                                            >
                                                <Download className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
                                            </button>
                                        )}
                                        {img.prompt_template && (
                                            <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-border text-xs font-medium text-foreground">
                                                {img.prompt_template}
                                            </div>
                                        )}
                                    </div>
                                ))
                        ) : (
                            result.image_data_url && (
                                <div className="relative">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="rounded-lg overflow-hidden border-4 border-white shadow-xl bg-card"
                                    >
                                        <img
                                            src={result.image_data_url}
                                            alt="Your portrait"
                                            className="w-full h-auto"
                                        />
                                    </motion.div>

                                    {result.payment_status !== 'Paid' && (
                                        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-border">
                                            <Lock className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Watermarked Preview</span>
                                        </div>
                                    )}
                                    {result.payment_status === 'Paid' && (
                                        <button
                                            onClick={() => handleSingleDownload(result.image_data_url || '', 0)}
                                            className="absolute top-4 right-4 bg-background/90 hover:bg-background backdrop-blur-sm p-2 rounded-full cursor-pointer shadow-sm border border-border group transition-all"
                                            title="Download this image"
                                        >
                                            <Download className="w-4 h-4 text-foreground group-hover:text-primary transition-colors" />
                                        </button>
                                    )}
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-4"
                >
                    {result.payment_status === 'Paid' ? (
                        <button
                            onClick={handleDownload}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download HD Portrait{(result.images?.filter(i => i.status === 'Completed').length ?? 0) > 1 ? 's' : ''}
                        </button>
                    ) : (
                        <button
                            onClick={() => {
                                localStorage.setItem('noblified_restore_req', requestId);
                                localStorage.setItem('noblified_auto_checkout', 'digital');
                                window.location.href = '/';
                            }}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                        >
                            <Lock className="w-5 h-5" />
                            Unlock HD Version{(result.images?.filter(i => i.status === 'Completed').length ?? 0) > 1 ? 's' : ''}
                        </button>
                    )}

                    <button
                        onClick={() => {
                            localStorage.removeItem('noblified_request_id');
                            window.location.href = '/';
                        }}
                        className="w-full py-4 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Create Another Portrait
                    </button>
                </motion.div>

                {/* Info */}
                <div className="pt-6 border-t border-border text-center text-sm text-muted-foreground space-y-2">
                    <p>✨ Thank you for choosing Nobilified!</p>
                    <p>
                        Questions?{' '}
                        <a href="mailto:support@noblified.com" className="text-primary hover:underline">
                            support@noblified.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
