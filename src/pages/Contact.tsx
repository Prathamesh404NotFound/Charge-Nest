import { Phone, MessageCircle, Mail, MapPin, Clock, Shield, HelpCircle, ArrowRight } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import FAQAccordion from "@/components/FAQAccordion";

const contactFaqs = [
  { q: "How quickly do you respond?", a: "We aim to respond within 2-4 hours during business hours. WhatsApp queries typically get faster responses." },
  { q: "Can I visit your office?", a: "We operate as a digital-first company. For in-person queries, please schedule a meeting through our contact form." },
  { q: "I have a complaint about a host/rider", a: "Please use the contact form with the subject 'Complaint' and include the session details. We take safety and trust very seriously." },
];

export default function Contact() {
  useScrollReveal();

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20 gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="font-display font-bold text-3xl md:text-5xl text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Have questions about charging, hosting, or the platform? We are here to help.
          </p>
        </div>
      </section>

      {/* Quick Contact */}
      <section className="py-12 -mt-8">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Phone, label: "Call Us", value: "+91 98765 43210", href: "tel:+919876543210", color: "primary" },
              { icon: MessageCircle, label: "WhatsApp", value: "Chat Now", href: "https://wa.me/919876543210", color: "green" },
              { icon: Mail, label: "Email", value: "hello@chargenest.in", href: "mailto:hello@chargenest.in", color: "primary" },
              { icon: Clock, label: "Hours", value: "Mon-Sat, 9am-7pm", href: "#", color: "primary" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <a
                  key={i}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="reveal flex items-center gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all"
                  style={{ transitionDelay: `${i * 0.1}s` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color === "green" ? "gradient-green" : "gradient-primary"}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">{item.label}</div>
                    <div className="text-sm font-semibold text-foreground">{item.value}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-3 reveal">
              <h2 className="font-display font-bold text-2xl text-foreground mb-6">Send Us a Message</h2>
              <form className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <input type="text" placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                    <input type="tel" placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Area / City</label>
                  <input type="text" placeholder="Your area, city" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message</label>
                  <textarea rows={4} placeholder="How can we help you?" className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <button type="button" className="px-8 py-4 rounded-xl gradient-primary text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-all flex items-center gap-2">
                  Send Message <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 space-y-6 reveal-right">
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">Service Areas</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Currently serving Bangalore, Pune, Hyderabad, Chennai, Mumbai, Delhi NCR, and 45+ other cities across India. Expanding daily.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-foreground">Support Hours</h3>
                </div>
                <p className="text-sm text-muted-foreground">Monday - Saturday: 9 AM - 7 PM IST</p>
                <p className="text-sm text-muted-foreground">Sunday: Emergency support only</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-5 h-5 text-ev-green" />
                  <h3 className="font-display font-semibold text-foreground">Trust & Safety</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your safety is our priority. All hosts are verified. All transactions are secure. Report any concerns and we act within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-soft-gray">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 reveal">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h2 className="font-display font-bold text-3xl text-foreground">Quick FAQ</h2>
            </div>
          </div>
          <div className="reveal">
            <FAQAccordion faqs={contactFaqs} />
          </div>
        </div>
      </section>
    </div>
  );
}
