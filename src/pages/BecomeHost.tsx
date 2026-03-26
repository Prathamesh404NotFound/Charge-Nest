import { useState } from "react";
import { Link } from "react-router-dom";
import { Home, DollarSign, Shield, Users, Clock, CheckCircle, ArrowRight, Phone, MessageCircle, QrCode, BadgeCheck, Zap, TrendingUp } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useAuth } from "@/components/Auth/AuthProvider";
import hostImg from "@/assets/host-homeowner.jpg";
import FeatureCard from "@/components/FeatureCard";
import FAQAccordion from "@/components/FAQAccordion";
import CTABanner from "@/components/CTABanner";
import HostRegistrationModal from "@/components/HostRegistration/HostRegistrationModal";
import { Button } from "@/components/ui/button";
import GoogleLoginModal from "@/components/Auth/GoogleLoginModal";

const steps = [
  { icon: Home, title: "Register Your Home", desc: "Sign up and add your address, outlet type, and photos." },
  { icon: DollarSign, title: "Set Your Pricing", desc: "Choose your rate per 10 minutes and set availability hours." },
  { icon: BadgeCheck, title: "Get Verified", desc: "Our team verifies your identity and outlet safety." },
  { icon: QrCode, title: "Receive Your QR Code", desc: "Get a unique QR code for riders to scan and start sessions." },
  { icon: TrendingUp, title: "Start Earning", desc: "Riders discover your spot and you earn with every charge." },
];

const hostFaqs = [
  { q: "What kind of outlet do I need?", a: "A standard 3-pin or 5-amp socket is sufficient for most EV two-wheelers. We verify the outlet safety during onboarding." },
  { q: "Is my property insured?", a: "ChargeNest provides basic coverage for any damage during charging sessions. Hosts are protected through our trust and safety program." },
  { q: "Can I pause my listing?", a: "Yes, you can toggle your availability anytime. You have full control over your schedule and pricing." },
  { q: "How do I receive payments?", a: "Earnings are deposited directly to your bank account weekly. You can track all transactions in the host dashboard." },
];

export default function BecomeHost() {
  useScrollReveal();
  const { user } = useAuth();
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleRegisterNow = () => {
    if (!user) {
      setShowLoginModal(true);
    } else {
      setShowRegistrationModal(true);
    }
  };

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative py-20 gradient-hero overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-ev-green/15 rounded-full blur-3xl animate-blob" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ev-green/20 text-ev-green text-sm font-medium mb-6">
                <DollarSign className="w-4 h-4" /> Earn Passive Income
              </div>
              <h1 className="font-display font-bold text-3xl md:text-5xl text-white leading-tight mb-6">
                Turn Your Home Outlet Into a{" "}
                <span className="text-ev-green">Charging Business</span>
              </h1>
              <p className="text-lg text-white/70 max-w-lg mb-8 leading-relaxed">
                List your electricity outlet on ChargeNest and earn money every time an EV rider charges at your location. Simple setup, zero investment.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleRegisterNow}
                  className="px-8 py-4 rounded-xl gradient-green text-white font-semibold text-lg shadow-xl hover:opacity-90 hover:-translate-y-1 transition-all flex items-center gap-2"
                >
                  Register Now <ArrowRight className="w-5 h-5" />
                </Button>
                <a href="tel:+919876543210" className="px-8 py-4 rounded-xl bg-white/10 text-white border border-white/20 font-semibold hover:bg-white/20 transition-all flex items-center gap-2">
                  <Phone className="w-5 h-5" /> Call Us
                </a>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <img src={hostImg} alt="Homeowner near EV charging outlet" className="rounded-3xl shadow-2xl w-full animate-float" loading="lazy" width={1280} height={720} />
              <div className="absolute -bottom-6 -right-6 glass rounded-2xl p-4 shadow-xl animate-float-delayed">
                <div className="text-sm font-semibold text-foreground">Monthly Earnings</div>
                <div className="text-2xl font-display font-bold text-ev-green">Rs 3,500+</div>
                <div className="text-xs text-muted-foreground">avg. host income</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Why Become a Host
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: DollarSign, title: "Passive Income", description: "Earn Rs 2,000 to Rs 5,000+ per month from your existing outlet." },
              { icon: Shield, title: "Safe & Verified", description: "Our trust system protects your property and privacy." },
              { icon: Users, title: "Local Demand", description: "EV adoption is growing rapidly in your neighborhood." },
              { icon: Clock, title: "Flexible Schedule", description: "Choose when your outlet is available for charging." },
              { icon: Zap, title: "Zero Investment", description: "No special equipment needed. Your existing socket works." },
              { icon: CheckCircle, title: "Full Control", description: "Set your own pricing and accept riders on your terms." },
            ].map((f, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
                <FeatureCard {...f} variant="gradient" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5-Step Onboarding */}
      <section className="py-20 bg-soft-gray">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Get Started in 5 Simple Steps
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-0">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="reveal flex gap-6 relative" style={{ transitionDelay: `${i * 0.15}s` }}>
                  {i < steps.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-full bg-border" />
                  )}
                  <div className="w-12 h-12 rounded-xl gradient-green flex items-center justify-center flex-shrink-0 relative z-10 shadow-md">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="pb-12">
                    <div className="text-xs font-semibold text-ev-green uppercase tracking-wider mb-1">Step {i + 1}</div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-1">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Earnings Preview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Estimated Earnings
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">See how much you could earn based on average rider traffic in your area.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto reveal">
            {[
              { period: "Daily", amount: "Rs 100 - Rs 200", sessions: "2-4 sessions" },
              { period: "Weekly", amount: "Rs 700 - Rs 1,400", sessions: "14-28 sessions" },
              { period: "Monthly", amount: "Rs 3,000 - Rs 5,000+", sessions: "60-120 sessions" },
            ].map((e, i) => (
              <div key={i} className="text-center p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="text-sm font-medium text-muted-foreground mb-2">{e.period}</div>
                <div className="font-display font-bold text-2xl text-ev-green mb-1">{e.amount}</div>
                <div className="text-xs text-muted-foreground">{e.sessions}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 bg-soft-gray">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">
              Register Your Interest
            </h2>
            <p className="text-muted-foreground">Fill in your details and our team will get in touch to help you get started.</p>
          </div>
          <div className="reveal bg-card rounded-2xl border border-border p-8 shadow-sm">
            <form className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                  <input type="text" placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Area / Locality</label>
                <input type="text" placeholder="Your area, city" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Outlet Type</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>3-Pin Socket</option>
                    <option>5-Amp Socket</option>
                    <option>15-Amp Socket</option>
                    <option>EV Charger</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preferred Pricing</label>
                  <select className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>Rs 5 / 10 min</option>
                    <option>Rs 8 / 10 min</option>
                    <option>Rs 10 / 10 min</option>
                    <option>Rs 15 / 10 min</option>
                  </select>
                </div>
              </div>
              <button type="button" className="w-full px-8 py-4 rounded-xl gradient-green text-white font-semibold text-lg shadow-lg hover:opacity-90 transition-all">
                Submit Interest
              </button>
            </form>
          </div>
          <div className="flex justify-center gap-4 mt-8">
            <a href="tel:+919876543210" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:shadow-md transition-all">
              <Phone className="w-4 h-4 text-primary" /> Call Now
            </a>
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-card text-foreground font-medium hover:shadow-md transition-all">
              <MessageCircle className="w-4 h-4 text-ev-green" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 reveal">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-foreground mb-4">Host FAQ</h2>
          </div>
          <div className="reveal">
            <FAQAccordion faqs={hostFaqs} />
          </div>
        </div>
      </section>

      <CTABanner variant="dark" title="Ready to Earn?" subtitle="Join 300+ verified hosts already earning from their home outlets." />

      {/* Modals */}
      <HostRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
      />
      <GoogleLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
}
