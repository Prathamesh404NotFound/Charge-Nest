import React, { Suspense } from "react";

/**
 * LazyPage wraps a React.lazy-loaded page in a Suspense boundary with a
 * polished brand-matched loading fallback. Each call site receives its own
 * import function so Vite emits one chunk per page (route-level code splitting).
 *
 * Usage: <Route path="/spots" element={<LazyPage load={lazyFindSpots} />} />
 */
export function LazyPage({ load, fullScreen = false }: { load: () => Promise<{ default: React.ComponentType<any> }>; fullScreen?: boolean }) {
  const LazyComponent = React.lazy(load);
  const fallback = (
    <div className={`flex flex-col items-center justify-center ${fullScreen ? "min-h-screen" : "min-h-[50vh]"}`} aria-live="polite">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  );
  return (
    <Suspense fallback={fallback}>
      <LazyComponent />
    </Suspense>
  );
}
