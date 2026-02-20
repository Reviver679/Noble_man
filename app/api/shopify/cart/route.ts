import { NextRequest, NextResponse } from 'next/server';
import { createCart } from '@/lib/shopify-utils';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { productType } = body;

        if (!productType || !['digital', 'print'].includes(productType)) {
            return NextResponse.json(
                { error: 'Missing or invalid productType. Must be "digital" or "print".' },
                { status: 400 }
            );
        }

        const checkoutUrl = await createCart(productType as 'digital' | 'print');

        if (!checkoutUrl) {
            return NextResponse.json(
                { error: 'Failed to create Shopify cart. Check your Shopify credentials.' },
                { status: 500 }
            );
        }

        return NextResponse.json({ checkoutUrl });
    } catch (error) {
        console.error('[API] Cart creation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create cart' },
            { status: 500 }
        );
    }
}
