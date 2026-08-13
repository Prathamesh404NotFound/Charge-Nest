import { database } from "./firebase-services";
import { ref, get, update, serverTimestamp } from "firebase/database";
import { sanitizeForDb } from "./bookingService";
import { sanitizeFacilityIds, facilitiesToAmenities } from "@/lib/facilities";

/** Fields hosts may edit on their own spots. */
export interface SpotEditPayload {
  name?: string;
  description?: string;
  pricePerHour?: number;
  outletType?: string;
  chargingSpeed?: string;
  availableHours?: string;
  spotType?: string;
  facilityIds?: string[];
  status?: "active" | "inactive";
}

export async function updateSpot(
  spotId: string,
  hostId: string,
  payload: SpotEditPayload
): Promise<{ ok: boolean; message: string }> {
  if (!spotId || !hostId) {
    return { ok: false, message: "Invalid spot or host." };
  }
  try {
    const spotSnap = await get(ref(database, `chargingSpots/${spotId}`));
    if (!spotSnap.exists()) {
      return { ok: false, message: "Spot not found." };
    }
    const spot = spotSnap.val() as Record<string, unknown>;
    if (spot.hostId !== hostId) {
      return { ok: false, message: "Only the spot owner can edit this spot." };
    }

    const change: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (payload.name !== undefined) {
      const name = String(payload.name).trim().slice(0, 80);
      if (name.length < 2) return { ok: false, message: "Name must be at least 2 characters." };
      change.name = name;
    }
    if (payload.description !== undefined) {
      change.description = String(payload.description).trim().slice(0, 400);
    }
    if (payload.pricePerHour !== undefined) {
      const price = Number(payload.pricePerHour);
      if (!Number.isFinite(price) || price < 0 || price > 10000) {
        return { ok: false, message: "Price must be between ₹0 and ₹10,000 per hour." };
      }
      change.pricePerHour = price;
      change.pricePerMinute = Math.round((price / 60) * 100) / 100;
    }
    if (payload.outletType !== undefined) {
      change.outletType = String(payload.outletType).slice(0, 40);
    }
    if (payload.chargingSpeed !== undefined) {
      change.chargingSpeed = String(payload.chargingSpeed).slice(0, 40);
    }
    if (payload.availableHours !== undefined) {
      change.availableHours = String(payload.availableHours).slice(0, 60);
    }
    if (payload.spotType !== undefined) {
      change.spotType = String(payload.spotType).slice(0, 40);
      change.category = payload.spotType === "Home" ? "home" : "commercial";
    }
    if (payload.facilityIds !== undefined) {
      const ids = sanitizeFacilityIds(payload.facilityIds);
      change.amenities = facilitiesToAmenities(ids);
    }
    if (payload.status !== undefined) {
      if (payload.status !== "active" && payload.status !== "inactive") {
        return { ok: false, message: "Invalid spot status." };
      }
      change.status = payload.status;
    }

    await update(ref(database, `chargingSpots/${spotId}`), sanitizeForDb(change));
    return { ok: true, message: "Spot updated successfully." };
  } catch (error) {
    console.error("Error updating spot:", error);
    return { ok: false, message: "Could not save changes. Please try again." };
  }
}
