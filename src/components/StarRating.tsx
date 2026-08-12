import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

export function StarRating({ rating, size = "md", interactive = false, onChange, className = "" }: StarRatingProps) {
  const sizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  };
  const value = Math.max(0, Math.min(5, Number(rating) || 0));

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${interactive ? "cursor-pointer select-none" : ""} ${className}`}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, value - (star - 1)));
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            onClick={() => interactive && onChange?.(star)}
            className={`relative text-primary ${interactive ? "transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2" : ""}`}
          >
            <Star
              className={`${sizes[size]} transition-colors`}
              style={
                fill === 1
                  ? undefined
                  : { color: fill > 0 ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.35)", strokeWidth: 1.5 }
              }
            />
            {fill > 0 && fill < 1 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
                aria-hidden="true"
              >
                <Star className={sizes[size]} style={{ color: "hsl(var(--primary))" }} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
