import { Navigate } from "react-router-dom";
import { useAuth } from "./Auth/AuthProvider";

/**
 * Shared authentication guard used by authenticated pages.
 *
 * Mirrors the inline guard in App.tsx so any authenticated page
 * (e.g. SavedSpots) can wrap itself without re-implementing guard logic.
 * Behavior stays identical: loading state renders a polite aria-live
 * message, signed-out visitors redirect to home with an auth flag.
 */
export default function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" aria-live="polite">
        Loading your account…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/" replace state={{ authRequired: true }} />;
  }
  return <>{children}</>;
}
