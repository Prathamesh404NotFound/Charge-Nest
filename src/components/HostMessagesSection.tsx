/* VoltSetu Round 36 — host-side booking messages inbox.
 *
 * Hosts see every open rider conversation for bookings on their spots via the
 * existing chatService (listenHostThreads + ChatPanel). Threads list, latest
 * message preview, unread-ish highlight for new messages, and an expandable
 * in-place chat for each thread.
 */
import { useEffect, useState } from "react";
import { MessageCircle, Loader2, Inbox, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  listenHostThreads,
  ChatThread,
  formatChatTime,
} from "@/lib/chatService";
import ChatPanel from "@/components/ChatPanel";

export default function HostMessagesSection({ hostUid }: { hostUid: string }) {
  const { user } = useAuth() as { user: { id: string; displayName?: string } | null };
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [openThread, setOpenThread] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user || !hostUid) return;
    const unlisten = listenHostThreads(hostUid, (list) => {
      setThreads(list);
      setReady(true);
    });
    return () => {
      unlisten();
    };
  }, [user, hostUid]);

  const activeThreads = threads.filter((t) => t.riderId);

  return (
    <Card className="rounded-2xl overflow-hidden">
      <CardHeader className="bg-primary/5">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" /> Booking Messages
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          In-app conversations with riders for bookings on your spots — no phone numbers needed.
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {!ready ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Loading conversations…
          </p>
        ) : activeThreads.length === 0 ? (
          <div className="text-center py-6">
            <Inbox className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No booking messages yet.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              When a rider books one of your spots, they can start chatting right here.
            </p>
          </div>
        ) : (
          activeThreads.map((t) => {
            const open = openThread === t.id;
            const peerName = t.riderName || "Rider";
            const lastAt = t.lastMessage?.createdAt ?? t.createdAt;
            return (
              <div key={t.id} className="rounded-xl border border-border overflow-hidden bg-background/50">
                <button
                  type="button"
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                  onClick={() => setOpenThread(open ? null : t.id)}
                  aria-expanded={open}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{peerName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.spotName || "Charging spot"}
                      {t.lastMessage ? (
                        <span> · <span className="italic">{t.lastMessage.text}</span></span>
                      ) : null}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">{formatChatTime(lastAt)}</p>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground mx-auto mt-0.5 transition-transform ${open ? "rotate-180" : ""}`} />
                  </div>
                </button>
                {open ? (
                  <ChatPanel
                    threadId={t.id}
                    peerName={peerName}
                    peerPhone={t.riderPhone}
                    spotName={t.spotName}
                  />
                ) : null}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
