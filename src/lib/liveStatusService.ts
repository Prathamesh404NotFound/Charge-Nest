/* VoltSetu live spot status (Round 13).
 *
 * RTDB layout: spotLiveStatus/{spotId} -> { available: boolean, updatedAt,
 * hostUid }
 *
 * - Hosts toggle their outlet status from the dashboard (setLiveStatus).
 * - Riders subscribe via subscribeLiveStatus for the green/red "Available
 *   now" badge and the waitlist offer.
 * - The spot model's own isAvailable flag is NOT touched — live status is a
 *   real-time overlay, so stale toggles never mutate listing data.
 */
import { get, off, onValue, ref, serverTimestamp, update } from "firebase/database";
import { database } from "./firebase-services";
import { sanitizeForDb } from "./bookingService";

export interface LiveStatus {
  available: boolean;
  updatedAt: any;
  hostUid?: string;
}

export async function setLiveStatus(spotId: string, hostUid: string, available: boolean): Promise<void> {
  if (!spotId || !hostUid) return;
  await update(ref(database, `spotLiveStatus/${spotId}`), sanitizeForDb({
    available,
    updatedAt: serverTimestamp(),
    hostUid,
  }));
}

export async function getLiveStatus(spotId: string): Promise<LiveStatus> {
  const snap = await get(ref(database, `spotLiveStatus/${spotId}`));
  return (snap.val() as LiveStatus) ?? { available: true, updatedAt: null };
}

/** Live subscription; fires immediately with current state then on change. */
export function subscribeLiveStatus(spotId: string, cb: (status: LiveStatus) => void): () => void {
  const statusRef = ref(database, `spotLiveStatus/${spotId}`);
  const handler = (snap) => cb((snap.val() as LiveStatus) ?? { available: true, updatedAt: null });
  onValue(statusRef, handler);
  return () => off(statusRef, "value", handler);
}
