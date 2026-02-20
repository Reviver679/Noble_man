import { NextRequest, NextResponse } from 'next/server';
import { verifyShopifyWebhook, processOrderPaid } from '@/lib/webhook';

export async function POST(request: NextRequest) {
    try {
        // Read raw body for HMAC verification
        const rawBody = await request.text();
        const hmacHeader = request.headers.get('x-shopify-hmac-sha256') || '';

        // Verify webhook signature
        if (!verifyShopifyWebhook(rawBody, hmacHeader)) {
            console.error('[Webhook] Invalid HMAC signature');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse the order payload
        const order = JSON.parse(rawBody);

        // Process the paid order
        const result = processOrderPaid(order);

        console.log('[Webhook] Order processed:', JSON.stringify(result, null, 2));

        // Respond with 200 to acknowledge receipt
        return NextResponse.json({ received: true, result });
    } catch (error) {
        console.error('[Webhook] Processing error:', error);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
