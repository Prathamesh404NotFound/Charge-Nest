/* VoltSetu host referral rewards (Round 13).
 *
 * RTDB layout:
 *   referralCodes/{code}       -> { hostUid, hostName, createdAt }   (index)
 *   users/{uid}                -> referralCode, referralCredits, referredCount
 *   referralClaims/{uid}       -> { code, claimedAt }               (one claim per host; guard)
 *
 * Flow: a host generates a stable code from their UID. Another host submits
 * that code when their registration is APPROVED; the referrer's
 * referralCredits increases by CREDIT_PER_APPROVAL and referredCount tracks
 * conversions. Duplicate/self claims are rejected client-side; the service
 * refuses obvious abuse (empty code, own code, already claimed).
 */
import { get, push, ref, serverTimestamp, update } from "firebase/database";
import { database } from "./firebase-services";
import { sanitizeForDb } from "./bookingService";

export const CREDIT_PER_APPROVAL = 50; // ₹
const CODE_PREFIX = "VS";
const MAX_CLAIM_PER_HOST = 1;

export interface ReferralMeta {
  hostUid: string;
  hostName: string;
  createdAt: any;
}

function slugifyCode(uid: string): string {
  const base = uid.replace(/[^a-z0-9]/gi, "").slice(0, 8);
  const check = (uid.length + base.length).toString(36).slice(0, 2);
  return `${CODE_PREFIX}-${base.toUpperCase()}-${check.toUpperCase()}`;
}

/** Deterministic referral code for a host. Generated on demand; no write. */
export function referralCodeFor(uid: string): string {
  if (!uid) return "";
  return slugifyCode(uid);
}

/** Ensure the referral index entry exists for this host (idempotent). */
export async function ensureReferralCode(
  uid: string,
  hostName: string
): Promise<string> {
  if (!uid) return "";
  const code = referralCodeFor(uid);
  try {
    const snap = await get(ref(database, `referralCodes/${encodeURIComponent(code)}`));
    if (!snap.exists()) {
      await update(ref(database, `referralCodes/${encodeURIComponent(code)}`), {
        hostUid: uid,
        hostName: hostName || "VoltSetu Host",
        createdAt: serverTimestamp(),
      });
    }
  } catch {
    /* index write is best-effort; code remains usable for display */
  }
  return code;
}

/** A newly approved host claims a referral code. Returns granted credits. */
export async function claimReferral(
  newHostUid: string,
  rawCode: string
): Promise<{ granted: number; message: string }> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!newHostUid) return { granted: 0, message: "Sign in first." };
  if (!code || !code.startsWith(CODE_PREFIX + "-")) return { granted: 0, message: "Invalid referral code." };
  if (code === referralCodeFor(newHostUid)) return { granted: 0, message: "You can't refer yourself." };

  const metaSnap = await get(ref(database, `referralCodes/${encodeURIComponent(code)}`));
  if (!metaSnap.exists()) return { granted: 0, message: "Referral code not found." };
  const meta = metaSnap.val() as ReferralMeta;
  if (meta.hostUid === newHostUid) return { granted: 0, message: "You can't refer yourself." };

  const claimSnap = await get(ref(database, `referralClaims/${newHostUid}`));
  if (claimSnap.exists() && Object.keys(claimSnap.val() ?? {}).length >= MAX_CLAIM_PER_HOST) {
    return { granted: 0, message: "You've already used a referral code." };
  }

  await update(ref(database, `referralClaims/${newHostUid}`), {
    code,
    claimedAt: serverTimestamp(),
  });

  await update(ref(database, `users/${meta.hostUid}`), {
    referralCredits: (Number((await get(ref(database, `users/${meta.hostUid}/referralCredits`))).val() ?? 0)) + CREDIT_PER_APPROVAL,
    referredCount: (Number((await get(ref(database, `users/${meta.hostUid}/referredCount`))).val() ?? 0)) + 1,
  });

  return { granted: CREDIT_PER_APPROVAL, message: `₹${CREDIT_PER_APPROVAL} credit awarded to the referrer.` };
}

/** Read a host's referral stats for the dashboard. */
export interface ReferralStats {
  code: string;
  credits: number;
  referredCount: number;
}

export async function getReferralStats(uid: string): Promise<ReferralStats | null> {
  if (!uid) return null;
  try {
    const [creditsSnap, countSnap] = await Promise.all([
      get(ref(database, `users/${uid}/referralCredits`)),
      get(ref(database, `users/${uid}/referredCount`)),
    ]);
    return {
      code: referralCodeFor(uid),
      credits: Number(creditsSnap.val() ?? 0),
      referredCount: Number(countSnap.val() ?? 0),
    };
  } catch {
    return null;
  }
}
