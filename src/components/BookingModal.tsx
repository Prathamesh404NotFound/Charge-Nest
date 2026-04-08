import { useState } from "react";
import { X, Clock, IndianRupee, MapPin, Zap, MessageSquare, Loader2, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitBookingRequest } from "@/lib/bookingService";
import { useNavigate } from "react-router-dom";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  spot: {
    id?: string;
    name: string;
    hostName: string;
    hostPhone?: string;
    pricePerHour: number;
    outletType?: string;
    city?: string;
  };
}

const DURATIONS = [
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "1 hour", value: 60 },
  { label: "2 hours", value: 120 },
  { label: "Custom", value: 0 },
];

export default function BookingModal({ isOpen, onClose, spot }: BookingModalProps) {
  const navigate = useNavigate();
  const [duration, setDuration] = useState<number>(30); // default 30 mins
  const [customDuration, setCustomDuration] = useState<string>("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const activeDuration = duration === 0 ? parseInt(customDuration) || 0 : duration;
  const estimatedCost = Math.round((spot.pricePerHour / 60) * activeDuration);

  const handleBook = async () => {
    if (!spot.id) {
      toast.error("Invalid spot selected.");
      return;
    }
    if (activeDuration < 15) {
      toast.error("Minimum charging duration is 15 minutes.");
      return;
    }

    setLoading(true);
    try {
      await submitBookingRequest({
        spotId: spot.id,
        spotName: spot.name,
        hostName: spot.hostName,
        hostPhone: spot.hostPhone || "",
        duration: activeDuration,
        message: message.trim(),
        pricePerHour: spot.pricePerHour,
        estimatedCost,
        city: spot.city || "Unknown",
        outletType: spot.outletType || "Standard",
      });

      setSuccess(true);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit booking request.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    onClose();
    // Redirect to bookings
    setTimeout(() => {
      navigate("/dashboard/bookings");
    }, 100);
  };

  if (success) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleFinish()}>
        <DialogContent className="sm:max-w-md text-center p-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <DialogTitle className="text-2xl font-bold mb-2">Request Sent!</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground mb-6">
            Your booking request has been sent to <span className="font-semibold text-foreground">{spot.hostName}</span>. 
            You'll be notified once they approve it.
          </DialogDescription>
          <div className="bg-muted/50 p-4 rounded-xl text-sm mb-6 flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spot:</span>
              <span className="font-semibold">{spot.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-semibold">{activeDuration} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Cost:</span>
              <span className="font-semibold text-green-600">₹{estimatedCost}</span>
            </div>
          </div>
          <Button onClick={handleFinish} className="w-full">
            View My Bookings
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Charging Spot</DialogTitle>
          <DialogDescription>
            Select your estimated charging duration below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Spot Summary */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-3">
            <div className="font-semibold text-base">{spot.name}</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{spot.city || "Unknown City"}</span>
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5" />{spot.outletType || "Standard AC"}</span>
              <span className="flex items-center gap-1.5 font-medium text-foreground"><IndianRupee className="w-3.5 h-3.5" />{spot.pricePerHour}/hr</span>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Charging Duration</Label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.label}
                  onClick={() => { setDuration(d.value); if(d.value !== 0) setCustomDuration(""); }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    duration === d.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {duration === 0 && (
              <div className="mt-3 relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="number"
                  placeholder="Duration in minutes (e.g. 90)"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className="pl-10"
                  min="15"
                />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Message to Host (Optional)</Label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Textarea 
                placeholder="Hi, I'll arrive in about 10 minutes..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pl-10 resize-none"
                rows={3}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3 text-sm border border-blue-100 dark:border-blue-900/50">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-300">Estimated Cost: <span className="font-bold text-lg inline-block align-middle ml-1">₹{estimatedCost}</span></p>
              <p className="text-blue-700 dark:text-blue-400">Pay the host directly upon arrival. Actual cost will depend on time spent.</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleBook} disabled={loading || activeDuration < 15}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Booking...</> : "Send Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
