import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";

interface AdminProject {
  _id: string;
  referenceNumber: string;
  title: string;
  category: string;
  projectStatus: string;
  status: string;
  isCaseStudy: boolean;
}

export default function Projects() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "projects"], queryFn: () => api.get<AdminProject[]>("/admin/projects") });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-black">Projects</h1>
      <p className="mt-1 text-sm text-brand-graphite">
        Projects are created by converting an inspection request from the Leads section.
      </p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-border bg-white">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Propeller size={28} />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-brand-graphite">No projects yet.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-brand-graphite">
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Project Status</th>
                <th className="px-6 py-3">Publish Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((project) => (
                <tr key={project._id} className="border-t border-brand-border hover:bg-brand-light">
                  <td className="px-6 py-3">
                    <Link to={`/admin/projects/${project._id}`} className="font-medium text-brand-red">
                      {project.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-3">{project.title}</td>
                  <td className="px-6 py-3 capitalize">{project.category}</td>
                  <td className="px-6 py-3 capitalize">{project.projectStatus.replace(/-/g, " ")}</td>
                  <td className="px-6 py-3 capitalize">{project.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
