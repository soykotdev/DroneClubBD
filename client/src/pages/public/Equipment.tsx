import { Helmet } from "react-helmet-async";
import { useEquipmentList } from "@/hooks/usePublicData";
import { Propeller } from "@/components/brand/Propeller";
import { Link } from "react-router-dom";

export default function Equipment() {
  const { data: equipment, isLoading } = useEquipmentList();

  return (
    <div className="relative">
      <div className="relative h-64 w-full overflow-hidden bg-brand-black">
        <img src="/assets/images/10-equipment-showcase-background.png" alt="" className="h-full w-full object-cover opacity-50" aria-hidden="true" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent">
          <h1 className="mx-auto w-full max-w-7xl px-4 pb-8 font-heading text-[clamp(2rem,4vw,3rem)] font-semibold text-white sm:px-6 lg:px-8">
            Equipment
          </h1>
        </div>
      </div>

      <Helmet>
        <title>Equipment — Drone Club Bangladesh</title>
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center">
            <Propeller size={32} />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {equipment?.map((item) => (
              <Link
                key={item._id}
                to={`/equipment/${item.slug}`}
                className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="h-44 overflow-hidden">
                  <img
                    src={item.image.url}
                    alt={item.image.alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-red">{item.category}</span>
                  <h3 className="mt-1 font-heading text-lg font-semibold text-brand-black">{item.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-graphite">{item.shortDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
