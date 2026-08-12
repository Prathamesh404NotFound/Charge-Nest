/* VoltSetu rider loyalty page (Round 14).
 *
 * Shows points, level, badges and streak. Pure read-side derivation — no
 * loyalty database, so nothing can be corrupted or abused.
 */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, Leaf, Flame, Star, Trophy, Loader2, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLoyaltyProfile, BADGES, type LoyaltyProfile } from "@/lib/loyaltyService";
import { useAuth } from "@/components/Auth/AuthProvider";
import SEO from "@/components/SEO";

const BADGE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  zap: Zap,
  leaf: Leaf,
  fire: Flame,
  star: Star,
  trophy: Trophy,
};

export default function Loyalty() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LoyaltyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getLoyaltyProfile(user.id)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="My Loyalty | VoltSetu"
        description="Track your VoltSetu loyalty points, badges and charging streak."
        noindex
      />
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl">My Loyalty</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Earn points for every session. Charge often, save CO₂, collect badges.
          </p>
        </div>
        {profile && (
          <Badge className="gradient-primary text-white px-3 py-1 text-sm rounded-full">
            Level {profile.level} Rider
          </Badge>
        )}
      </div>

      {loading || !profile ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Points + streak row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-1">
                <Zap className="w-5 h-5 text-primary mb-1" />
                <p className="text-3xl font-bold">{profile.points}</p>
                <p className="text-xs text-muted-foreground">Loyalty points</p>
                <p className="text-[10px] text-muted-foreground">10/session · +5 for on-time ratings</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-1">
                <Award className="w-5 h-5 text-ev-green mb-1" />
                <p className="text-3xl font-bold">{profile.badges.length}</p>
                <p className="text-xs text-muted-foreground">Badges earned</p>
                <p className="text-[10px] text-muted-foreground">of {Object.keys(BADGES).length} available</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-1">
                <Leaf className="w-5 h-5 text-green-600 mb-1" />
                <p className="text-3xl font-bold">{profile.co2Kg} kg</p>
                <p className="text-xs text-muted-foreground">CO₂ saved vs petrol</p>
                <p className="text-[10px] text-muted-foreground">~4 kg per completed session</p>
              </CardContent>
            </Card>
            <Card className="rounded-2xl">
              <CardContent className="p-5 flex flex-col gap-1">
                <Flame className="w-5 h-5 text-orange-500 mb-1" />
                <p className="text-3xl font-bold">{profile.streakWeeks}</p>
                <p className="text-xs text-muted-foreground">Week streak</p>
                <p className="text-[10px] text-muted-foreground">Consecutive weeks with a session</p>
              </CardContent>
            </Card>
          </div>

          {/* Badge grid */}
          <Card className="rounded-2xl">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg">Badge Collection</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.values(BADGES).map((badge) => {
                  const earned = profile.badges.some((b) => b.id === badge.id);
                  const Icon = BADGE_ICONS[badge.icon];
                  return (
                    <div
                      key={badge.id}
                      className={`relative flex flex-col items-center text-center p-4 rounded-xl border transition-all duration-300 ${
                        earned
                          ? "border-ev-green bg-ev-green/5 shadow-sm hover:-translate-y-0.5"
                          : "border-border bg-muted/30 opacity-50 grayscale"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${earned ? "gradient-green" : "bg-muted"}`}>
                        <Icon className={`w-5 h-5 ${earned ? "text-white" : "text-muted-foreground"}`} />
                      </div>
                      <p className="text-xs font-semibold">{badge.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{badge.description}</p>
                      {!earned && <span className="absolute top-2 right-2 text-[9px] font-bold text-muted-foreground">LOCKED</span>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-muted-foreground">
            Points and badges are calculated automatically from your completed sessions and host ratings.
            Charge more to level up — every 100 points = 1 level.
          </p>
        </div>
      )}
    </div>
  );
}
