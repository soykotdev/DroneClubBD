import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { RedCircle } from "@/components/brand/RedCircle";
import { SignalArc } from "@/components/brand/SignalArc";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const HEADLINE_LINES = ["Survey Smarter.", "Inspect Faster.", "Deliver with Precision."];

export function Hero() {
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Light pointer-responsive depth on desktop only (spec Section 10) — the
  // background drifts a few px opposite the cutout for a subtle parallax
  // read, never enough to distract from the headline.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 60, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 60, damping: 20 });
  const cutoutX = useTransform(springX, (v) => v * 18);
  const cutoutY = useTransform(springY, (v) => v * 14);
  const bgX = useTransform(springX, (v) => v * -8);
  const bgY = useTransform(springY, (v) => v * -6);

  useEffect(() => {
    if (reducedMotion) return;
    const query = window.matchMedia("(pointer: fine)");
    if (!query.matches) return; // touch devices: no pointer parallax

    const handleMove = (event: MouseEvent) => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!rect) return;
      pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
      pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [reducedMotion, pointerX, pointerY]);

  return (
    <section ref={sectionRef} className="relative flex min-h-[92vh] items-center overflow-hidden bg-brand-black text-white">
      <motion.div className="absolute inset-0" style={reducedMotion ? undefined : { x: bgX, y: bgY, scale: 1.06 }}>
        <picture>
          <source media="(max-width: 640px)" srcSet="/assets/images/15-mobile-homepage-hero.png" />
          <img
            src="/assets/images/01-homepage-hero.png"
            alt="Aerial view of an engineering site in Bangladesh at dusk, captured by a survey and inspection drone"
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
        </picture>
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/60 to-black/40" aria-hidden="true" />

      {/* Scanning line sweep — evokes the drone's panel-by-panel pass, per
          spec: "Solar-panel scanning lines activate as the drone passes." */}
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent"
          initial={{ top: "-10%" }}
          animate={{ top: "110%" }}
          transition={{ duration: 5, delay: 1.4, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
        />
      )}

      {/* Enterprise drone cutout — enters from upper-right along a restrained
          flight path, then idles with a gentle hover bob and responds to
          the pointer for a light parallax depth cue. */}
      <motion.div
        className="pointer-events-none absolute right-[-4%] top-[8%] hidden w-[38%] max-w-xl md:block"
        style={reducedMotion ? undefined : { x: cutoutX, y: cutoutY }}
      >
        <motion.img
          src="/assets/images/02-enterprise-drone-cutout.png"
          alt=""
          aria-hidden="true"
          className="w-full"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 80, y: -40, rotate: -6 }}
          animate={
            reducedMotion
              ? { opacity: 1 }
              : { opacity: 1, x: 0, y: [0, -10, 0], rotate: 0 }
          }
          transition={
            reducedMotion
              ? { duration: 0.4 }
              : {
                  opacity: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                  x: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                  rotate: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.1 },
                }
          }
        />
      </motion.div>

      <div className="absolute right-[12%] top-[38%] hidden md:block">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          <RedCircle size={18} variant="scan" />
        </motion.div>
        <motion.div
          className="mt-2"
          animate={reducedMotion ? undefined : { opacity: [0.6, 1, 0.6] }}
          transition={reducedMotion ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <SignalArc size={48} />
        </motion.div>
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/90"
          >
            <RedCircle size={8} variant="pulse" />
            Advanced UAV Solutions
          </motion.p>

          <h1 className="font-heading text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.05]">
            {HEADLINE_LINES.map((line, index) => (
              <motion.span
                key={line}
                className="block"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {line}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="mt-6 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg"
          >
            Professional UAV solutions for surveying, LiDAR mapping, aerial imaging, solar inspection and
            infrastructure monitoring, delivering accurate data and actionable insights for smarter decisions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <Link
              to="/request-inspection"
              className="min-h-[44px] rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition hover:bg-brand-red-dark"
            >
              Request a Service
            </Link>
            <Link
              to="/services"
              className="min-h-[44px] rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Our Services
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
