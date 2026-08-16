import { database, auth } from "./firebase-services";
import { ref, push, set, get, update, serverTimestamp } from "firebase/database";

/** Strip undefined/null/NaN values from an object so Firebase set()/update()
 * never receives "value argument contains undefined" or silently wipes data.
 * Empty strings are preserved (intentional blank field, not missing data). */
export function sanitizeForDb<T extends Record<string, unknown>>(payload: T): T {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "number" && !Number.isFinite(value)) continue;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      // Recursively clean nested objects (e.g. coordinates) but skip raw
      // firebase values like serverTimestamp() which are special instances.
      if (typeof (value as any).toJSON !== "function") {
        const nested = sanitizeForDb(value as Record<string, unknown>);
        if (Object.keys(nested).length > 0) cleaned[key] = nested;
        continue;
      }
    }
    cleaned[key] = value;
  }
  return cleaned as T;
}

export interface BookingRequest {
  id: string;
  spotId: string;
  spotName: string;
  hostName: string;
  hostPhone: string;
  hostId?: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  requestedAt: any;
  duration: number; // minutes
  status: "pending" | "approved" | "rejected" | "cancelled" | "completed";
  message?: string;
  pricePerHour: number;
  estimatedCost: number;
  city: string;
  outletType: string;
  // Deposit (Cashfree) fields — depositStatus "none" means pay-at-spot retained.
  depositAmount?: number;
  depositCurrency?: string;
  depositStatus?: "none" | "pending" | "paid" | "failed";
  cfOrderId?: string;
  cfPaymentSessionId?: string;
  emergency?: boolean;
}

/** Emergency one-tap booking for Roadside Rescue: 45-minute default slot,
 * rescuer message, deposit deferred (rider pays at spot on arrival). */
export async function submitEmergencyBooking(spot: {
  id: string;
  name?: string;
  hostName?: string;
  hostPhone?: string;
  city?: string;
  outletType?: string;
  pricePerHour?: number;
}): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to request roadside rescue.");
  const duration = 45; // 45-minute rescue slot — enough for a two-wheeler top-up
  return submitBookingRequest({
    spotId: spot.id,
    spotName: spot.name ?? "Charging spot",
    hostName: spot.hostName ?? "",
    hostPhone: spot.hostPhone ?? "",
    userPhone: "",
    duration,
    message: "ROADSIDE RESCUE — stranded rider. Heading to your spot now. Please keep the outlet ready.",
    pricePerHour: Number(spot.pricePerHour) || 0,
    estimatedCost: Math.round(((Number(spot.pricePerHour) || 0) * duration) / 60 * 100) / 100,
    city: spot.city ?? "",
    outletType: spot.outletType ?? "",
    emergency: true,
    depositStatus: "none",
  });
}

/** Submit a new booking request */
export async function submitBookingRequest(
  data: Omit<BookingRequest, "id" | "userId" | "userName" | "userEmail" | "requestedAt" | "status">
): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error("Must be logged in to book");

  const duration = Number(data.duration);
  if (!Number.isFinite(duration) || duration < 15 || duration > 24 * 60) {
    throw new Error("Choose a charging duration between 15 minutes and 24 hours.");
  }

  const spotSnapshot = await get(ref(database, `chargingSpots/${data.spotId}`));
  if (!spotSnapshot.exists()) throw new Error("This charging spot is no longer available.");
  const spot = spotSnapshot.val();
  if (spot.status && spot.status !== "active") throw new Error("This charging spot is not currently available.");

  const pricePerHour = Math.max(0, Number(spot.pricePerHour) || 0);
  const requestsRef = ref(database, `chargingRequests/${user.uid}`);
  const newRef = push(requestsRef);
  const bookingPayload = sanitizeForDb({
    spotId: data.spotId,
    spotName: spot.name || data.spotName,
    hostName: spot.hostName || data.hostName,
    hostPhone: spot.hostPhone || data.hostPhone,
    hostId: spot.hostId || data.hostId || undefined,
    userId: user.uid,
    userName: user.displayName || "",
    userPhone: data.userPhone || "",
    userEmail: user.email || "",
    requestedAt: serverTimestamp(),
    duration,
    status: "pending",
    message: typeof data.message === "string" ? data.message.trim().slice(0, 500) : "",
    pricePerHour,
    estimatedCost: Math.round((pricePerHour * duration / 60) * 100) / 100,
    city: spot.city || data.city,
    outletType: spot.outletType || data.outletType,
    emergency: Boolean(data.emergency) || false,
    depositAmount: Number.isFinite(Number(data.depositAmount)) ? Number(data.depositAmount) : undefined,
    depositCurrency: data.depositCurrency || undefined,
    depositStatus: data.depositStatus || (Number.isFinite(Number(data.depositAmount)) && Number(data.depositAmount) > 0 ? "pending" : "none"),
    cfOrderId: data.cfOrderId || undefined,
    cfPaymentSessionId: data.cfPaymentSessionId || undefined,
  });
  await set(newRef, bookingPayload);
  await set(ref(database, `spotRequests/${data.spotId}/${newRef.key}`), bookingPayload);
  return newRef.key!;
}

/** Get all bookings for the current user, sorted newest first */
export async function getUserBookings(uid: string): Promise<BookingRequest[]> {
  const requestsRef = ref(database, `chargingRequests/${uid}`);
  const snap = await get(requestsRef);
  if (!snap.exists()) return [];

  const raw = snap.val();
  const bookings: BookingRequest[] = Object.keys(raw).map((key) => ({
    id: key,
    ...raw[key],
  }));

  // Sort newest first (serverTimestamp stored as ms or object — handle both)
  return bookings.sort((a, b) => {
    const ta = typeof a.requestedAt === "number" ? a.requestedAt : 0;
    const tb = typeof b.requestedAt === "number" ? b.requestedAt : 0;
    return tb - ta;
  });
}

/** Cancel a pending booking */
export async function cancelBooking(uid: string, bookingId: string): Promise<void> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error("You can only cancel your own bookings.");
  }
  const bookRef = ref(database, `chargingRequests/${uid}/${bookingId}`);
  const snapshot = await get(bookRef);
  if (!snapshot.exists()) throw new Error("Booking not found.");
  if (snapshot.val().status !== "pending") throw new Error("Only pending bookings can be cancelled.");
  const updates = { status: "cancelled", updatedAt: serverTimestamp() };
  await update(bookRef, updates);
  await update(ref(database, `spotRequests/${snapshot.val().spotId}/${bookingId}`), updates);
}

/** Get all requests for a given spot (host view) */
export async function getSpotRequests(spotId: string): Promise<BookingRequest[]> {
  const spotSnapshot = await get(ref(database, `spotRequests/${spotId}`));
  if (!spotSnapshot.exists()) return [];
  const requests = spotSnapshot.val();
  return Object.keys(requests).map((id) => ({ id, ...requests[id] }));
}
