import { database, auth } from "./firebase-services";
import { ref, get, set, update, serverTimestamp } from "firebase/database";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone: string;
  photoURL: string;
  role: "user" | "host" | "admin";
  hostStatus?: "pending" | "approved" | "rejected";
  preferences: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      newSpots: boolean;
      requestUpdates: boolean;
      promotions: boolean;
    };
  };
  stats: {
    requestsCompleted: number;
    reviewsGiven: number;
  };
  createdAt?: any;
  updatedAt?: any;
}

const DEFAULT_PROFILE = (user: any): Partial<UserProfile> => ({
  uid: user.uid,
  displayName: user.displayName || "",
  email: user.email || "",
  phone: "",
  photoURL: user.photoURL || "",
  role: "user",
  preferences: {
    notifications: {
      email: true,
      push: true,
      sms: false,
      newSpots: true,
      requestUpdates: true,
      promotions: false,
    },
  },
  stats: { requestsCompleted: 0, reviewsGiven: 0 },
});

/** Read user profile, creating defaults if it doesn't exist */
export async function getUserProfile(uid: string): Promise<UserProfile> {
  const userRef = ref(database, `users/${uid}`);
  const snap = await get(userRef);
  if (snap.exists()) {
    return { uid, ...snap.val() } as UserProfile;
  }
  // First time: bootstrap from Firebase Auth
  const firebaseUser = auth.currentUser;
  const defaults = DEFAULT_PROFILE(firebaseUser || { uid });
  await set(userRef, { ...defaults, createdAt: serverTimestamp() });
  return { ...defaults, uid } as UserProfile;
}

/** Partial update of user profile fields */
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = ref(database, `users/${uid}`);
  const { uid: _omit, ...rest } = data as any;
  await update(userRef, { ...rest, updatedAt: serverTimestamp() });
}

/** Update notification preferences */
export async function updateNotificationPrefs(
  uid: string,
  prefs: UserProfile["preferences"]["notifications"]
) {
  const prefRef = ref(database, `users/${uid}/preferences/notifications`);
  await set(prefRef, prefs);
}
