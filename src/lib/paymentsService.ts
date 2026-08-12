/**
 * Cashfree payments service for VoltSetu booking deposits.
 *
 * Design (defense-in-depth):
 * - Cashfree's Create Order API requires a client secret and MUST run on a
 *   server. VoltSetu's web app has no server, so the client calls a small
 *   order-creation endpoint (env VITE_CF_ORDER_ENDPOINT) that the owner
 *   deploys — a Firebase Cloud Function or any HTTPS endpoint that holds the
 *   secret. Contract: POST { amount, currency, orderRef, customerName,
 *   customerPhone, customerEmail, returnUrl } → { order_id, payment_session_id }.
 *   The endpoint must verify the rider is authenticated and clamp the amount
 *   server-side (it re-derives the price from the spot, never trusting client
 *   input alone). See docs/PAYMENTS-SETUP.md for the reference function code.
 * - Modes (env VITE_CF_MODE, default "simulate"):
 *   "simulate"  — no real keys needed; a fake session is returned and the
 *                 booking proceeds as deposit-paid. Used for demos and dev.
 *   "sandbox"   — Cashfree test environment (sandbox.cashfree.com).
 *   "production"— live environment (api.cashfree.com).
 * - The client-facing app ID (VITE_CF_CLIENT_ID) is public, like a Firebase
 *   apiKey — safe to ship. The secret never ships.
 * - Order idempotency: each booking attempt uses orderRef = "vs-{uid}-{ts}".
 */

export type CashfreeMode = "simulate" | "sandbox" | "production";

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  orderRef: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  returnUrl: string;
}

export interface CreateOrderResponse {
  order_id: string;
  payment_session_id: string;
  order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED";
}

export interface OrderStatus {
  order_id: string;
  order_status: "ACTIVE" | "PAID" | "EXPIRED" | "TERMINATED";
}

export function getMode(): CashfreeMode {
  const raw = (import.meta.env.VITE_CF_MODE as string) || "simulate";
  if (raw === "sandbox" || raw === "production" || raw === "simulate") return raw;
  return "simulate";
}

export function isPaymentsEnabled(): boolean {
  const mode = getMode();
  if (mode !== "simulate") return Boolean(import.meta.env.VITE_CF_ORDER_ENDPOINT);
  return true; // simulate always works for demos
}

/** Deposit sizing: 20% of the estimate, floor ₹10, capped at the estimate. */
export function computeDepositAmount(estimatedCost: number): number {
  const est = Number(estimatedCost);
  if (!Number.isFinite(est) || est <= 0) return 0;
  const deposit = Math.max(10, Math.ceil((est * 0.2 * 100) / 100));
  return Math.min(deposit, Math.ceil(est));
}

/** Compute a stable order reference for a booking attempt. */
export function makeOrderRef(uid: string, spotId: string): string {
  const ts = Math.floor(Date.now() / 1000);
  const safe = (s: string) => s.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 18);
  return `vs-${safe(uid)}-${safe(spotId)}-${ts}`.slice(0, 45);
}

/** Create a Cashfree order via the owner's server endpoint. */
async function createRemoteOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
  const endpoint = import.meta.env.VITE_CF_ORDER_ENDPOINT as string;
  if (!endpoint) throw new Error("Payment endpoint is not configured. See docs/PAYMENTS-SETUP.md");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "unknown error");
    throw new Error(`Payment server error (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = (await res.json()) as CreateOrderResponse;
  if (!data.order_id || !data.payment_session_id) {
    throw new Error("Payment server returned an incomplete order.");
  }
  return data;
}

/** Verify a Cashfree order status via the owner's server endpoint. */
async function verifyRemoteOrder(orderId: string): Promise<OrderStatus> {
  const endpoint = import.meta.env.VITE_CF_ORDER_ENDPOINT as string;
  if (!endpoint) throw new Error("Payment endpoint is not configured.");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verify_order", order_id: orderId }),
  });
  if (!res.ok) throw new Error(`Payment server error (${res.status}) while verifying.`);
  const data = (await res.json()) as OrderStatus;
  if (!data.order_status) throw new Error("Payment verification failed.");
  return data;
}

function simulateCreateOrder(req: CreateOrderRequest): CreateOrderResponse {
  return {
    order_id: `vs-sim-${req.orderRef.slice(0, 32)}`,
    payment_session_id: `session_sim_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    order_status: "PAID",
  };
}

/**
 * Start a deposit payment session. In simulate mode it returns instantly as
 * paid (demo). In sandbox/production it calls the owner's server for an order,
 * then opens Cashfree's hosted checkout. The returned promise resolves with
 * the order outcome: "paid" | "cancelled" | "failed".
 */
export async function startDepositPayment(opts: {
  amount: number;
  spotId: string;
  spotName: string;
  uid: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}): Promise<{ outcome: "paid" | "cancelled" | "failed"; order?: CreateOrderResponse; error?: string }> {
  const mode = getMode();

  if (opts.amount <= 0 || !Number.isFinite(opts.amount)) {
    return { outcome: "failed", error: "Deposit amount is invalid." };
  }

  if (mode === "simulate") {
    const order = simulateCreateOrder({
      amount: opts.amount,
      currency: "INR",
      orderRef: makeOrderRef(opts.uid, opts.spotId),
      customerName: opts.customerName,
      customerPhone: opts.customerPhone,
      customerEmail: opts.customerEmail,
      returnUrl: `${window.location.origin}/dashboard/bookings`,
    });
    console.info("[VoltSetu payments] Simulated deposit paid:", order.order_id);
    return { outcome: "paid", order };
  }

  // sandbox / production: real Cashfree flow
  if (!opts.customerPhone) {
    return { outcome: "failed", error: "Your phone number is required for secure checkout." };
  }
  const orderRef = makeOrderRef(opts.uid, opts.spotId);
  let order: CreateOrderResponse;
  try {
    order = await createRemoteOrder({
      amount: opts.amount,
      currency: "INR",
      orderRef,
      customerName: opts.customerName,
      customerPhone: opts.customerPhone,
      customerEmail: opts.customerEmail,
      returnUrl: `${window.location.origin}/dashboard/bookings`,
    });
  } catch (err) {
    return { outcome: "failed", error: err instanceof Error ? err.message : "Payment server unreachable." };
  }

  try {
    const script = document.getElementById("cashfree-sdk") as HTMLScriptElement | null;
    if (!script) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.id = "cashfree-sdk";
        s.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Cashfree SDK could not be loaded."));
        document.head.appendChild(s);
      });
    }
    const w = window as Window & { Cashfree?: (opts: { mode: "sandbox" | "production" }) => { checkout: (opts: { paymentSessionId: string; redirectTarget?: string }) => Promise<any> } };
    if (!w.Cashfree) throw new Error("Cashfree SDK is not available in this browser.");
    const cashfree = w.Cashfree({ mode: mode === "sandbox" ? "sandbox" : "production" });
    const result = await cashfree.checkout({ paymentSessionId: order.payment_session_id, redirectTarget: "_modal" });
    if (result && result.error) {
      return { outcome: "failed", error: result.error.description || "Checkout was cancelled.", order };
    }
    // Verify server-side before trusting the client-side promise.
    const status = await verifyRemoteOrder(order.order_id);
    if (status.order_status === "PAID") return { outcome: "paid", order };
    if (status.order_status === "EXPIRED" || status.order_status === "TERMINATED") {
      return { outcome: "cancelled", error: "Payment window expired. Please try again.", order };
    }
    return { outcome: "cancelled", error: "Payment was not completed.", order };
  } catch (err) {
    return { outcome: "failed", error: err instanceof Error ? err.message : "Checkout failed.", order };
  }
}
