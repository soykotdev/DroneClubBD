import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useEquipment } from "@/hooks/usePublicData";
import { Propeller } from "@/components/brand/Propeller";
import NotFound from "./NotFound";

export default function EquipmentDetail() {
  const { slug = "" } = useParams();
  const { data: item, isLoading, isError } = useEquipment(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Propeller size={32} />
      </div>
    );
  }

  if (isError || !item) return <NotFound />;

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>{item.name} — Equipment — Drone Club Bangladesh</title>
      </Helmet>
      <img src={item.image.url} alt={item.image.alt} className="w-full rounded-2xl object-cover" />
      <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-wide text-brand-red">{item.category}</span>
      <h1 className="mt-1 font-heading text-[clamp(2rem,4vw,2.75rem)] font-semibold text-brand-black">{item.name}</h1>
      <p className="mt-4 text-base leading-relaxed text-brand-graphite">{item.useCase}</p>

      {item.specifications.length > 0 && (
        <dl className="mt-8 grid gap-4 border-t border-brand-border pt-6 sm:grid-cols-2">
          {item.specifications.map((spec) => (
            <div key={spec.label}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">{spec.label}</dt>
              <dd className="mt-1 text-sm text-brand-black">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}
