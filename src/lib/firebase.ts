// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeRiFBS4sKaM0KOaIgrC8VkxFHYARoS8s",
  authDomain: "charge-nest.firebaseapp.com",
  databaseURL: "https://charge-nest-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "charge-nest",
  storageBucket: "charge-nest.firebasestorage.app",
  messagingSenderId: "25271736707",
  appId: "1:25271736707:web:f4e792c64ce5b69dce7eb6",
  measurementId: "G-HVLLLQYEG9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
export default app;
