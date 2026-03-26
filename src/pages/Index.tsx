import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Zap, Shield, Clock, Home, DollarSign, Users, CheckCircle, Sparkles, TrendingUp, Leaf } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import heroImg from "@/assets/hero-charging.jpg";
import riderImg from "@/assets/rider-app.jpg";
import StatsCounter from "@/components/StatsCounter";
import SpotCard from "@/components/SpotCard";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import FAQAccordion from "@/components/FAQAccordion";
import CTABanner from "@/components/CTABanner";

const featuredSpots = [
  { name: "Anand's Home Charging", host: "Anand Verma", distance: "0.8 km", price: "Rs 10", rating: 4.8, reviews: 42, isOpen: true, isVerified: true, isFeatured: true },
  { name: "Green Park Outlet", host: "Meera Joshi", distance: "1.2 km", price: "Rs 8", rating: 4.6, reviews: 28, isOpen: true, isVerified: true, isFeatured: false },
  { name: "Sunrise Apartments", host: "Suresh Reddy", distance: "1.5 km", price: "Rs 12", rating: 4.9, reviews: 56, isOpen: false, isVerified: true, isFeatured: false },
];

const Index = () => {
  useScrollReveal();

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-20 gradient-hero overflow-hidden">
        {/* Animated Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-ev-green/15 rounded-full blur-3xl animate-blob-delayed" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-blob-delayed-2" />

        <div className="container mx-auto px-4 relative z-10 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-sm mb-6">
                <Sparkles className="w-4 h-4 text-primary" />
                India's Hyperlocal EV Charging Network
              </div>
              <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
                Find Nearby EV Charging Spots or{" "}
                <span className="text-gradient">Earn from Your Home Outlet</span>
              </h1>
              <p className="text-lg text-white/70 max-w-lg mb-8 leading-relaxed">
                Charge your EV two-wheeler at verified home charging points near you. Or list your home outlet and start earning passive income from every charge.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/spots"
                  className="px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-lg shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <MapPin className="w-5 h-5" /> Find a Spot
                </Link>
                <Link
                  to="/host"
                  className="px-8 py-4 rounded-xl bg-white/10 text-white border border-white/20 font-semibold text-lg hover:bg-white/20 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  <Home className="w-5 h-5" /> Register Your Home
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-white/50 text-sm">
                <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-ev-green" /> Free to Join</span>
                <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-ev-green" /> Verified Hosts</span>
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-ev-green" /> Pay per Use</span>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 gradient-primary rounded-3xl blur-3xl opacity-20 scale-90" />
              <img
                src={heroImg}
                alt="EV scooter charging at a home outlet"
                className="relative rounded-3xl shadow-2xl w-full animate-float"
                width={1920}
                height={1080}
              />
              <div className="absolute -bottom-6 -left-6 glass rounded-2xl p-4 shadow-xl animate-float-delayed">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">Charging Active</div>
                    <div className="text-xs text-muted-foreground">Rs 10 / 10 min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <StatsCounter />

      {/* How It Works Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              How ChargeNest Works
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Simple, transparent, and built for India's neighborhoods.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Rider Flow */}
            <div className="reveal p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-card-foreground mb-3">For Riders</h3>
              <div className="space-y-3">
                {["Search nearby spots", "Navigate to location", "Plug in and charge", "Pay and rate"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
              <Link to="/how-it-works" className="inline-flex items-center gap-1 text-sm text-primary font-medium mt-4 hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Host Flow */}
            <div className="reveal p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all" style={{ transitionDelay: "0.1s" }}>
              <div className="w-12 h-12 rounded-xl gradient-green flex items-center justify-center mb-4">
                <Home className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-bold text-xl text-card-foreground mb-3">For Hosts</h3>
              <div className="space-y-3">
                {["Register your outlet", "Set pricing and hours", "Get verified", "Start earning"].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="w-6 h-6 rounded-full bg-ev-green/10 text-ev-green text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
              <Link to="/how-it-works" className="inline-flex items-center gap-1 text-sm text-ev-green font-medium mt-4 hover:gap-2 transition-all">
                Learn more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rider Benefits */}
      <section className="py-20 bg-soft-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Why Riders Love ChargeNest
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, title: "Nearby Access", description: "Find charging spots within walking distance, right in your neighborhood." },
              { icon: Clock, title: "Easy Booking", description: "Book a spot in seconds. Navigate, plug in, and start charging immediately." },
              { icon: DollarSign, title: "Transparent Pricing", description: "See exact pricing before you book. No hidden fees, no surprises." },
              { icon: Zap, title: "Fast Charging", description: "Charge your EV two-wheeler quickly at verified, safe home outlets." },
            ].map((f, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <FeatureCard {...f} variant="gradient" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Host Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal-left">
              <img
                src={riderImg}
                alt="Rider using ChargeNest app"
                className="rounded-3xl shadow-xl"
                loading="lazy"
                width={1280}
                height={720}
              />
            </div>
            <div className="reveal-right">
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
                Earn Passive Income as a Host
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Turn your home electricity outlet into a revenue-generating charging point. Set your own prices, choose your availability, and earn money while helping EV riders.
              </p>
              <div className="space-y-4">
                {[
                  { icon: DollarSign, text: "Earn Rs 2,000 - Rs 5,000+ monthly" },
                  { icon: Shield, text: "Verified and insured platform" },
                  { icon: Users, text: "Growing community of riders nearby" },
                  { icon: Clock, text: "Flexible hours - you decide availability" },
                ].map(({ icon: Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-ev-green/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-ev-green" />
                    </div>
                    <span className="text-foreground font-medium">{text}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/host"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-green text-white font-semibold mt-8 hover:opacity-90 transition-all shadow-lg hover:-translate-y-0.5"
              >
                Register as Host <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spots */}
      <section className="py-20 bg-soft-gray">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12 reveal">
            <div>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-2">
                Featured Charging Spots
              </h2>
              <p className="text-muted-foreground">Top-rated spots in your area</p>
            </div>
            <Link to="/spots" className="hidden md:inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSpots.map((spot, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <SpotCard {...spot} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Why Choose ChargeNest
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Verified & Safe", description: "Every host goes through identity and outlet verification." },
              { icon: TrendingUp, title: "Growing Network", description: "500+ spots and counting across 50+ Indian cities." },
              { icon: Leaf, title: "Eco-Friendly", description: "Supporting India's clean mobility transition, one charge at a time." },
              { icon: Users, title: "Community Trust", description: "Built on mutual ratings, reviews, and transparent pricing." },
            ].map((f, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <div className="reveal">
        <TestimonialCarousel />
      </div>

      {/* FAQ */}
      <section className="py-20 bg-soft-gray">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="reveal">
            <FAQAccordion />
          </div>
        </div>
      </section>

      {/* CTA */}
      <CTABanner variant="dark" />
    </div>
  );
};

export default Index;
