import { Link } from "react-router-dom";
import { Zap, MapPin, Mail, Phone, ArrowRight } from "lucide-react";

const footerLinks = {
  Platform: [
    { to: "/spots", label: "Find Charging Spots" },
    { to: "/host", label: "Become a Host" },
    { to: "/how-it-works", label: "How It Works" },
    { to: "/pricing", label: "Pricing" },
  ],
  Company: [
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact" },
    { to: "#", label: "Careers" },
    { to: "#", label: "Blog" },
  ],
  Legal: [
    { to: "#", label: "Privacy Policy" },
    { to: "#", label: "Terms of Service" },
    { to: "#", label: "Refund Policy" },
    { to: "#", label: "Safety Guidelines" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy text-navy-foreground">
      {/* Newsletter Section */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-2xl mb-2">
                Stay Updated with ChargeNest
              </h3>
              <p className="text-white/60 text-sm">
                Get the latest updates on new charging spots, host earnings tips, and EV news.
              </p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 text-sm flex-1 md:w-72 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold text-sm whitespace-nowrap hover:opacity-90 transition-opacity flex items-center gap-2">
                Subscribe <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl">ChargeNest</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-sm">
              India's hyperlocal EV charging marketplace. Find nearby charging spots or earn passive income by listing your home outlet.
            </p>
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Serving 50+ cities across India</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span>hello@chargenest.in</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>+91 98765 43210</span>
              </div>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-sm uppercase tracking-wider mb-4 text-white/80">
                {title}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            2024 ChargeNest. All rights reserved. Made with care in India.
          </p>
          <div className="flex items-center gap-4 text-sm text-white/40">
            <span>Trusted by 1,200+ EV riders</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>300+ verified hosts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
