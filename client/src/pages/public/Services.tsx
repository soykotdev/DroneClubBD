import { Helmet } from "react-helmet-async";
import { useServices } from "@/hooks/usePublicData";
import { ServiceCard } from "@/components/marketing/ServiceCard";
import { Propeller } from "@/components/brand/Propeller";

export default function Services() {
  const { data: services, isLoading } = useServices();

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Helmet>
        <title>Professional Drone Services — Drone Club Bangladesh</title>
        <meta
          name="description"
          content="UAV survey and mapping, LiDAR survey, photogrammetry, aerial data acquisition, infrastructure inspection, construction monitoring, disaster assessment, solar inspection and drone training."
        />
      </Helmet>

      <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold text-brand-black">Professional Drone Services</h1>
      <p className="mt-3 max-w-2xl text-brand-graphite">
        From aerial surveying and LiDAR mapping to infrastructure inspection, solar maintenance and professional UAV
        training, we provide end-to-end drone solutions for engineering, energy and geospatial applications.
      </p>

      {isLoading ? (
        <div className="mt-12 flex justify-center">
          <Propeller size={32} />
        </div>
      ) : services && services.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-brand-graphite">Services will appear here once published from the admin panel.</p>
      )}
    </div>
  );
}
