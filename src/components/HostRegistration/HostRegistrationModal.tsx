import { useState } from "react";
import { X, ArrowLeft, ArrowRight, Home, MapPin, Zap, DollarSign, Upload, Check, Camera, Shield, Phone, Mail, User } from "lucide-react";
import { useAuth } from "../Auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  // Step 4: Photos
  outletPhotos: string[];
  locationPhotos: string[];

  // Step 5: Verification
  idProof: string;
  agreeToTerms: boolean;
}

const HostRegistrationModal = ({ isOpen, onClose }: HostRegistrationModalProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
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
    outletPhotos: [],
    locationPhotos: [],
    idProof: "",
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitHostRegistration(formData);
      toast.success("Registration submitted successfully! We'll verify your details within 24-48 hours.");
      onClose();
      // Reset form
      setCurrentStep(1);
      setFormData({
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
        outletPhotos: [],
        locationPhotos: [],
        idProof: "",
        agreeToTerms: false,
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast.error("Failed to submit registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
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
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateFormData('fullName', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Location Details</h3>
              <p className="text-muted-foreground">Where is your charging spot located?</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="123 Main Street, Apartment 4B"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">PIN Code</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => updateFormData('pincode', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="400001"
                />
              </div>
            </div>
          </div>
        );

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
                  {["Standard 3-Pin", "5-Amp Socket", "16-Amp Socket", "Type 2 EV Charger"].map((type) => (
                    <button
                      key={type}
                      onClick={() => updateFormData('outletType', type)}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.outletType === type
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Charging Speed</label>
                <div className="grid grid-cols-3 gap-3">
                  {["Slow (2-3 kW)", "Fast (7-22 kW)", "Rapid (50+ kW)"].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => updateFormData('chargingSpeed', speed)}
                      className={`p-3 rounded-xl border-2 transition-all ${formData.chargingSpeed === speed
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Available Hours</label>
                <select
                  value={formData.availableHours}
                  onChange={(e) => updateFormData('availableHours', e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select availability</option>
                  <option value="24/7">24/7</option>
                  <option value="6am-10pm">6 AM - 10 PM</option>
                  <option value="8am-8pm">8 AM - 8 PM</option>
                  <option value="9am-6pm">9 AM - 6 PM</option>
                  <option value="custom">Custom Hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price per Hour</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.pricePerHour}
                    onChange={(e) => updateFormData('pricePerHour', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="50"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Add Photos</h3>
              <p className="text-muted-foreground">Show off your charging spot</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-3">Outlet Photos</label>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2].map((index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:border-primary/50 transition-all cursor-pointer">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">Photo {index}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Location Photos</label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square border-2 border-dashed border-border rounded-xl flex items-center justify-center hover:border-primary/50 transition-all cursor-pointer">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-center">View {index}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Verification</h3>
              <p className="text-muted-foreground">Complete the verification process</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload ID Proof</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-all cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">Aadhar Card, PAN Card, or Driving License</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-medium text-amber-900 mb-2">Verification Process</h4>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Our team will verify your documents within 24-48 hours</li>
                  <li>• You'll receive a confirmation email once approved</li>
                  <li>• Your charging spot will be listed after verification</li>
                </ul>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.agreeToTerms}
                  onChange={(e) => updateFormData('agreeToTerms', e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <label htmlFor="terms" className="text-sm text-muted-foreground">
                  I agree to the Terms of Service and Privacy Policy. I understand that my listing will be verified before going live.
                </label>
              </div>
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
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Step {currentStep} of {totalSteps}</Badge>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t border-border p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : prevStep}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {currentStep > 1 && <ArrowLeft className="w-4 h-4" />}
              {currentStep === 1 ? "Cancel" : "Previous"}
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.agreeToTerms}
                className="flex items-center gap-2 px-8"
              >
                {isSubmitting ? "Submitting..." : "Complete Registration"}
                <Check className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8"
              >
                Next Step
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostRegistrationModal;
