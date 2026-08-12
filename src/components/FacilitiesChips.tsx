import {
  Bath, Armchair, Umbrella, House, Droplets, BatteryCharging,
  Coffee, Cookie, Utensils,
  CircleParking, ParkingMeter, Tent, Video,
  Lightbulb, Cross, Accessibility, Flame,
  Wifi, Smartphone,
  BedDouble, Fuel, ShoppingBag, Wrench,
  CircleParking as DefaultIcon,
} from "lucide-react";

/**
 * Static icon map — icons are bound to facility ids here and never typed by
 * humans, so no invalid or nonsense icon data can enter the database.
 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  bath: Bath, armchair: Armchair, umbrella: Umbrella, house: House,
  droplets: Droplets, "battery-charging": BatteryCharging,
  coffee: Coffee, cookie: Cookie, utensils: Utensils,
  "circle-parking": CircleParking, "parking-meter": ParkingMeter,
  tent: Tent, video: Video,
  lightbulb: Lightbulb, cross: Cross, accessibility: Accessibility,
  flame: Flame,
  wifi: Wifi, smartphone: Smartphone,
  "bed-double": BedDouble, fuel: Fuel, "shopping-bag": ShoppingBag,
  wrench: Wrench,
};

/** Rider-facing display of a spot's facilities as icon chips. */
export default function FacilitiesChips({
  amenities,
  limit,
}: {
  amenities?: Array<{ id?: string; icon?: string; name?: string }>;
  limit?: number;
}) {
  const items = (amenities ?? []).filter((a) => a?.name?.trim());
  if (items.length === 0) return null;
  const shown = limit ? items.slice(0, limit) : items;
  const extra = items.length - shown.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {shown.map((a) => {
        const Icon = (a.icon ? ICON_MAP[a.icon] : undefined) ?? DefaultIcon;
        return (
          <span
            key={a.id || a.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] sm:text-xs font-medium text-muted-foreground"
            title={a.name}
          >
            <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
            {a.name}
          </span>
        );
      })}
      {extra > 0 && (
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          +{extra}
        </span>
      )}
    </div>
  );
}
