/* VoltSetu ride-cost comparison (Round 13).
 *
 * ₹/km model for Indian EV two-wheelers:
 * - Average consumption: ~25 km per kWh (typical 3 kWh pack ≈ 75 km range)
 * - A 10-min session at the spot's pricePerHour delivers pricePerHour/6 kWh
 * - Cost per km = (pricePerHour / 6) / (KWH_PER_KM_INV) = pricePerHour / (6 * 40)
 *   using 25 km/kWh -> kWh per km = 1/25 = 0.04
 *
 * Also: session cost per 10 min = pricePerHour / 6.
 */
export const KWH_PER_KM = 1 / 25; // 25 km per kWh average
export const KWH_PER_10MIN = 1 / 6; // 10-min session at 1 kW (conservative home outlet)

export function sessionCostRs(pricePerHour: number): number {
  if (!Number.isFinite(pricePerHour) || pricePerHour <= 0) return 0;
  return Math.round((pricePerHour / 6) * 100) / 100;
}

export function pricePerKmRs(pricePerHour: number): number | null {
  if (!Number.isFinite(pricePerHour) || pricePerHour <= 0) return null;
  return Math.round(((pricePerHour / 6) * KWH_PER_KM) * 1000) / 1000;
}

export function rangeKmFromKwh(kwh: number): number {
  return Math.round(kwh / KWH_PER_KM);
}
