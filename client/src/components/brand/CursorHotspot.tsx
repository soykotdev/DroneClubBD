import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Cursor-following inspection point — one of the logo's red-circle motion
 * ideas from spec Section 8 ("Cursor-following inspection point on
 * desktop"). Fixed-position, pointer-events: none (never blocks clicks),
 * a light spring trail so it reads as a tracked "scan point" rather than
 * snapping to the raw cursor position. Desktop fine-pointer devices only —
 * disabled on touch and when the user prefers reduced motion.
 */
export function CursorHotspot() {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.4 });

  useEffect(() => {
    const query = window.matchMedia("(pointer: fine)");
    setEnabled(query.matches);
    const handler = (event: MediaQueryListEvent) => setEnabled(event.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!enabled || reducedMotion) return;

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener("pointermove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
  }, [enabled, reducedMotion, x, y]);

  if (!enabled || reducedMotion) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[70] mix-blend-difference"
      style={{ x: springX, y: springY, opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <span className="scan-ring absolute inset-0 -m-2 rounded-full border border-[color:var(--brand-red)]" />
        <span
          className="block rounded-full"
          style={{ width: 8, height: 8, background: "var(--brand-red)", boxShadow: "0 0 0 4px var(--brand-red-glow)" }}
        />
      </div>
    </motion.div>
  );
}
