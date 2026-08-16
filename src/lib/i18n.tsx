/* VoltSetu i18n (Round 13) — English + Hindi toggle.
 *
 * Design notes:
 * - Lightweight React context; dictionaries are flat key maps with optional
 *   template interpolation ("{{value}}").
 * - The language choice is persisted to localStorage (key "vs-lang") and the
 *   default follows the system/browser Hindi preference.
 * - All visible rider/host UI strings go through useT(); untranslated keys
 *   fall back to English (the source-language dictionary), so adding a key
 *   never breaks a screen.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Lang = "en" | "hi";

export const EN: Record<string, string> = {
  // App shell
  "app.name": "VoltSetu",
  "nav.home": "Home",
  "nav.findSpots": "Find Spots",
  "nav.loyalty": "Loyalty",
  "nav.becomeHost": "Become a Host",
  "nav.howItWorks": "How It Works",
  "nav.pricing": "Pricing",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.signIn": "Sign In",
  "nav.getStarted": "Get Started",
  "nav.rescue": "RESCUE",
  "nav.rescueLong": "Roadside Rescue",
  "nav.installApp": "Install app",
  "nav.chooseCity": "Choose a city",
  "nav.more": "More",
  "nav.tripPlanner": "Trip Planner",
  "trip.fromMyLocation": "Start from my location",
  "trip.locDenied": "Location access was denied — type a place name instead",
  // Spot status
  "spot.available": "Available now",
  "spot.occupied": "Occupied",
  "spot.verified": "Verified Host",
  "spot.waitlist": "Join waitlist",
  "spot.waitlistJoined": "You're on the waitlist",
  "spot.waitlistPosition": "position",
  "spot.leaveWaitlist": "Leave waitlist",
  "spot.waitlistFull": "Waitlist full",
  "spot.perKm": "/km",
  "spot.bookNow": "Book Now",
  "spot.minutes": "min",
  "booking.busy": "This outlet is currently occupied",
  "booking.waitlistPrompt": "The host is using it right now. Join the waitlist and get notified when it's free.",
  "booking.joinWaitlist": "Join waitlist",
  "booking.signInToWaitlist": "Sign in to join",
  "booking.leaveWaitlist": "Leave waitlist",
  "spot.hour": "hr",
  "spot.rating": "rating",
  "spot.reviews": "reviews",
  "spot.facilities": "Facilities",
  "spot.type.home": "Home",
  "spot.type.shop": "Shop",
  "spot.type.cafe": "Café",
  "spot.type.office": "Office",
  "spot.type.parking": "Parking",
  "spot.seeMore": "See more",
  "spot.seeLess": "See less",
  "spot.distance": "away",
  // Trip planner
  "trip.title": "Plan My Charge",
  "trip.subtitle": "Find charging spots along your route",
  "trip.start": "Start",
  "trip.destination": "Destination",
  "trip.plan": "Find spots on route",
  "trip.spotsFound": "spots along your route",
  "trip.noSpots": "No spots found on this route — try widening the corridor",
  "trip.corridor": "Corridor radius",
  "trip.distance": "Total distance",
  // Dashboard / host
  "dash.title": "Host Dashboard",
  "dash.live": "Outlet available now",
  "dash.liveOff": "Outlet busy",
  "dash.pause.title": "Pause my listing",
  "dash.pause.on": "Listing paused",
  "dash.pause.off": "Listing live",
  "dash.pause.hint": "Hide your spot from search until you unpause",
  "dash.sessionsToday": "Sessions today",
  "dash.earnings": "Earnings",
  "dash.trend.7d": "7-day session trend",
  "dash.requests": "Booking requests",
  "dash.ratings": "Ratings",
  "dash.refer.title": "Invite a host, earn credit",
  "dash.refer.subtitle": "Every host you invite who gets verified earns you ₹50 booking credit.",
  "dash.refer.code": "Your referral code",
  "dash.refer.copy": "Copy code",
  "dash.refer.copied": "Copied!",
  "dash.refer.message": "Earn from your home outlet with VoltSetu — sign up with my code",
  "dash.refer.credits": "Referral credits",
  "dash.refer.referred": "hosts referred",
  // Waitlist / notifications
  "notify.spotFree": "Your spot is free now",
  "notify.spotFreeBody": "The spot you were waiting for just became available. Book it before someone else does.",
  // Ratings
  "rate.title": "Rate your experience",
  "rate.rider.title": "Rate this rider",
  "rate.punctuality": "Punctuality",
  "rate.courtesy": "Courtesy",
  "rate.submit": "Submit rating",
  "rate.thanks": "Thanks for your rating!",
  // Misc
  "common.loading": "Loading...",
  "common.error": "Something went wrong",
  "common.tryAgain": "Try again",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.learnMore": "Learn more",
  "common.findASpot": "Find a Spot",
  "common.viewAll": "View All",
  "common.map": "Map",
};

export const HI: Record<string, string> = {
  "app.name": "VoltSetu",
  "nav.home": "होम",
  "nav.findSpots": "स्पॉट ढूंढें",
  "nav.loyalty": "लॉयल्टी",
  "nav.becomeHost": "होस्ट बनें",
  "nav.howItWorks": "कैसे काम करता है",
  "nav.pricing": "मूल्य",
  "nav.about": "हमारे बारे में",
  "nav.contact": "संपर्क",
  "nav.signIn": "साइन इन",
  "nav.getStarted": "शुरू करें",
  "nav.rescue": "रेस्क्यू",
  "nav.rescueLong": "रोडसाइड रेस्क्यू",
  "nav.installApp": "ऐप इन्स्टॉल करें",
  "nav.chooseCity": "शहर चुनें",
  "nav.more": "और",
  "nav.tripPlanner": "यात्रा योजक",
  "trip.fromMyLocation": "अपने स्थान से शुरू करें",
  "trip.locDenied": "लोकेशन एक्सेस अस्वीकृत — कृपया स्थान का नाम टाइप करें",
  "spot.available": "अभी उपलब्ध",
  "spot.occupied": "व्यस्त",
  "spot.verified": "प्रमाणित होस्ट",
  "spot.waitlist": "वेटलिस्ट में जुड़ें",
  "spot.waitlistJoined": "आप वेटलिस्ट में हैं",
  "spot.waitlistPosition": "स्थान",
  "spot.leaveWaitlist": "वेटलिस्ट छोड़ें",
  "spot.waitlistFull": "वेटलिस्ट भरी हुई",
  "spot.perKm": "/किमी",
  "spot.bookNow": "अभी बुक करें",
  "spot.minutes": "मिनट",
  "booking.busy": "यह आउटलेट अबही व्यस्त है",
  "booking.waitlistPrompt": "होस्ट अबही इसे उपयोग में है। वेटलिस्ट में जुड़ें और जब यह खाली हो तो सूचित हों।",
  "booking.joinWaitlist": "वेटलिस्ट में जुड़ें",
  "booking.signInToWaitlist": "शामिल होने के लिए साइन इन करें",
  "booking.leaveWaitlist": "वेटलिस्ट छोड़ें",
  "spot.hour": "घंटा",
  "spot.rating": "रेटिंग",
  "spot.reviews": "रिव्यू",
  "spot.facilities": "सुविधाएँ",
  "spot.type.home": "घर",
  "spot.type.shop": "दुकान",
  "spot.type.cafe": "कैफे",
  "spot.type.office": "कार्यालय",
  "spot.type.parking": "पार्किंग",
  "spot.seeMore": "और देखें",
  "spot.seeLess": "कम देखें",
  "spot.distance": "दूर",
  "trip.title": "चार्ज प्लान करें",
  "trip.subtitle": "अपने रास्ते पर चार्जिंग स्पॉट ढूंढें",
  "trip.start": "शुरुआत",
  "trip.destination": "गंतव्य",
  "trip.plan": "रास्ते पर स्पॉट ढूंढें",
  "trip.spotsFound": "स्पॉट रास्ते पर मिले",
  "trip.noSpots": "इस रास्ते पर कोई स्पॉट नहीं मिला — कॉरिडोर बढ़ाएँ",
  "trip.corridor": "कॉरिडोर त्रिज्या",
  "trip.distance": "कुल दूरी",
  "dash.title": "होस्ट डैशबोर्ड",
  "dash.live": "आउटलेट अभी उपलब्ध",
  "dash.liveOff": "आउटलेट व्यस्त",
  "dash.pause.title": "लिस्टिंग रोकें",
  "dash.pause.on": "लिस्टिंग रोकी गई",
  "dash.pause.off": "लिस्टिंग लाइव",
  "dash.pause.hint": "रोकने तक खोज से स्पॉट छुपा दें",
  "dash.sessionsToday": "आज के सेशन",
  "dash.earnings": "कमाई",
  "dash.trend.7d": "7-दिन का सेशन ट्रेंड",
  "dash.requests": "बुकिंग अनुरोध",
  "dash.ratings": "रेटिंग",
  "dash.refer.title": "होस्ट बुलाएँ, क्रेडिट कमाएँ",
  "dash.refer.subtitle": "हर प्रमाणित होस्ट जो आपके कोड से जुड़ेगा, ₹50 क्रेडिट आपका।",
  "dash.refer.code": "आपका रेफरल कोड",
  "dash.refer.copy": "कोड कॉपी करें",
  "dash.refer.copied": "कॉपी हो गया!",
  "dash.refer.message": "VoltSetu के साथ अपने होम आउटलेट से कमाएँ — मेरे कोड से साइन अप करें",
  "dash.refer.credits": "रेफरल क्रेडिट",
  "dash.refer.referred": "होस्ट रेफर किए",
  "notify.spotFree": "आपका स्पॉट अब खाली है",
  "notify.spotFreeBody": "जिस स्पॉट का आप इंतजार कर रहे थे, वह अब उपलब्ध है। कोई और बुक करने से पहले बुक कर लें।",
  "rate.title": "अनुभव रेट करें",
  "rate.rider.title": "इस राइडर को रेट करें",
  "rate.punctuality": "समय की पालना",
  "rate.courtesy": "शिष्टाचार",
  "rate.submit": "रेटिंग दें",
  "rate.thanks": "रेटिंग के लिए धन्यवाद!",
  "common.loading": "लोड हो रहा है...",
  "common.error": "कुछ गड़बड़ हो गई",
  "common.tryAgain": "दोबारा कोशिश करें",
  "common.save": "सेव करें",
  "common.cancel": "रद्द करें",
  "common.close": "बंद करें",
  "common.learnMore": "और जानें",
  "common.findASpot": "स्पॉट ढूंढें",
  "common.viewAll": "सभी देखें",
  "common.map": "मैप",
};

const LANG_KEY = "vs-lang";

function defaultLang(): Lang {
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored === "en" || stored === "hi") return stored;
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("hi")) return "hi";
    return "en";
  } catch {
    return "en";
  }
}

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

function renderTemplate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : _match
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<LangContextValue>(() => {
    const dicts = lang === "hi" ? { primary: HI, fallback: EN } : { primary: EN, fallback: EN };
    const t = (key: string, vars?: Record<string, string | number>) => {
      const primary = dicts.primary[key];
      const raw =
        primary !== undefined && primary !== "" ? primary : dicts.fallback[key] ?? key;
      return renderTemplate(raw, vars);
    };
    return { lang, setLang, t };
  }, [lang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used inside LanguageProvider");
  return ctx.t;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return { lang: ctx.lang, setLang: ctx.setLang };
}
