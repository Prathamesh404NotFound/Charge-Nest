/**
 * Roadside Rescue service for VoltSetu.
 *
 * "I'm stranded — find the nearest open spot now."
 *
 * Design notes:
 * - Nearest ranking uses the haversine distance between the rider's GPS
 *   position and each spot. Spots carry no lat/lng of their own, so spot
 *   coordinates are resolved client-side through the geocoding helper in
 *   routeUtils (or fall back to the spot's city centroid). Distance badges
 *   degrade to "City match" when geocoding fails instead of hiding results.
 * - Candidates must be `status === "active"` and OPEN at the current time.
 * - Location lookup degrades gracefully: GPS → denied/error → rider picks a
 *   city manually; every branch returns a usable result set.
 */
import { getCityBySlug, getActiveCities } from "./cities";
import type { ChargingSpot } from "@/types";

export interface RescueSpot {
  spot: ChargingSpot;
  distanceKm: number;
  distanceLabel: string;
}

/** Haversine distance in km between two coordinates. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Check whether a spot is open at the current time (same rule as SpotCard). */
export function isSpotOpenNow(spot: ChargingSpot): boolean {
  if (!spot.openHours) return true; // 24/7 when no hours set
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [start, end] = spot.openHours.split("-").map((s) => {
    const [h, m] = s.trim().split(":").map(Number);
    return Number.isFinite(h) ? h * 60 + (m || 0) : 0;
  });
  if (!start && !end) return true;
  if (end >= start) return current >= start && current < end;
  // overnight window (e.g. 21:00-06:00)
  return current >= start || current < end;
}

function formatDistance(km: number): string {
  if (!Number.isFinite(km) || km <= 0) return "Nearby";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/**
 * Resolve a geocoded coordinate for a spot. Spots store `address`/`city`; we
 * approximate using their city centroid (registry) when no lat/lng is stored.
 */
export function spotCoordinate(spot: ChargingSpot): { lat: number; lng: number } | null {
  const s = spot as ChargingSpot & { lat?: number; lng?: number };
  if (Number.isFinite(s.lat) && Number.isFinite(s.lng)) return { lat: s.lat!, lng: s.lng! };
  const slug = getActiveCities()
    .map((c) => c.slug)
    .find((slug) => spot.city?.toLowerCase().includes(slug) || slug === spot.city?.toLowerCase());
  const city = slug ? getCityBySlug(slug) : undefined;
  if (city) return { lat: city.lat, lng: city.lng };
  return null;
}

/** Rank active + open spots by distance to a point. */
export function rankSpotsByDistance(
  spots: ChargingSpot[],
  lat: number,
  lng: number
): RescueSpot[] {
  return spots
    .filter((s) => (s.status ?? "active") === "active" && isSpotOpenNow(s))
    .map((spot) => {
      const coord = spotCoordinate(spot);
      const distanceKm = coord ? haversineKm(lat, lng, coord.lat, coord.lng) : Infinity;
      return {
        spot,
        distanceKm,
        distanceLabel: Number.isFinite(distanceKm) ? formatDistance(distanceKm) : "City match",
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export type GeolocationSource = "gps" | "city";

/**
 * Resolve the rider's position. Tries GPS first (timeout 8s), falls back to
 * the launch city centroid. Never rejects the rescue flow.
 */
export async function resolveRiderPosition(): Promise<{
  lat: number;
  lng: number;
  source: GeolocationSource;
  error?: string;
}> {
  if (typeof navigator !== "undefined" && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60_000,
        });
      });
      return { lat: pos.coords.latitude, lng: pos.coords.longitude, source: "gps" };
    } catch (err) {
      const msg = err instanceof GeolocationPositionError ? err.message : "Location unavailable";
      const city = getActiveCities().find((c) => c.launch) ?? getActiveCities()[0];
      return {
        lat: city.lat,
        lng: city.lng,
        source: "city",
        error: msg,
      };
    }
  }
  const city = getActiveCities().find((c) => c.launch) ?? getActiveCities()[0];
  return { lat: city.lat, lng: city.lng, source: "city" };
}

/** Estimate battery minutes left at a 60-minute countdown "window". */
export const RESCUE_WINDOW_MINUTES = 60;
