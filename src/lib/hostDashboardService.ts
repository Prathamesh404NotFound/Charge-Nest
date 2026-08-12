import { database } from "./firebase-services";
import {
  ref, get, set, update, remove, push, onValue, serverTimestamp
} from "firebase/database";
import { sanitizeForDb } from "./bookingService";

export interface HostSpot {
  id: string;
  name: string;
  pricePerHour: number;
  status: string;
  isAvailable: boolean;
  address?: string;
  city?: string;
  availability?: Record<string, { open: string; close: string }>; // weekday schedule
}

export interface SpotStats {
  totalBookings: number;
  completed: number;
  pending: number;
  revenue: number; // completed sessions at the spot's own rate
  emergencyBookings: number;
  averageRating: number;
  reviewCount: number;
}

export interface HostBookingRequest {
  id: string;
  spotId: string;
  spotName?: string;
  userName?: string;
  userPhone?: string;
  requestedAt?: number;
  duration?: number;
  pricePerHour?: number;
  estimatedCost?: number;
  status?: string;
  emergency?: boolean;
  depositStatus?: string;
  depositAmount?: number;
  userId?: string;
  riderReputation?: { average: number; count: number };
}

/** Load rider reputation (avg + count from riderRatings) into a booking request.
 * Read-only derivation — never stored, cannot be gamed by riders. */
export async function enrichRiderReputation(
  request: HostBookingRequest
): Promise<HostBookingRequest> {
  try {
    const { getRiderRating } = await import("./riderRatingService");
    if (!request.userId) return request;
    const rep = await getRiderRating(request.userId);
    return { ...request, riderReputation: { average: rep.average, count: rep.count } };
  } catch {
    return request;
  }
}

export interface PayoutRequest {
  id: string;
  amount: number;
  status: "pending" | "processing" | "paid" | "rejected";
  createdAt: number;
  paidAt?: number;
  requestedAt?: number;
}

/** Fetch the host's own charging spots from chargingSpots (by hostId). */
export async function getHostSpots(hostUid: string): Promise<HostSpot[]> {
  const snap = await get(ref(database, "chargingSpots"));
  if (!snap.exists()) return [];
  const spots = snap.val();
  return Object.entries(spots)
    .filter(([, s]: any) => (s as any).hostId === hostUid)
    .map(([id, s]: any) => ({ id, ...s } as HostSpot));
}

/** Aggregate live stats for a single host spot. */
export async function getHostSpotStats(spot: HostSpot): Promise<SpotStats> {
  // Requests live at chargingRequests/{uid}/{requestId}; scan via spotRequests index.
  const snap = await get(ref(database, `spotRequests/${spot.id}`));
  const requests: HostBookingRequest[] = snap.exists()
    ? Object.entries(snap.val()).map(([id, r]: any) => ({ id, ...r } as HostBookingRequest))
    : [];

  const completed = requests.filter(r => r.status === "completed");
  const pending = requests.filter(r => r.status === "pending");
  const emergencyBookings = requests.filter((r: any) => r.emergency).length;

  const revenue = completed.reduce((sum, r) => {
    if (typeof r.estimatedCost === "number") return sum + Math.max(0, r.estimatedCost);
    return sum + (Number(r.pricePerHour) || spot.pricePerHour) * Number(r.duration || 0) / 60;
  }, 0);

  // Reviews
  let averageRating = 0;
  let reviewCount = 0;
  try {
    const reviewsSnap = await get(ref(database, `spotReviews/${spot.id}`));
    if (reviewsSnap.exists()) {
      const reviews = Object.values(reviewsSnap.val()) as any[];
      reviewCount = reviews.length;
      const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      averageRating = reviewCount > 0 ? Math.round(sum / reviewCount * 10) / 10 : 0;
    }
  } catch {
    /* ignore */
  }

  return {
    totalBookings: requests.length,
    completed: completed.length,
    pending: pending.length,
    revenue: Math.round(revenue * 100) / 100,
    emergencyBookings,
    averageRating,
    reviewCount,
  };
}

/** 7-day daily completed-session trend for one host spot (date labels + counts). */
export function getSpotSessionTrend(requests: HostBookingRequest[], days = 7): {
  labels: string[];
  completed: number[];
} {
  const labels: string[] = [];
  const completed: number[] = [];
  const now = new Date();
  const dayMs = 86400000;
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    dayStart.setTime(dayStart.getTime() - i * dayMs);
    const dayEnd = dayStart.getTime() + dayMs;
    const count = requests.filter((r) => {
      const at = typeof r.requestedAt === "number" ? r.requestedAt : 0;
      return r.status === "completed" && at >= dayStart.getTime() && at < dayEnd;
    }).length;
    labels.push(dayStart.toLocaleDateString("en-IN", { weekday: "short" }));
    completed.push(count);
  }
  return { labels, completed };
}

/** Host actions on incoming booking requests for their spots. */
export async function hostRespondToRequest(
  spotId: string, requestId: string, userId: string,
  response: "approved" | "rejected" | "completed"
): Promise<void> {
  const statusUpdate =
    response === "completed" ? { status: "completed", respondedAt: serverTimestamp() }
      : response === "approved" ? { status: "approved", respondedAt: serverTimestamp() }
      : { status: "rejected", respondedAt: serverTimestamp() };
  // Hosts see requests via the spotRequests index; rider records live under chargingRequests.
  try {
    await update(ref(database, `spotRequests/${spotId}/${requestId}`), sanitizeForDb(statusUpdate));
  } catch {
    // Index may not exist yet for legacy requests — no-op rather than crash
  }
  try {
    await update(ref(database, `chargingRequests/${userId}/${requestId}`), sanitizeForDb(statusUpdate));
  } catch {
    /* ignore */
  }
}

/** Get pending requests across all of a host's spots, newest first. */
export async function getHostPendingQueue(hostUid: string): Promise<HostBookingRequest[]> {
  const spots = await getHostSpots(hostUid);
  const out: HostBookingRequest[] = [];
  for (const spot of spots) {
    const snap = await get(ref(database, `spotRequests/${spot.id}`));
    if (!snap.exists()) continue;
    for (const [id, r] of Object.entries(snap.val()) as any[]) {
      const req = { id, ...r } as HostBookingRequest;
      req.spotName = spot.name;
      out.push(req);
    }
  }
  return out
    .filter(r => r.status === "pending" || r.status === "approved")
    .sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0));
}

// ── Availability calendar ───────────────────────────────────────────────────

export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  open: string; // HH:mm
  close: string; // HH:mm
  blocked: boolean; // host blocked this day
}

export async function getHostAvailability(hostUid: string, spotId: string): Promise<Record<string, AvailabilitySlot>> {
  const snap = await get(ref(database, `availability/${hostUid}/${spotId}`));
  return snap.exists() ? (snap.val() as Record<string, AvailabilitySlot>) : {};
}

/** Save per-day availability for one spot. Keys are YYYY-MM-DD. */
export async function setHostAvailability(
  hostUid: string, spotId: string, slots: Record<string, AvailabilitySlot>
): Promise<void> {
  const cleaned: Record<string, AvailabilitySlot> = {};
  for (const [date, slot] of Object.entries(slots)) {
    cleaned[date] = { date, open: slot.open, close: slot.close, blocked: Boolean(slot.blocked) };
  }
  await set(ref(database, `availability/${hostUid}/${spotId}`), sanitizeForDb(cleaned));
}

/** Simple weekly schedule on the spot itself (defaults for the calendar). */
export async function setSpotSchedule(
  spotId: string, schedule: Record<string, { open: string; close: string }>
): Promise<void> {
  await update(ref(database, `chargingSpots/${spotId}`), { availability: sanitizeForDb(schedule) });
}

// ── Payout requests ─────────────────────────────────────────────────────────

/** Create a payout request for the host (idempotent while one is pending). */
export async function requestPayout(hostUid: string, amount: number): Promise<string> {
  // Prevent double requests: only one pending/processing payout per host
  const existing = await get(ref(database, `payoutRequests/${hostUid}`));
  if (existing.exists()) {
    const active = Object.values(existing.val() as Record<string, PayoutRequest>)
      .some(p => p.status === "pending" || p.status === "processing");
    if (active) throw new Error("You already have an active payout request. Wait for it to be processed.");
  }
  const newRef = push(ref(database, `payoutRequests/${hostUid}`));
  await set(newRef, sanitizeForDb({
    amount: Math.round(amount * 100) / 100,
    status: "pending" as const,
    requestedAt: serverTimestamp(),
    createdAt: Date.now(),
  }));
  return newRef.key ?? "";
}

export async function getHostPayoutRequests(hostUid: string): Promise<PayoutRequest[]> {
  const snap = await get(ref(database, `payoutRequests/${hostUid}`));
  if (!snap.exists()) return [];
  return Object.entries(snap.val())
    .map(([id, p]: any) => ({ id, ...p } as PayoutRequest))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Mark all completed-session earnings as "paid out" via a payout checkpoint —
 * admin approves through AdminPayoutsPage; hosts just request here. */

// ── Live listeners ──────────────────────────────────────────────────────────

export function listenPendingQueue(hostUid: string, spots: HostSpot[], cb: (requests: HostBookingRequest[]) => void): () => void {
  let disposed = false;
  const listeners: Array<() => void> = [];
  const aggregate = async () => {
    if (disposed) return;
    const queue = await getHostPendingQueue(hostUid);
    if (!disposed) cb(queue);
  };
  spots.forEach(spot => {
    try {
      const un = onValue(ref(database, `spotRequests/${spot.id}`), () => { aggregate(); });
      listeners.push(() => un());
    } catch {
      /* ignore */
    }
  });
  aggregate();
  return () => {
    disposed = true;
    listeners.forEach(u => u());
  };
}
