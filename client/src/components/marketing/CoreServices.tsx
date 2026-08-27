import { useServices } from "@/hooks/usePublicData";
import { ServiceCard } from "./ServiceCard";
import { Propeller } from "@/components/brand/Propeller";

export function CoreServices() {
  const { data: services, isLoading } = useServices();

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" id="services" aria-labelledby="core-services-heading">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="core-services-heading" className="font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-brand-black">
          Professional Drone Services
        </h2>
        <p className="mt-3 text-brand-graphite">
          From aerial surveying and LiDAR mapping to infrastructure inspection, solar maintenance and professional
          UAV training, we provide end-to-end drone solutions for engineering, energy and geospatial applications.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-12 flex justify-center">
          <Propeller size={32} />
        </div>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services?.map((service) => (
            <ServiceCard key={service._id} service={service} />
          ))}
        </div>
      )}
    </section>
  );
}
