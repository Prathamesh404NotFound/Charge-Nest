/**
 * Admin Listing Reviews page (Round 9).
 * Quality layer on top of identity verification: review every new spot
 * listing before it goes live to riders.
 */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/Auth/AuthProvider";
import FacilitiesChips from "@/components/FacilitiesChips";
import AdminLayoutPage from "@/components/Admin/AdminLayoutPage";
import {
  getAllListingReviews,
  decideListingReview,
  type ListingReview,
} from "@/lib/spotReviewService";

type Filter = "all" | "pending_review" | "approved" | "rejected";

export default function AdminListingReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ListingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending_review");
  const [selected, setSelected] = useState<ListingReview | null>(null);
  const [note, setNote] = useState("");
  const [deciding, setDeciding] = useState(false);
  // Bulk actions (Round 15)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkNote, setBulkNote] = useState("");
  const [bulkDeciding, setBulkDeciding] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      setReviews(await getAllListingReviews());
    } catch (error) {
      console.error(error);
      toast.error("Failed to load listing reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchReviews();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return reviews;
    return reviews.filter(r => r.status === filter);
  }, [reviews, filter]);

  const counts = useMemo(
    () => ({
      pending: reviews.filter(r => r.status === "pending_review").length,
      approved: reviews.filter(r => r.status === "approved").length,
      rejected: reviews.filter(r => r.status === "rejected").length,
    }),
    [reviews]
  );

  const cityStats = useMemo(() => {
    const map = new Map<string, { pending: number; approved: number; rejected: number }>();
    for (const r of reviews) {
      const key = r.city || "Unknown";
      const c = map.get(key) ?? { pending: 0, approved: 0, rejected: 0 };
      if (r.status === "pending_review") c.pending += 1;
      else if (r.status === "approved") c.approved += 1;
      else if (r.status === "rejected") c.rejected += 1;
      map.set(key, c);
    }
    return [...map.entries()]
      .map(([city, v]) => ({ city, ...v, total: v.pending + v.approved + v.rejected }))
      .sort((a, b) => b.total - a.total);
  }, [reviews]);

  async function handleDecision(decision: "approved" | "rejected") {
    if (!selected || !user) return;
    if (decision === "rejected" && !note.trim()) {
      toast.error("Please add a rejection reason so the host understands the decision.");
      return;
    }
    setDeciding(true);
    try {
      const result = await decideListingReview(selected.spotId, decision, note.trim(), user.uid);
      if (result.ok) {
        toast.success(result.message);
        setNote("");
        setSelected(null);
        void fetchReviews();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Failed to record the decision");
    } finally {
      setDeciding(false);
    }
  }

  /** Bulk decision across the pending queue; per-item error isolation. */
  async function bulkDecide(decision: "approved" | "rejected") {
    if (!user) return;
    const ids = [...selectedIds].filter((id) =>
      reviews.some((r) => r.spotId === id && r.status === "pending_review")
    );
    if (ids.length === 0) return;
    if (decision === "rejected" && !bulkNote.trim()) {
      toast.error("Add one shared rejection note so every host sees what to fix.");
      return;
    }
    setBulkDeciding(true);
    let ok = 0;
    let fail = 0;
    for (const spotId of ids) {
      try {
        const result = await decideListingReview(spotId, decision, bulkNote.trim(), user.uid);
        if (result.ok) ok++;
        else fail++;
      } catch {
        fail++;
      }
    }
    setBulkNote("");
    setSelectedIds(new Set());
    if (ok) toast.success(`${ok} listing${ok > 1 ? "s" : ""} ${decision}${fail ? ` · ${fail} failed` : ""}`);
    if (fail) toast.error(`${fail} listing${fail > 1 ? "s" : ""} could not be updated`);
    setBulkDeciding(false);
    void fetchReviews();
  }

  const pendingIds = filtered.filter((r) => r.status === "pending_review").map((r) => r.spotId);
  const allPendingSelected =
    pendingIds.length > 0 && pendingIds.every((id) => selectedIds.has(id));
  const bulkCount = [...selectedIds].filter((id) => pendingIds.includes(id)).length;

  return (
    <AdminLayoutPage title="Listing Reviews" subtitle="Quality control — approve or reject new spot listings before they go live">
      <div className="space-y-6">
        {/* Queue stats strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4 text-amber-500" /> Pending
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">{counts.pending}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Approved
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">{counts.approved}</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 text-rose-500" /> Rejected
            </div>
            <div className="mt-1 text-2xl font-bold text-foreground">{counts.rejected}</div>
          </div>
          <div className="flex items-center justify-end rounded-lg border border-border bg-card p-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchReviews()}
              disabled={loading}
            >
              <RefreshCw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Per-city breakdown */}
        {cityStats.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">By city</h3>
            <div className="flex flex-wrap gap-2">
              {cityStats.map(c => (
                <div
                  key={c.city}
                  className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-xs"
                >
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{c.city}</span>
                  <Badge variant="secondary" className="gap-1 rounded-full bg-amber-100 px-2 text-amber-700 hover:bg-amber-100">
                    {c.pending} pending
                  </Badge>
                  <span className="text-muted-foreground">
                    {c.approved} approved · {c.rejected} rejected
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2">
          {(
            [
              ["pending_review", "Pending queue", counts.pending],
              ["all", "All", reviews.length],
              ["approved", "Approved", counts.approved],
              ["rejected", "Rejected", counts.rejected],
            ] as [Filter, string, number][]
          ).map(([key, label, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === key
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-border bg-background text-muted-foreground hover:border-slate-400 hover:text-foreground"
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* Bulk actions toolbar */}
        {pendingIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-600/30 bg-emerald-600/5 p-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allPendingSelected}
                onChange={(e) =>
                  setSelectedIds(e.target.checked ? new Set(pendingIds) : new Set())
                }
                className="w-4 h-4 rounded border-slate-300 accent-emerald-600"
              />
              Select {allPendingSelected ? "all" : `none`} ({pendingIds.length} pending)
            </label>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              {bulkCount > 0 ? (
                <>
                  <Textarea
                    placeholder="Shared note (rejection reason)"
                    value={bulkNote}
                    onChange={(e) => setBulkNote(e.target.value)}
                    rows={1}
                    className="min-h-8 text-xs w-56"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={bulkDeciding}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50"
                    onClick={() => void bulkDecide("rejected")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Reject {bulkCount}
                  </Button>
                  <Button
                    size="sm"
                    disabled={bulkDeciding}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => void bulkDecide("approved")}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve {bulkCount}
                  </Button>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">Select pending listings to approve or reject in bulk</span>
              )}
            </div>
          </div>
        )}

        {/* Review queue */}
        {loading ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            Loading listing reviews…
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center">
            <ShieldCheck className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {filter === "pending_review"
                ? "No new listings waiting for review. New host submissions will appear here."
                : "Nothing in this category yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map(r => {
              const isSelectable = r.status === "pending_review";
              return (
              <div key={r.spotId} className="flex flex-col rounded-lg border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    {isSelectable && (
                      <label className="mt-0.5 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(r.spotId)}
                          onChange={() =>
                            setSelectedIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(r.spotId)) next.delete(r.spotId); else next.add(r.spotId);
                              return next;
                            })
                          }
                          aria-label={`Select ${r.name} for bulk action`}
                          className="w-4 h-4 rounded border-input accent-emerald-600"
                        />
                      </label>
                    )}
                    <div>
                    <h4 className="font-semibold text-foreground">{r.name}</h4>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {r.address}, {r.city}
                    </p>
                    </div>
                  </div>
                  <Badge
                    className={
                      r.status === "pending_review"
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                        : r.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : "bg-rose-100 text-rose-700 hover:bg-rose-100"
                    }
                  >
                    {r.status === "pending_review" ? "Pending review" : r.status === "approved" ? "Approved" : "Rejected"}
                  </Badge>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                  <div><dt className="text-muted-foreground/70">Host</dt><dd className="font-medium text-foreground">{r.hostName || "—"}</dd></div>
                  <div><dt className="text-muted-foreground/70">Phone</dt><dd className="font-medium text-foreground">{r.hostPhone || "—"}</dd></div>
                  <div><dt className="text-muted-foreground/70">Outlet</dt><dd className="font-medium text-foreground">{r.outletType || "—"}</dd></div>
                  {Array.isArray(r.facilities) && r.facilities.length > 0 && (
                    <div className="col-span-2"><dt className="text-slate-400">Facilities</dt><dd><FacilitiesChips amenities={(r.facilities as string[]).map((id) => ({ id, name: id.replace(/_/g, " ") }))} /></dd></div>
                  )}
                  <div><dt className="text-muted-foreground/70">Price</dt><dd className="font-medium text-foreground">₹{r.pricePerHour}/hr</dd></div>
                  <div className="col-span-2"><dt className="text-muted-foreground/70">Verified host</dt><dd className="font-medium text-foreground">{r.isVerifiedHost ? "Yes" : "No — identity check first"}</dd></div>
                </dl>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">
                    Submitted {new Date(r.submittedAt).toLocaleString()}
                  </span>
                  <Button size="sm" onClick={() => { setSelected(r); setNote(r.rejectionReason ?? ""); }}>
                    <MessageSquareText className="mr-1 h-3.5 w-3.5" /> Review
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Decision dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) { setSelected(null); setNote(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
            <DialogDescription>
              {selected?.address}, {selected?.city} — ₹{selected?.pricePerHour}/hr · {selected?.outletType}
              <br />
              Host: {selected?.hostName} ({selected?.hostPhone || "no phone"})
              {selected?.isVerifiedHost ? (
                <span className="mt-1 block text-emerald-600">Identity verified ✓</span>
              ) : (
                <span className="mt-1 block text-amber-600">Not identity verified — verify the host in the Verifications queue first.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Textarea
              placeholder={
                filter === "rejected" ? "Rejection reason…" : "Admin note (e.g. verified photos, safety check…"
              }
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
            />
            {selected?.photos && selected.photos.length > 0 && (
              <div className="flex gap-2">
                {selected.photos.map((p, i) => (
                  <img key={i} src={p} alt={`Listing photo ${i + 1}`} className="h-20 w-20 rounded-md object-cover" />
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => void handleDecision("rejected")}
              disabled={deciding || selected?.status !== "pending_review"}
            >
              <XCircle className="mr-1 h-4 w-4" /> Reject listing
            </Button>
            <Button
              onClick={() => void handleDecision("approved")}
              disabled={deciding || selected?.status !== "pending_review"}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> Approve & go live
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayoutPage>
  );
}
