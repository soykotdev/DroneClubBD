import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

interface MobileMenuProps {
  open: boolean;
  links: Array<{ label: string; href: string }>;
  onClose: () => void;
}

/**
 * Full-screen mobile navigation: focus-trapped, Escape-to-close,
 * background-scroll-locked, staggered item entrance — spec Section 9.
 */
export function MobileMenu({ open, links, onClose }: MobileMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    const previouslyFocused = document.activeElement as HTMLElement | null;
    containerRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !containerRef.current) return;
      const focusable = containerRef.current.querySelectorAll<HTMLElement>("a, button");
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="fixed inset-0 top-0 z-40 flex flex-col bg-brand-black px-6 pb-10 pt-24 lg:hidden"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <nav className="flex flex-1 flex-col gap-1" aria-label="Mobile primary">
            {links.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={link.href}
                  onClick={onClose}
                  className="block min-h-[44px] border-b border-white/10 py-4 text-lg font-medium text-white"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>
          <Link
            to="/request-inspection"
            onClick={onClose}
            className="mt-6 flex min-h-[44px] items-center justify-center rounded-full bg-brand-red px-5 py-3 text-center text-base font-semibold text-white"
          >
            Request a Service
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
