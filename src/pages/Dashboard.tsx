import { useState } from "react";
import { User, MapPin, Clock, DollarSign, Zap, TrendingUp, Calendar, Star, Phone, MessageCircle } from "lucide-react";
import { useAuth } from "@/components/Auth/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SpotCard from "@/components/SpotCard";

const mockBookings = [
  { id: 1, spot: "Anand's Home Charging", date: "2024-03-26", duration: "45 min", cost: "Rs 45", status: "completed" },
  { id: 2, spot: "Green Park Outlet", date: "2024-03-25", duration: "30 min", cost: "Rs 24", status: "completed" },
  { id: 3, spot: "Sunrise Apartments", date: "2024-03-28", duration: "60 min", cost: "Rs 72", status: "upcoming" },
];

const mockHostEarnings = [
  { date: "2024-03-26", charges: 3, earnings: "Rs 120" },
  { date: "2024-03-25", charges: 2, earnings: "Rs 80" },
  { date: "2024-03-24", charges: 5, earnings: "Rs 200" },
];

const featuredSpots = [
  { name: "Anand's Home Charging", host: "Anand Verma", distance: "0.8 km", price: "Rs 10", rating: 4.8, reviews: 42, isOpen: true, isVerified: true, isFeatured: true },
  { name: "Green Park Outlet", host: "Meera Joshi", distance: "1.2 km", price: "Rs 8", rating: 4.6, reviews: 28, isOpen: true, isVerified: true, isFeatured: false },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const totalSpent = mockBookings
    .filter(b => b.status === "completed")
    .reduce((sum, b) => sum + parseInt(b.cost.replace(/\D/g, "")), 0);

  const totalEarned = mockHostEarnings
    .reduce((sum, e) => sum + parseInt(e.earnings.replace(/\D/g, "")), 0);

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl md:text-4xl text-card-foreground mb-2">
            Welcome back, {user?.displayName || "User"}!
          </h1>
          <p className="text-muted-foreground">
            Manage your charging sessions and host earnings
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="hosting">Hosting</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rs {totalSpent}</div>
                  <p className="text-xs text-muted-foreground">
                    +20% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sessions</CardTitle>
                  <Zap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockBookings.length}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45 min</div>
                  <p className="text-xs text-muted-foreground">
                    +5 min from average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saved CO₂</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12 kg</div>
                  <p className="text-xs text-muted-foreground">
                    Environmental impact
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="font-medium">{booking.spot}</p>
                        <p className="text-sm text-muted-foreground">{booking.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{booking.cost}</p>
                        <p className="text-sm text-muted-foreground">{booking.duration}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommended Spots</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {featuredSpots.map((spot, index) => (
                    <SpotCard key={index} {...spot} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          booking.status === "completed" ? "bg-green-500" : "bg-blue-500"
                        }`} />
                        <div>
                          <p className="font-medium">{booking.spot}</p>
                          <p className="text-sm text-muted-foreground">{booking.date} • {booking.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-medium">{booking.cost}</p>
                          <p className="text-sm text-muted-foreground capitalize">{booking.status}</p>
                        </div>
                        {booking.status === "upcoming" && (
                          <Button size="sm">View Details</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hosting" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Host Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockHostEarnings.map((earning, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{earning.date}</p>
                          <p className="text-sm text-muted-foreground">{earning.charges} charging sessions</p>
                        </div>
                        <p className="font-medium">{earning.earnings}</p>
                      </div>
                    ))}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Total Earnings</p>
                        <p className="text-xl font-bold text-green-600">{totalEarned}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Host Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">4.8</p>
                    <p className="text-sm text-muted-foreground">Average Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">24</p>
                    <p className="text-sm text-muted-foreground">Total Charges</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">98%</p>
                    <p className="text-sm text-muted-foreground">Response Rate</p>
                  </div>
                  <Button className="w-full">Manage Listing</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
