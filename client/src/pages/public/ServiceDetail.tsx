import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { useService } from "@/hooks/usePublicData";
import { Propeller } from "@/components/brand/Propeller";
import NotFound from "./NotFound";

export default function ServiceDetail() {
  const { slug = "" } = useParams();
  const { data: service, isLoading, isError } = useService(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Propeller size={32} />
      </div>
    );
  }

  if (isError || !service) return <NotFound />;

  return (
    <article>
      <Helmet>
        <title>{service.title} — Drone Club Bangladesh</title>
        <meta name="description" content={service.summary} />
      </Helmet>

      <div className="relative h-[45vh] min-h-[320px] w-full overflow-hidden bg-brand-black">
        <img src={service.heroImage.url} alt={service.heroImage.alt} className="h-full w-full object-cover opacity-70" />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent">
          <div className="mx-auto w-full max-w-4xl px-4 pb-10 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className="mb-3 text-xs text-white/70">
              <Link to="/services" className="hover:text-white">
                Services
              </Link>{" "}
              / {service.title}
            </nav>
            <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold text-white">{service.title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="whitespace-pre-line text-base leading-relaxed text-brand-graphite">{service.description}</p>
        <Link
          to="/request-inspection"
          className="mt-10 inline-block min-h-[44px] rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-dark"
        >
          Request a Service
        </Link>
      </div>
    </article>
  );
}
