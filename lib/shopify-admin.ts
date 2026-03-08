/**
 * Shopify Admin API Utilities
 * Uses the offline access token generated via Dev Dashboard OAuth flow.
 */

const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOP_DOMAIN;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

/**
 * Fetches data from the Shopify Admin GraphQL API using the offline access token.
 */
export async function shopifyAdminFetch(query: string, variables?: Record<string, any>) {
    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ADMIN_TOKEN) {
        console.error('[Shopify Admin] Missing client credentials. Check SHOPIFY_ADMIN_TOKEN.');
        throw new Error('Shopify Admin token is not configured.');
     }

    const url = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/graphql.json`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        const text = await response.text();
        console.error('[Shopify Admin] HTTP error:', response.status, text);
        throw new Error(`Shopify Admin API error (${response.status}): ${text}`);
    }

    const data = await response.json();

    if (data.errors) {
        console.error('[Shopify Admin] GraphQL errors:', JSON.stringify(data.errors, null, 2));
        throw new Error(`Shopify Admin GraphQL error: ${data.errors[0]?.message || 'Unknown error'}`);
    }

    return data;
}


