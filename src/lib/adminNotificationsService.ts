/* VoltSetu admin notification inbox (Round 21).
 *
 * Aggregates pending administrative work into a single unread count,
 * so the sidebar shows one bell badge instead of checking three queues.
 *
 * Sources:
 *   - contentFlags/{id}          with status "open"
 *   - listingReviews/{id}        with status "pending"
 *   - hostVerifications/{id}     with status "pending_review"
 *
 * All reads are admin-scoped (adminMiddleware guards the routes), and failures
 * degrade gracefully to 0 so the badge never blocks the admin UI.
 */
import { get, ref } from "firebase/database";
import { database } from "./firebase-services";

export interface AdminNotificationSummary {
  openFlags: number;
  pendingListingReviews: number;
  pendingVerifications: number;
  total: number;
}

async function countOpen(path: string, statusField: string, target: string): Promise<number> {
  try {
    const snap = await get(ref(database, path));
    if (!snap.exists()) return 0;
    const all = snap.val() as Record<string, Record<string, unknown>>;
    return Object.values(all).filter((item) => item[statusField] === target).length;
  } catch {
    return 0;
  }
}

export async function getAdminNotificationSummary(): Promise<AdminNotificationSummary> {
  const [openFlags, pendingListingReviews, pendingVerifications] = await Promise.all([
    countOpen("contentFlags", "status", "open"),
    countOpen("listingReviews", "status", "pending"),
    countOpen("hostVerifications", "status", "pending_review"),
  ]);
  const total = openFlags + pendingListingReviews + pendingVerifications;
  return { openFlags, pendingListingReviews, pendingVerifications, total };
}

/**
 * Round 21: notification item feed for the inbox page.
 * Each pending item becomes a card with a deep link to the right admin queue.
 */
export interface AdminNotificationItem {
  id: string;
  kind: "flag" | "listing_review" | "verification";
  title: string;
  detail: string;
  createdAt: number;
  severity: "high" | "medium" | "low";
}

function ts(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export async function getAdminNotifications(): Promise<AdminNotificationItem[]> {
  const items: AdminNotificationItem[] = [];
  try {
    const [flagsSnap, reviewsSnap, verSnap] = await Promise.all([
      get(ref(database, "contentFlags")),
      get(ref(database, "listingReviews")),
      get(ref(database, "hostVerifications")),
    ]);
    if (flagsSnap.exists()) {
      for (const [id, f] of Object.entries(flagsSnap.val() as Record<string, Record<string, unknown>>)) {
        if (f.status !== "open") continue;
        items.push({
          id,
          kind: "flag",
          title: "Content flag",
          detail: `${f.reason ?? "No reason given"} — reported by ${f.reporterName ?? "a user"}`,
          createdAt: ts(f.createdAt),
          severity: f.reasonType === "abuse" ? "high" : "medium",
        });
      }
    }
    if (reviewsSnap.exists()) {
      for (const [id, r] of Object.entries(reviewsSnap.val() as Record<string, Record<string, unknown>>)) {
        if (r.status !== "pending") continue;
        items.push({
          id,
          kind: "listing_review",
          title: "New spot listing",
          detail: `${r.spotName ?? "Untitled spot"} — waiting for quality review`,
          createdAt: ts(r.createdAt),
          severity: "medium",
        });
      }
    }
    if (verSnap.exists()) {
      for (const [id, v] of Object.entries(verSnap.val() as Record<string, Record<string, unknown>>)) {
        if (v.status !== "pending_review") continue;
        items.push({
          id,
          kind: "verification",
          title: "Host verification",
          detail: `${v.hostName ?? v.hostEmail ?? "A host"} submitted identity documents`,
          createdAt: ts(v.createdAt),
          severity: "high",
        });
      }
    }
  } catch {
    /* degrade: empty inbox */
  }
  return items.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 } as const;
    if (order[a.severity] !== order[b.severity]) return order[a.severity] - order[b.severity];
    return b.createdAt - a.createdAt;
  });
}
