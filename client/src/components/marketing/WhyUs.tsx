import { Layers, Thermometer, MapPinned, BrainCircuit, PlaneTakeoff, GraduationCap } from "lucide-react";

const STRENGTHS = [
  { icon: Layers, title: "Integrated Inspection and Cleaning", description: "One provider for both drone inspection and aerial cleaning support." },
  { icon: Thermometer, title: "Thermal and RGB Data Collection", description: "Surface-temperature observation alongside visible-light imagery." },
  { icon: MapPinned, title: "Georeferenced Location Reporting", description: "Findings mapped back to their exact location on site." },
  { icon: BrainCircuit, title: "AI-Assisted Anomaly Detection Workflow", description: "AI-assisted detection built into the inspection process." },
  { icon: PlaneTakeoff, title: "Enterprise Drone Equipment", description: "DJI Matrice and Zenmuse platforms operated by a trained team." },
  { icon: GraduationCap, title: "Technical Training and Support", description: "Operational training for teams adopting drone-based asset care." },
];

export function WhyUs() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="why-us-heading">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="why-us-heading" className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-brand-black">
          Why Drone Club Bangladesh
        </h2>
      </div>
      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {STRENGTHS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-light">
              <Icon size={20} color="var(--brand-red)" aria-hidden="true" />
            </span>
            <div>
              <h3 className="font-heading text-base font-semibold text-brand-black">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-brand-graphite">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
