import { database, auth } from "./firebase-services";
import { ref, push, set, serverTimestamp } from "firebase/database";

interface HostRegistrationData {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  outletType: string;
  chargingSpeed: string;
  availableHours: string;
  pricePerHour: string;
  outletPhotos: string[];
  locationPhotos: string[];
  idProof: string;
  agreeToTerms: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export async function submitHostRegistration(data: Omit<HostRegistrationData, 'userId' | 'status' | 'createdAt'>) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("User must be logged in to register as host");
    }

    const registrationData: HostRegistrationData = {
      ...data,
      userId: user.uid,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    // Create a new registration under user's path for better security
    const userRegistrationsRef = ref(database, `hostRegistrations/${user.uid}`);
    const newRegistrationRef = push(userRegistrationsRef);

    await set(newRegistrationRef, registrationData);

    // Also create a charging spot entry
    const spotData = {
      hostId: user.uid,
      hostName: data.fullName,
      hostEmail: data.email,
      hostPhone: data.phone,
      name: `${data.fullName}'s Charging Spot`,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      outletType: data.outletType,
      chargingSpeed: data.chargingSpeed,
      availableHours: data.availableHours,
      pricePerHour: data.pricePerHour,
      outletPhotos: data.outletPhotos,
      locationPhotos: data.locationPhotos,
      rating: 0,
      reviews: 0,
      totalCharges: 0,
      status: 'pending',
      isVerified: false,
      isOpen: false,
      createdAt: serverTimestamp(),
    };

    const spotsRef = ref(database, 'chargingSpots');
    const newSpotRef = push(spotsRef);
    await set(newSpotRef, spotData);

    return {
      registrationId: newRegistrationRef.key,
      spotId: newSpotRef.key,
      success: true,
    };
  } catch (error) {
    console.error('Error submitting host registration:', error);
    throw error;
  }
}

export async function getHostRegistrations(userId: string) {
  try {
    const registrationsRef = ref(database, 'hostRegistrations');
    // TODO: Implement query to get user's registrations
    return [];
  } catch (error) {
    console.error('Error fetching host registrations:', error);
    throw error;
  }
}

export async function updateRegistrationStatus(registrationId: string, status: 'approved' | 'rejected') {
  try {
    const registrationRef = ref(database, `hostRegistrations/${registrationId}`);
    await set(registrationRef, { status, updatedAt: serverTimestamp() });

    // Also update the corresponding spot status
    // TODO: Implement spot status update
    return true;
  } catch (error) {
    console.error('Error updating registration status:', error);
    throw error;
  }
}
