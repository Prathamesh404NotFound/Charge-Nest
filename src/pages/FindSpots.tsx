import { useState } from "react";
import { Search, MapPin, Star, Filter, SlidersHorizontal, BadgeCheck, Zap } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SpotCard from "@/components/SpotCard";
import CTABanner from "@/components/CTABanner";
import spotsMapImg from "@/assets/spots-map.jpg";

const allSpots = [
  { name: "Anand's Home Charging", host: "Anand Verma", distance: "0.8 km", price: "Rs 10", rating: 4.8, reviews: 42, isOpen: true, isVerified: true, isFeatured: true },
  { name: "Green Park Outlet", host: "Meera Joshi", distance: "1.2 km", price: "Rs 8", rating: 4.6, reviews: 28, isOpen: true, isVerified: true, isFeatured: false },
  { name: "Sunrise Apartments", host: "Suresh Reddy", distance: "1.5 km", price: "Rs 12", rating: 4.9, reviews: 56, isOpen: true, isVerified: true, isFeatured: false },
  { name: "Lakeview Charging", host: "Pooja Nair", distance: "2.1 km", price: "Rs 7", rating: 4.4, reviews: 18, isOpen: true, isVerified: false, isFeatured: false },
  { name: "Rajiv's Power Point", host: "Rajiv Singh", distance: "0.5 km", price: "Rs 15", rating: 4.7, reviews: 35, isOpen: false, isVerified: true, isFeatured: true },
  { name: "Shanti Nagar Charge", host: "Kavitha Rao", distance: "1.8 km", price: "Rs 9", rating: 4.5, reviews: 22, isOpen: true, isVerified: true, isFeatured: false },
  { name: "Blue Gates Residence", host: "Amit Patel", distance: "3.0 km", price: "Rs 6", rating: 4.3, reviews: 14, isOpen: true, isVerified: false, isFeatured: false },
  { name: "Palm Grove Outlet", host: "Deepa Krishnan", distance: "2.5 km", price: "Rs 11", rating: 4.8, reviews: 48, isOpen: true, isVerified: true, isFeatured: false },
  { name: "Tech Park Avenue", host: "Nitin Shah", distance: "1.0 km", price: "Rs 10", rating: 4.6, reviews: 31, isOpen: false, isVerified: true, isFeatured: false },
];

const filters = ["All", "Open Now", "Verified", "Under Rs 10", "Top Rated", "Nearest"];

export default function FindSpots() {
  useScrollReveal();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpots = allSpots.filter((spot) => {
    if (activeFilter === "Open Now") return spot.isOpen;
    if (activeFilter === "Verified") return spot.isVerified;
    if (activeFilter === "Under Rs 10") return parseInt(spot.price.replace(/\D/g, "")) < 10;
    if (activeFilter === "Top Rated") return spot.rating >= 4.7;
    if (activeFilter === "Nearest") return parseFloat(spot.distance) <= 1.5;
    return true;
  });

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative py-16 gradient-hero overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={spotsMapImg} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h1 className="font-display font-bold text-3xl md:text-5xl text-white mb-4">
              Find EV Charging Spots Near You
            </h1>
            <p className="text-white/70 max-w-lg mx-auto">
              Discover verified home charging points in your neighborhood. Search, book, and charge in minutes.
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by location, area, or landmark..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card text-foreground shadow-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary border-0"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold">
                Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:bg-muted"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              {filteredSpots.length} spots found
            </span>
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="w-4 h-4 text-ev-green" />
              {filteredSpots.filter(s => s.isVerified).length} verified
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary" />
              {filteredSpots.filter(s => s.isOpen).length} open now
            </span>
          </div>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSpots.map((spot, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.05}s` }}>
                <SpotCard {...spot} />
              </div>
            ))}
          </div>

          {filteredSpots.length === 0 && (
            <div className="text-center py-20">
              <Filter className="w-16 h-16 text-muted mx-auto mb-4" />
              <h3 className="font-display font-semibold text-xl text-foreground mb-2">No spots found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search in a different area.</p>
            </div>
          )}
        </div>
      </section>

      <CTABanner title="Can't find a spot nearby?" subtitle="Register your home outlet and become the charging spot your neighborhood needs." />
    </div>
  );
}
