import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  variant?: "default" | "glass" | "gradient";
}

export default function FeatureCard({ icon: Icon, title, description, variant = "default" }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group p-6 rounded-2xl transition-all duration-500 hover:-translate-y-1",
        variant === "default" && "bg-card border border-border shadow-sm hover:shadow-lg",
        variant === "glass" && "glass hover:shadow-lg",
        variant === "gradient" && "bg-gradient-to-br from-primary/5 to-ev-green/5 border border-primary/10 hover:shadow-lg hover:border-primary/20"
      )}
    >
      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
      <h3 className="font-display font-semibold text-lg text-card-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
