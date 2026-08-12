import { useState } from "react";
import { Link } from "react-router-dom";
import { Battery, MapPin, Zap, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { CITIES } from "@/lib/cities";

/**
 * Bonus helper widget — "Plan My Charge". Riders estimate how far they can
 * still ride on remaining battery and what a top-up would cost at a spot.
 * Purely client-side math; links into the real /spots flow.
 */
export default function ChargePlanner() {
  const [batteryPct, setBatteryPct] = useState(25);
  const [cityIdx, setCityIdx] = useState(0);
  const [topUpPct, setTopUpPct] = useState(50);

  // Typical Indian EV two-wheeler battery: ~3 kWh usable, ~80 km real range.
  const USABLE_KWH = 3;
  const REAL_RANGE_KM = 80;
  const city = CITIES[cityIdx];

  const remainingKwh = (batteryPct / 100) * USABLE_KWH;
  const remainingKm = Math.round((batteryPct / 100) * REAL_RANGE_KM);
  const topUpKwh = Math.round((topUpPct / 100) * USABLE_KWH * 10) / 10;
  // 0–80% fast charging ≈ 0.7 h per full charge → scale linearly
  const topUpHours = Math.round((topUpPct / 100) * 1.1 * 60) / 60;
  // Average spot price across cities ≈ ₹20/h for 3 kW outlet
  const topUpCost = Math.round(topUpHours * 20);

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-1">
        <Battery className="w-4 h-4 text-primary" />
        <h3 className="font-display font-bold text-lg text-foreground">Plan My Charge</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        Estimate your remaining range and top-up cost before you head out.
      </p>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-foreground font-medium">Battery remaining: {batteryPct}%</span>
            <span className="text-muted-foreground">≈ {remainingKm} km</span>
          </div>
          <Slider value={[batteryPct]} min={0} max={100} step={5}
            onValueChange={v => setBatteryPct(v[0])} aria-label="Battery remaining percent" />
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-foreground font-medium">Top-up to: {topUpPct}%</span>
            <span className="text-muted-foreground">≈ {topUpKwh} kWh</span>
          </div>
          <Slider value={[topUpPct]} min={10} max={90} step={5}
            onValueChange={v => setTopUpPct(v[0])} aria-label="Target top-up percent" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-center gap-2.5">
            <Timer className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Charging time</p>
              <p className="font-bold text-foreground text-sm">{Math.round(topUpHours * 60)} min</p>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Est. cost</p>
              <p className="font-bold text-foreground text-sm">₹{topUpCost}*</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Looking in:</span>
          <select
            value={cityIdx}
            onChange={e => setCityIdx(Number(e.target.value))}
            className="text-xs rounded-lg border border-input bg-background px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="City"
          >
            {CITIES.filter(c => c.active).map((c, i) => (
              <option key={c.slug} value={i}>{c.name}</option>
            ))}
          </select>
          <Button asChild size="sm" className="ml-auto gradient-green hover:opacity-90">
            <Link to={`/city/${city.slug}`}>Find Spots</Link>
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          *Estimate for a typical 3 kWh two-wheeler pack at ~₹20/hr outlet rates. Actual range and pricing vary by model and spot.
        </p>
      </div>
    </div>
  );
}
