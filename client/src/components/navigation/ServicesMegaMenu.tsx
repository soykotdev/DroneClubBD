import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Scan,
  Droplets,
  Wrench,
  MapPinned,
  Radar,
  Boxes,
  Camera,
  Layers3,
  Zap,
  Building2,
  CloudRainWind,
  GraduationCap,
} from "lucide-react";
import { SignalArc } from "@/components/brand/SignalArc";
import { useServices } from "@/hooks/usePublicData";

// Icon lookup by category — falls back to a generic mark for anything new
// so the menu never breaks when services are added from the admin panel
// without a matching icon yet.
const CATEGORY_ICONS: Record<string, typeof Scan> = {
  "solar-panel-inspection": Scan,
  "solar-panel-cleaning": Droplets,
  "operation-maintenance": Wrench,
  "uav-survey-mapping": MapPinned,
  "lidar-survey": Radar,
  "drone-photogrammetry": Boxes,
  "aerial-image-acquisition": Camera,
  "3d-mapping-modeling": Layers3,
  "power-line-tower-inspection": Zap,
  "construction-progress-monitoring": Building2,
  "disaster-assessment": CloudRainWind,
  "equipment-training": GraduationCap,
};

interface ServicesMegaMenuProps {
  dark: boolean;
}

export function ServicesMegaMenu({ dark }: ServicesMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: services } = useServices();
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();

  function scheduleClose() {
    closeTimeout.current = setTimeout(() => setOpen(false), 120);
  }
  function cancelClose() {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        // Keep it open while focus is still somewhere inside the menu —
        // spec Section 9: "Ensure dropdowns remain open while focus is inside."
        if (!containerRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          dark ? "text-white hover:bg-white/10" : "text-brand-black hover:bg-black/5"
        }`}
      >
        <Link to="/services" className="outline-none">
          Services
        </Link>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-1/2 top-full z-50 mt-3 w-[760px] max-w-[92vw] -translate-x-1/2 overflow-hidden rounded-2xl border border-brand-border bg-white p-5 shadow-xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">Our Services</span>
              <SignalArc size={36} />
            </div>
            <div className="grid grid-cols-3 gap-1">
              {services?.map((service) => {
                const Icon = CATEGORY_ICONS[service.category] ?? Scan;
                return (
                  <Link
                    key={service._id}
                    to={`/services/${service.slug}`}
                    className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-brand-light"
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-light group-hover:bg-white">
                      <Icon size={16} color="var(--brand-red)" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-brand-black">{service.title}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-brand-graphite line-clamp-2">{service.summary}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
            <Link
              to="/services"
              className="mt-3 inline-flex items-center gap-1.5 border-t border-brand-border pt-3 text-sm font-semibold text-brand-red"
            >
              View all services <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
