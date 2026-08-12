import { Check, Lightbulb } from "lucide-react";
import { FACILITIES, FACILITY_CATEGORIES } from "@/lib/facilities";
import FacilitiesChips from "@/components/FacilitiesChips";

/**
 * No-free-text facility picker. Hosts can only toggle items from the curated
 * catalog — there is no text input, so nonsense values can never be stored.
 */
export default function FacilityPicker({
  selected,
  onChange,
  compact = false,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  compact?: boolean;
}) {
  const toggle = (id: string) => {
    onChange(
      selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id]
    );
  };

  const preview = selected
    .map((id) => FACILITIES.find((f) => f.id === id))
    .filter(Boolean) as Array<{ id: string; icon: string; name: string }>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="block text-sm font-medium">Facilities & Amenities</label>
        <span className="text-xs text-muted-foreground">Optional — help riders choose your spot</span>
      </div>

      {FACILITY_CATEGORIES.map((cat) => {
        const catFacilities = FACILITIES.filter((f) => f.category === cat.id);
        return (
          <div key={cat.id}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{cat.label}</p>
            <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
              {catFacilities.map((f) => {
                const active = selected.includes(f.id);
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggle(f.id)}
                    title={f.description}
                    className={`relative flex items-start gap-2 rounded-xl border-2 p-2.5 text-left transition-all ${
                      active
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border hover:border-primary/40 bg-card"
                    }`}
                    aria-pressed={active}
                  >
                    <FacilitiesChips amenities={[{ id: f.id, icon: f.icon, name: f.name }]} />
                    <span className="flex-1 min-w-0 pt-0.5">
                      <span className={`block text-xs font-medium leading-tight ${active ? "text-primary" : "text-foreground"}`}>
                        {f.name}
                      </span>
                      {!compact && (
                        <span className="block text-[10px] leading-tight text-muted-foreground mt-0.5">{f.description}</span>
                      )}
                    </span>
                    {active && (
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {preview.length > 0 && (
        <div className="rounded-xl bg-muted/50 border border-border p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Lightbulb className="w-3.5 h-3.5" />
            Riders will see ({preview.length} selected)
          </div>
          <FacilitiesChips amenities={preview} />
        </div>
      )}
    </div>
  );
}
