import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { PublicService } from "@/hooks/usePublicData";

/**
 * On hover: the whole card lifts slightly, the image gets a controlled
 * zoom, the border darkens, a subtle shadow appears, a short red scanning
 * line sweeps, and the "Learn More" arrow nudges right — no rotation or
 * bounce, all on smooth CSS transitions.
 */
export function ServiceCard({ service }: { service: PublicService }) {
  return (
    <Link
      to={`/services/${service.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-black/20 hover:shadow-lg"
    >
      <div className="relative aspect-[16/10] shrink-0 overflow-hidden">
        <img
          src={service.heroImage.url}
          alt={service.heroImage.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <span
          className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-brand-red transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
          aria-hidden="true"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-heading text-lg font-semibold text-brand-black">{service.title}</h3>
        <p className="flex-1 text-sm leading-relaxed text-brand-graphite">{service.summary}</p>
        <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-red">
          Learn More{" "}
          <ArrowRight size={16} className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
