import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Zap, Shield, Clock, Home, DollarSign, Users, CheckCircle, Sparkles, TrendingUp, Leaf, Loader2 } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import riderImg from "@/assets/rider-app.jpg";
import StatsCounter from "@/components/StatsCounter";

import ParallaxHero from "@/components/landing/ParallaxHero";
import FeatureGrid from "@/components/landing/FeatureGrid";
import SpotCard from "@/components/SpotCard";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import FAQAccordion from "@/components/FAQAccordion";
import CTABanner from "@/components/CTABanner";
import PlanMyChargeSection from "@/components/PlanMyChargeSection";
import { useState, useEffect } from "react";
import { getAllChargingSpots } from "@/lib/hostRegistration";
import BookingModal from "@/components/BookingModal";
import { useAuth } from "@/components/Auth/AuthProvider";
import GoogleLoginModal from "@/components/Auth/GoogleLoginModal";
import SEO from "@/components/SEO";

const Index = () => {
  useScrollReveal();
  const { user } = useAuth();
  const [featuredSpots, setFeaturedSpots] = useState<any[]>([]);
  const [loadingSpots, setLoadingSpots] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How does VoltSetu work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "VoltSetu connects EV two-wheeler riders with nearby home charging spots. Riders search for a spot, navigate to it, plug in, and pay based on charging time. Homeowners list their outlet and earn money each time a rider charges."
        }
      },
      {
        "@type": "Question",
        "name": "How much does it cost to charge?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Pricing is set by individual hosts, typically ranging from Rs 5 to Rs 15 per 10 minutes. You can see the exact price on each charging spot listing before you book."
        }
      },
      {
        "@type": "Question",
        "name": "Is it safe to charge at someone's home?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. All hosts go through a verification process. We verify identity, outlet safety, and location details. Riders and hosts both have rating systems to maintain community trust."
        }
      },
      {
        "@type": "Question",
        "name": "How much can I earn as a host?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Earnings depend on your area's demand and pricing. On average, hosts earn Rs 2,000 to Rs 5,000 per month with minimal effort. You set your own rates and availability."
        }
      }
    ]
  };

  useEffect(() => {
    getAllChargingSpots().then(spots => {
      // Pick top 3 rated or latest spots as featured
      setFeaturedSpots(spots.slice(0, 3));
    }).finally(() => {
      setLoadingSpots(false);
    });
  }, []);

  const handleBookNow = (spot: any) => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setSelectedSpot(spot);
    }
  };

  const handleFindSpots = () => {
    // Navigate to find spots page
    window.location.href = '/spots';
  };

  const handleBecomeHost = () => {
    // Navigate to become host page
    window.location.href = '/host';
  };

  // 21st.dev adaptation: Parallax Scrolling hero (@osmosupply/components/parallax-scrolling)
  const heroSection = <ParallaxHero />;

  const statsSection = <StatsCounter />;

  const trustStrip = (
    <section aria-label="Network trust highlights" className="relative z-10 -mt-8 lg:-mt-12">
      <div className="page-shell">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-border shadow-xl sm:grid-cols-4">
          <div className="flex flex-col items-start gap-1 bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary" /> Live spots</div>
            <div className="text-2xl font-bold text-foreground">
              {loadingSpots ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : (featuredSpots.length || '—')}
            </div>
            <div className="text-xs text-muted-foreground">Featured near you</div>
          </div>
          <div className="flex flex-col items-start gap-1 bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"><Shield className="h-3.5 w-3.5 text-ev-green" /> Verified</div>
            <div className="text-2xl font-bold text-foreground">100%</div>
            <div className="text-xs text-muted-foreground">Hosts are identity-checked</div>
          </div>
          <div className="flex flex-col items-start gap-1 bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"><Zap className="h-3.5 w-3.5 text-primary" /> Pay per use</div>
            <div className="text-2xl font-bold text-foreground">Rs 5–15</div>
            <div className="text-xs text-muted-foreground">Per 10-minute session</div>
          </div>
          <div className="flex flex-col items-start gap-1 bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground"><Users className="h-3.5 w-3.5 text-ev-green" /> Community</div>
            <div className="text-2xl font-bold text-foreground">Neighbors</div>
            <div className="text-xs text-muted-foreground">Riders helping riders</div>
          </div>
        </div>
      </div>
    </section>
  );

  const howItWorksSection = (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16 reveal">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            How VoltSetu Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Simple, transparent, and built for India's neighborhoods.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Rider Flow */}
          <div className="reveal p-8 md:p-10 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300 group">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-2xl text-card-foreground mb-4">For Riders</h3>
            <div className="space-y-4">
              {["Search nearby charging spots on the map", "Navigate seamlessly to the location", "Plug in your EV and charge securely", "Pay digitally based on time spent"].map((step, i) => (
                <div key={i} className="flex items-start gap-4 text-[15px] text-muted-foreground">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="leading-tight pt-1">{step}</span>
                </div>
              ))}
            </div>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 text-primary font-semibold mt-8 hover:gap-3 transition-all">
              Learn more <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          {/* Host Flow */}
          <div className="reveal p-8 md:p-10 rounded-3xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300 group" style={{ transitionDelay: "0.1s" }}>
            <div className="w-14 h-14 rounded-2xl gradient-green flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Home className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-display font-bold text-2xl text-card-foreground mb-4">For Hosts</h3>
            <div className="space-y-4">
              {["Register your home outlet details", "Set your own pricing & availability", "Get verified instantly by our team", "Start earning passive income effortlessly"].map((step, i) => (
                <div key={i} className="flex items-start gap-4 text-[15px] text-muted-foreground">
                  <span className="w-6 h-6 rounded-full bg-ev-green/10 text-ev-green text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="leading-tight pt-1">{step}</span>
                </div>
              ))}
            </div>
            <Link to="/how-it-works" className="inline-flex items-center gap-2 text-ev-green font-semibold mt-8 hover:gap-3 transition-all">
              Learn more <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  const riderBenefitsSection = (
    <section className="py-20 lg:py-24 bg-soft-gray">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16 reveal">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Why Riders Love VoltSetu
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">Everything you need for a stress-free EV life.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
  );

  const hostBenefitsSection = (
    <section className="py-20 lg:py-28 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="reveal-left order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-ev-green/20 to-transparent rounded-3xl blur-2xl animate-pulse" />
            <img
              src={riderImg}
              alt="Rider using VoltSetu app"
              className="relative rounded-3xl shadow-2xl object-cover w-full max-h-[600px]"
              loading="lazy"
            />
          </div>
          <div className="reveal-right order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ev-green/10 text-ev-green text-sm font-semibold mb-6">
              <DollarSign className="w-4 h-4" /> Earn with VoltSetu
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-5xl text-foreground mb-6 leading-tight">
              Turn your outlet into <br className="hidden lg:block" /> a revenue stream
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Turn your home electricity outlet into a revenue-generating charging point. Set your own prices, choose your availability, and earn money while helping EV riders.
            </p>
            <div className="space-y-5">
              {[
                { icon: TrendingUp, text: "Earn Rs 2,000 - Rs 5,000+ monthly" },
                { icon: Shield, text: "Verified riders and insured platform" },
                { icon: Users, text: "Tap into a growing community in your area" },
                { icon: Clock, text: "100% Flexible hours - you decide when" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-xl bg-ev-green/10 group-hover:bg-ev-green/20 transition-colors flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-ev-green" />
                  </div>
                  <span className="text-foreground font-medium text-[17px]">{text}</span>
                </div>
              ))}
            </div>
            <Link
              to="/host"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 rounded-xl gradient-green text-white font-semibold text-lg mt-10 hover:opacity-90 transition-all shadow-xl hover:shadow-ev-green/30 hover:-translate-y-1"
            >
              Register as Host <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );

  const featuredSpotsSection = (
    <section className="py-20 lg:py-24 bg-soft-gray border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 reveal">
          <div className="max-w-2xl">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-3">
              Featured Charging Spots
            </h2>
            <p className="text-muted-foreground text-lg">Top-rated spots ready for booking in your area.</p>
          </div>
          <Link to="/spots" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all bg-primary/10 hover:bg-primary/20 px-5 py-2.5 rounded-full">
            View All Map <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingSpots ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p>Loading top spots...</p>
          </div>
        ) : featuredSpots.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-border">
            <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No spots available yet</h3>
            <p className="text-muted-foreground mb-6">Be the first to host in your area!</p>
            <Link to="/host" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-green text-white font-semibold hover:opacity-90 transition-all shadow-md">
              Become a Host
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredSpots.map((spot, i) => (
              <div key={spot.id || i} className="reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
                <SpotCard
                  id={spot.id}
                  name={spot.name}
                  host={spot.hostName}
                  hostId={spot.hostId}
                  hostPhone={spot.hostPhone}
                  distance="0.8 km"
                  pricePerHour={spot.pricePerHour}
                  rating={(!spot.reviews?.length && !spot.totalCharges) ? null : spot.rating}
                  reviews={spot.reviews?.length || spot.totalCharges || 0}
                  isVerified={spot.isVerified}
                  isFeatured={i === 0}
                  outletType={spot.outletType}
                  availableHours={spot.availableHours}
                  amenities={spot.amenities}
                  image={spot.photos?.[0]}
                  onBook={() => setSelectedSpot(spot)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );

  // Signature "Electric Night" section — dark full-bleed moment with a scrolling city marquee.
  // Built to raise typographic scale contrast (top-design) against the light sections around it.
  const electricNightSection = (
    <section className="relative py-24 lg:py-32 gradient-hero grain overflow-hidden" aria-label="VoltSetu network coverage">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 charge-line" />
        <div className="absolute top-[30%] left-0 w-80 h-80 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[20%] right-0 w-96 h-96 bg-ev-green/15 rounded-full blur-3xl" />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center reveal mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-white/80 text-sm mb-6">
            <Leaf className="w-4 h-4 text-ev-green" /> Built for India's EV riders
          </div>
          <h2 className="font-display font-bold display-tight text-4xl md:text-6xl text-white text-balance">
            India rides electric. <span className="text-gradient">VoltSetu keeps it moving.</span>
          </h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mt-5">
            Two-wheelers are the fastest-growing EV segment in India. VoltSetu gives them a charging point in every neighborhood — powered by hosts who earn while riders ride.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 reveal">
          {[
            { stat: "Rs 0", caption: "Joining fee — riders and hosts both start free" },
            { stat: "Rs 5–15", caption: "Honest pricing per 10-minute session, set by each host" },
            { stat: "24/7", caption: "Spots open on the host's schedule — filtered live on the map" },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-8 backdrop-blur-sm hover:bg-white/10 transition-colors duration-300" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="font-display font-bold text-4xl md:text-5xl text-white mb-3 tracking-squish">{item.stat}</div>
              <p className="text-white/60 text-sm leading-relaxed">{item.caption}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mt-16 border-y border-white/10 py-4 overflow-hidden" aria-hidden="true">
        <div className="marquee-track text-white/40 text-sm font-medium">
          {Array.from({ length: 2 }).map((_, dup) => (
            <div key={dup} className="flex items-center gap-10 pr-10 shrink-0">
              {[
                "Kolhapur",
                "Pune",
                "Mumbai",
                "Bangalore",
                "Chennai",
                "Hyderabad",
                "Delhi NCR",
                "Indore",
                "Nagpur",
                "Nashik",
              ].map((city) => (
                <span key={`${dup}-${city}`} className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  {city}
                  <Zap className="w-3.5 h-3.5 text-ev-green/70" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const whyChooseUsSection = (
    <section className="py-20 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 lg:mb-16 reveal">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Why Choose VoltSetu
          </h2>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">Building the foundation for India's EV future.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {[
            { icon: Shield, title: "Verified & Safe", description: "Every host goes through identity and outlet hardware verification for absolute safety." },
            { icon: TrendingUp, title: "Rapidly Growing", description: "A rapidly expanding network ensuring you always have a plug nearby." },
            { icon: Leaf, title: "Eco-Friendly", description: "Supporting India's clean mobility transition by making EVs practical for everyone." },
            { icon: Users, title: "Community Driven", description: "Built on mutual ratings, reviews, and a shared mission to reduce emissions." },
          ].map((f, i) => (
            <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
              <FeatureCard {...f} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const testimonialsSection = (
    <div className="reveal">
      <TestimonialCarousel />
    </div>
  );

  const faqSection = (
    <section className="py-20 lg:py-28 bg-soft-gray">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12 lg:mb-16 reveal">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">Everything you need to know about charging and hosting on VoltSetu.</p>
        </div>
        <div className="reveal bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border">
          <FAQAccordion />
        </div>
      </div>
    </section>
  );

  const ctaSection = <CTABanner variant="dark" />;
  const planMyChargeSection = <PlanMyChargeSection />;

  return (
    <div className="overflow-hidden">
      <SEO 
        title="VoltSetu — Find EV Charging Spots Near You in Kolhapur"
        description="Book nearby EV two-wheeler charging spots instantly in Kolhapur, or list your outlet and earn passive income as a host. Join India's hyperlocal charging network."
        schema={faqSchema}
      />
      {heroSection}
      <FeatureGrid />

      {user ? (
        <>
          {featuredSpotsSection}
          {planMyChargeSection}
          {statsSection}
          {howItWorksSection}
          {riderBenefitsSection}
          {hostBenefitsSection}
          {electricNightSection}
          {whyChooseUsSection}
          {testimonialsSection}
          {faqSection}
          {ctaSection}
        </>
      ) : (
        <>
          {statsSection}
          {howItWorksSection}
          {riderBenefitsSection}
          {hostBenefitsSection}
          {featuredSpotsSection}
          {planMyChargeSection}
          {electricNightSection}
          {whyChooseUsSection}
          {testimonialsSection}
          {faqSection}
          {ctaSection}
        </>
      )}

      {selectedSpot && (
        <BookingModal
          isOpen={!!selectedSpot}
          onClose={() => setSelectedSpot(null)}
          spot={selectedSpot}
        />
      )}

      {showLoginModal && (
        <GoogleLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default Index;
