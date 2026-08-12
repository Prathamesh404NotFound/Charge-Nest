/* VoltSetu rider loyalty (Round 14).
 *
 * Lightweight engagement layer derived on the fly from booking history
 * (no mutable loyalty store — nothing to corrupt, and it can't be abused).
 *
 * Points: 10 pts per completed session, +5 for each on-time rating a host
 * gave (punctuality >= 4).
 * Badges: earned at milestones (5/20/50 sessions), plus an Eco badge
 * (CO2 saved) and a Streak badge (weekly consistency).
 */
import { getUserBookings, type BookingRequest } from "./bookingService";
import { getRiderRating } from "./riderRatingService";

export interface LoyaltyBadge {
  id: string;
  label: string;
  description: string;
  icon: "zap" | "leaf" | "fire" | "star" | "trophy";
}

export const BADGES: Record<string, LoyaltyBadge> = {
  new_rider: { id: "new_rider", label: "New Rider", description: "First charging session", icon: "star" },
  regular: { id: "regular", label: "Regular Rider", description: "5 completed sessions", icon: "zap" },
  commuter: { id: "commuter", label: "Daily Commuter", description: "20 completed sessions", icon: "trophy" },
  pioneer: { id: "pioneer", label: "EV Pioneer", description: "50 completed sessions", icon: "trophy" },
  eco_hero: { id: "eco_hero", label: "Eco Hero", description: "100+ kg CO₂ saved", icon: "leaf" },
  streak_3: { id: "streak_3", label: "Charging Streak", description: "Charged 3 weeks in a row", icon: "fire" },
  eco_warrior: { id: "eco_warrior", label: "Eco Warrior", description: "500+ kg CO₂ saved", icon: "leaf" },
};

export interface LoyaltyProfile {
  points: number;
  level: number;
  completed: number;
  co2Kg: number;
  badges: LoyaltyBadge[];
  streakWeeks: number;
}

/** Level threshold: every 100 points advances a level. */
export function loyaltyLevel(points: number): number {
  return Math.max(1, Math.floor(points / 100) + 1);
}

/** Earned badges from session count, CO2 and streak. */
function earnedBadges(completed: number, co2Kg: number, streakWeeks: number): LoyaltyBadge[] {
  const badges: LoyaltyBadge[] = [];
  if (completed >= 1) badges.push(BADGES.new_rider);
  if (completed >= 5) badges.push(BADGES.regular);
  if (completed >= 20) badges.push(BADGES.commuter);
  if (completed >= 50) badges.push(BADGES.pioneer);
  if (co2Kg >= 100) badges.push(BADGES.eco_hero);
  if (co2Kg >= 500) badges.push(BADGES.eco_warrior);
  if (streakWeeks >= 3) badges.push(BADGES.streak_3);
  return badges;
}

/** Compute longest recent streak of distinct calendar weeks with >=1 session. */
function streakWeeks(completedBookings: BookingRequest[]): number {
  const now = Date.now();
  const weekMs = 7 * 24 * 3600 * 1000;
  const weekStart = (ts: number) => Math.floor(ts / weekMs);
  const weeks = new Set<number>();
  completedBookings.forEach((b) => {
    const ts = typeof b.requestedAt === "number" ? b.requestedAt : Date.now();
    weeks.add(weekStart(ts));
  });
  const current = weekStart(now);
  let streak = 0;
  for (let w = current; weeks.has(w); w--) streak++;
  return streak;
}

/** Build the full loyalty profile for a rider from their bookings. */
export async function getLoyaltyProfile(uid: string): Promise<LoyaltyProfile> {
  const bookings = await getUserBookings(uid).catch(() => [] as BookingRequest[]);
  const completed = bookings.filter((b) => b.status === "completed");
  const co2Kg = Math.round(completed.length * 4);

  let points = completed.length * 10;
  try {
    const rating = await getRiderRating(uid);
    const onTime = rating.ratings.filter((r) => r.punctuality >= 4).length;
    points += onTime * 5;
  } catch {
    /* ratings unavailable — points still valid */
  }

  return {
    points,
    level: loyaltyLevel(points),
    completed: completed.length,
    co2Kg,
    badges: earnedBadges(completed.length, co2Kg, streakWeeks(completed)),
    streakWeeks: streakWeeks(completed),
  };
}
