/**
 * VoltSetu Trip Planner (Round 32) — dedicated standalone page.
 *
 * Riders enter a start point and destination; the planner geocodes both via
 * Nominatim (OpenStreetMap), pulls a driving route from OSRM, and lists every
 * VoltSetu spot (host + network stations) within the corridor, ranked by
 * distance from the start with ₹/km pricing so riders pick the cheapest
 * stop on the way. Entry points: navbar "Trip Planner" link and the
 * "On My Way" toggle on Find Spots.
 */
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Route, Navigation2, Loader2, AlertCircle, Zap, MapPinned, BatteryCharging, IndianRupee, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";
import CTABanner from "@/components/CTABanner";
import ResponsiveContainer from "@/components/ui/responsive-container";
import { Button } from "@/components/ui/button";
import { TripPlannerPanel, type TripSpot } from "@/components/TripPlannerPanel";
import { useT } from "@/lib/i18n";
import { getAllChargingSpots } from "@/lib/hostRegistration";
import { getAllNetworkStations, mergeNetworkStations } from "@/lib/networkStationsService";
import { toast } from "sonner";

export default function TripPlannerPage() {
  const t = useT();
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([getAllChargingSpots(), getAllNetworkStations()])
      .then(([data, net]) =>
        setSpots(
          mergeNetworkStations(data, net).map((s: any) => ({
            ...s,
            lat: s.coordinates?.lat,
            lng: s.coordinates?.lng,
            isAvailable: s.availableHours === undefined,
          })),
        ),
      )
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load charging spots");
      })
      .finally(() => setLoading(false));
  }, []);

  const tripSpots: TripSpot[] = useMemo(
    () =>
      spots.map((s) => ({
        id: s.id,
        name: s.name,
        lat: s.lat,
        lng: s.lng,
        pricePerHour: s.pricePerHour,
        city: s.city,
        isAvailable: s.isAvailable,
      })),
    [spots],
  );

  if (selectedSpot) {
    return (
      <div className="pt-24 pb-16">
        <SEO title={`${selectedSpot.name} — VoltSetu Trip Planner`} description={`Charging stop on your route: ${selectedSpot.name}.`} />
        <ResponsiveContainer size="xl" className="py-6">
          <Link to="/route" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to trip planner
          </Link>
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h1 className="font-display font-bold text-xl text-foreground mb-1">{selectedSpot.name}</h1>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedSpot.city ?? "India"} · ₹{(selectedSpot.pricePerHour ?? 10)}/hr
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setSelectedSpot(null)} variant="outline" size="sm">
                Keep planning
              </Button>
              <Button asChild size="sm">
                <Link to="/spots">Browse all spots</Link>
              </Button>
            </div>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="pt-24">
      <SEO
        title="Trip Planner — Find EV Charging Spots Along Your Route | VoltSetu"
        description="Enter your start and destination. VoltSetu finds every verified charging spot along your drive with ₹/km pricing so you pick the cheapest stop on the way."
      />

      <section className="relative py-16 gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <img src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1600&q=60" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs font-semibold text-white/90 mb-4">
              <Route className="w-3.5 h-3.5" /> Route charging for two-wheelers
            </div>
            <h1 className="font-display font-bold text-3xl md:text-5xl text-white mb-4">
              Charge Along the Way
            </h1>
            <p className="text-white/70 max-w-xl mx-auto">
              Plan your route and VoltSetu will surface every charging spot beside it — ranked by
              distance from your start and price per kilometre.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 min-h-[40vh]">
        <div className="container mx-auto px-4 max-w-3xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground py-20">
              <Loader2 className="w-5 h-5 animate-spin text-primary" /> Loading spot network…
            </div>
          ) : (
            <TripPlannerPanel spots={tripSpots} onPickSpot={setSelectedSpot} />
          )}

          <div className="grid sm:grid-cols-3 gap-4 mt-10">
            <div className="rounded-2xl border border-border bg-card p-5">
              <Navigation2 className="w-5 h-5 text-primary mb-2" />
              <p className="font-semibold text-sm text-foreground mb-1">Route-based matching</p>
              <p className="text-xs text-muted-foreground">
                Spots are matched against the actual driving route, not a straight line, so every
                result is a realistic stop.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <IndianRupee className="w-5 h-5 text-primary mb-2" />
              <p className="font-semibold text-sm text-foreground mb-1">Cheapest per kilometre</p>
              <p className="text-xs text-muted-foreground">
                Every result shows ₹/km so you can pick the most economical stop, not just the nearest.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <MapPinned className="w-5 h-5 text-primary mb-2" />
              <p className="font-semibold text-sm text-foreground mb-1">One network, every spot</p>
              <p className="text-xs text-muted-foreground">
                Host spots and network charging stations are searched together — one list for the
                whole journey.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <CTABanner
              variant="dark"
              title="Never Run Out of Charge on the Road"
              subtitle="VoltSetu makes every two-wheeler journey in India safer with charging spots along the way."
            />
          </div>
        </div>
      </section>
    </div>
  );
}
