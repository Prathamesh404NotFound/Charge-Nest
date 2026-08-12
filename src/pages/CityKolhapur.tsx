import { MapPin, Zap, BadgeCheck, IndianRupee, Clock, ArrowRight, Phone, MessageCircle, Star, Car, Bike, BatteryCharging, Home, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import CTABanner from "@/components/CTABanner";
import FAQAccordion from "@/components/FAQAccordion";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { getAllChargingSpots } from "@/lib/hostRegistration";
import { useEffect, useState } from "react";

const kolhapurFaqs = [
  { q: "Where can I find EV charging spots in Kolhapur?", a: "VoltSetu lists verified home and commercial charging spots across Kolhapur — from Shahupuri and Rajarampuri to the Railway Station area and Shirol Road. Use the map on our spots page to find the nearest open outlet." },
  { q: "How much does EV charging cost in Kolhapur?", a: "Most VoltSetu hosts in Kolhapur charge between Rs 5 and Rs 15 per 10 minutes depending on the outlet type. The price is always shown up front before you book." },
  { q: "Is VoltSetu available in other cities?", a: "Kolhapur is our launch city. We are onboarding hosts across Maharashtra next — hosts from any city can register today and be ready for launch." },
  { q: "Can I charge my EV bike overnight in Kolhapur?", a: "Many hosts offer extended evening hours. Filter by 'Open Now' on the spots page or message a host on WhatsApp to arrange a convenient time." },
  { q: "How do I earn money listing my outlet in Kolhapur?", a: "Register on the Become a Host page, set your price and hours, get verified, and riders in your neighborhood can book your outlet. Hosts keep their earnings with weekly deposits." },
];

const areaCards = [
  { icon: Landmark, name: "Shahupuri & Central Kolhapur", note: "Dense rider demand near markets and offices" },
  { icon: Home, name: "Rajarampuri & Tarabai Park", note: "Residential outlets ideal for overnight charges" },
  { icon: Landmark, name: "Railway Station & Bus Stand", note: "High footfall for quick top-up sessions" },
  { icon: MapPin, name: "Shirol Road & Ichalkaranji corridor", note: "Commuter hotspot with growing EV adoption" },
];

export default function CityKolhapur() {
  useScrollReveal();
  const [spotCount, setSpotCount] = useState<number | null>(null);

  useEffect(() => {
    getAllChargingSpots()
      .then((spots) => setSpotCount(spots.length))
      .catch(() => setSpotCount(null));
  }, []);

  return (
    <div className="pt-24">
      <SEO
        title="EV Charging in Kolhapur — Verified Home Charging Spots Near You | VoltSetu"
        description="Find verified EV two-wheeler charging spots in Kolhapur — Shahupuri, Rajarampuri, Railway Station area and more. Book instantly from Rs 5 per 10 minutes or list your outlet to earn."
        canonical="/kolhapur"
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "EV Charging Spots in Kolhapur",
          itemListElement: areaCards.map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: a.name,
          })),
        }}
      />

      {/* Hero */}
      <section className="relative py-20 gradient-hero overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-ev-green/15 rounded-full blur-3xl animate-blob" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-ev-green text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" /> Launch City — Kolhapur, Maharashtra
            </div>
            <h1 className="font-display font-bold text-3xl md:text-5xl text-white leading-tight mb-6">
              EV Charging Spots in{" "}
              <span className="text-ev-green">Kolhapur</span>
            </h1>
            <p className="text-lg text-white/70 max-w-xl mb-8 leading-relaxed">
              Book a verified home charging point near you — starting at Rs 5 per 10 minutes. No
              queue, no detour, just plug in and charge your two-wheeler anywhere in the city.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="px-8 py-4 rounded-xl gradient-green text-white font-semibold text-lg shadow-xl hover:opacity-90 hover:-translate-y-1 transition-all">
                <Link to="/spots">
                  <Zap className="w-5 h-5" /> Find Spots Near Me
                </Link>
              </Button>
              <Button variant="outline" asChild className="px-8 py-4 rounded-xl bg-white/5 border-white/20 text-white font-semibold text-lg hover:bg-white/15 hover:-translate-y-1 transition-all">
                <Link to="/host">
                  <IndianRupee className="w-5 h-5" /> List My Outlet
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Live count strip */}
      <section className="py-6 bg-soft-gray">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{spotCount ?? "—"}</span> charging spots listed
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-ev-green" /> Verified hosts
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" /> Live availability
            </span>
          </div>
        </div>
      </section>

      {/* Where to charge */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Charge Anywhere in Kolhapur
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              VoltSetu hosts cover every major neighborhood — pick the area closest to you.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {areaCards.map((a, i) => {
              const Icon = a.icon;
              return (
                <div
                  key={a.name}
                  className="reveal p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-ev-green/10 flex items-center justify-center mb-4 group-hover:bg-ev-green/20 transition-colors">
                    <Icon className="w-6 h-6 text-ev-green" />
                  </div>
                  <h3 className="font-display font-semibold text-lg text-foreground mb-1">{a.name}</h3>
                  <p className="text-sm text-muted-foreground">{a.note}</p>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10">
            <Button asChild className="gradient-primary px-6 py-3 rounded-xl">
              <Link to="/spots">
                <MapPin className="w-4 h-4" /> See All Spots on the Map <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For riders & hosts */}
      <section className="py-20 bg-soft-gray">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="reveal rounded-2xl bg-card border border-border p-8 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-5">
                <Bike className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-3">Riding an EV in Kolhapur?</h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Skip the long detour to public charging stations. Book a verified home outlet near
                you, check live availability, and charge your two-wheeler in minutes — starting at
                Rs 5 per 10 minutes.
              </p>
              <Button asChild className="gradient-primary">
                <Link to="/spots">Find Charging Spots</Link>
              </Button>
            </div>
            <div className="reveal rounded-2xl bg-card border border-border p-8 shadow-sm hover:shadow-xl transition-all duration-300" style={{ transitionDelay: "0.1s" }}>
              <div className="w-14 h-14 rounded-2xl gradient-green flex items-center justify-center mb-5">
                <BatteryCharging className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-3">Have a spare outlet?</h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Thousands of EV riders in Kolhapur are looking for convenient charging points. List
                your home outlet, set your own price, and earn Rs 3,000–5,000+ every month with
                zero investment.
              </p>
              <Button asChild className="gradient-green">
                <Link to="/host">Become a Host</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Local proof */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Why Kolhapur Riders Choose VoltSetu
            </h2>
          </div>
          <div className="space-y-6">
            {[
              { icon: Star, title: "Verified hosts", desc: "Every host is identity and outlet verified before listing goes live." },
              { icon: Clock, title: "Live open/closed status", desc: "See which spots are open right now before you ride out." },
              { icon: IndianRupee, title: "Transparent pricing", desc: "Pay exactly the listed rate — no surge, no hidden fees." },
              { icon: Phone, title: "Direct host contact", desc: "Call or WhatsApp your host directly from the spot card." },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="reveal flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-ev-green/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-ev-green" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg text-foreground">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-soft-gray">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Kolhapur Charging FAQ
            </h2>
          </div>
          <div className="reveal">
            <FAQAccordion faqs={kolhapurFaqs} />
          </div>
        </div>
      </section>

      <CTABanner
        variant="dark"
        title="Charging in Kolhapur, Made Simple"
        subtitle="Join hundreds of riders and hosts already using VoltSetu across the city."
      />

      {/* Local business schema footer note */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "VoltSetu EV Charging — Kolhapur",
            areaServed: { "@type": "City", name: "Kolhapur", address: { "@type": "PostalAddress", addressRegion: "Maharashtra", addressCountry: "IN" } },
            provider: { "@type": "Organization", name: "VoltSetu", url: "https://voltsetu.netlify.app" },
            serviceType: "EV Two-Wheeler Charging",
            termsOfService: "https://voltsetu.netlify.app/pricing",
          }),
        }}
      />
    </div>
  );
}
