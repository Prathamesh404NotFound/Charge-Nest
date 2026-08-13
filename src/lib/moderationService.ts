import { database } from "./firebase-services";
import { ref, get, set, update, push, serverTimestamp } from "firebase/database";
import { sanitizeForDb } from "./bookingService";

export type FlagTargetType = "review" | "user";

export interface ContentFlag {
  id: string;
  targetType: FlagTargetType;
  /** review id (when targetType === "review") or user id (when targetType === "user") */
  targetId: string;
  /** When a review is flagged: the host/spot owner the review is about. */
  targetOwnerId?: string;
  reason: string;
  reporterId: string;
  reporterName: string;
  status: "open" | "dismissed" | "resolved";
  resolution?: "muted_user" | "removed_review" | "dismissed" | string;
  createdAt: number;
  resolvedAt?: number;
}

const REASON_OPTIONS = [
  "Abusive or harassing language",
  "Spam or misleading content",
  "Inappropriate content",
  "Personal information shared",
  "Abusive behavior by user",
  "Other",
] as const;

export { REASON_OPTIONS };

/** Submit a flag on a review or user. Deduplicates per reporter + target. */
export async function submitFlag(params: {
  targetType: FlagTargetType;
  targetId: string;
  targetOwnerId?: string;
  reason: string;
  reporterId: string;
  reporterName: string;
}): Promise<{ ok: boolean; message: string }> {
  const { targetType, targetId, targetOwnerId, reason, reporterId, reporterName } = params;
  if (!reporterId) {
    return { ok: false, message: "Please sign in to report content." };
  }
  if (!targetId || !reason.trim()) {
    return { ok: false, message: "Missing report details." };
  }
  if (!targetType || (targetType !== "review" && targetType !== "user")) {
    return { ok: false, message: "Invalid report target." };
  }
  const sanitizedReason = String(reason).trim().slice(0, 300);
  if (sanitizedReason.length < 3) {
    return { ok: false, message: "Please describe the issue in a bit more detail." };
  }
  try {
    // Dedupe: same reporter reporting the same target again.
    const existing = await get(ref(database, "contentFlags"));
    if (existing.exists()) {
      const flags = existing.val() as Record<string, ContentFlag>;
      const duplicate = Object.values(flags).some(
        (f) =>
          f.reporterId === reporterId &&
          f.targetId === targetId &&
          f.targetType === targetType &&
          f.status === "open"
      );
      if (duplicate) {
        return { ok: false, message: "You have already reported this." };
      }
    }

    const newRef = push(ref(database, "contentFlags"));
    await set(newRef, sanitizeForDb({
      targetType,
      targetId,
      targetOwnerId: targetOwnerId ?? "",
      reason: sanitizedReason,
      reporterId,
      reporterName: String(reporterName || "Anonymous").slice(0, 60),
      status: "open",
      createdAt: serverTimestamp(),
    }));
    return { ok: true, message: "Report received — our moderation team will review it." };
  } catch (error) {
    console.error("Error submitting flag:", error);
    return { ok: false, message: "Could not submit report. Please try again." };
  }
}

/** List flags for admin, optionally filtered by status. */
export async function listFlags(statusFilter?: ContentFlag["status"]): Promise<ContentFlag[]> {
  const snap = await get(ref(database, "contentFlags"));
  if (!snap.exists()) return [];
  const flags = Object.entries(snap.val() as Record<string, ContentFlag>).map(([id, f]) => ({
    id,
    ...f,
  }));
  const filtered = statusFilter ? flags.filter((f) => f.status === statusFilter) : flags;
  filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return filtered;
}

/** Resolve a flag: dismiss it, mute the reported user, or remove the reported review. */
export async function resolveFlag(params: {
  flagId: string;
  resolution: ContentFlag["resolution"];
  /** Required when removing a review: spot id + review id. */
  reviewSpotId?: string;
  reviewId?: string;
  /** Required when muting a user. */
  userId?: string;
  adminNote?: string;
}): Promise<{ ok: boolean; message: string }> {
  const { flagId, resolution, reviewSpotId, reviewId, userId, adminNote } = params;
  if (!flagId || !resolution) {
    return { ok: false, message: "Invalid resolution." };
  }
  try {
    const snap = await get(ref(database, `contentFlags/${flagId}`));
    if (!snap.exists()) {
      return { ok: false, message: "This report no longer exists." };
    }
    const flag = snap.val() as ContentFlag;

    const updates: Record<string, unknown> = {
      [`contentFlags/${flagId}/status`]: "resolved",
      [`contentFlags/${flagId}/resolution`]: resolution,
      [`contentFlags/${flagId}/adminNote`]: adminNote ? String(adminNote).slice(0, 300) : "",
      [`contentFlags/${flagId}/resolvedAt`]: serverTimestamp(),
    };

    if (resolution === "muted_user") {
      const mutedId = flag.targetType === "user" ? flag.targetId : userId;
      if (!mutedId) {
        return { ok: false, message: "No user identified to mute." };
      }
      updates[`users/${mutedId}/muted`] = true;
      updates[`users/${mutedId}/mutedAt`] = serverTimestamp();
      updates[`users/${mutedId}/mutedReason`] = adminNote ?? `Moderation action: ${flag.reason}`;
    }

    if (resolution === "removed_review") {
      if (!reviewSpotId || !reviewId) {
        return { ok: false, message: "Review location is required to remove it." };
      }
      updates[`chargingSpots/${reviewSpotId}/reviews/${reviewId}/hidden`] = true;
    }

    await update(ref(database), sanitizeForDb(updates));
    return {
      ok: true,
      message:
        resolution === "muted_user"
          ? "User has been muted."
          : resolution === "removed_review"
            ? "Review has been removed."
            : "Report dismissed.",
    };
  } catch (error) {
    console.error("Error resolving flag:", error);
    return { ok: false, message: "Could not apply moderation action. Please try again." };
  }
}

/** Re-check whether the current user is muted before allowing bookings/reviews. */
export async function isUserMuted(userId: string): Promise<boolean> {
  try {
    const snap = await get(ref(database, `users/${userId}/muted`));
    return snap.exists() && snap.val() === true;
  } catch {
    return false;
  }
}
