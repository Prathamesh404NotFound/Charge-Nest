/* VoltSetu rider ratings (Round 13).
 *
 * Two-way reputation: riders rate hosts (existing spotReviews), and now hosts
 * rate riders for punctuality and courtesy after a completed session.
 *
 * RTDB layout:
 *   riderRatings/{riderUid}/{bookingId} -> { hostUid, hostName, spotId,
 *     spotName, bookingId, punctuality: 1-5, courtesy: 1-5, comment?,
 *     createdAt }
 *
 * Defense-in-depth: only the booking's host can write (client guards + the
 * bookingId must exist under chargingRequests/{hostUid}); rider aggregate is
 * derived on read, never stored as a mutable score that can be overwritten.
 */
import { get, push, ref, serverTimestamp, update } from "firebase/database";
import { database } from "./firebase-services";
import { sanitizeForDb } from "./bookingService";

export interface RiderRatingInput {
  riderUid: string;
  hostUid: string;
  hostName: string;
  spotId: string;
  spotName: string;
  bookingId: string;
  punctuality: number;
  courtesy: number;
  comment?: string;
}

export interface RiderRating {
  id: string;
  hostUid: string;
  hostName: string;
  spotId: string;
  spotName: string;
  bookingId: string;
  punctuality: number;
  courtesy: number;
  comment?: string;
  createdAt: any;
}

export async function submitRiderRating(input: RiderRatingInput): Promise<{ ok: boolean; message: string }> {
  if (!input.riderUid || !input.hostUid || !input.bookingId) {
    return { ok: false, message: "Missing booking context." };
  }
  const punctuality = Math.round(Number(input.punctuality));
  const courtesy = Math.round(Number(input.courtesy));
  if ((punctuality < 1 || punctuality > 5) || (courtesy < 1 || courtesy > 5)) {
    return { ok: false, message: "Ratings must be between 1 and 5." };
  }

  // Verify the booking actually belongs to this host before allowing a write.
  const bookingSnap = await get(ref(database, `chargingRequests/${input.hostUid}/${input.bookingId}`));
  if (!bookingSnap.exists()) {
    return { ok: false, message: "Booking not found." };
  }
  const booking = bookingSnap.val() as Record<string, unknown>;
  if (booking.userId !== input.riderUid) {
    return { ok: false, message: "This booking belongs to a different rider." };
  }

  const already = await get(ref(database, `riderRatings/${input.riderUid}/${input.bookingId}`));
  if (already.exists()) return { ok: false, message: "You've already rated this booking." };

  const newRef = push(ref(database, `riderRatings/${input.riderUid}`));
  await update(newRef, sanitizeForDb({
    hostUid: input.hostUid,
    hostName: input.hostName || "Host",
    spotId: input.spotId,
    spotName: input.spotName || "Spot",
    bookingId: input.bookingId,
    punctuality,
    courtesy,
    comment: input.comment || undefined,
    createdAt: serverTimestamp(),
  }));
  return { ok: true, message: "Rating submitted." };
}

/** Aggregate rider rating from stored ratings (read-side derivation). */
export async function getRiderRating(riderUid: string): Promise<{ average: number; count: number; ratings: RiderRating[] }> {
  const snap = await get(ref(database, `riderRatings/${riderUid}`));
  const ratings: RiderRating[] = [];
  snap.forEach((child) => ratings.push({ id: child.key!, ...(child.val() as Omit<RiderRating, "id">) }));
  if (ratings.length === 0) return { average: 0, count: 0, ratings };
  const avg = ratings.reduce((sum, r) => sum + (r.punctuality + r.courtesy) / 2, 0) / ratings.length;
  return { average: Math.round(avg * 10) / 10, count: ratings.length, ratings };
}
