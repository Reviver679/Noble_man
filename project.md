

Continue Building a production-ready headless Shopify storefront using **Next.js**.

This project sells AI-generated portraits using a Face Swap API and Shopify checkout.

---

# 🧠 BUSINESS LOGIC

Users:

1. Upload a selfie
2. AI generates a watermarked preview (async processing)
3. User can:

   * Download watermarked preview (free)
   * Buy HD Unwatermarked Digital Image ($25)
   * Buy Physical Print ($50)

After successful payment:

* Digital buyers receive full-resolution unwatermarked image
* Print buyers trigger fulfillment workflow

---

# 🔐 IMPORTANT: ENV VARIABLES

All sensitive credentials must come from environment variables.

Do NOT hardcode tokens.

Use:

```
NEXT_PUBLIC_SHOP_DOMAIN=
NEXT_PUBLIC_STOREFRONT_TOKEN=
NEXT_PHYSICAL_PRINT_VARIENT_ID=
NEXT_DIGITAL_VARIENT_ID=
SHOPIFY_ADMIN_TOKEN=
SHOPIFY_API_SECRET=

```

---

# 🖼 FACE SWAP API INTEGRATION (ASYNC FLOW)

Use this exact integration logic.

## Authentication Header

```
X-Face-Swap-Token: process.env.FACE_SWAP_TOKEN
```

---

## Step 1 — Submit Image

POST:

```
https://api.darzh.xyz/api/method/new_face.api.face_swap.process
```

Body:

```json
{
  "image": "<base64 without data prefix>",
  "user_id": "<shopify session id or uuid>",
  "customer_name": "",
  "customer_email": ""
}
```

Response:

```json
{
  "message": {
    "request_id": "FSR-0001",
    "status": "Queued"
  }
}
```

Store request_id in DB.

---

## Step 2 — Poll Every 5 Seconds

POST:

```
https://api.darzh.xyz/api/method/new_face.api.face_swap.get_status
```

Body:

```json
{ "request_id": "FSR-0001" }
```

Possible statuses:

* Queued
* Processing
* Completed
* Failed

When Completed:

```
message.image_data_url
```

Display it directly in `<img src="">`.

---

# 🛒 SHOPIFY CHECKOUT (HEADLESS)

Use Storefront GraphQL API.

Endpoint:

```
https://{STORE_DOMAIN}/api/2024-01/graphql.json
```

Headers:

```
X-Shopify-Storefront-Access-Token
Content-Type: application/json
```

---

## Create Cart

Use mutation:

```
cartCreate
```

Add one line item using:

```
HD_VARIANT_ID
or
PRINT_VARIANT_ID
```

Then:

Redirect user to:

```
cart.checkoutUrl
```

---

# 🔄 AFTER PAYMENT

Implement Shopify webhook:

```
orders/paid
```

Webhook route:

```
/api/webhooks/shopify
```

Verify signature using:

```
SHOPIFY_API_SECRET
```

Header:

```
X-Shopify-Hmac-Sha256
```

---

# 🎯 WEBHOOK LOGIC

When order is paid:

1. Read line items
2. If HD_VARIANT_ID:

   * Mark request as unlocked
   * Store digital entitlement
3. If PRINT_VARIANT_ID:

   * Mark as unlocked
   * Flag for fulfillment

Then allow user to download unwatermarked image.

---

# 🗂 DATABASE DESIGN

Create simple table:

```
face_requests
- id
- request_id
- user_id
- status
- watermarked_image
- full_image
- is_paid
- purchased_type (hd | print)
- created_at
```

---

# 📦 PROJECT STRUCTURE

```
/app
  /upload
  /result/[id]
  /api/face/process
  /api/face/status
  /api/shopify/cart
  /api/webhooks/shopify
/lib
  shopify.ts
  faceswap.ts
  webhook.ts
```

---

# 🛡 SECURITY RULES

* Never expose Admin API token to frontend
* Store Admin API only in server routes
* Validate Shopify webhook signature
* Validate request ownership before allowing HD download
* Rate limit polling

---

# 🎨 FRONTEND FLOW

Upload Page:

* File input
* Submit button
* Spinner
* Poll status
* Show watermarked image

Result Page:

* Show image
* “Download Watermarked”
* “Buy HD – $25”
* “Buy Print – $50”

Buy buttons call `/api/shopify/cart` to generate checkout.

---

# 📦 PRINT PRODUCT REQUIREMENTS

Assume:

* Print product is marked as physical in Shopify
* Shipping required
* Fulfillment handled later

---

# 🎯 FINAL REQUIREMENTS

The code must:

* Use TypeScript
* Use async/await
* Be production clean
* Separate client and server logic
* Handle errors gracefully
* Include webhook verification example
* Include cartCreate mutation example
* Include polling example
* Include checkout redirect example

---

Build this as a scalable production MVP.

Do NOT use Shopify Hydrogen.

Use Next.js + Storefront API only.

---

If you'd like, I can now generate:

* A simplified MVP version prompt
* Or the actual starter code structure for your repo

You’re now architecting this correctly.
