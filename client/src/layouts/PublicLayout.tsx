import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { CursorHotspot } from "@/components/brand/CursorHotspot";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function PublicLayout() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <CursorHotspot />
      <Navbar />
      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
