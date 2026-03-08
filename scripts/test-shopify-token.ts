import { shopifyAdminFetch } from '../lib/shopify-admin';

async function run() {
    try {
        console.log('Testing Admin GraphQL API with static offline token...');
        const query = `
          query {
            shop {
              name
              myshopifyDomain
            }
          }
        `;
        const result = await shopifyAdminFetch(query);
        console.log('--- Successfully fetched from Admin API ---');
        console.dir(result, { depth: null });
        
    } catch (e) {
        console.error('Test failed:', e);
    }
}

run();

run();
