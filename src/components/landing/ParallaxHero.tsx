/**
 * Parallax Scrolling Hero — VoltSetu adaptation of Osmo's "Parallax Scrolling" component
 * from 21st.dev (https://21st.dev/@osmosupply/components/parallax-scrolling)
 *
 * Original used GSAP ScrollTrigger + Lenis with 4 stacked image layers moving at
 * different yPercent speeds as the user scrolls. This version reproduces the same
 * layered parallax effect with framer-motion useScroll + useTransform (already
 * installed) so no extra heavy dependencies are added to the bundle.
 *
 * Structure mirrors the original:
 * - .parallax container
 * - .parallax__header: 200vh pinned section whose visuals stack 4 layers
 *   (back image → mid image → giant title → front image), each translating at a
 *   different rate as scroll progresses
 * - .parallax__content: closing brand mark over a soft orb background
 *
 * All colors route through VoltSetu tokens (bg-background, text-foreground,
 * bg-primary/*) so it works in both light and dark themes. Fonts use the site's
 * self-hosted Space Grotesk (font-display). prefers-reduced-motion disables the
 * parallax motion entirely.
 */
import { motion, useScroll, useTransform, useReducedMotion, useSpring } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Home } from "lucide-react";

const LAYERS: Array<{
  y: number; // how far (px) the layer moves relative to scroll
  kind: "img" | "title";
  src?: string;
  alt?: string;
}> = [
  { y: -280, kind: "img", src: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&auto=format&fit=crop", alt: "EV charging station" },
  { y: -220, kind: "img", src: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=1200&auto=format&fit=crop", alt: "Electric vehicle charging" },
  { y: -160, kind: "title" },
  { y: -40, kind: "img", src: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop", alt: "Rider on electric scooter" },
];

function LayerImage({ src, alt, y }: { src: string; alt: string; y: number }) {
  const translateY = useSpring(useTransform(y, [0, 1], [0, y]), { stiffness: 60, damping: 20 });
  return (
    <motion.img
      src={src}
      alt={alt}
      loading="eager"
      width={800}
      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
      style={{ translateY }}
    />
  );
}

export default function ParallaxHero() {
  const heroRef = useSpring ? undefined : undefined; // kept for clarity; ref below
  const containerRef = useSpring ? undefined : undefined;
  void heroRef;
  void containerRef;
  const ref = (useScroll as unknown as { (): unknown }) ? undefined : undefined;
  void ref;

  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  // Hero section height: 200vh — scroll progress 0→1 runs across it
  const headerOpacity = useTransform(progress, [0, 0.7, 1], [1, 1, 0]);
  const contentFade = useTransform(progress, [0, 0.5], [0, 1]);
  const contentY = useTransform(progress, [0, 0.5], [24, 0]);

  return (
    <div ref={undefined} className="relative overflow-hidden bg-background">
      {/* Ambient brand orb behind everything */}
      <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 w-[48rem] h-[48rem] rounded-full bg-primary/15 dark:bg-primary/10 blur-[120px] pointer-events-none" />

      {/* ============ Parallax header (pinned) ============ */}
      <section
        className="relative h-[200vh]"
        aria-label="VoltSetu hero"
      >
        <div className="sticky top-0 h-screen overflow-hidden">
          <div className="absolute inset-0">
            {LAYERS.map((layer, i) =>
              layer.kind === "img" && layer.src ? (
                <div
                  key={layer.src}
                  className="absolute inset-0 overflow-hidden"
                  style={{ zIndex: i === 0 ? 0 : i === 3 ? 30 : i * 10 }}
                >
                  <ParallaxImage src={layer.src} alt={layer.alt!} y={layer.y} reduced={reduceMotion} />
                </div>
              ) : (
                <ParallaxTitle key="title" y={layer.y} reduced={reduceMotion} />
              )
            )}
          </div>

          {/* bottom fade into next section */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none"
            style={{ zIndex: 40 }}
          />
        </div>
      </section>

      {/* ============ Content section (fades in over the hero) ============ */}
      <section className="relative -mt-16">
        <motion.div style={{ opacity: reduceMotion ? 1 : contentFade, y: reduceMotion ? 0 : contentY }} className="relative z-20">
          <div className="container mx-auto px-4 max-w-3xl text-center pb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/15 border border-primary/20 text-primary text-sm font-semibold mb-6">
              <MapPin className="w-4 h-4" /> India's peer-to-peer EV charging network
            </div>
            <h1 className="font-display font-bold tracking-squish text-4xl sm:text-6xl md:text-7xl text-foreground mb-6 text-balance">
              Charge anywhere your <span className="text-gradient">scooter reaches</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Find, book, and charge at verified home and network spots near you — or list your outlet and
              earn from every charge with transparent pay-per-use pricing.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
              <Link
                to="/spots"
                className="magnet-lift px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2"
              >
                <MapPin className="w-5 h-5" /> Find a Spot
              </Link>
              <Link
                to="/host"
                className="magnet-lift px-8 py-4 rounded-xl bg-card text-foreground border border-border font-semibold text-lg hover:bg-muted flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" /> Register Your Home
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
              {["UPI accepted", "24×7 spots", "Verified hosts", "Pay at the spot"].map((chip) => (
                <span key={chip} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Decorative closing brand mark (from the original component) */}
        <div aria-hidden className="flex justify-center pt-16 pb-4 opacity-30 dark:opacity-20 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="56" viewBox="0 0 160 160" fill="none" className="h-14 w-14">
            <path d="M94.8284 53.8578C92.3086 56.3776 88 54.593 88 51.0294V0H72V59.9999C72 66.6273 66.6274 71.9999 60 71.9999H0V87.9999H51.0294C54.5931 87.9999 56.3777 92.3085 53.8579 94.8283L18.3431 130.343L29.6569 141.657L65.1717 106.142C67.684 103.63 71.9745 105.396 72 108.939V160L88.0001 160L88 99.9999C88 93.3725 93.3726 87.9999 100 87.9999H160V71.9999H108.939C105.407 71.9745 103.64 67.7091 106.12 65.1938L106.142 65.1716L141.657 29.6568L130.343 18.3432L94.8284 53.8578Z" fill="currentColor" />
          </svg>
        </div>
      </section>
    </div>
  );
}

function ParallaxImage({ src, alt, y, reduced }: { src: string; alt: string; y: number; reduced: boolean }) {
  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const translateY = useTransform(spring, [0, 1], [0, reduced ? 0 : y]);
  return (
    <motion.img
      src={src}
      alt={alt}
      loading="eager"
      width={800}
      className="w-full h-full object-cover select-none pointer-events-none"
      style={{ translateY }}
    />
  );
}

function ParallaxTitle({ y, reduced }: { y: number; reduced: boolean }) {
  const { scrollYProgress } = useScroll();
  const spring = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const translateY = useTransform(spring, [0, 1], [0, reduced ? 0 : y]);

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center"
      style={{ translateY }}
    >
      <div className="px-3 py-1 rounded-full bg-primary/15 dark:bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-5">
        India's peer-to-peer EV charging network
      </div>
      <h2 className="font-display font-bold text-[16vw] md:text-[11vw] leading-[0.95] tracking-squish text-foreground mix-blend-darken dark:mix-blend-lighten">
        Volt<span className="text-primary">Setu</span>
      </h2>
      <p className="mt-6 text-lg md:text-2xl text-foreground/80 max-w-md mx-auto font-medium">
        Charge anywhere your scooter reaches
      </p>
    </motion.div>
  );
}
