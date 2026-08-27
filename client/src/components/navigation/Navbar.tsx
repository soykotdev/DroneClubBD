import { useEffect, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Propeller } from "@/components/brand/Propeller";
import { useNavigation } from "@/hooks/usePublicData";
import { MobileMenu } from "./MobileMenu";
import { ServicesMegaMenu } from "./ServicesMegaMenu";

const FALLBACK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Inspection Process", href: "/inspection-process" },
  { label: "Equipment", href: "/equipment" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

// Only these routes render a full-bleed dark hero banner tall enough to sit
// behind a transparent white-text navbar at scroll position 0 (Home's
// <Hero>, the Equipment list page, and a service detail page). Every other
// route starts on a plain light background, so a transparent nav with white
// text there would be invisible — exactly the bug this list fixes.
function pageHasDarkHeroAtTop(pathname: string): boolean {
  if (pathname === "/") return true;
  if (pathname === "/equipment") return true;
  if (/^\/services\/[^/]+$/.test(pathname)) return true;
  return false;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: navigation } = useNavigation();
  const location = useLocation();

  // "Services" gets its own mega menu, rendered separately below — filter
  // it out of the plain link list so it isn't shown twice.
  const links = (navigation?.primary ?? FALLBACK_LINKS).filter((link) => link.label !== "Services");

  // "solid" (opaque bar, dark text) instead of raw `scrolled` drives every
  // color/background decision below — it's also true on pages with no dark
  // hero to sit over, regardless of scroll position.
  const solid = scrolled || !pageHasDarkHeroAtTop(location.pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        // The horizontal gutter lives here, on the full-width header, so the
        // bar below is centered by mx-auto within whatever space remains —
        // never left-anchored with a lopsided gap on wide screens.
        solid ? "px-3 pt-3 sm:px-4" : "px-0 pt-0"
      }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between transition-[padding,background-color,box-shadow,border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          // Scrolled state must fully occlude whatever hero/page content is
          // passing underneath it — a narrow centered pill left gaps on
          // both sides for that content to peek through. This stays
          // full-bleed (minus the header's own gutter) instead, so it
          // always reads as a solid bar regardless of scroll position.
          solid
            ? "rounded-2xl border border-black/10 bg-white/95 px-4 py-2 shadow-lg shadow-black/5 backdrop-blur-md"
            : "bg-transparent px-4 py-5 sm:px-6 lg:px-8"
        }`}
      >
        <Link to="/" className="flex items-center gap-2" aria-label="Drone Club Bangladesh home">
          <Logo variant={solid ? "icon" : "full"} height={solid ? 32 : 36} plate={!solid} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          <ServicesMegaMenu dark={!solid} />
          {links.map((link) => (
            <NavLink
              key={link.href}
              to={link.href}
              end={link.href === "/"}
              className={({ isActive }) =>
                `relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  solid ? "text-brand-black hover:bg-black/5" : "text-white hover:bg-white/10"
                } ${isActive ? "font-semibold" : ""}`
              }
            >
              {({ isActive }) => (
                <span className="relative inline-flex items-center">
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-indicator"
                      className="absolute -bottom-1.5 left-0 right-0 h-[3px] rounded-full bg-brand-red"
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/request-inspection"
            className="group hidden items-center gap-1.5 rounded-full bg-brand-red px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-900/20 transition hover:bg-brand-red-dark sm:inline-flex"
          >
            Request a Service
            <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full lg:hidden"
            style={{ background: solid ? "rgba(6,6,6,0.06)" : "rgba(255,255,255,0.15)" }}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X size={22} color={solid ? "#060606" : "#fefefe"} />
                </motion.span>
              ) : (
                <motion.span key="propeller" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Propeller size={24} spinning={false} color={solid ? "#060606" : "#fefefe"} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <MobileMenu open={mobileOpen} links={navigation?.primary ?? FALLBACK_LINKS} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
