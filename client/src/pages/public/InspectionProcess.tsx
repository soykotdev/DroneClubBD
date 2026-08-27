import { Helmet } from "react-helmet-async";
import { WorkflowSection } from "@/components/marketing/WorkflowSection";

export default function InspectionProcess() {
  return (
    <div>
      <Helmet>
        <title>Inspection Process — Drone Club Bangladesh</title>
      </Helmet>
      <div className="mx-auto max-w-4xl px-4 pt-20 text-center sm:px-6 lg:px-8">
        <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold text-brand-black">Inspection Process</h1>
        <p className="mt-4 text-brand-graphite">
          Solar-asset inspection capabilities: drone mission planning, thermal and RGB image collection,
          surface-temperature observation, visible-light inspection, hotspot identification, defective-cell
          identification, crack and physical-defect findings, georeferenced orthomosaic preparation, AI-assisted
          anomaly detection, faulty-panel location identification, solar-asset productivity monitoring and
          prioritised maintenance reporting.
        </p>
      </div>
      <WorkflowSection />
    </div>
  );
}
