import { database } from "./firebase-services";
import { ref, get } from "firebase/database";

export interface EarningEntry {
  requestId: string;
  userId: string;
  spotId: string;
  spotName: string;
  date: any;
  duration: number;
  pricePerHour: number;
  earned: number;
  status: string;
}

export interface EarningsSummary {
  totalEarned: number;
  completedSessions: number;
  pendingSessions: number;
  averagePerSession: number;
  entries: EarningEntry[];
  bySpot: Record<string, { spotName: string; earned: number; sessions: number }>;
}

/** Get all earnings for a host by scanning chargingRequests for their spots */
export async function getHostEarnings(hostUid: string): Promise<EarningsSummary> {
  // 1. Get host spots
  const spotsRef = ref(database, "chargingSpots");
  const spotsSnap = await get(spotsRef);

  const hostSpotIds = new Set<string>();
  const spotNames: Record<string, string> = {};

  if (spotsSnap.exists()) {
    const spots = spotsSnap.val();
    for (const [id, spot] of Object.entries(spots) as any[]) {
      if (spot.hostId === hostUid) {
        hostSpotIds.add(id);
        spotNames[id] = spot.name;
      }
    }
  }

  // 2. Scan all requests looking for completed ones on host's spots
  const allRef = ref(database, "chargingRequests");
  const allSnap = await get(allRef);

  const entries: EarningEntry[] = [];
  let completedSessions = 0;
  let pendingSessions = 0;

  if (allSnap.exists()) {
    const allRequests = allSnap.val();
    for (const uid of Object.keys(allRequests)) {
      for (const reqId of Object.keys(allRequests[uid])) {
        const req = allRequests[uid][reqId];
        if (!hostSpotIds.has(req.spotId)) continue;

        const earned = req.status === "completed"
          ? ((req.pricePerHour || 0) * (req.duration || 0)) / 60
          : 0;

        if (req.status === "completed") completedSessions++;
        if (req.status === "pending" || req.status === "approved") pendingSessions++;

        entries.push({
          requestId: reqId,
          userId: uid,
          spotId: req.spotId,
          spotName: spotNames[req.spotId] || "Unknown Spot",
          date: req.requestedAt,
          duration: req.duration || 0,
          pricePerHour: req.pricePerHour || 0,
          earned,
          status: req.status,
        });
      }
    }
  }

  const totalEarned = entries.reduce((s, e) => s + e.earned, 0);

  // Group by spot
  const bySpot: EarningsSummary["bySpot"] = {};
  for (const e of entries) {
    if (!bySpot[e.spotId]) bySpot[e.spotId] = { spotName: e.spotName, earned: 0, sessions: 0 };
    bySpot[e.spotId].earned += e.earned;
    if (e.status === "completed") bySpot[e.spotId].sessions++;
  }

  return {
    totalEarned: Math.round(totalEarned * 100) / 100,
    completedSessions,
    pendingSessions,
    averagePerSession: completedSessions > 0 ? Math.round(totalEarned / completedSessions) : 0,
    entries: entries.sort((a, b) => (b.date || 0) - (a.date || 0)),
    bySpot,
  };
}
