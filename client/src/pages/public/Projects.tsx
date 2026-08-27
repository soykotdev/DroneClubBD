import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useProjects } from "@/hooks/usePublicData";
import { Propeller } from "@/components/brand/Propeller";
import { PROJECT_CATEGORIES } from "@droneclub/shared";

export default function Projects() {
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data: projects, isLoading } = useProjects(category);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <Helmet>
        <title>Projects — Drone Club Bangladesh</title>
      </Helmet>

      <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold text-brand-black">Projects</h1>

      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter projects by category">
        <button
          type="button"
          onClick={() => setCategory(undefined)}
          className={`min-h-[44px] rounded-full border px-4 text-sm font-medium ${!category ? "border-brand-red bg-brand-red text-white" : "border-brand-border text-brand-graphite"}`}
        >
          All
        </button>
        {PROJECT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`min-h-[44px] rounded-full border px-4 text-sm font-medium capitalize ${category === cat ? "border-brand-red bg-brand-red text-white" : "border-brand-border text-brand-graphite"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-14 flex justify-center">
          <Propeller size={32} />
        </div>
      ) : projects && projects.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/projects/${project.slug}`}
              className="group overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {project.coverImage && (
                <div className="h-44 overflow-hidden">
                  <img src={project.coverImage.url} alt={project.coverImage.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
              )}
              <div className="p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-red">{project.category}</span>
                <h3 className="mt-1 font-heading text-lg font-semibold text-brand-black">{project.title}</h3>
                <p className="mt-1 text-sm text-brand-graphite">{project.location}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-dashed border-brand-border bg-brand-light p-12 text-center">
          <h2 className="font-heading text-lg font-semibold text-brand-black">No published projects yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-brand-graphite">
            Completed projects will appear here as case studies once they are published from the admin panel.
          </p>
        </div>
      )}
    </div>
  );
}
