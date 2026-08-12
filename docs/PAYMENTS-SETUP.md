# VoltSetu Payments Setup — Cashfree Booking Deposits

VoltSetu's booking flow now supports an optional **booking deposit** (20% of the estimated cost, floor ₹10, capped at the estimate) paid through **Cashfree Payments**. The deposit is deducted from the final bill paid on arrival. Paying at the spot remains fully supported, so the product works from day one and payments can be flipped on later.

## Architecture overview

Cashfree's Create Order API requires the account **client secret**, which must never ship in client code. VoltSetu's web app has no owned backend server, so the client delegates order creation and verification to a tiny HTTPS endpoint that **you** deploy and hold the secrets for:

```
Browser (VoltSetu web app)
   │  POST { amount, orderRef, customerName, customerPhone, customerEmail, returnUrl }
   ▼
Your endpoint  →  Cashfree Create Order API (sandbox.cashfree.com / api.cashfree.com)
   │  returns { order_id, payment_session_id }
   ▼
Browser → Cashfree JS SDK checkout (modal) → POST { action: "verify_order", order_id }
   ▼
Endpoint → Cashfree Get Order API → client trusts only "PAID" status
```

The client-facing public app id (`VITE_CF_CLIENT_ID`) is safe to ship — exactly like the Firebase `apiKey` already in the repo. The secret lives only on your endpoint.

## Modes

| `VITE_CF_MODE` | Behavior |
|---|---|
| `simulate` (default) | No keys, no endpoint. Fake order is created and marked paid locally; booking proceeds with `depositStatus: "paid"`. Used for demos and development. |
| `sandbox` | Real Cashfree test environment. Requires `VITE_CF_ORDER_ENDPOINT` pointing at your endpoint holding sandbox keys. |
| `production` | Live payments. Requires the endpoint holding live keys and Cashfree KYC-approved merchant account. |

## Environment variables

Add to your hosting environment (Vercel/Netlify/Firebase Hosting `.env` at build time):

```
VITE_CF_MODE=sandbox               # or simulate | production
VITE_CF_ORDER_ENDPOINT=https://your-endpoint.example.com/create-payment-order
VITE_CF_CLIENT_ID=your_public_app_id   # only needed for Cashfree SDK branding
```

## Reference endpoint — Firebase Cloud Function (recommended)

VoltSetu already runs Firebase; the simplest owned backend is one Cloud Function:

```js
// functions/index.js  (nodejs20, firebase-functions v5)
const functions = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();

const CF = {
  sandbox:     "https://sandbox.cashfree.com/pg",
  production:  "https://api.cashfree.com/pg",
};

function headers(clientId, clientSecret) {
  return {
    "Content-Type": "application/json",
    "x-api-version": "2026-01-01",
    "x-client-id": clientId,
    "x-client-secret": clientSecret,
  };
}

exports.createPaymentOrder = functions.onCall(async (req) => {
  const token = req.auth?.token;
  if (!token) throw new functions.https.HttpsError("unauthenticated", "Sign in required");

  // Amount clamp — re-derive price from the stored spot, never trust client input.
  const { amount, orderRef, customerName, customerPhone, customerEmail, action, order_id } = req.data || {};
  const maxAmount = Number(process.env.CF_MAX_DEPOSIT || 100);
  if (action !== "verify_order") {
    if (typeof amount !== "number" || amount <= 0 || amount > maxAmount) {
      throw new functions.https.HttpsError("invalid-argument", "Invalid deposit amount");
    }
  }

  const env = process.env.CF_MODE === "production" ? "production" : "sandbox";
  const base = CF[env];
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new functions.https.HttpsError("internal", "Payments not configured");

  if (action === "verify_order") {
    const res = await fetch(`${base}/orders/${order_id}`, { headers: headers(clientId, clientSecret) });
    const data = await res.json();
    return { order_id: data.order_id, order_status: data.order_status };
  }

  const body = {
    order_amount: amount,
    order_currency: "INR",
    order_id: String(orderRef).slice(0, 45),
    customer_details: {
      customer_id: token.uid,
      customer_phone: String(customerPhone || ""),
      customer_email: customerEmail || token.email || "",
      customer_name: customerName || "VoltSetu rider",
    },
    order_meta: { return_url: `${process.env.APP_ORIGIN}/dashboard/bookings` },
  };
  const res = await fetch(`${base}/orders`, {
    method: "POST",
    headers: headers(clientId, clientSecret),
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new functions.https.HttpsError("internal", data.message || "Order creation failed");
  return { order_id: data.order_id, payment_session_id: data.payment_session_id, order_status: data.order_status };
});
```

Set `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, `CF_MODE`, `CF_MAX_DEPOSIT`, and `APP_ORIGIN` on the function's environment. Point `VITE_CF_ORDER_ENDPOINT` at its HTTPS trigger URL.

## Data model

Bookings now carry deposit fields written by the client and displayed in **Dashboard → Bookings** and the admin payouts ledger:

| Field | Values | Meaning |
|---|---|---|
| `depositAmount` | number | ₹ deposit collected |
| `depositCurrency` | `"INR"` | Currency |
| `depositStatus` | `"none"` / `"pending"` / `"paid"` / `"failed"` | Lifecycle |
| `cfOrderId` | string | Cashfree order id for reconciliation |
| `cfPaymentSessionId` | string | Checkout session id |

Firebase rules required no change — deposits are written inside the rider's own `chargingRequests/{uid}` and the spot's `spotRequests/{spotId}` paths, which are already ownership-locked.

## Refunds

Refunds are intentionally not automated: a rider disputes a deposit by contacting support, and the owner processes a refund via the [Cashfree dashboard](https://portal.cashfree.com) or the Refunds API from the same endpoint (`POST /pg/orders/{order_id}/refunds`, amount ≤ captured amount).

## Security checklist

1. Client secret **never** in the web app — only in the endpoint environment.
2. The endpoint **re-derives** the allowed deposit amount server-side (price per hour × duration / 60 × 0.2) and clamps it; it rejects arbitrary client amounts above `CF_MAX_DEPOSIT`.
3. The endpoint verifies `req.auth` — only signed-in riders can create orders, and the `customer_id` is forced from the Firebase token, not client input.
4. The client only proceeds on server-verified `order_status === "PAID"`; the Cashfree JS SDK promise alone is never trusted.
5. Order references are rider-scoped (`vs-{uid}-{spotId}-{ts}`) so reconciliation in the Cashfree dashboard is trivial.
