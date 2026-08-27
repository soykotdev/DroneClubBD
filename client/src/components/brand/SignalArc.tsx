import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The black/white signal arcs above the logo's red circle — used for radar
 * sweep, mega-menu opening, scroll-progress and hero background motifs per
 * spec Section 8. Purely decorative (aria-hidden).
 */
interface SignalArcProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

export function SignalArc({ size = 40, animate = true, className = "" }: SignalArcProps) {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = animate && !reducedMotion;

  return (
    <svg width={size} height={size / 2} viewBox="0 0 40 20" fill="none" aria-hidden="true" className={className}>
      {[{ r: 18, opacity: 0.9 }, { r: 12, opacity: 0.6 }, { r: 6, opacity: 0.35 }].map((arc, index) => (
        <motion.path
          key={arc.r}
          d={`M ${20 - arc.r} 20 A ${arc.r} ${arc.r} 0 0 1 ${20 + arc.r} 20`}
          stroke="var(--brand-black)"
          strokeWidth={1.6}
          strokeLinecap="round"
          initial={shouldAnimate ? { opacity: 0, scale: 0.85 } : { opacity: arc.opacity }}
          animate={{ opacity: arc.opacity, scale: 1 }}
          transition={shouldAnimate ? { duration: 0.5, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        />
      ))}
    </svg>
  );
}
