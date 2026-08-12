import { useEffect, useState } from "react";
import { MessageCircle, Send, Loader2, Clock, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  listenHostThreads, sendMessage, listenMessages,
  getOrCreateThread, ChatThread, ChatMessage, formatChatTime,
} from "@/lib/chatService";

/**
 * Host-side chat inbox: lists all booking threads for the host's spots and
 * opens any thread for live messaging. Riders see the same threads via
 * ChatPanel on their booking cards.
 */
export default function HostChatInbox() {
  const { user } = useAuth() as { user: { id: string; displayName?: string } | null };
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [hydrating, setHydrating] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsub = listenHostThreads(user.id, setThreads);
    return unsub;
  }, [user]);

  const openThread = async (threadId: string) => {
    setActiveId(threadId);
    setHydrating(true);
    try {
      const existing = await getOrCreateThread(threadId, {
        spotId: "", riderId: "", hostId: user?.id ?? "",
      });
      void existing;
      const unsub = listenMessages(threadId, setMessages);
      (window as any).__hostChatUnsub?.();
      (window as any).__hostChatUnsub = unsub;
    } finally {
      setHydrating(false);
    }
  };

  useEffect(() => {
    return () => { (window as any).__hostChatUnsub?.(); };
  }, []);

  const handleSend = async () => {
    if (!user || sending || !text.trim() || !activeId) return;
    setSending(true);
    try {
      await sendMessage(activeId, { uid: user.id, name: user.displayName }, text);
      setText("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (!user) return null;

  const active = threads.find(t => t.id === activeId);
  const isMine = (m: ChatMessage) => m.senderId === user.id;

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-4 border border-border rounded-xl overflow-hidden bg-card">
      {/* Thread list */}
      <div className="border-r border-border max-h-[520px] overflow-y-auto">
        <div className="p-3 border-b border-border flex items-center gap-2 sticky top-0 bg-card">
          <MessageCircle className="w-4 h-4 text-primary" />
          <p className="text-sm font-semibold text-foreground">Rider Chats</p>
          <span className="ml-auto text-xs text-muted-foreground">{threads.length}</span>
        </div>
        {threads.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No conversations yet. Riders can message you from their booking cards once they book.
          </div>
        ) : (
          threads.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => void openThread(t.id)}
              className={`w-full text-left p-3 border-b border-border hover:bg-muted/50 transition-colors ${
                activeId === t.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground truncate">{t.riderName || "Rider"}</p>
                {t.lastMessage ? (
                  <span className="text-[10px] text-muted-foreground">{formatChatTime(t.lastMessage.createdAt)}</span>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground truncate">{t.lastMessage?.text ?? "No messages yet"}</p>
              <p className="text-[10px] text-primary mt-0.5 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />{t.spotName || "booking"}
              </p>
            </button>
          ))
        )}
      </div>

      {/* Message view */}
      <div className="flex flex-col h-[520px] max-h-[520px]">
        {!active ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-8">
            <MessageCircle className="w-10 h-10 opacity-40 mb-3" />
            <p className="text-sm">Select a conversation to start chatting.</p>
          </div>
        ) : (
          <>
            <div className="p-3 border-b border-border flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{active.riderName || "Rider"}</p>
                <p className="text-xs text-muted-foreground">{active.spotName || active.riderPhone || ""}</p>
              </div>
              <div className="flex items-center gap-2">
                {active.riderPhone ? (
                  <a href={`tel:${active.riderPhone}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <ExternalLink className="w-3 h-3" />Call
                  </a>
                ) : null}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {hydrating ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-muted-foreground">
                  <MessageCircle className="w-8 h-8 opacity-40 mb-2" />
                  Say hello — keep chat polite and booking-related.
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={`flex ${isMine(m) ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                      isMine(m)
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}>
                      {!isMine(m) ? (
                        <p className="text-[10px] opacity-70 mb-0.5 font-medium">{m.senderName || "Rider"}</p>
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
        )}
      </div>
    </div>
  );
}
