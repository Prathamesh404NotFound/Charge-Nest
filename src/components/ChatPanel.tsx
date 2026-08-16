import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  getOrCreateThread, listenMessages, sendMessage,
  ChatMessage, formatChatTime,
} from "@/lib/chatService";

interface ChatPanelProps {
  /** The booking request id becomes the chat thread id. */
  threadId: string;
  peerName: string;
  peerPhone?: string;
  spotName?: string;
  /** Optional host/spot ids so the host-side inbox (listenHostThreads) can find this thread. */
  hostId?: string;
  spotId?: string;
  compact?: boolean;
}

/**
 * In-app rider–host chat tied to a booking. Both sides see the same thread.
 * The thread is lazily created on first message; reads are live (onValue).
 */
export default function ChatPanel({ threadId, peerName, peerPhone, spotName, hostId, spotId, compact }: ChatPanelProps) {
  const { user } = useAuth() as { user: { id: string; displayName?: string } | null };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [ready, setReady] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        await getOrCreateThread(threadId, {
          spotId: spotId || "", riderId: user.id, riderName: user.displayName,
          hostId: hostId || "",
        });
      } catch {
        // thread may already exist with richer meta — ignore
      }
      if (cancelled) return;
      setReady(true);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId, user]);

  useEffect(() => {
    if (!ready) return;
    return listenMessages(threadId, setMessages);
  }, [ready, threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, expanded]);

  if (!user) return null;

  const isMine = (m: ChatMessage) => m.senderId === user.id;

  const handleSend = async () => {
    if (sending || !text.trim()) return;
    setSending(true);
    try {
      await sendMessage(threadId, { uid: user.id, name: user.displayName }, text);
      setText("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const body = (
    <>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <p className="text-sm font-medium text-foreground">
          Chat with {peerName}
          {spotName ? <span className="text-muted-foreground"> · {spotName}</span> : null}
        </p>
        {peerPhone ? (
          <a href={`tel:${peerPhone}`} className="text-xs text-primary hover:underline">
            {peerPhone}
          </a>
        ) : null}
      </div>
      <div ref={scrollRef} className={`overflow-y-auto p-3 space-y-2 ${compact ? "h-64" : "h-96"}`}>
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground text-xs space-y-2">
            <MessageCircle className="w-8 h-8 opacity-40" />
            <p>No messages yet. Introduce yourself — keep chat polite and booking-related.</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`flex ${isMine(m) ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
                isMine(m)
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                {!isMine(m) ? (
                  <p className="text-[10px] opacity-70 mb-0.5 font-medium">{m.senderName || peerName}</p>
                ) : null}
                <p className="whitespace-pre-wrap break-words">{m.text}</p>
                <p className={`text-[10px] mt-0.5 ${isMine(m) ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {formatChatTime(m.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      <form
        className="p-3 border-t border-border flex items-center gap-2"
        onSubmit={(e) => { e.preventDefault(); void handleSend(); }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 1000))}
          placeholder="Type a message…"
          maxLength={1000}
          className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Chat message"
        />
        <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label="Send message">
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </>
  );

  if (compact) {
    return (
      <div className="rounded-xl border border-border overflow-hidden bg-card">
        <button
          type="button"
          className="w-full flex items-center justify-between p-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Chat with host
          </span>
          <span className="text-xs text-muted-foreground">{expanded ? "Hide" : "Show"}</span>
        </button>
        {expanded ? body : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      {body}
      <div className="px-3 pb-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
        Chat is only visible to you and the host for this booking.
      </div>
    </div>
  );
}
