import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Zap, BadgeCheck, Clock, ArrowRight, IndianRupee, Bike, BatteryCharging } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import CTABanner from "@/components/CTABanner";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import NotFound from "@/pages/NotFound";
import { getAllChargingSpots } from "@/lib/hostRegistration";
import { getCityBySlug, filterSpotsByCity, CITIES } from "@/lib/cities";

export default function CityPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  useScrollReveal();
  const city = getCityBySlug(slug ?? "");
  const [spotCount, setSpotCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!city || !city.active) return;
    let cancelled = false;
    setLoading(true);
    getAllChargingSpots()
      .then((spots) => {
        if (cancelled) return;
        setSpotCount(filterSpotsByCity(spots, city.slug).length);
      })
      .catch(() => {
        if (!cancelled) setSpotCount(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [city]);

  if (!city || !city.active) {
    return (
      <div className="pt-24 min-h-screen">
        <SEO
          title="City Not Available Yet | VoltSetu"
          description="This city is coming soon to VoltSetu. Explore Kolhapur, our launch city, and get notified when we arrive."
          noindex
        />
        <NotFound />
      </div>
    );
  }

  const title = `EV Charging in ${city.name} — Verified Home Charging Spots | VoltSetu`;
  const description = `Find verified EV two-wheeler charging spots in ${city.name}, ${city.state}. Book instantly from Rs 5 per 10 minutes or list your outlet to earn.`;

  const otherCities = CITIES.filter((c) => c.active && c.slug !== city.slug);

  return (
    <div className="pt-24">
      <SEO title={title} description={description} canonical={`/city/${city.slug}`} />

      {/* Hero */}
      <section className="relative py-20 gradient-hero overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-ev-green/15 rounded-full blur-3xl animate-blob" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-ev-green text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" /> {city.name}, {city.state}
              {city.launch && (
                <span className="px-2 py-0.5 rounded-full bg-ev-green/20 text-xs font-semibold">Launch City</span>
              )}
            </div>
            <h1 className="font-display font-bold text-3xl md:text-5xl text-white leading-tight mb-6">
              EV Charging Spots in{" "}
              <span className="text-ev-green">{city.name}</span>
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
              <span className="font-semibold text-foreground">{loading ? "…" : (spotCount ?? "—")}</span> charging spots listed
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

      {/* Riders and hosts */}
      <section className="py-20 bg-soft-gray">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="reveal rounded-2xl bg-card border border-border p-8 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-5">
                <Bike className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-display font-bold text-2xl text-foreground mb-3">Riding an EV in {city.name}?</h3>
              <p className="text-muted-foreground leading-relaxed mb-5">
                Skip the long detour to public charging stations. Book a verified home outlet near
                you, check live availability, and charge your two-wheeler in minutes.
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
                EV riders in {city.name} are looking for convenient charging points. List your home
                outlet, set your own price, and earn with every charge session — zero investment.
              </p>
              <Button asChild className="gradient-green">
                <Link to="/host">Become a Host</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Other cities */}
      {otherCities.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-8 text-center reveal">
              VoltSetu in Other Cities
            </h2>
            <div className="flex flex-wrap justify-center gap-3 reveal">
              {otherCities.map((c) => (
                <Button
                  key={c.slug}
                  variant="outline"
                  onClick={() => navigate(`/city/${c.slug}`)}
                  className="rounded-full px-5 py-2.5 hover:-translate-y-0.5 transition-transform"
                >
                  <MapPin className="w-4 h-4 mr-1.5 text-primary" /> {c.name}
                  <span className="ml-2 text-xs text-muted-foreground">({c.state})</span>
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABanner
        variant="dark"
        title={`Charging in ${city.name}, Made Simple`}
        subtitle="VoltSetu is growing across India — join riders and hosts building the neighborhood charging network."
      />
      <Button asChild className="fixed bottom-20 right-4 z-40 rounded-full shadow-xl gradient-primary px-5 py-3 text-sm font-semibold hover:-translate-y-0.5 transition-transform">
        <Link to="/spots">
          <MapPin className="w-4 h-4 mr-1" /> Spots in {city.name} <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
