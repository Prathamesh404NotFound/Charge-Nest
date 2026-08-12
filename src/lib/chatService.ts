import { database } from "./firebase-services";
import {
  ref, set, onValue, serverTimestamp, push, get
} from "firebase/database";
import { sanitizeForDb } from "./bookingService";

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName?: string;
  text: string;
  createdAt: number;
}

export interface ChatThread {
  id: string; // booking requestId
  spotId: string;
  spotName?: string;
  hostId: string;
  hostName?: string;
  hostPhone?: string;
  riderId: string;
  riderName?: string;
  riderPhone?: string;
  createdAt: number;
  lastMessage?: ChatMessage;
}

/** Thread key = the booking request id, so chat is always tied to a booking. */
function threadRef(threadId: string) {
  return ref(database, `bookingChat/${threadId}`);
}

function messagesRef(threadId: string) {
  return ref(database, `bookingChat/${threadId}/messages`);
}

/** Create a chat thread when a booking exists (idempotent). */
export async function getOrCreateThread(threadId: string, data: {
  spotId: string; spotName?: string; hostId: string; hostName?: string; hostPhone?: string;
  riderId: string; riderName?: string; riderPhone?: string;
}): Promise<string> {
  const metaRef = ref(database, `bookingChat/${threadId}`);
  const snap = await get(metaRef);
  if (!snap.exists()) {
    await set(metaRef, sanitizeForDb({
      ...data,
      createdAt: Date.now(),
      openedAt: serverTimestamp(),
    }));
  }
  return threadId;
}

/** Send a message into a booking thread. */
export async function sendMessage(
  threadId: string, sender: { uid: string; name?: string }, text: string
): Promise<string> {
  const trimmed = String(text ?? "").trim().slice(0, 1000);
  if (!trimmed) throw new Error("Message cannot be empty");
  const msgRef = push(messagesRef(threadId));
  const msg = {
    threadId,
    senderId: sender.uid,
    senderName: sender.name ?? "",
    text: trimmed,
    createdAt: Date.now(),
    sentAt: serverTimestamp(),
  };
  await set(msgRef, sanitizeForDb(msg));
  return msgRef.key ?? "";
}

/** Live listener for a thread's messages. */
export function listenMessages(
  threadId: string,
  cb: (messages: ChatMessage[]) => void
): () => void {
  let disposed = false;
  const un = onValue(messagesRef(threadId), (snap) => {
    if (disposed) return;
    if (!snap.exists()) return cb([]);
    const msgs = Object.entries(snap.val() as Record<string, any>)
      .map(([id, m]) => ({ id, ...m } as ChatMessage))
      .sort((a, b) => a.createdAt - b.createdAt);
    cb(msgs);
  });
  return () => { disposed = true; un(); };
}

/** Load all chat threads relevant to a host (threads for their spots). */
export async function getHostThreads(hostUid: string): Promise<ChatThread[]> {
  const snap = await get(ref(database, "bookingChat"));
  if (!snap.exists()) return [];
  const out: ChatThread[] = [];
  for (const [id, t] of Object.entries(snap.val() as Record<string, any>)) {
    if (t.hostId !== hostUid) continue;
    const msgs = t.messages
      ? Object.values(t.messages as Record<string, any>)
          .map(m => ({ ...m } as ChatMessage))
          .sort((a, b) => b.createdAt - a.createdAt)[0]
      : undefined;
    out.push({ id, ...t, lastMessage: msgs });
  }
  return out.sort((a, b) => (b.lastMessage?.createdAt ?? b.createdAt) - (a.lastMessage?.createdAt ?? a.createdAt));
}

/** Live listener for host threads (refreshes when new threads/messages appear). */
export function listenHostThreads(hostUid: string, cb: (threads: ChatThread[]) => void): () => void {
  let disposed = false;
  const un = onValue(ref(database, "bookingChat"), (snap) => {
    if (disposed) return;
    if (!snap.exists()) return cb([]);
    const out: ChatThread[] = [];
    for (const [id, t] of Object.entries(snap.val() as Record<string, any>)) {
      if (t.hostId !== hostUid) continue;
      const msgs = t.messages
        ? Object.values(t.messages as Record<string, any>)
            .map(m => ({ ...m } as ChatMessage))
            .sort((a, b) => b.createdAt - a.createdAt)[0]
        : undefined;
      out.push({ id, ...t, lastMessage: msgs });
    }
    cb(out.sort((a, b) => (b.lastMessage?.createdAt ?? b.createdAt) - (a.lastMessage?.createdAt ?? a.createdAt)));
  });
  return () => { disposed = true; un(); };
}

export function formatChatTime(ts: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
