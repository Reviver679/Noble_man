

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
FACE_SWAP_TOKEN=

NEXT_SHOPIFY_CLIENT_ID=
NEXT_SHOPIFY_CLIENT_SECRET=
```

---

# 🖼 FACE SWAP API INTEGRATION (ASYNC FLOW)

Use this exact integration logic.

## Authentication Header

```
X-Face-Swap-Token: process.env.FACE_SWAP_TOKEN
```

---

## Step 1 — Submit Image(s)

POST:

```
https://api.nobilified.com/api/method/new_face.api.face_swap.process
```

API accepts **1 to 5 images**. Backend rejects 0 or >5.

### Option A — JSON body (recommended)

Body (single image — backward compatible):

```json
{
  "image": "<base64 without data prefix>",
  "user_id": "<shopify session id or uuid>",
  "customer_name": "",
  "customer_email": "",
  "callback_url": "<optional push URL>",
  "prompt_template": "<optional — exact name of Prompt Template on backend>"
}
```

Body (multiple images — use `images` array):

```json
{
  "images": ["<base64_1>", "<base64_2>"],
  "user_id": "<shopify session id or uuid>",
  "customer_name": "",
  "customer_email": "",
  "callback_url": "<optional push URL>",
  "prompt_template": "<optional — exact name of Prompt Template on backend>"
}
```

| Field | Required | Notes |
|---|---|---|
| `image` | Yes (if `images` not set) | Single base64 string |
| `images` | Yes (if `image` not set) | Array of base64, max 5 |
| `user_id` | Yes | Shopify session or customer ID |
| `customer_name` | No | Customer full name |
| `customer_email` | No | Customer email |
| `callback_url` | No | Backend POSTs result here when done |
| `prompt_template` | No | Named template; falls back to backend default if omitted |

### Option B — Multipart form upload

Do **not** set `Content-Type` — browser sets it automatically with multipart boundary.

Append each file under the same field name `images` (repeated).

---

Response:

```json
{
  "message": {
    "request_id": "FSR-0001",
    "status": "Queued"
  }
}
```

Store `request_id` in DB.

---

## Step 2 — Poll Every 5 Seconds

POST:

```
https://api.nobilified.com/api/method/new_face.api.face_swap.get_status
```

Body:

```json
{ "request_id": "FSR-0001" }
```

Possible statuses: `Queued` → `Processing` → `Completed` or `Failed`

When Completed:

```json
{
  "message": {
    "request_id": "FSR-0001",
    "status": "Completed",
    "image_b64": "<raw base64>",
    "image_data_url": "data:image/png;base64,..."
  }
}
```

When Failed:

```json
{ "message": { "status": "Failed", "error_message": "..." } }
```

Note: field is `error_message` (not `error`).

Display result: `img.src = message.image_data_url`

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
* Never expose `FACE_SWAP_TOKEN` to the browser

---

# 🎨 FRONTEND FLOW

Upload Page:

* Multi-file input (JPEG/PNG, `multiple`, max 5 files enforced client-side)
* Submit button
* Spinner / progress indicator during async processing (~30–90 s)
* Poll `/api/face/status` every 5 s (max 60 attempts = 5 min timeout)
* On Completed: show watermarked preview via `image_data_url`
* On Failed: show human-readable `error_message`

Result Page:

* Show watermarked image
* “Download Watermarked” (free)
* “Buy HD – $25”
* “Buy Print – $50”

Unwatermarked image unlocked only after backend sets `payment_status = Paid`.

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

# 📝 TODO — TASKS TO IMPLEMENT (from updated API spec)

## `lib/faceswap.ts`

- [x] Support `images: string[]` in `submitFaceSwap()` — send `images` (plural) when >1, `image` for single
- [x] Add `prompt_template?: string` and `callback_url?: string` optional params to `submitFaceSwap()`
- [x] Fix `FaceSwapStatusResponse`: rename `error` → `error_message` to match actual API response
- [x] Add `image_b64?: string` to `FaceSwapStatusResponse`
- [x] Add `submitFaceSwapMultipart(files: File[], userId: string, ...)` for FormData / multipart upload
- [x] Throw startup error if `FACE_SWAP_TOKEN` env var is missing

## `app/api/face/process/route.ts`

- [x] Accept `image` (string) OR `images` (string[]) from request body
- [x] Forward `prompt_template` and `callback_url` fields if present
- [x] Return 400 if images count > 5 or == 0
- [x] Detect `multipart/form-data` content-type and route to multipart helper

## `app/api/face/status/route.ts`

- [x] Map `error_message` (not `error`) from API response to client

## `app/upload/page.tsx`

- [x] Change `<input>` to `multiple`, `accept="image/jpeg,image/png"`
- [x] Enforce max 5 client-side: `Array.from(files).slice(0, 5)`
- [x] Convert all files to base64 and submit as `images[]` array
- [x] Handle `error_message` field in Failed poll response (not `error`)
- [x] (Optional) Add `prompt_template` selector if templates are exposed by backend

## `app/result/[id]/page.tsx`

- [x] Show unwatermarked image once `is_paid = true` (post-webhook DB update)
- [x] Visually distinguish watermarked preview from unlocked HD image

## `lib/uploadContext.tsx`

- [x] Extend state to hold array of uploaded files (not single)
- [x] Track `prompt_template` selection in context if applicable

## `.env.local`

- [x] Ensure `FACE_SWAP_TOKEN=` is present and documented
