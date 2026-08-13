import { database } from "./firebase-services";
import { ref, get } from "firebase/database";

export interface NetworkStation {
  id: string;
  stationName: string;
  networkOperator?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates: { lat: number; lng: number };
  numberOfChargers?: number;
  chargerTypes?: string[];
  availabilityStatus?: string;
  pricing?: { pricePerHour?: number; pricePerMinute?: number; freeCharging?: boolean };
  workingHours?: { weekdays?: string; weekends?: string; holidays?: string };
  contact?: { phone?: string; email?: string; website?: string };
  description?: string;
  notes?: string;
  verificationStatus?: string;
  isFeatured?: boolean;
  technical?: { connectorTypes?: string[]; powerRating?: string };
}

/**
 * Fetches all network stations (admin-curated charging infrastructure) for rider pages.
 * Public read path — anonymous access is allowed by RTDB rules.
 */
export async function getAllNetworkStations(): Promise<NetworkStation[]> {
  const snap = await get(ref(database, "networkStations"));
  const data = snap.val() || {};
  return Object.keys(data)
    .filter((id) => data[id] && data[id].coordinates)
    .map((id) => ({ id, ...data[id] }));
}

/**
 * Normalizes a NetworkStation into the rider Spot shape used across
 * SpotsMap / SpotCard / BookingModal so network stations appear alongside
 * host spots on the Find Spots map without changing the rider UI.
 */
export function toRiderSpot(station: NetworkStation): Record<string, any> {
  const conns =
    station.chargerTypes?.length
      ? station.chargerTypes.join(", ")
      : (station.technical?.connectorTypes?.join(", ") ?? "EV Charger");
  const free = !!station.pricing?.freeCharging || (station.pricing?.pricePerHour ?? 0) === 0;
  const hours = station.workingHours?.weekdays || "Open 24/7";
  return {
    id: station.id,
    name: station.stationName,
    hostName: station.networkOperator || "Network Station",
    hostId: station.id,
    isNetworkStation: true,
    address: [station.address, station.city, station.state].filter(Boolean).join(", "),
    city: station.city,
    state: station.state,
    pincode: station.pincode,
    coordinates: { lat: station.coordinates.lat, lng: station.coordinates.lng },
    outletType: conns,
    chargingSpeed: station.technical?.powerRating || "Fast",
    pricePerHour: station.pricing?.pricePerHour ?? 0,
    priceLabel: free ? "Free" : `₹${station.pricing?.pricePerHour ?? 0}/hr`,
    rating: 0,
    ratingCount: 0,
    available: station.availabilityStatus === "active" || station.availabilityStatus === undefined,
    liveStatus: station.availabilityStatus === "coming_soon" ? "coming-soon" : station.availabilityStatus === "maintenance" ? "busy" : "free",
    facilities: (station.chargerTypes ?? []).map((c) => c.toLowerCase().replace(" ", "-")),
    description: station.description || "",
    phone: station.contact?.phone || "",
    hours,
    featured: !!station.isFeatured,
    verified: station.verificationStatus === "verified",
  };
}

/**
 * Merge network stations with host spots, de-duplicating by coordinates.
 * Network stations are appended so riders see them on the map and lists.
 */
export function mergeNetworkStations(
  spots: Record<string, any>[],
  stations: NetworkStation[],
): Record<string, any>[] {
  const seen = new Set(
    spots.map((s) => `${s.coordinates?.lat?.toFixed(4)}|${s.coordinates?.lng?.toFixed(4)}`),
  );
  const merged = [...spots];
  for (const st of stations) {
    const key = `${st.coordinates.lat.toFixed(4)}|${st.coordinates.lng.toFixed(4)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(toRiderSpot(st));
  }
  return merged;
}
