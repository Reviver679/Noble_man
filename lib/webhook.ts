/**
 * Shopify Webhook Utilities
 * Handles HMAC signature verification and order processing
 */

import { createHmac } from 'crypto';

const SHOPIFY_API_SECRET = process.env.NEXT_SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET || '';
const DIGITAL_VARIANT_ID = process.env.NEXT_DIGITAL_VARIENT_ID || '';
const PRINT_VARIANT_ID = process.env.NEXT_PHYSICAL_PRINT_VARIENT_ID || '';

/**
 * Verify Shopify webhook HMAC signature
 * @param rawBody - The raw request body as a string
 * @param hmacHeader - The X-Shopify-Hmac-Sha256 header value
 * @returns true if the signature is valid
 */
export function verifyShopifyWebhook(
    rawBody: string,
    hmacHeader: string
): boolean {
    if (!SHOPIFY_API_SECRET) {
        console.error('SHOPIFY_API_SECRET is not configured');
        return false;
    }

    const hash = createHmac('sha256', SHOPIFY_API_SECRET)
        .update(rawBody, 'utf8')
        .digest('base64');

    return hash === hmacHeader;
}

export interface ShopifyLineItem {
    variant_id: number;
    title: string;
    quantity: number;
    price: string;
}

export interface ShopifyOrder {
    id: number;
    order_number: number;
    email: string;
    line_items: ShopifyLineItem[];
    note_attributes?: Array<{ name: string; value: string }>;
}

export interface OrderProcessingResult {
    orderId: number;
    actions: Array<{
        type: 'digital_unlock' | 'print_fulfillment';
        variantId: number;
        title: string;
    }>;
}

/**
 * Process a paid order — determine if items are digital or print
 * @param order - The Shopify order payload
 * @returns Processing result with actions taken
 */
export function processOrderPaid(order: ShopifyOrder): OrderProcessingResult {
    const actions: OrderProcessingResult['actions'] = [];

    for (const item of order.line_items) {
        const variantIdStr = String(item.variant_id);

        if (variantIdStr === DIGITAL_VARIANT_ID) {
            actions.push({
                type: 'digital_unlock',
                variantId: item.variant_id,
                title: item.title,
            });
            console.log(
                `[Webhook] Digital unlock: Order #${order.order_number}, variant ${item.variant_id}`
            );
        } else if (variantIdStr === PRINT_VARIANT_ID) {
            actions.push({
                type: 'print_fulfillment',
                variantId: item.variant_id,
                title: item.title,
            });
            console.log(
                `[Webhook] Print fulfillment: Order #${order.order_number}, variant ${item.variant_id}`
            );
        }
    }

    return {
        orderId: order.id,
        actions,
    };
}
