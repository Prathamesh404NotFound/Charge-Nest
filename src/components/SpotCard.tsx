import { Star, MapPin, Clock, BadgeCheck, Phone, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpotCardProps {
  name: string;
  host: string;
  distance: string;
  price: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  isVerified: boolean;
  isFeatured?: boolean;
  image?: string;
}

export default function SpotCard({
  name, host, distance, price, rating, reviews, isOpen, isVerified, isFeatured, image
}: SpotCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1",
        isFeatured && "ring-2 ring-primary/30"
      )}
    >
      {isFeatured && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          Recommended
        </div>
      )}

      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-ev-green/20 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-primary/40" />
          </div>
        )}
        <div className="absolute top-4 right-4 flex gap-2">
          {isVerified && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-ev-green/90 text-white text-xs font-medium">
              <BadgeCheck className="w-3 h-3" /> Verified
            </span>
          )}
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              isOpen ? "bg-ev-green/90 text-white" : "bg-destructive/90 text-white"
            )}
          >
            {isOpen ? "Open Now" : "Closed"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display font-semibold text-lg text-card-foreground mb-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">Hosted by {host}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {distance}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {price}/10 min
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {rating} ({reviews})
          </span>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all">
            Book Now
          </button>
          <a
            href="tel:+919876543210"
            className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <Phone className="w-4 h-4 text-muted-foreground" />
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-xl border border-border hover:bg-ev-green/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-ev-green" />
          </a>
        </div>
      </div>
    </div>
  );
}
