import { useState, useEffect } from "react";
import { Search, MapPin, Filter, SlidersHorizontal, BadgeCheck, Zap, Loader2 } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import SpotCard from "@/components/SpotCard";
import BookingModal from "@/components/BookingModal";
import CTABanner from "@/components/CTABanner";
import spotsMapImg from "@/assets/spots-map.jpg";
import { getAllChargingSpots } from "@/lib/hostRegistration";
import { toast } from "sonner";

const filters = ["All", "Open Now", "Verified", "Under Rs 50", "Top Rated", "Nearest"];

export default function FindSpots() {
  useScrollReveal();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpot, setSelectedSpot] = useState<any | null>(null);

  useEffect(() => {
    getAllChargingSpots()
      .then((data) => {
        setSpots(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to load charging spots");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredSpots = spots.filter((spot) => {
    // text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!spot.name?.toLowerCase().includes(query) && 
          !spot.city?.toLowerCase().includes(query) && 
          !spot.address?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // categorization filters
    if (activeFilter === "Open Now") return true; // assuming all are open for MVP since we don't track live open/closed
    if (activeFilter === "Verified") return spot.isVerified;
    if (activeFilter === "Under Rs 50") return spot.pricePerHour < 50;
    if (activeFilter === "Top Rated") return spot.rating >= 4.5;
    if (activeFilter === "Nearest") return true; // mock nearest for MVP
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
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-12 min-h-[50vh]">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 scrollbar-none">
            <SlidersHorizontal className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeFilter === f
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:bg-muted"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>

          {!loading && (
            <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                {filteredSpots.length} spots found
              </span>
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-ev-green" />
                {filteredSpots.filter(s => s.isVerified).length} verified
              </span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
              <p>Searching for nearby EV spots...</p>
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpots.map((spot, i) => (
                  <div key={spot.id || i} className="reveal" style={{ transitionDelay: `${Math.min(i, 10) * 0.05}s` }}>
                    <SpotCard 
                      id={spot.id}
                      name={spot.name}
                      host={spot.hostName}
                      hostPhone={spot.hostPhone}
                      distance="1.2 km" // Map distance logic could be added here
                      pricePerHour={spot.pricePerHour}
                      rating={spot.rating || 5.0} // Fallback rating if none
                      reviews={spot.reviews?.length || spot.totalCharges || 0}
                      isOpen={true} // assume true
                      isVerified={spot.isVerified}
                      outletType={spot.outletType}
                      availableHours={spot.availableHours}
                      image={spot.photos?.[0]}
                      onBook={() => setSelectedSpot(spot)}
                    />
                  </div>
                ))}
              </div>

              {filteredSpots.length === 0 && (
                <div className="text-center py-20">
                  <Filter className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                  <h3 className="font-display font-semibold text-xl text-foreground mb-2">No spots found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or search in a different area.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <CTABanner title="Can't find a spot nearby?" subtitle="Register your home outlet and become the charging spot your neighborhood needs." />

      {selectedSpot && (
        <BookingModal 
          isOpen={!!selectedSpot} 
          onClose={() => setSelectedSpot(null)} 
          spot={selectedSpot} 
        />
      )}
    </div>
  );
}
