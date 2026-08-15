/**
 * Curated facilities (amenities) library for VoltSetu.
 *
 * Design rule: hosts can ONLY pick from this list — there is no free-text
 * input anywhere a facility is selected, so nonsense values can never be
 * written into Firebase. Each entry is strongly typed, iconified, and
 * grouped into rider-friendly categories.
 */
import type { Amenity } from "@/types";

export interface Facility {
  /** Stable machine-readable id, written to Firebase */
  id: string;
  /** Rider-facing display name */
  name: string;
  /** Human-readable description shown in tooltips / previews */
  description: string;
  /** Lucide icon name (rendered by FacilitiesChips via a static icon map) */
  icon: string;
  /** Category group used for sectioned pickers */
  category: FacilityCategory;
}

export type FacilityCategory =
  | "comfort"
  | "parking"
  | "safety"
  | "connectivity"
  | "nearby"
  | "refreshments";

export const FACILITY_CATEGORIES: { id: FacilityCategory; label: string }[] = [
  { id: "comfort", label: "Comfort & Rest" },
  { id: "refreshments", label: "Refreshments" },
  { id: "parking", label: "Parking" },
  { id: "safety", label: "Safety & Access" },
  { id: "connectivity", label: "Connectivity" },
  { id: "nearby", label: "Nearby Places" },
];

export const FACILITIES: Facility[] = [
  // Comfort & Rest
  { id: "clean_toilet", name: "Clean Toilet", description: "Hygienic restroom available on site", icon: "bath", category: "comfort" },
  { id: "seating_area", name: "Seating Area", description: "Benches or chairs to wait comfortably", icon: "armchair", category: "comfort" },
  { id: "shaded_wait", name: "Shaded Waiting Area", description: "Covered or shaded spot to wait while charging", icon: "umbrella", category: "comfort" },
  { id: "waiting_room", name: "Indoor Waiting Room", description: "Air-conditioned / indoor space to relax", icon: "house", category: "comfort" },
  { id: "restroom_water", name: "Drinking Water", description: "Free drinking water while you wait", icon: "droplets", category: "comfort" },
  { id: "power_backup", name: "Power Backup", description: "Generator / UPS so charging never stops", icon: "battery-charging", category: "comfort" },

  // Refreshments
  { id: "chai_coffee", name: "Tea / Coffee", description: "Hot tea or coffee available on site", icon: "coffee", category: "refreshments" },
  { id: "snacks_shop", name: "Snack Shop", description: "Small shop or stall for snacks nearby", icon: "cookie", category: "refreshments" },
  { id: "restaurant", name: "Restaurant / Eatery", description: "Restaurant or diner at the spot", icon: "utensils", category: "refreshments" },

  // Parking
  { id: "free_parking", name: "Free Parking", description: "Park your vehicle for free while charging", icon: "circle-parking", category: "parking" },
  { id: "paid_parking", name: "Paid Parking", description: "Dedicated parking space available (paid)", icon: "parking-meter", category: "parking" },
  { id: "covered_parking", name: "Covered Parking", description: "Parking under a roof — protected from sun & rain", icon: "tent", category: "parking" },
  { id: "cctv", name: "CCTV Monitored", description: "Vehicle watched on camera while parked", icon: "video", category: "parking" },

  // Safety & Access
  { id: "well_lit", name: "Well-Lit Spot", description: "Bright lighting — safe for night charging", icon: "lightbulb", category: "safety" },
  { id: "first_aid", name: "First Aid Kit", description: "Basic first aid available on site", icon: "cross", category: "safety" },
  { id: "wheelchair_access", name: "Wheelchair Access", description: "Ramp or level access for easy entry", icon: "accessibility", category: "safety" },
  { id: "fire_extinguisher", name: "Fire Extinguisher", description: "Fire safety equipment on site", icon: "flame", category: "safety" },

  // Connectivity
  { id: "wifi", name: "Free Wi-Fi", description: "Free Wi-Fi while your vehicle charges", icon: "wifi", category: "connectivity" },
  { id: "phone_charging", name: "Phone Charging Point", description: "Charge your phone at the spot", icon: "smartphone", category: "connectivity" },

  // Nearby Places
  { id: "hotel_nearby", name: "Hotel Nearby", description: "Hotel or lodge within walking distance", icon: "bed-double", category: "nearby" },
  { id: "fuel_station", name: "Fuel / Petrol Pump Nearby", description: "Petrol pump close by for other refuelling", icon: "fuel", category: "nearby" },
  { id: "market_nearby", name: "Market Nearby", description: "Shopping area within walking distance", icon: "shopping-bag", category: "nearby" },
  { id: "repair_shop", name: "Repair / Mechanic Shop", description: "Vehicle repair shop close by", icon: "wrench", category: "nearby" },
];

/** Validate a raw list of ids — rejects anything not in the curated catalog. */
export function sanitizeFacilityIds(raw: unknown): string[] {
  const allowed = new Set(FACILITIES.map((f) => f.id));
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is string => typeof v === "string" && allowed.has(v))
    .filter((v, i, arr) => arr.indexOf(v) === i);
}

/** Convert selected facility ids to the Amenity[] shape the rest of the app uses. */
export function facilitiesToAmenities(ids: string[]): Amenity[] {
  return sanitizeFacilityIds(ids).map((id) => {
    const f = FACILITIES.find((x) => x.id === id)!;
    return { id: f.id, name: f.name, icon: f.icon, available: true };
  });
}

/** Get a facility definition by id. */
export function getFacility(id: string): Facility | undefined {
  return FACILITIES.find((f) => f.id === id);
}

/** Reverse mapping: convert Amenity[] (as stored on spots) back to facility ids.
 * Matches on the amenity id when it is a known facility id. */
export function amenitiesToFacilityIds(amenities: { id?: string; name?: string }[] | undefined): string[] {
  if (!amenities || !Array.isArray(amenities)) return [];
  const allowed = new Set(FACILITIES.map((f) => f.id));
  const ids: string[] = [];
  for (const a of amenities) {
    if (a && a.id && allowed.has(a.id)) {
      ids.push(a.id);
    }
  }
  return ids.filter((v, i, arr) => arr.indexOf(v) === i);
}
