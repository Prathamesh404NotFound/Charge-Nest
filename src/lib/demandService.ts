import { database } from "./firebase-services";
import { ref, get } from "firebase/database";
import { CITIES } from "./cities";

/**
 * Demand vs supply insights for the admin heatmap.
 *
 * Demand  = count of booking requests (spotRequests) whose resolved spot
 *           lives in a given city over the last 30 days.
 * Supply  = count of live (active, non-paused, non-rejected) charging spots
 *           in that city.
 * The ratio demand/supply highlights cities starving for hosts so the admin
 * can focus rider marketing + host outreach where it matters.
 */

export interface DemandInsight {
  city: string;
  slug: string;
  demand: number;
  supply: number;
  ratio: number;
  status: "shortage" | "balanced" | "surplus";
}

const DAY_MS = 86400000;

function cityOfSpot(spot: Record<string, unknown>): string | null {
  const raw = (spot.city as string) || (spot.district as string) || "";
  if (!raw) return null;
  const lower = raw.trim().toLowerCase();
  const match = CITIES.find(
    (c) => c.name.toLowerCase() === lower || c.slug === lower
  );
  return match ? match.slug : null;
}

/** Load all spots keyed by id. */
async function loadSpots(): Promise<{ id: string; data: Record<string, unknown> }[]> {
  const snap = await get(ref(database, "chargingSpots"));
  if (!snap.exists()) return [];
  const raw = snap.val() as Record<string, Record<string, unknown>>;
  return Object.entries(raw).map(([id, data]) => ({ id, data }));
}

/** Load all booking requests (spotRequests) — { spotId: { requestId: {...} } }. */
async function loadRequests(): Promise<Record<string, unknown>[]> {
  const snap = await get(ref(database, "spotRequests"));
  if (!snap.exists()) return [];
  const bySpot = snap.val() as Record<string, Record<string, unknown>>;
  const all: Record<string, unknown>[] = [];
  for (const reqs of Object.values(bySpot)) {
    if (reqs && typeof reqs === "object") {
      for (const req of Object.values(reqs)) {
        if (req && typeof req === "object") all.push(req as Record<string, unknown>);
      }
    }
  }
  return all;
}

/** Classify demand level relative to supply. */
function classify(ratio: number): DemandInsight["status"] {
  if (ratio >= 2) return "shortage";
  if (ratio >= 0.5) return "balanced";
  return "surplus";
}

export async function getDemandHeatmap(): Promise<DemandInsight[]> {
  const [spots, requests] = await Promise.all([loadSpots(), loadRequests()]);

  // Live supply per city: active spots that haven't been rejected by admin.
  const supply = new Map<string, number>();
  const spotCity = new Map<string, string | null>();
  for (const { id, data } of spots) {
    const status = (data.status as string) || "active";
    const adminApproval = (data.adminApproval as string) || "";
    if (status === "rejected" || adminApproval === "rejected") continue;
    const slug = cityOfSpot(data);
    if (!slug) continue;
    spotCity.set(id, slug);
    supply.set(slug, (supply.get(slug) || 0) + 1);
  }

  // 30-day demand per city (all requests regardless of status — they signal intent).
  const cutoff = Date.now() - 30 * DAY_MS;
  const demand = new Map<string, number>();
  for (const req of requests) {
    const at = Number(req.requestedAt) || Number(req.createdAt) || 0;
    if (at && at < cutoff) continue;
    const slug = spotCity.get(req.spotId as string) || null;
    if (!slug) continue;
    demand.set(slug, (demand.get(slug) || 0) + 1);
  }

  const slugs = new Set<string>([...supply.keys(), ...demand.keys()]);
  const rows: DemandInsight[] = [...slugs]
    .map((slug) => {
      const cityInfo = CITIES.find((c) => c.slug === slug);
      const d = demand.get(slug) || 0;
      const s = supply.get(slug) || 0;
      const ratio = s > 0 ? Math.round((d / s) * 10) / 10 : d > 0 ? Infinity : 0;
      return {
        city: cityInfo?.name || slug,
        slug,
        demand: d,
        supply: s,
        ratio,
        status: classify(isFinite(ratio) ? ratio : 99),
      };
    })
    .sort((a, b) => (isFinite(b.ratio) ? b.ratio : 99) - (isFinite(a.ratio) ? a.ratio : 99));

  return rows;
}
