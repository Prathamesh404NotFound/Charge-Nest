/**
 * Spot listing review service (Round 9).
 *
 * Quality layer on top of host identity verification: every new spot listing
 * enters a review queue at spotListingReviews/{spotId} with status
 * "pending_review". Admins approve or reject with an optional note; approval
 * sets the spot status to "active" (and approves the linked host registration
 * if needed), rejection sets it to "rejected" so it stops showing to riders.
 *
 * RTDB paths:
 *   spotListingReviews/{spotId}          — review case (admin-only read/write)
 *   chargingSpots/{spotId}.status        — active|rejected|pending_review|paused
 */
import {
  ref,
  get,
  set,
  update,
  serverTimestamp,
} from "firebase/database";
import { database } from "./firebase-services";
import { sanitizeForDb } from "./bookingService";

export type ListingReviewStatus =
  | "pending_review"
  | "approved"
  | "rejected";

export interface ListingReview {
  id: string;
  spotId: string;
  registrationId?: string;
  hostId: string;
  hostName?: string;
  hostEmail?: string;
  hostPhone?: string;
  isVerifiedHost?: boolean;
  name: string;
  address: string;
  city: string;
  state: string;
  outletType: string;
  pricePerHour: number;
  photos: string[];
  facilities?: string[];
  coordinates?: { lat: number; lng: number } | null;
  googleMapsLink?: string;
  submittedAt: number;
  status: ListingReviewStatus;
  reviewedBy?: string;
  reviewedAt?: number;
  adminNote?: string;
  rejectionReason?: string;
}

const REVIEWS_PATH = "spotListingReviews";

function reviewFromSnapshot(id: string, value: Record<string, unknown>): ListingReview {
  return {
    id,
    spotId: (value.spotId as string) ?? id,
    registrationId: value.registrationId as string | undefined,
    hostId: (value.hostId as string) ?? "",
    hostName: value.hostName as string | undefined,
    hostEmail: value.hostEmail as string | undefined,
    hostPhone: value.hostPhone as string | undefined,
    isVerifiedHost: Boolean(value.isVerifiedHost),
    name: (value.name as string) ?? "",
    address: (value.address as string) ?? "",
    city: (value.city as string) ?? "",
    state: (value.state as string) ?? "",
    outletType: (value.outletType as string) ?? "",
    pricePerHour: Number(value.pricePerHour) || 0,
    photos: (Array.isArray(value.photos) ? value.photos : []) as string[],
    facilities: Array.isArray(value.facilities) ? (value.facilities as string[]) : undefined,
    coordinates: (value.coordinates as { lat: number; lng: number } | null) ?? null,
    googleMapsLink: value.googleMapsLink as string | undefined,
    submittedAt: (value.submittedAt as number) ?? Date.now(),
    status: (value.status as ListingReviewStatus) ?? "pending_review",
    reviewedBy: value.reviewedBy as string | undefined,
    reviewedAt: value.reviewedAt as number | undefined,
    adminNote: value.adminNote as string | undefined,
    rejectionReason: value.rejectionReason as string | undefined,
  };
}

export async function createListingReview(spotId: string, spot: Record<string, unknown>): Promise<void> {
  const spotValue = spot as Record<string, unknown>;
  const existing = await getListingReview(spotId);
  if (existing) return; // review case already exists for this spot
  await set(
    ref(database, `${REVIEWS_PATH}/${spotId}`),
    sanitizeForDb({
      spotId,
      registrationId: spotValue.registrationId ?? "",
      hostId: spotValue.hostId ?? "",
      hostName: spotValue.hostName ?? "",
      hostEmail: spotValue.hostEmail ?? "",
      hostPhone: spotValue.hostPhone ?? "",
      isVerifiedHost: Boolean(spotValue.isVerified),
      name: spotValue.name ?? `${String(spotValue.hostName ?? "Host")}'s Charging Spot`,
      address: spotValue.address ?? "",
      city: spotValue.city ?? "",
      state: spotValue.state ?? "",
      outletType: spotValue.outletType ?? "",
      pricePerHour: Number(spotValue.pricePerHour) || 0,
      photos: Array.isArray(spotValue.photos) ? spotValue.photos : [],
      facilities: Array.isArray(spotValue.facilities) ? spotValue.facilities : undefined,
      coordinates: spotValue.coordinates ?? null,
      googleMapsLink: spotValue.googleMapsLink ?? "",
      submittedAt: Date.now(),
      status: "pending_review",
    })
  );
  // Park the spot as pending_review so riders do not see unreviewed listings.
  // (Spots with status "active" are still readable; marking pending keeps the
  //  listing out of rider-facing views that filter to active.)
  await update(ref(database, `chargingSpots/${spotId}`), {
    status: "pending_review",
    updatedAt: serverTimestamp(),
  });
}

export async function getListingReview(spotId: string): Promise<ListingReview | null> {
  const snapshot = await get(ref(database, `${REVIEWS_PATH}/${spotId}`));
  if (!snapshot.exists()) return null;
  return reviewFromSnapshot(spotId, snapshot.val() as Record<string, unknown>);
}

export async function getAllListingReviews(): Promise<ListingReview[]> {
  const snapshot = await get(ref(database, REVIEWS_PATH));
  if (!snapshot.exists()) return [];
  const val = snapshot.val() as Record<string, Record<string, unknown>>;
  return Object.entries(val)
    .map(([id, v]) => reviewFromSnapshot(id, v))
    .sort((a, b) => b.submittedAt - a.submittedAt);
}

export interface ListingDecisionResult {
  ok: boolean;
  message: string;
}

export async function decideListingReview(
  spotId: string,
  decision: "approved" | "rejected",
  adminNote: string,
  adminUid: string
): Promise<ListingDecisionResult> {
  const review = await getListingReview(spotId);
  if (!review) {
    return { ok: false, message: "Review case not found for this spot." };
  }

  const spotRef = ref(database, `chargingSpots/${spotId}`);
  const now = Date.now();
  const updates = sanitizeForDb({
    status: decision === "approved" ? "active" : "rejected",
    updatedAt: serverTimestamp(),
    ...(decision === "rejected" ? { rejectionReason: adminNote } : {}),
  });
  await update(spotRef, updates);

  await update(ref(database, `${REVIEWS_PATH}/${spotId}`), {
    status: decision === "approved" ? "approved" : "rejected",
    reviewedBy: adminUid,
    reviewedAt: now,
    adminNote: adminNote || undefined,
    ...(decision === "rejected" ? { rejectionReason: adminNote || undefined } : {}),
  });

  // Approve the linked host registration (and its rider-facing spot) if the
  // listing owner registration is still pending.
  if (decision === "approved" && review.registrationId) {
    try {
      const { updateRegistrationStatus } = await import("./hostRegistration");
      await updateRegistrationStatus(review.registrationId, review.hostId, "approved");
    } catch (error) {
      console.warn("Linked registration already approved or not found:", error);
    }
  }

  return {
    ok: true,
    message:
      decision === "approved"
        ? `Spot "${review.name}" is now live for riders.`
        : `Spot "${review.name}" has been rejected and hidden from riders.`,
  };
}

export async function removeListingReview(spotId: string): Promise<void> {
  await update(ref(database, `${REVIEWS_PATH}/${spotId}`), {
    status: "removed",
    removedAt: Date.now(),
  });
}
