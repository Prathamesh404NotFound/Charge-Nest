/* VoltSetu spot waitlist (Round 13).
 *
 * RTDB layout: spotWaitlist/{spotId}/{waitId} -> { userId, userName, userPhone,
 * joinedAt, status:"waiting"|"served" }  (FIFO via push keys, cap 10)
 *
 * Riders join when a spot is busy; the host's "Outlet available now" toggle
 * triggers spotFreeBroadcast() which flips everyone's status to "served".
 * Reads subscribe via onValue for live position updates.
 */
import { get, off, onValue, push, ref, remove, serverTimestamp, update } from "firebase/database";
import { database } from "./firebase-services";
import { sanitizeForDb } from "./bookingService";

const MAX_WAITLIST = 10;

export interface WaitlistEntry {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  joinedAt: any;
  status: "waiting" | "served";
}

export async function joinWaitlist(
  spotId: string,
  userId: string,
  userName: string,
  userPhone?: string
): Promise<{ ok: boolean; position: number | null; message: string; waitId?: string | null }> {
  if (!spotId || !userId) return { ok: false, position: null, message: "Sign in to join the waitlist." };

  const listRef = ref(database, `spotWaitlist/${spotId}`);
  const snap = await get(listRef);
  const entries: { id: string; val: WaitlistEntry }[] = [];
  snap.forEach((child) => {
    entries.push({ id: child.key!, val: child.val() as WaitlistEntry });
  });

  const already = entries.find((e) => e.val.userId === userId && e.val.status === "waiting");
  if (already) return { ok: true, position: entries.findIndex((e) => e.id === already.id) + 1, message: "You're already on the waitlist.", waitId: already.id };

  const waiting = entries.filter((e) => e.val.status === "waiting");
  if (waiting.length >= MAX_WAITLIST) return { ok: false, position: null, message: "Waitlist is full. Check back soon." };

  const newRef = push(listRef);
  await update(newRef, sanitizeForDb({
    userId,
    userName: userName || "Rider",
    userPhone: userPhone || undefined,
    joinedAt: serverTimestamp(),
    status: "waiting",
  }));
  return { ok: true, position: waiting.length + 1, message: `You're #${waiting.length + 1} on the waitlist.`, waitId: newRef.key };
}

/** Delete the caller's waiting entry; no-op if not found. */
export async function leaveMyWaitlist(spotId: string, userId: string): Promise<void> {
  if (!spotId || !userId) return;
  const listRef = ref(database, `spotWaitlist/${spotId}`);
  const snap = await get(listRef);
  let targetKey: string | null = null;
  snap.forEach((child) => {
    const val = child.val() as WaitlistEntry;
    if (val.userId === userId && val.status === "waiting") targetKey = child.key;
  });
  if (targetKey) {
    await remove(ref(database, `spotWaitlist/${spotId}/${targetKey}`));
  }
}

/** Flip every waiting entry to "served" — call when the host toggles available. */
export async function spotFreeBroadcast(spotId: string): Promise<number> {
  const listRef = ref(database, `spotWaitlist/${spotId}`);
  const snap = await get(listRef);
  let notified = 0;
  const updates: Record<string, { status: "served" }> = {};
  snap.forEach((child) => {
    const val = child.val() as WaitlistEntry;
    if (val.status === "waiting") {
      updates[child.key!] = { status: "served" };
      notified += 1;
    }
  });
  if (Object.keys(updates).length > 0) {
    await update(listRef, updates);
  }
  return notified;
}

/** Live position for the current user (index in waiting entries, 1-based). */
export async function myWaitlistPosition(spotId: string, userId: string): Promise<number | null> {
  const snap = await get(ref(database, `spotWaitlist/${spotId}`));
  let pos = 0;
  let found = false;
  snap.forEach((child) => {
    const val = child.val() as WaitlistEntry;
    if (val.status === "waiting") {
      pos += 1;
      if (!found && val.userId === userId) found = true;
    }
  });
  return found ? pos : null;
}

export function subscribeWaitingCount(spotId: string, cb: (count: number) => void): () => void {
  const listRef = ref(database, `spotWaitlist/${spotId}`);
  const handler = (snap) => {
    let count = 0;
    snap.forEach((child) => {
      if ((child.val() as WaitlistEntry).status === "waiting") count += 1;
    });
    cb(count);
  };
  onValue(listRef, handler);
  return () => off(listRef, "value", handler);
}
