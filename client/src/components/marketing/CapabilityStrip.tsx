import { Thermometer, Map, Sparkles, Droplets, FileText } from "lucide-react";
import { RedCircle } from "@/components/brand/RedCircle";

// Only supported facts per spec Section 10, Section 2 — no synthetic counters.
const CAPABILITIES = [
  { icon: Thermometer, label: "Thermal + RGB Inspection" },
  { icon: Map, label: "Georeferenced Orthomosaic" },
  { icon: Sparkles, label: "AI-Assisted Anomaly Detection" },
  { icon: Droplets, label: "Up to 800 m² Cleaning Per Hour" },
  { icon: FileText, label: "Maintenance Reporting" },
];

export function CapabilityStrip() {
  return (
    <section className="border-b border-brand-border bg-brand-light py-10" aria-label="Capabilities">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-5 lg:px-8">
        {CAPABILITIES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 text-center">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
              <Icon size={20} color="var(--brand-black)" aria-hidden="true" />
              <RedCircle size={6} variant="pulse" className="absolute -right-0.5 -top-0.5" />
            </span>
            <span className="text-xs font-medium leading-snug text-brand-graphite sm:text-sm">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
