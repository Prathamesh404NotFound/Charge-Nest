import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getAllVerificationCases,
  decideVerificationCase,
  HostVerificationCase,
} from "../../lib/hostVerificationService";
import AdminRoute from "../../components/Admin/AdminRoute";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { ShieldCheck, ShieldX, RefreshCw, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

const STATUS_META: Record<string, { label: string; tone: string }> = {
  new: { label: "New", tone: "bg-sky-100 text-sky-700" },
  documents_submitted: { label: "Documents Submitted", tone: "bg-amber-100 text-amber-700" },
  pending_review: { label: "In Review", tone: "bg-violet-100 text-violet-700" },
  verified: { label: "Verified", tone: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", tone: "bg-rose-100 text-rose-700" },
};

const DOC_LABELS: Record<string, string> = {
  aadhaar: "Aadhaar",
  pan: "PAN Card",
  electricity_bill: "Electricity Bill",
  photo_id: "Photo ID",
  other: "Other Document",
};

type Filter = "all" | "pending" | "decided";

export default function AdminVerificationsPage() {
  const [cases, setCases] = useState<HostVerificationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [deciding, setDeciding] = useState<string | null>(null);
  const [note, setNote] = useState("");
  // Bulk actions (Round 15): multi-select across the current filter
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkNote, setBulkNote] = useState("");
  const [bulkDeciding, setBulkDeciding] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const all = await getAllVerificationCases();
      setCases(all);
    } catch (error: any) {
      toast.error("Could not load verification queue: " + (error?.message || error));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(verificationId: string, decision: "verified" | "rejected") {
    if (!note.trim() && decision === "rejected") {
      toast.warning("Please add a short reason so the host knows what to fix");
      return;
    }
    setDeciding(verificationId);
    try {
      await decideVerificationCase(verificationId, decision, note.trim() || undefined);
      toast.success(decision === "verified" ? "Host verified — trust badge granted" : "Case rejected");
      setNote("");
      await load();
    } catch (error: any) {
      toast.error("Decision failed: " + (error?.message || error));
    } finally {
      setDeciding(null);
    }
  }

  /** Bulk decision: runs decisions sequentially (RTDB has no transaction
   *  batch for multiple paths), with per-item error isolation. */
  async function bulkDecide(decision: "verified" | "rejected") {
    const ids = [...selected].filter((id) => cases.some((c) => c.id === id));
    if (ids.length === 0) return;
    if (decision === "rejected" && !bulkNote.trim()) {
      toast.warning("Add one shared rejection note so every host sees what to fix");
      return;
    }
    setBulkDeciding(true);
    let ok = 0;
    let fail = 0;
    for (const id of ids) {
      try {
        await decideVerificationCase(id, decision, bulkNote.trim() || undefined);
        ok++;
      } catch {
        fail++;
      }
    }
    setBulkNote("");
    setSelected(new Set());
    if (ok) toast.success(`${ok} case${ok > 1 ? "s" : ""} ${decision === "verified" ? "verified" : "rejected"}${fail ? ` · ${fail} failed` : ""}`);
    if (fail) toast.error(`${fail} case${fail > 1 ? "s" : ""} could not be updated`);
    setBulkDeciding(false);
    await load();
  }

  const filtered = cases.filter((c) =>
    filter === "all" ? true : filter === "pending" ? !["verified", "rejected"].includes(c.status) : ["verified", "rejected"].includes(c.status)
  );

  const pendingCount = cases.filter((c) => !["verified", "rejected"].includes(c.status)).length;

  const selectable = filtered.filter((c) => !["verified", "rejected"].includes(c.status));
  const selectableIds = selectable.map((c) => c.id);
  const allSelected = selectable.length > 0 && selectableIds.every((id) => selected.has(id));
  const selectedIds = [...selected].filter((id) => selectableIds.includes(id));

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold">Host Verification Queue</h1>
            <p className="text-sm text-muted-foreground">
              Review identity documents, approve trusted hosts, or ask them to fix issues.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "decided"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {f === "all" ? `All (${cases.length})` : f === "pending" ? `Pending (${pendingCount})` : "Decided"}
            </button>
          ))}
        </div>

        {/* Bulk actions toolbar */}
        {selectable.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="py-3 flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) =>
                    setSelected(e.target.checked ? new Set(selectableIds) : new Set())
                  }
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                Select {allSelected ? "all" : `none`} ({selectable.length} pending)
              </label>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                {selectedIds.length > 0 ? (
                  <>
                    <Textarea
                      placeholder="Shared note (e.g. rejection reason)"
                      value={bulkNote}
                      onChange={(e) => setBulkNote(e.target.value)}
                      rows={1}
                      className="min-h-8 text-xs w-56"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={bulkDeciding}
                      className="border-rose-200 text-rose-600 hover:bg-rose-50"
                      onClick={() => bulkDecide("rejected")}
                    >
                      <ShieldX className="w-3.5 h-3.5 mr-1" /> Reject {selectedIds.length}
                    </Button>
                    <Button
                      size="sm"
                      disabled={bulkDeciding}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() => bulkDecide("verified")}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Approve {selectedIds.length}
                    </Button>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">Select cases, then approve or reject in bulk</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">Loading queue…</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                {cases.length === 0
                  ? "No verification cases yet — hosts will appear here once they submit documents."
                  : "Nothing in this filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {filtered.map((c) => {
              const isSelectable = !["verified", "rejected"].includes(c.status);
              return (
                <VerificationCard
                  key={c.id}
                  c={c}
                  deciding={deciding === c.id}
                  onDecide={decide}
                  note={note}
                  setNote={setNote}
                  selectable={isSelectable}
                  isSelected={selected.has(c.id)}
                  onToggle={() =>
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (next.has(c.id)) next.delete(c.id); else next.add(c.id);
                      return next;
                    })
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </AdminRoute>
  );
}

function VerificationCard({
  c,
  deciding,
  onDecide,
  note,
  setNote,
  selectable = false,
  isSelected = false,
  onToggle,
}: {
  c: HostVerificationCase;
  deciding: boolean;
  onDecide: (id: string, decision: "verified" | "rejected") => void;
  note: string;
  setNote: (v: string) => void;
  selectable?: boolean;
  isSelected?: boolean;
  onToggle?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[c.status] || STATUS_META.new;
  const submittedAt = c.submittedAt ? new Date(c.submittedAt).toLocaleString("en-IN") : "—";

  return (
    <>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              {selectable && (
                <label className="mt-0.5 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle?.()}
                    aria-label={`Select ${c.userName || "case"} for bulk action`}
                    className="w-4 h-4 rounded border-border accent-primary"
                  />
                </label>
              )}
              <div>
              <CardTitle className="text-base">{c.userName || "Unknown Host"}</CardTitle>
              <CardDescription className="space-y-0.5">
                <p>{c.userEmail || "no email"}</p>
                <p className="text-xs">{c.userPhone || "no phone"}</p>
              </CardDescription>
              </div>
            </div>
            <Badge className={meta.tone}>{meta.label}</Badge>
          </div>
          {c.registrationId && (
            <p className="mt-1 text-xs text-muted-foreground">
              Linked registration: <code className="rounded bg-secondary px-1 py-0.5">{c.registrationId.slice(0, 12)}…</code>
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Documents ({c.documents?.length || 0})
            </p>
            <ul className="space-y-1.5">
              {(c.documents || []).map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="font-medium">{DOC_LABELS[d.type] || d.type}</span>
                    {d.label && d.label !== d.type ? ` — ${d.label}` : ""}
                    {d.documentNumber ? (
                      <span className="text-muted-foreground"> · {maskDocumentNumber(d.documentNumber)}</span>
                    ) : null}
                    {d.note ? <span className="block text-xs text-muted-foreground">{d.note}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> Submitted {submittedAt}
          </p>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setOpen(true)}>
              Review & Decide
            </Button>
            {(c.status === "verified" || c.status === "rejected") && (
              <Badge variant="outline" className="flex items-center gap-1">
                {c.status === "verified" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                )}
                {c.status === "verified" ? "Verified host" : "Rejected"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review {c.userName}</DialogTitle>
            <DialogDescription>
              Decide whether this host's identity documents are sufficient to earn the verified trust
              badge. Approval also promotes the host and (if linked) approves their pending registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Documents:</span>{" "}
              {(c.documents || []).map((d) => DOC_LABELS[d.type] || d.type).join(", ") || "none"}
            </p>
            {c.registrationId && (
              <p className="text-xs text-muted-foreground">
                Approving will also approve linked registration {c.registrationId.slice(0, 12)}…
              </p>
            )}
            <Textarea
              placeholder="Admin note (required for rejection — e.g. 'Aadhaar image unreadable, please resubmit')"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onDecide(c.id, "rejected")}
              disabled={deciding}
              className="text-rose-600 hover:text-rose-700"
            >
              <ShieldX className="mr-1 h-4 w-4" /> Reject
            </Button>
            <Button
              onClick={() => onDecide(c.id, "verified")}
              disabled={deciding}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <ShieldCheck className="mr-1 h-4 w-4" /> Approve & Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function maskDocumentNumber(n: string) {
  if (n.length <= 4) return n;
  return "•".repeat(n.length - 4) + n.slice(-4);
}
