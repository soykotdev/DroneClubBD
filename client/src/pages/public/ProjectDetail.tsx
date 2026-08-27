import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/usePublicData";
import { Propeller } from "@/components/brand/Propeller";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const { slug = "" } = useParams();
  const { data: project, isLoading, isError } = useProject(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Propeller size={32} />
      </div>
    );
  }

  if (isError || !project) return <NotFound />;

  return (
    <article className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>{project.title} — Projects — Drone Club Bangladesh</title>
      </Helmet>
      {project.coverImage && <img src={project.coverImage.url} alt={project.coverImage.alt} className="w-full rounded-2xl object-cover" />}
      <span className="mt-6 inline-block text-xs font-semibold uppercase tracking-wide text-brand-red">{project.category}</span>
      <h1 className="mt-1 font-heading text-[clamp(2rem,4vw,2.75rem)] font-semibold text-brand-black">{project.title}</h1>
      <p className="mt-2 text-sm text-brand-graphite">{project.location}</p>
      <p className="mt-6 text-base leading-relaxed text-brand-graphite">{project.description || project.summary}</p>
    </article>
  );
}
