import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./lib/firebase";

/* ---------- PWA hardening ---------- */
if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        console.log("VoltSetu SW registered:", registration.scope);
      })
      .catch((error) => {
        console.warn("VoltSetu SW registration failed:", error);
      });
  });
}

/* Persist the PWA install prompt so the app can offer a native install CTA. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

let pendingInstallEvent: BeforeInstallPromptEvent | null = null;

window.addEventListener("beforeinstallprompt", (event: Event) => {
  event.preventDefault();
  pendingInstallEvent = event as BeforeInstallPromptEvent;
});

export function getPwaInstallEvent(): BeforeInstallPromptEvent | null {
  return pendingInstallEvent;
}

export function consumePwaInstallEvent(): BeforeInstallPromptEvent | null {
  const event = pendingInstallEvent;
  pendingInstallEvent = null;
  return event;
}
/* -------------------------------- */

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

