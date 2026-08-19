/**
 * ScrollExpandHero — landing page hero with a scroll-expansion effect.
 *
 * Adapted for VoltSetu (plain React 18 + Tailwind, framer-motion only):
 * on first load the page stays pinned at the top; scrolling "expands" a
 * framed video/hero shot from a phone-sized preview into a full-screen
 * immersive shot while the headline splits and slides apart. At full
 * expansion the pin releases and the visitor lands on the real page flow
 * (stats strip → featured spots → the rest of the landing page).
 *
 * Accessibility / fallback notes:
 * - If `prefers-reduced-motion` is set, the effect is skipped and the page
 *   behaves like a normal hero.
 * - Touch is supported (swipe up to expand, swipe down to collapse).
 * - If the media fails to load, a solid gradient fallback shows so the
 *   hero is never blank.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, BatteryCharging, MapPin, Shield, Zap } from "lucide-react";

interface ScrollExpandHeroProps {
  mediaSrc: string;
  bgImageSrc?: string;
  titleFirst: string;
  titleRest: string;
  sub?: string;
  date?: string;
  scrollToExpand?: string;
  children?: React.ReactNode;
}

export default function ScrollExpandHero({
  mediaSrc,
  titleFirst,
  titleRest,
  sub,
  date,
  scrollToExpand = "Scroll to expand",
  children,
}: ScrollExpandHeroProps) {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartY = useRef(0);
  const lastTouchY = useRef(0);
  const [mediaFailed, setMediaFailed] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // On mount, lock the page at the top so the expansion gesture starts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const finishExpand = useCallback(() => {
    setProgress(1);
    setExpanded(true);
  }, []);

  // When expanded, release the pin and let normal scrolling continue.
  useEffect(() => {
    if (!expanded) return;
    const handler = () => {
      // no-op — scrolling is now free
    };
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [expanded]);

  // Core effect: pin at top + consume wheel/touch into progress until expanded.
  useEffect(() => {
    if (reduce) return;
    const onWheel = (e: WheelEvent) => {
      if (expanded) return;
      e.preventDefault();
      const delta = Math.max(-1, Math.min(1, e.deltaY)) * 0.012;
      const next = Math.min(Math.max(progress + delta, 0), 1);
      setProgress(next);
      if (next >= 1) finishExpand();
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
      lastTouchY.current = touchStartY.current;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (expanded) return;
      const y = e.touches[0].clientY;
      const delta = lastTouchY.current - y;
      lastTouchY.current = y;
      const factor = delta < 0 ? 0.016 : 0.01;
      const next = Math.min(Math.max(progress + delta * factor, 0), 1);
      setProgress(next);
      if (next >= 1) finishExpand();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [progress, expanded, reduce, finishExpand]);

  // Sizing math: preview frame grows from phone-ish to full screen.
  const wMin = isMobile ? 280 : 320;
  const wMax = isMobile ? window.innerWidth - 32 : 1250;
  const hMin = isMobile ? 380 : 420;
  const hMax = isMobile ? window.innerHeight - 96 : 820;
  const mediaW = wMin + progress * (wMax - wMin);
  const mediaH = hMin + progress * (hMax - hMin);
  const spread = progress * (isMobile ? 26 : 20); // vw

  if (reduce) {
    // Fallback: plain stacked hero, no gesture.
    return (
      <section className="relative min-h-[90vh] flex items-center pt-24 gradient-hero overflow-hidden">
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10 py-16">
          <div className="text-center lg:text-left">
            <h1 className="font-display font-bold display-tight text-5xl sm:text-6xl lg:text-7xl text-white mb-6 text-balance">
              {titleFirst} {titleRest}
            </h1>
            {children}
          </div>
          <img src={mediaSrc} alt={titleFirst} className="rounded-3xl shadow-2xl w-full object-cover h-[420px]" />
        </div>
      </section>
    );
  }

  return (
    <div className="relative overflow-x-hidden">
      {/* Pinned hero layer — renders until the visitor expands it */}
      <div
        className="relative"
        style={{
          position: expanded ? "relative" : "fixed",
          inset: expanded ? undefined : "0",
          zIndex: expanded ? undefined : 40,
        }}
      >
        <div className="relative flex min-h-[100vh] w-full flex-col items-center justify-start bg-[#05080a]">
          {/* Dark ambient background that fades out as the media fills the view */}
          <div
            className="absolute inset-0"
            style={{
              opacity: 1 - progress,
              background:
                "radial-gradient(ellipse at 30% 20%, rgba(34,211,153,0.12), transparent 55%), radial-gradient(ellipse at 80% 80%, rgba(59,130,246,0.10), transparent 55%), #05080a",
            }}
          />

          {/* Expanding media frame */}
          <div className="flex h-[100vh] w-full flex-col items-center justify-center relative">
            <motion.div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden"
              style={{
                width: Math.min(mediaW, window.innerWidth * 0.95),
                height: Math.min(mediaH, window.innerHeight * 0.85),
                boxShadow: "0px 0px 60px rgba(22,212,136,0.18)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
              animate={{ opacity: 0.55 + progress * 0.45 }}
              transition={{ duration: 0.15 }}
            >
              {!mediaFailed ? (
                <video
                  src={mediaSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onError={() => setMediaFailed(true)}
                  className="h-full w-full rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 text-neutral-500">
                  <BatteryCharging className="h-16 w-16 opacity-50" />
                </div>
              )}
              <div
                className="pointer-events-none absolute inset-0 rounded-xl"
                style={{ background: `rgba(0,0,0,${0.42 - progress * 0.28})` }}
              />
            </motion.div>

            {/* Split headline */}
            <div className="relative z-10 flex w-full flex-col items-center justify-center gap-1 text-center px-4">
              <motion.h2
                className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl"
                style={{ transform: `translateX(-${spread}vw)` }}
              >
                {titleFirst}
              </motion.h2>
              <motion.h2
                className="font-display text-4xl font-bold text-center text-white sm:text-5xl lg:text-6xl text-balance"
                style={{ transform: `translateX(${spread}vw)` }}
              >
                {titleRest}
              </motion.h2>
              {date && (
                <motion.p
                  className="mt-3 text-lg text-emerald-300/90 font-medium"
                  style={{ transform: `translateX(-${spread}vw)` }}
                  animate={{ opacity: 0.4 + progress * 0.6 }}
                >
                  {date}
                </motion.p>
              )}
            </div>

            {/* Scroll hint (fades as expansion proceeds) */}
            {progress < 0.9 && !expanded && (
              <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/70"
                animate={{ opacity: 1 - progress * 2.2, y: [0, 6, 0] }}
                transition={{ y: { repeat: Infinity, duration: 1.6, ease: "easeInOut" }, opacity: { duration: 0.2 } }}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">{scrollToExpand}</span>
                <ArrowDown className="h-4 w-4" />
              </motion.div>
            )}
          </div>

          {/* Content revealed after expansion */}
          <motion.section
            className="flex w-full flex-col px-4 py-10 md:px-16 lg:py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          >
            {children}
          </motion.section>
        </div>
      </div>

      {/* Placeholder space so the rest of the page keeps its layout while pinned */}
      {!expanded && <div className="h-[100vh] bg-[#05080a]" />}
    </div>
  );
}

export function HeroProofChips() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-white/70 text-sm font-medium">
      <span className="flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-ev-green" /> Kolhapur live
      </span>
      <span className="flex items-center gap-1.5">
        <Shield className="w-4 h-4 text-ev-green" /> Verified hosts
      </span>
      <span className="flex items-center gap-1.5">
        <Zap className="w-4 h-4 text-ev-green" /> Rs 5–15 per 10 min
      </span>
    </div>
  );
}
