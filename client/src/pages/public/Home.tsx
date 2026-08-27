import { Helmet } from "react-helmet-async";
import { Hero } from "@/components/marketing/Hero";
import { CapabilityStrip } from "@/components/marketing/CapabilityStrip";
import { CoreServices } from "@/components/marketing/CoreServices";
import { WorkflowSection } from "@/components/marketing/WorkflowSection";
import { CompareSlider } from "@/components/marketing/CompareSlider";
import { WhyUs } from "@/components/marketing/WhyUs";
import { FinalCta } from "@/components/marketing/FinalCta";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Drone Club Bangladesh — Advanced UAV Solutions</title>
        <meta
          name="description"
          content="Professional UAV solutions for surveying, LiDAR mapping, aerial imaging, solar inspection and infrastructure monitoring, delivering accurate data and actionable insights."
        />
      </Helmet>

      <Hero />
      <CapabilityStrip />
      <CoreServices />
      <WorkflowSection />

      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="comparison-heading">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="comparison-heading" className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-brand-black">
            RGB and Thermal Inspection
          </h2>
          <p className="mt-3 text-brand-graphite">
            Drag the handle to compare visible-light and thermal imagery captured during the same inspection flight.
          </p>
        </div>
        <div className="mt-10">
          <CompareSlider
            beforeSrc="/assets/images/04-rgb-solar-inspection.png"
            beforeAlt="RGB visible-light image of a solar panel array"
            afterSrc="/assets/images/05-thermal-solar-inspection.png"
            afterAlt="Thermal image of the same solar panel array showing surface-temperature variation"
          />
        </div>
      </section>

      <WhyUs />
      <FinalCta />
    </>
  );
}
