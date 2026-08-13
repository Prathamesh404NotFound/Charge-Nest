// Round 19: dark-safe utility color classes.
// Tailwind arbitrary fixed colors (text-green-600, hover:bg-red-50 ...) are nearly
// invisible on dark backgrounds. These helpers use HSL theme tokens so badges and
// status text stay legible in both light and dark mode.

import { isDark } from "@/lib/theme";

// Booking / payout / status text colors — works in light AND dark mode.
export function statusTextColor(status: string): string {
  const dark = isDark();
  switch (status) {
    case "completed":
    case "approved":
    case "paid_out":
      return dark ? "text-[hsl(var(--ev-green))]" : "text-green-600";
    case "pending":
    case "requested":
    case "processing":
      return dark ? "text-[hsl(var(--warning))]" : "text-amber-600";
    case "cancelled":
    case "rejected":
      return dark ? "text-[hsl(var(--destructive))]" : "text-red-600";
    default:
      return "text-muted-foreground";
  }
}

// Danger button outline (cancel payout / reject) — works in light AND dark mode.
export function dangerOutlineClasses(): string {
  const dark = isDark();
  return dark
    ? "border-red-500/40 text-red-400 hover:bg-red-500/10"
    : "border-red-200 text-red-600 hover:bg-red-50";
}

// Success money amounts (earnings, CO2, refunds) — works in light AND dark mode.
export function successTextClasses(): string {
  const dark = isDark();
  return dark ? "text-[hsl(var(--ev-green))]" : "text-green-600";
}

// Small red notification dot — works in light AND dark mode.
export function dotRedClasses(): string {
  const dark = isDark();
  return dark ? "bg-red-500 text-white" : "bg-red-500 text-white";
}
