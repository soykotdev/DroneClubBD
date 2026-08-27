import { useEffect, useState } from "react";

/**
 * Mirrors prefers-reduced-motion so Motion-for-React animations (which CSS
 * media queries alone can't gate) can be disabled in code — per spec
 * Section 8: "Configure Motion to respect the user's reduced-motion setting."
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return reduced;
}
