/**
 * Lightweight client-side favorites (saved spots) backed by localStorage.
 *
 * Design notes (round 3B):
 * - Favorites are stored per authenticated user so rider data never leaks between
 *   accounts on a shared device; the key is scoped to the user id.
 * - The data model keeps spot metadata (name, host, price, coordinates) so saved
 *   spots remain useful even after a host unpublishes a listing.
 * - No server write path exists, so this cannot escalate privileges or bypass
 *   the realtime database rules.
 */
export interface SavedSpot {
  id: string;
  name: string;
  host: string;
  pricePerHour?: number;
  lat?: number;
  lng?: number;
  city?: string;
  savedAt: number;
}

function storageKey(uid: string): string {
  return `voltsetu:favorites:${uid}`;
}

function readAll(uid: string): SavedSpot[] {
  try {
    const raw = localStorage.getItem(storageKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(uid: string, items: SavedSpot[]): void {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(items.slice(0, 100)));
  } catch {
    // Storage full or unavailable — fail silently; favorites are a convenience, not core.
  }
}

export function isFavorite(uid: string, spotId: string): boolean {
  if (!uid || !spotId) return false;
  return readAll(uid).some((s) => s.id === spotId);
}

export function getFavorites(uid: string): SavedSpot[] {
  if (!uid) return [];
  return readAll(uid).sort((a, b) => b.savedAt - a.savedAt);
}

export function saveSpot(uid: string, spot: Omit<SavedSpot, "savedAt">): boolean {
  if (!uid || !spot.id) return false;
  const items = readAll(uid);
  if (items.some((s) => s.id === spot.id)) return true;
  writeAll(uid, [...items, { ...spot, savedAt: Date.now() }]);
  return true;
}

export function unsaveSpot(uid: string, spotId: string): boolean {
  if (!uid || !spotId) return false;
  writeAll(
    uid,
    readAll(uid).filter((s) => s.id !== spotId)
  );
  return true;
}

export function toggleFavorite(
  uid: string,
  spot: Omit<SavedSpot, "savedAt">
): "saved" | "unsaved" {
  if (!uid || !spot.id) return "unsaved";
  if (isFavorite(uid, spot.id)) {
    unsaveSpot(uid, spot.id);
    return "unsaved";
  }
  saveSpot(uid, spot);
  return "saved";
}
