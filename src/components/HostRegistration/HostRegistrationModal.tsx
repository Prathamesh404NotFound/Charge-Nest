import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Home, MapPin, Zap, DollarSign, Check, Phone, Mail, User, Navigation, Loader2, CheckCircle2, FileText } from "lucide-react";
import { useAuth } from "../Auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { submitHostRegistration } from "@/lib/hostRegistration";
import { toast } from "sonner";

interface HostRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Step 1: Personal Info
  fullName: string;
  email: string;
  phone: string;

  // Step 2: Address
  address: string;
  city: string;
  state: string;
  pincode: string;

  // Step 3: Charging Details
  outletType: string;
  chargingSpeed: string;
  availableHours: string;
  pricePerHour: string;

  // Step 4: GPS Location
  coordinates: { lat: number; lng: number } | null;
  locationLabel: string;

  // Step 5: Confirm
  agreeToTerms: boolean;
}

const defaultFormData = (user: any): FormData => ({
  fullName: user?.displayName || "",
  email: user?.email || "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  outletType: "",
  chargingSpeed: "",
  availableHours: "",
  pricePerHour: "",
  coordinates: null,
  locationLabel: "",
  agreeToTerms: false,
});

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Location Details", icon: Home },
  { label: "Charging Setup", icon: Zap },
  { label: "GPS Location", icon: MapPin },
  { label: "Confirm & Submit", icon: FileText },
];

const HostRegistrationModal = ({ isOpen, onClose }: HostRegistrationModalProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(() => defaultFormData(user));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        updateFormData("coordinates", { lat: latitude, lng: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const json = await res.json();
          updateFormData("locationLabel", json.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
          const addr = json.address;
          if (addr) {
            if (!formData.city && (addr.city || addr.town || addr.village))
              updateFormData("city", addr.city || addr.town || addr.village || "");
            if (!formData.state && addr.state) updateFormData("state", addr.state);
            if (!formData.pincode && addr.postcode) updateFormData("pincode", addr.postcode);
          }
        } catch {
          updateFormData("locationLabel", `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        }
        setLocationLoading(false);
      },
      (err) => {
        setLocationLoading(false);
        setLocationError(
          err.code === 1
            ? "Location access denied. Please allow location permissions and try again."
            : "Could not detect location. Please try again."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitHostRegistration({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        outletType: formData.outletType,
        chargingSpeed: formData.chargingSpeed,
        availableHours: formData.availableHours,
        pricePerHour: formData.pricePerHour,
        coordinates: formData.coordinates,
        agreeToTerms: formData.agreeToTerms,
      });
      toast.success("You're registered! We'll verify your spot and notify you within 24–48 hours.");
      onClose();
      setCurrentStep(1);
      setFormData(defaultFormData(user));
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!(formData.fullName.trim() && formData.email.trim() && formData.phone.trim());
      case 2: return !!(formData.address.trim() && formData.city.trim());
      case 3: return !!(formData.outletType && formData.availableHours && formData.pricePerHour);
      case 4: return !!formData.coordinates;
      case 5: return formData.agreeToTerms;
      default: return true;
    }
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      /* ── STEP 1: Personal Info ── */
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Personal Information</h3>
              <p className="text-muted-foreground">Tell us about yourself</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input type="text" value={formData.fullName}
                    onChange={e => updateFormData("fullName", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="Enter your full name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input type="email" value={formData.email}
                    onChange={e => updateFormData("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input type="tel" value={formData.phone}
                    onChange={e => updateFormData("phone", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>
          </div>
        );

      /* ── STEP 2: Location Details ── */
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Location Details</h3>
              <p className="text-muted-foreground">Where is your charging spot located?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input type="text" value={formData.address}
                    onChange={e => updateFormData("address", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="123 Main Street, Apartment 4B" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input type="text" value={formData.city}
                    onChange={e => updateFormData("city", e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="Mumbai" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input type="text" value={formData.state}
                    onChange={e => updateFormData("state", e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="Maharashtra" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">PIN Code</label>
                <input type="text" value={formData.pincode}
                  onChange={e => updateFormData("pincode", e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                  placeholder="400001" />
              </div>
            </div>
          </div>
        );

      /* ── STEP 3: Charging Setup ── */
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Charging Setup</h3>
              <p className="text-muted-foreground">Tell us about your charging equipment</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Outlet Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Standard 3-Pin", "5-Amp Socket", "16-Amp Socket", "Type 2 EV Charger"].map(type => (
                    <button key={type} onClick={() => updateFormData("outletType", type)}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${formData.outletType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-foreground"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Charging Speed</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Slow (2-3 kW)", "Fast (7-22 kW)", "Rapid (50+ kW)"].map(speed => (
                    <button key={speed} onClick={() => updateFormData("chargingSpeed", speed)}
                      className={`p-3 rounded-xl border-2 transition-all text-xs font-medium ${formData.chargingSpeed === speed
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50 text-foreground"}`}>
                      {speed}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Available Hours</label>
                <select value={formData.availableHours}
                  onChange={e => updateFormData("availableHours", e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground">
                  <option value="">Select availability</option>
                  <option value="24/7">24/7</option>
                  <option value="6am-10pm">6 AM – 10 PM</option>
                  <option value="8am-8pm">8 AM – 8 PM</option>
                  <option value="9am-6pm">9 AM – 6 PM</option>
                  <option value="custom">Custom Hours</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Price per Hour (₹)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input type="number" value={formData.pricePerHour}
                    onChange={e => updateFormData("pricePerHour", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="50" min="0" />
                </div>
              </div>
            </div>
          </div>
        );

      /* ── STEP 4: GPS Location ── */
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Pin Your Location</h3>
              <p className="text-muted-foreground">Add your exact GPS coordinates so riders can find you easily</p>
            </div>
            <div className="space-y-4">
              <button onClick={handleGetCurrentLocation} disabled={locationLoading}
                className={`w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl border-2 border-dashed transition-all font-semibold text-base ${
                  formData.coordinates
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "border-primary bg-primary/5 text-primary hover:bg-primary/10"}`}>
                {locationLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />Detecting location...</>
                ) : formData.coordinates ? (
                  <><CheckCircle2 className="w-5 h-5 text-green-500" />Location Pinned!</>
                ) : (
                  <><Navigation className="w-5 h-5" />Add Current Location</>
                )}
              </button>

              {locationError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                  <p className="text-sm text-red-700 dark:text-red-400">{locationError}</p>
                </div>
              )}

              {formData.coordinates && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400">Location Confirmed</span>
                  </div>
                  <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed">{formData.locationLabel}</p>
                  <div className="flex gap-4 pt-1">
                    <span className="text-xs text-muted-foreground">Lat: <span className="font-mono font-medium">{formData.coordinates.lat.toFixed(6)}</span></span>
                    <span className="text-xs text-muted-foreground">Lng: <span className="font-mono font-medium">{formData.coordinates.lng.toFixed(6)}</span></span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 text-sm">Why we need your location</h4>
                <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                  <li>• Riders nearby can discover your charging spot</li>
                  <li>• Navigation directions are shared with EV users</li>
                  <li>• Your exact address is kept private from public view</li>
                </ul>
              </div>

              {formData.coordinates && (
                <button onClick={handleGetCurrentLocation} disabled={locationLoading}
                  className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
                  {locationLoading ? "Re-detecting..." : "Re-detect location"}
                </button>
              )}
            </div>
          </div>
        );

      /* ── STEP 5: Confirm & Submit ── */
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Confirm & Submit</h3>
              <p className="text-muted-foreground">Review your details and complete registration</p>
            </div>

            {/* Summary card */}
            <div className="bg-muted/40 rounded-2xl p-5 space-y-4 border border-border">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Name</p>
                  <p className="font-medium text-foreground">{formData.fullName || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Phone</p>
                  <p className="font-medium text-foreground">{formData.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">City</p>
                  <p className="font-medium text-foreground">{formData.city || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Outlet</p>
                  <p className="font-medium text-foreground">{formData.outletType || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Price / hr</p>
                  <p className="font-medium text-foreground">₹{formData.pricePerHour || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">Hours</p>
                  <p className="font-medium text-foreground">{formData.availableHours || "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground text-xs uppercase tracking-wide mb-0.5">GPS Location</p>
                  <p className="font-medium text-foreground flex items-center gap-1.5">
                    {formData.coordinates ? (
                      <><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{formData.locationLabel.slice(0, 60)}{formData.locationLabel.length > 60 ? "…" : ""}</>
                    ) : "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
              <h4 className="font-medium text-amber-900 dark:text-amber-300 mb-2 text-sm">What happens next?</h4>
              <ul className="text-xs text-amber-800 dark:text-amber-400 space-y-1">
                <li>• Our team will review your spot within 24–48 hours</li>
                <li>• You'll receive a confirmation email once approved</li>
                <li>• Your charging spot will go live and start attracting riders</li>
              </ul>
            </div>

            <div className="flex items-start gap-3">
              <input type="checkbox" id="terms" checked={formData.agreeToTerms}
                onChange={e => updateFormData("agreeToTerms", e.target.checked)}
                className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary" />
              <label htmlFor="terms" className="text-sm text-muted-foreground">
                I agree to the <span className="text-primary underline cursor-pointer">Terms of Service</span> and <span className="text-primary underline cursor-pointer">Privacy Policy</span>. I confirm that my outlet information is accurate.
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Step {currentStep} of {totalSteps}</Badge>
              <span className="text-sm text-muted-foreground">{STEPS[currentStep - 1].label}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          {/* Step dots */}
          <div className="flex justify-center gap-2 mt-3">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-2 rounded-full transition-all ${
                i + 1 === currentStep ? "w-6 bg-primary" : i + 1 < currentStep ? "w-2 bg-primary/60" : "w-2 bg-border"
              }`} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={currentStep === 1 ? onClose : prevStep}
              disabled={isSubmitting} className="flex items-center gap-2">
              {currentStep > 1 && <ArrowLeft className="w-4 h-4" />}
              {currentStep === 1 ? "Cancel" : "Previous"}
            </Button>

            {currentStep === totalSteps ? (
              <Button onClick={handleSubmit} disabled={isSubmitting || !formData.agreeToTerms}
                className="flex items-center gap-2 px-8 gradient-green hover:opacity-90">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Registering...</>
                ) : (
                  <><Check className="w-4 h-4" />Complete Registration</>
                )}
              </Button>
            ) : (
              <Button onClick={nextStep} disabled={!canProceed()} className="flex items-center gap-2 px-8">
                Next Step <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          {!canProceed() && currentStep < totalSteps && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              {currentStep === 4 ? "Please pin your location to continue" : "Please fill in all required fields to continue"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostRegistrationModal;
