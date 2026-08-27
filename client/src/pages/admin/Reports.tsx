import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";

interface AdminProject {
  _id: string;
  referenceNumber: string;
  title: string;
}

/**
 * Secure report sharing is managed per-project (generate/revoke links) —
 * see ProjectDetail. This page is the entry point: pick a project to manage
 * its report links.
 */
export default function Reports() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "projects"], queryFn: () => api.get<AdminProject[]>("/admin/projects") });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-black">Report Sharing</h1>
      <p className="mt-1 text-sm text-brand-graphite">Select a project to generate or revoke a secure report link.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-border bg-white">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Propeller size={28} />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-brand-graphite">No projects yet — convert a lead to a project first.</p>
        ) : (
          <ul className="divide-y divide-brand-border">
            {data.map((project) => (
              <li key={project._id} className="flex items-center justify-between px-6 py-4">
                <span>
                  {project.title} <span className="text-xs text-brand-graphite">({project.referenceNumber})</span>
                </span>
                <Link to={`/admin/projects/${project._id}`} className="text-sm font-semibold text-brand-red">
                  Manage Reports →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
