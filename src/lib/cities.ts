/**
 * Multi-city registry for VoltSetu.
 *
 * Design notes:
 * - Each city has a stable URL slug used by the /city/:slug landing pages and the
 *   city switcher. Slugs are the source of truth; never derive them from display names.
 * - `active` controls whether the city appears in switchers and nav. Launch city first.
 * - Spot data is already stored with a `city` field; filtering is client-side, so
 *   activation is purely a registry change until the network grows.
 */
export interface CityInfo {
  slug: string;
  name: string;
  state: string;
  tagline: string;
  lat: number;
  lng: number;
  active: boolean;
  launch: boolean;
}

export const CITIES: CityInfo[] = [
  { slug: "kolhapur", name: "Kolhapur", state: "Maharashtra", tagline: "Launch city — every neighborhood has a plug", lat: 16.705, lng: 74.2433, active: true, launch: true },
  { slug: "pune", name: "Pune", state: "Maharashtra", tagline: "Coming soon", lat: 18.5204, lng: 73.8567, active: false, launch: false },
  { slug: "mumbai", name: "Mumbai", state: "Maharashtra", tagline: "Coming soon", lat: 19.076, lng: 72.8777, active: false, launch: false },
  { slug: "nagpur", name: "Nagpur", state: "Maharashtra", tagline: "Coming soon", lat: 21.1458, lng: 79.0882, active: false, launch: false },
  { slug: "bangalore", name: "Bangalore", state: "Karnataka", tagline: "Coming soon", lat: 12.9716, lng: 77.5946, active: false, launch: false },
  { slug: "hyderabad", name: "Hyderabad", state: "Telangana", tagline: "Coming soon", lat: 17.385, lng: 78.4867, active: false, launch: false },
  { slug: "chennai", name: "Chennai", state: "Tamil Nadu", tagline: "Coming soon", lat: 13.0827, lng: 80.2707, active: false, launch: false },
  { slug: "delhi", name: "Delhi NCR", state: "Delhi", tagline: "Coming soon", lat: 28.7041, lng: 77.1025, active: false, launch: false },
];

export function getCityBySlug(slug: string): CityInfo | undefined {
  return CITIES.find((c) => c.slug === slug);
}

export function getActiveCities(): CityInfo[] {
  return CITIES.filter((c) => c.active);
}

export function getLaunchCity(): CityInfo {
  return CITIES.find((c) => c.launch) ?? CITIES[0];
}

/**
 * Normalize a spot's stored city (case/whitespace tolerant) to a registry slug.
 */
export function spotCitySlug(city: string | undefined): string | null {
  if (!city) return null;
  const norm = city.trim().toLowerCase();
  const match = CITIES.find(
    (c) => c.name.toLowerCase() === norm || c.slug.toLowerCase() === norm
  );
  return match ? match.slug : null;
}

/** Filter spots to a city slug; returns all spots when slug is null. */
export function filterSpotsByCity<T extends { city?: string }>(
  spots: T[],
  slug: string | null
): T[] {
  if (!slug) return spots;
  return spots.filter((s) => spotCitySlug(s.city) === slug);
}
