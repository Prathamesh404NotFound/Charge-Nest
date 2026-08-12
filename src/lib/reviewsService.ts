/**
 * Reviews service for VoltSetu charging spots.
 *
 * Design (defense-in-depth):
 * - Reads pull from the existing `chargingSpots/{spotId}/reviews` array
 *   (the spot model already defines Review[]), so no new surface is needed.
 * - Writes go to a scoped index `spotReviews/{spotId}/{reviewId}`. Firebase
 *   rules (database.rules.json) must allow writes only to authenticated users
 *   whose own UID matches review.userId, and reads by anyone with a session.
 *   No client can overwrite the spot's own reviews array, preventing spoofed
 *   ratings. Admin-approved aggregation happens server-side on demand.
 * - Anonymous visitors can never submit a review.
 */
import { get, push, ref, serverTimestamp, update } from "firebase/database";
import { database } from "./firebase-services";
import { sanitizeForDb } from "./bookingService";
import type { Review } from "@/types";

export interface ReviewInput {
  spotId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
}

function normalizeRating(rating: number): number {
  const n = Math.round(Number(rating));
  if (!Number.isFinite(n) || n < 1 || n > 5) return 0;
  return n;
}

export async function getSpotReviews(spotId: string): Promise<Review[]> {
  if (!spotId) return [];
  try {
    const reviewsRef = ref(database, `spotReviews/${spotId}`);
    const snapshot = await get(reviewsRef);
    if (!snapshot.exists()) return [];
    return Object.keys(snapshot.val())
      .map((key) => ({ id: key, ...snapshot.val()[key] }))
      .sort((a: Review, b: Review) => Number(b.createdAt ?? 0) - Number(a.createdAt ?? 0));
  } catch (error) {
    console.error("Error fetching spot reviews:", error);
    return [];
  }
}

export async function submitSpotReview(input: ReviewInput): Promise<Review> {
  if (!input.spotId || !input.userId) throw new Error("Anonymous reviews are not allowed.");
  const rating = normalizeRating(input.rating);
  if (rating === 0) throw new Error("Rating must be between 1 and 5 stars.");
  const comment = (input.comment ?? "").trim();
  if (comment.length === 0 || comment.length > 500) {
    throw new Error("Review text must be between 1 and 500 characters.");
  }
  if (!input.userName || input.userName.trim().length === 0) {
    throw new Error("Reviewer name is required.");
  }

  const review: Omit<Review, "id"> = {
    userId: input.userId,
    userName: input.userName.trim().slice(0, 64),
    userPhoto: input.userPhoto || undefined,
    rating,
    comment,
    photos: undefined,
    createdAt: serverTimestamp(),
    helpful: 0,
    response: undefined,
  } as Review;
  const reviewsRef = ref(database, `spotReviews/${input.spotId}`);
  const newRef = push(reviewsRef);
  // sanitizeForDb strips undefined values (userPhoto/response/photos) that
  // would crash Firebase update() with "value argument contains undefined".
  await update(newRef, sanitizeForDb(review as Record<string, unknown>) as Review);
  return { id: newRef.key ?? "", ...review } as Review;
}

/**
 * Aggregate display rating for a spot. Falls back to the spot's own rating
 * when the scoped review index is empty, so launch sites never show 0 stars
 * for spots that already carry a rating.
 */
export function aggregateRating(reviews: Review[], spotRating: number): {
  rating: number;
  count: number;
} {
  const visible = reviews.filter((r) => r.rating >= 1 && r.rating <= 5);
  if (visible.length === 0) return { rating: spotRating ?? 0, count: 0 };
  const sum = visible.reduce((acc, r) => acc + r.rating, 0);
  return { rating: Math.round((sum / visible.length) * 10) / 10, count: visible.length };
}
