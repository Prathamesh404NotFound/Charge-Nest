import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  CalendarRange,
  CheckCircle2,
  IndianRupee,
  Loader2,
  ReceiptText,
  RefreshCw,
  Users,
  Wallet,
} from "lucide-react";
import { get, push, ref, serverTimestamp, update } from "firebase/database";
import { database } from "@/lib/firebase-services";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface BookingRow {
  id: string;
  spotId: string;
  spotName: string;
  hostId: string;
  hostName: string;
  hostPhone: string;
  userId: string;
  userName: string;
  duration: number;
  pricePerHour: number;
  estimatedCost: number;
  status: string;
  requestedAt: number;
  city: string;
}

interface PayoutRecord {
  id: string;
  hostId: string;
  amount: number;
  status: "paid" | "pending" | "adjusted";
  paidAt?: number;
  createdAt: number;
  note?: string;
}

interface HostLedger {
  hostId: string;
  hostName: string;
  hostPhone: string;
  spots: Set<string>;
  spotCount: number;
  completedBookings: number;
  billableMinutes: number;
  grossEarnings: number;
  paidOut: number;
  pendingPayout: number;
  payouts: PayoutRecord[];
}

function asNumber(ts: unknown): number {
  if (typeof ts === "number") return ts;
  if (ts && typeof ts === "object" && "valueOf" in (ts as object)) {
    const v = (ts as { valueOf?: () => unknown }).valueOf?.();
    if (typeof v === "number") return v;
  }
  return 0;
}

export default function AdminPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [filter, setFilter] = useState<"all" | "due" | "cleared">("all");

  async function loadData() {
    setLoading(true);
    try {
      const [spotsSnap, requestsSnap, payoutsSnap] = await Promise.all([
        get(ref(database, "chargingSpots")),
        get(ref(database, "chargingRequests")),
        get(ref(database, "payouts")),
      ]);

      const spotMap = new Map<string, { hostId: string; hostName: string; hostPhone: string; name: string; city: string }>();
      if (spotsSnap.exists()) {
        Object.keys(spotsSnap.val()).forEach((id) => {
          const s = spotsSnap.val()[id];
          spotMap.set(id, {
            hostId: s.hostId,
            hostName: s.hostName || "",
            hostPhone: s.hostPhone || "",
            name: s.name || "",
            city: s.city || "",
          });
        });
      }

      const rows: BookingRow[] = [];
      if (requestsSnap.exists()) {
        Object.keys(requestsSnap.val()).forEach((uid) => {
          Object.keys(requestsSnap.val()[uid]).forEach((bid) => {
            const b = requestsSnap.val()[uid][bid];
            const spot = spotMap.get(b.spotId);
            rows.push({
              id: bid,
              spotId: b.spotId || "",
              spotName: b.spotName || spot?.name || "Unknown spot",
              hostId: spot?.hostId || "",
              hostName: b.hostName || spot?.hostName || "Unknown host",
              hostPhone: spot?.hostPhone || b.hostPhone || "",
              userId: uid,
              userName: b.userName || "Rider",
              duration: Number(b.duration) || 0,
              pricePerHour: Number(b.pricePerHour) || 0,
              estimatedCost: Number(b.estimatedCost) || 0,
              status: b.status || "pending",
              requestedAt: asNumber(b.requestedAt),
              city: b.city || spot?.city || "",
            });
          });
        });
      }

      const payoutRows: PayoutRecord[] = [];
      if (payoutsSnap.exists()) {
        Object.keys(payoutsSnap.val()).forEach((hostId) => {
          Object.keys(payoutsSnap.val()[hostId]).forEach((pid) => {
            const p = payoutsSnap.val()[hostId][pid];
            payoutRows.push({
              id: pid,
              hostId,
              amount: Number(p.amount) || 0,
              status: p.status || "pending",
              paidAt: asNumber(p.paidAt),
              createdAt: asNumber(p.createdAt),
              note: typeof p.note === "string" ? p.note : undefined,
            });
          });
        });
      }

      setBookings(rows);
      setPayouts(payoutRows);
    } catch (error) {
      console.error("Failed to load payout data:", error);
      toast.error("Could not load payout data. Please retry.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const ledgers = useMemo(() => {
    const map = new Map<string, HostLedger>();
    bookings.forEach((b) => {
      if (!b.hostId || !b.spotId) return;
      const ledger =
        map.get(b.hostId) ||
        {
          hostId: b.hostId,
          hostName: b.hostName,
          hostPhone: b.hostPhone,
          spots: new Set<string>(),
          spotCount: 0,
          completedBookings: 0,
          billableMinutes: 0,
          grossEarnings: 0,
          paidOut: 0,
          pendingPayout: 0,
          payouts: [],
        };
      ledger.spots.add(b.spotId);
      ledger.spotCount = ledger.spots.size;
      if (b.status === "completed" || b.status === "approved") {
        ledger.completedBookings += 1;
        ledger.billableMinutes += b.duration;
        ledger.grossEarnings +=
          b.estimatedCost > 0 ? b.estimatedCost : (b.pricePerHour * b.duration) / 60;
      }
      map.set(b.hostId, ledger);
    });
    payouts.forEach((p) => {
      const ledger =
        map.get(p.hostId) ||
        {
          hostId: p.hostId,
          hostName: "Host (no bookings)",
          hostPhone: "",
          spots: new Set<string>(),
          spotCount: 0,
          completedBookings: 0,
          billableMinutes: 0,
          grossEarnings: 0,
          paidOut: 0,
          pendingPayout: 0,
          payouts: [],
        };
      if (p.status === "paid") ledger.paidOut += p.amount;
      else ledger.pendingPayout += p.amount;
      ledger.payouts.push(p);
      map.set(p.hostId, ledger);
    });

    return Array.from(map.values()).sort((a, b) => b.grossEarnings - a.grossEarnings);
  }, [bookings, payouts]);

  const filtered = useMemo(() => {
    if (filter === "due") return ledgers.filter((l) => l.pendingPayout > 0);
    if (filter === "cleared") return ledgers.filter((l) => l.pendingPayout === 0 && l.grossEarnings > 0);
    return ledgers;
  }, [ledgers, filter]);

  const totals = useMemo(
    () => ({
      hosts: ledgers.length,
      gross: ledgers.reduce((acc, l) => acc + l.grossEarnings, 0),
      pending: ledgers.reduce((acc, l) => acc + l.pendingPayout, 0),
      paid: ledgers.reduce((acc, l) => acc + l.paidOut, 0),
    }),
    [ledgers]
  );

  async function markPaid(hostId: string, hostName: string, amount: number) {
    if (amount <= 0) {
      toast.error("Nothing due for this host right now.");
      return;
    }
    try {
      const payoutRef = push(ref(database, `payouts/${hostId}`));
      await set(payoutRef, {
        hostId,
        amount: Math.round(amount * 100) / 100,
        status: "paid",
        paidAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        note: "Marked paid from VoltSetu admin workspace",
      });
      toast.success(`Payout of ₹${amount.toFixed(2)} recorded for ${hostName}`);
      await loadData();
    } catch (error) {
      console.error("Payout write failed:", error);
      toast.error("Could not record payout. Please retry.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary" />
            Payout Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Host earnings computed from approved and completed booking sessions (pricePerHour × duration).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData()}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          {loading ? "Syncing…" : "Refresh"}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Hosts in ledger", value: String(totals.hosts), icon: Users },
          { label: "Gross host earnings", value: `₹${totals.gross.toFixed(2)}`, icon: IndianRupee },
          { label: "Pending payout", value: `₹${totals.pending.toFixed(2)}`, icon: ReceiptText },
          { label: "Already paid", value: `₹${totals.paid.toFixed(2)}`, icon: CheckCircle2 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <stat.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <p className="mt-2 text-xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "due", "cleared"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "All hosts" : f === "due" ? "Payment due" : "Cleared"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading payout ledger…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/40 py-16 text-center text-muted-foreground">
          <ArrowDownToLine className="mx-auto mb-3 h-8 w-8 opacity-50" />
          <p className="font-medium">
            {filter === "all"
              ? "No payout activity yet — earnings appear here once bookings are approved or completed."
              : filter === "due"
              ? "All hosts are clear. No pending payouts."
              : "No fully cleared hosts yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ledger) => (
            <div key={ledger.hostId} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-foreground">{ledger.hostName}</h3>
                  <p className="text-xs text-muted-foreground">
                    {ledger.hostPhone || "No phone on file"} · {ledger.spotCount} spot
                    {ledger.spotCount === 1 ? "" : "s"} · {ledger.city ? `${ledger.city}, ` : ""}
                    {ledger.completedBookings} approved/completed session
                    {ledger.completedBookings === 1 ? "" : "s"} · {Math.round(ledger.billableMinutes / 60 * 10) / 10}h
                    billed
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Gross earnings</p>
                  <p className="text-xl font-bold text-foreground">₹{ledger.grossEarnings.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  Paid out: <strong className="text-foreground">₹{ledger.paidOut.toFixed(2)}</strong>
                </span>
                <span className="text-sm text-muted-foreground">
                  Due now:{" "}
                  <strong className={ledger.pendingPayout > 0 ? "text-ev-green" : "text-foreground"}>
                    ₹{ledger.pendingPayout.toFixed(2)}
                  </strong>
                </span>
                <span className="ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    disabled={ledger.pendingPayout <= 0}
                    onClick={() => markPaid(ledger.hostId, ledger.hostName, ledger.pendingPayout)}
                  >
                    <CalendarRange className="h-4 w-4" />
                    Mark Paid ₹{ledger.pendingPayout.toFixed(2)}
                  </Button>
                </span>
              </div>

              {ledger.payouts.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {ledger.payouts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between rounded-md bg-background px-3 py-2 text-xs">
                      <span className="text-muted-foreground">
                        {p.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-ev-green">
                            <CheckCircle2 className="h-3 w-3" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-500">
                            <ReceiptText className="h-3 w-3" /> Pending
                          </span>
                        )}
                        <span className="ml-2">₹{p.amount.toFixed(2)}</span>
                        <span className="ml-2">
                          {p.paidAt
                            ? new Date(p.paidAt).toLocaleString()
                            : `created ${new Date(p.createdAt).toLocaleString()}`}
                        </span>
                      </span>
                      {p.note && <span className="max-w-[45%] truncate text-muted-foreground/70">{p.note}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
