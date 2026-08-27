import { useState } from "react";
import { motion } from "motion/react";
import { RedCircle } from "@/components/brand/RedCircle";

const STEPS = [
  { title: "Mission Planning", description: "Drone mission planning tailored to the site and array layout." },
  { title: "Drone Flight", description: "Automated flight over the solar asset." },
  { title: "Thermal and RGB Capture", description: "Surface-temperature and visible-light image collection." },
  { title: "Orthomosaic Processing", description: "Georeferenced orthomosaic map preparation." },
  { title: "AI-Assisted Anomaly Detection", description: "AI-assisted anomaly detection as part of the inspection workflow." },
  { title: "Faulty Panel Location", description: "Hotspot, defective-cell and physical-defect identification." },
  { title: "Maintenance Report", description: "Prioritised maintenance reporting for the operations team." },
];

/**
 * Interactive workflow built with React/SVG/CSS per spec Section 10 —
 * a horizontal stepper on desktop, vertical timeline on mobile. The moving
 * red circle marks the selected step.
 */
export function WorkflowSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-brand-light py-20" aria-labelledby="workflow-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="workflow-heading" className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-brand-black">
            Inspection Workflow
          </h2>
          <p className="mt-3 text-brand-graphite">Drone Flight → Thermal and RGB Images → Orthomosaic Map → AI-Assisted Anomaly Detection → Faulty Panel Identification → Maintenance Report</p>
        </div>

        <ol className="relative mt-14 flex flex-col gap-8 lg:flex-row lg:gap-0">
          <div className="absolute left-[22px] top-0 hidden h-full w-px bg-brand-border lg:hidden" aria-hidden="true" />
          <div className="absolute left-0 top-[22px] hidden w-full border-t border-brand-border lg:block" aria-hidden="true" />

          {STEPS.map((step, index) => {
            const isActive = index === active;
            return (
              <li key={step.title} className="relative flex flex-1 flex-row gap-4 lg:flex-col lg:items-center lg:px-2 lg:text-center">
                <button
                  type="button"
                  onClick={() => setActive(index)}
                  className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 bg-white text-sm font-semibold transition-colors"
                  style={{ borderColor: isActive ? "var(--brand-red)" : "var(--brand-border)" }}
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                >
                  {isActive ? (
                    <motion.span layoutId="workflow-marker">
                      <RedCircle size={12} variant="pulse" />
                    </motion.span>
                  ) : (
                    index + 1
                  )}
                </button>
                <div className="lg:mt-3">
                  <h3 className="font-heading text-sm font-semibold text-brand-black">{step.title}</h3>
                  <p className="mt-1 max-w-[16rem] text-xs leading-relaxed text-brand-graphite">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
