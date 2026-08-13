/**
 * Roadside Rescue — emergency stranded-rider mode.
 *
 * Full-bleed urgent UI: auto geolocation → nearest open spots ranked by
 * haversine distance → one-tap "Rescue Me" booking (45-min slot, rescuer
 * message, pay-at-spot on arrival) → direct host call/WhatsApp.
 *
 * Designed for panic moments: huge touch targets, countdown timer for the
 * battery "window", zero scroll required for the primary action.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  BatteryWarning,
  MapPin,
  Phone,
  MessageCircle,
  Zap,
  Loader2,
  ShieldCheck,
  Clock,
  X,
  Navigation,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { getAllChargingSpots } from "@/lib/hostRegistration";
import { getAllNetworkStations, mergeNetworkStations } from "@/lib/networkStationsService";import {
  resolveRiderPosition,
  rankSpotsByDistance,
  RESCUE_WINDOW_MINUTES,
  type RescueSpot,
} from "@/lib/rescueService";
import { submitEmergencyBooking } from "@/lib/bookingService";
import type { ChargingSpot } from "@/types";

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(() => setLeft((l) => (l <= 1 ? 0 : l - 1)), 1000);
    return () => clearInterval(t);
  }, [left]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function EmergencyRescue() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [stage, setStage] = useState<"locating" | "ready" | "booking">("locating");
  const [source, setSource] = useState<"gps" | "city">("gps");
  const [error, setError] = useState<string | null>(null);
  const [spots, setSpots] = useState<RescueSpot[]>([]);
  const [bookingSpot, setBookingSpot] = useState<RescueSpot | null>(null);
  const [done, setDone] = useState<RescueSpot | null>(null);
  const timerRef = useRef<number>(0);
  const display = useCountdown(timerRef.current);

  useEffect(() => {
    timerRef.current = RESCUE_WINDOW_MINUTES * 60;
  }, []);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    (async () => {
      try {
        const pos = await resolveRiderPosition();
        if (cancelled) return;
        setSource(pos.source);
        if (pos.error) setError(pos.error);
        const all = await getAllChargingSpots();
        const net = await getAllNetworkStations();
        if (cancelled) return;
        const ranked = rankSpotsByDistance(mergeNetworkStations(all, net), pos.lat, pos.lng);
        setSpots(ranked);
        setStage("ready");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Rescue finder failed.");
        setStage("ready");
      }
    })();
    return () => { cancelled = true; };
  }, [loading]);

  const nearest = useMemo(() => spots.slice(0, 3), [spots]);

  const handleRescue = async (rescue: RescueSpot) => {
    if (!user) {
      toast.error("Sign in first — we need to know who to rescue.");
      navigate("/?signin=rescue");
      return;
    }
    setBookingSpot(rescue);
    try {
      await submitEmergencyBooking(rescue.spot as ChargingSpot);
      setDone(rescue);
      toast.success(`Rescue request sent to ${rescue.spot.hostName || "your host"}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rescue booking failed — please call the host directly.");
    } finally {
      setBookingSpot(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] text-neutral-100">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0a0a] text-neutral-100">
      <div className="relative min-h-full">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-red-950/60 bg-[#0a0a0a]/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <BatteryWarning className="h-6 w-6 text-red-500" />
            <span className="font-display text-lg font-bold tracking-tight">ROADSIDE RESCUE</span>
            <span className="animate-pulse rounded-full bg-red-600/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-red-400">
              SOS
            </span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-neutral-800 p-2 text-neutral-400 transition-colors hover:bg-neutral-900 hover:text-neutral-100"
            aria-label="Exit rescue mode"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="mx-auto max-w-xl px-4 pb-24 pt-6">
          {/* Urgency panel */}
          <div className="mb-5 rounded-2xl border border-red-950/60 bg-gradient-to-b from-red-950/40 to-transparent p-4">
            <div className="mb-2 flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Don't let it die — act within</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-display text-4xl font-bold tabular-nums text-red-500">{display}</span>
              <span className="text-sm text-neutral-400">rescue window remaining</span>
            </div>
            <p className="mt-2 text-sm text-neutral-400">
              Two-wheeler batteries forgive no one. We found spots that are{" "}
              <span className="font-semibold text-neutral-200">open right now</span>. Tap Rescue Me — your host gets a
              pending request instantly.
            </p>
          </div>

          {/* Location status */}
          <div className="mb-4 flex items-center gap-2 text-sm text-neutral-400">
            <MapPin className="h-4 w-4 text-red-400" />
            {stage === "locating" ? (
              <span>Locating you…</span>
            ) : (
              <span>
                {source === "gps" ? "Using your location" : "Location unavailable — showing launch city"}
                {error ? ` (${error})` : ""}
              </span>
            )}
            {stage === "locating" && <Loader2 className="h-4 w-4 animate-spin text-red-400" />}
          </div>

          {/* Results */}
          {stage === "locating" && (
            <div className="flex flex-col items-center gap-3 py-14 text-neutral-500">
              <Navigation className="h-10 w-10 animate-pulse text-red-500/60" />
              <p className="text-sm">Scanning the map for open outlets near you…</p>
            </div>
          )}

          {stage === "ready" && nearest.length === 0 && !done && (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-center">
              <BatteryWarning className="mx-auto mb-3 h-10 w-10 text-red-500/60" />
              <p className="mb-1 font-semibold">No open spots nearby right now</p>
              <p className="mb-4 text-sm text-neutral-400">
                Every open outlet is booked or closed for the hour. Call a host directly — hosts on VoltSetu often make
                exceptions for stranded riders.
              </p>
              <a
                href="/spots"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                <Zap className="h-4 w-4" /> View all spots
              </a>
            </div>
          )}

          {/* Nearest cards */}
          {nearest.map((rescue, idx) => (
            <div
              key={rescue.spot.id}
              className={`mb-4 overflow-hidden rounded-2xl border bg-neutral-950/60 ${
                idx === 0 ? "border-red-700/60" : "border-neutral-800"
              }`}
            >
              {idx === 0 && (
                <div className="flex items-center gap-1.5 bg-red-600/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Nearest open spot — priority pick
                </div>
              )}
              <div className="p-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold leading-tight">
                    {rescue.spot.name || "Charging spot"}
                  </h3>
                  <span className="whitespace-nowrap rounded-full bg-red-600/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                    {rescue.distanceLabel}
                  </span>
                </div>
                <p className="mb-3 text-sm text-neutral-400">
                  {rescue.spot.hostName ? `${rescue.spot.hostName} · ` : ""}
                  {rescue.spot.address || rescue.spot.city || "India"}
                </p>
                <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-neutral-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-400" />
                    ₹{rescue.spot.pricePerHour ?? "—"}{rescue.spot.pricePerHour ? "/hr" : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-neutral-500" />
                    {rescue.spot.openHours || "24/7"}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                    Open now
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {done?.spot.id === rescue.spot.id ? (
                    <div className="flex-1 rounded-xl bg-emerald-600/15 px-4 py-3 text-center text-sm font-semibold text-emerald-400">
                      ✓ Rescue request sent — host will confirm
                    </div>
                  ) : (
                    <button
                      onClick={() => handleRescue(rescue)}
                      disabled={bookingSpot !== null}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-red-900/40 transition-all hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {bookingSpot?.spot.id === rescue.spot.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Zap className="h-5 w-5" />
                      )}
                      Rescue Me — {rescue.spot.name || "book now"}
                    </button>
                  )}
                  {rescue.spot.hostPhone && (
                    <a
                      href={`tel:${rescue.spot.hostPhone}`}
                      className="rounded-xl border border-neutral-700 p-3.5 text-neutral-200 transition-colors hover:border-red-700 hover:text-red-400"
                      aria-label={`Call ${rescue.spot.hostName || "host"}`}
                    >
                      <Phone className="h-5 w-5" />
                    </a>
                  )}
                  {rescue.spot.hostPhone && (
                    <a
                      href={`https://wa.me/${rescue.spot.hostPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                        "EMERGENCY — stranded rider on VoltSetu, coming to your spot now!"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-neutral-700 p-3.5 text-neutral-200 transition-colors hover:border-emerald-600 hover:text-emerald-400"
                      aria-label="Message host on WhatsApp"
                    >
                      <MessageCircle className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Remaining ranked list */}
          {spots.length > 3 && (
            <p className="mt-2 mb-4 text-center text-sm text-neutral-500">
              +{spots.length - 3} more open spots —{" "}
              <a href="/spots" className="font-semibold text-red-400 underline underline-offset-2">
                see all
              </a>
            </p>
          )}

          {/* Post-rescue guidance */}
          {done && (
            <div className="mt-4 rounded-2xl border border-emerald-800/50 bg-emerald-950/30 p-4 text-sm text-neutral-300">
              <p className="mb-1 font-semibold text-emerald-400">Help is on the way. Do this now:</p>
              <ol className="list-decimal space-y-1 pl-4 text-neutral-400">
                <li>
                  Call your host — {done.spot.hostName || "them"} — using the button above so they're at the outlet when
                  you arrive.
                </li>
                <li>Keep the bike's battery warm; push-don't-ride if possible.</li>
                <li>Pay at the spot when charging begins — the request is already reserved under your account.</li>
                <li>
                  Check your request in{" "}
                  <a href="/dashboard/bookings" className="font-semibold text-emerald-400 underline underline-offset-2">
                    Dashboard → Bookings
                  </a>
                  .
                </li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
