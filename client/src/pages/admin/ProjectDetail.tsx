import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PROJECT_STATUSES } from "@droneclub/shared";
import { api, ApiRequestError } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";

interface AdminProject {
  _id: string;
  referenceNumber: string;
  title: string;
  slug: string;
  category: string;
  location: string;
  projectStatus: string;
  status: "draft" | "published" | "unpublished";
  isCaseStudy: boolean;
  summary: string;
}

interface ReportLink {
  id: string;
  title: string;
  expiresAt: string;
  revoked: boolean;
  downloadCount: number;
}

export default function ProjectDetail() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const [reportTitle, setReportTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: project, isLoading } = useQuery({ queryKey: ["admin", "projects", id], queryFn: () => api.get<AdminProject>(`/admin/projects/${id}`) });
  const { data: reportLinks } = useQuery({ queryKey: ["admin", "projects", id, "reports"], queryFn: () => api.get<ReportLink[]>(`/admin/projects/${id}/reports`) });

  const updateMutation = useMutation({
    mutationFn: (update: Partial<AdminProject>) => api.put(`/admin/projects/${id}`, update),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "projects", id] }),
  });

  const createReportMutation = useMutation({
    mutationFn: () =>
      api.post<{ shareUrl: string }>("/admin/reports", {
        projectId: id,
        title: reportTitle,
        fileUrl,
        expiresAt: new Date(expiresAt).toISOString(),
      }),
    onSuccess: (result) => {
      setShareUrl(result.shareUrl);
      setReportTitle("");
      setFileUrl("");
      setExpiresAt("");
      queryClient.invalidateQueries({ queryKey: ["admin", "projects", id, "reports"] });
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Failed to create report link"),
  });

  const revokeMutation = useMutation({
    mutationFn: (reportId: string) => api.delete(`/admin/reports/${reportId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "projects", id, "reports"] }),
  });

  if (isLoading || !project) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Propeller size={32} />
      </div>
    );
  }

  return (
    <div>
      <Link to="/admin/projects" className="text-sm text-brand-graphite hover:text-brand-black">
        ← Back to projects
      </Link>
      <h1 className="mt-3 font-heading text-2xl font-semibold text-brand-black">{project.title}</h1>
      <p className="text-sm text-brand-graphite">
        {project.referenceNumber} · {project.location}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-brand-border bg-white p-6">
          <h2 className="font-heading text-base font-semibold text-brand-black">Status</h2>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-brand-graphite">Project Status</label>
          <select
            value={project.projectStatus}
            onChange={(e) => updateMutation.mutate({ projectStatus: e.target.value as AdminProject["projectStatus"] })}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-brand-border px-3 text-sm capitalize"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/-/g, " ")}
              </option>
            ))}
          </select>

          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={project.isCaseStudy}
              onChange={(e) => updateMutation.mutate({ isCaseStudy: e.target.checked })}
              className="h-5 w-5"
            />
            Publish as case study
          </label>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-brand-graphite">Publish Status</label>
          <select
            value={project.status}
            onChange={(e) => updateMutation.mutate({ status: e.target.value as AdminProject["status"] })}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-brand-border px-3 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </section>

        <section className="rounded-2xl border border-brand-border bg-white p-6">
          <h2 className="font-heading text-base font-semibold text-brand-black">Secure Report Sharing</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              createReportMutation.mutate();
            }}
            className="mt-4 space-y-3"
          >
            <input required placeholder="Report title" value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-brand-border px-3 text-sm" />
            <input required placeholder="File URL (uploaded report)" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-brand-border px-3 text-sm" />
            <input required type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="min-h-[44px] w-full rounded-lg border border-brand-border px-3 text-sm" />
            {error && <p className="text-sm text-brand-red">{error}</p>}
            <button type="submit" disabled={createReportMutation.isPending} className="min-h-[44px] rounded-full bg-brand-red px-5 text-sm font-semibold text-white disabled:opacity-60">
              {createReportMutation.isPending ? "Generating…" : "Generate Share Link"}
            </button>
          </form>

          {shareUrl && (
            <p className="mt-3 break-all rounded-lg bg-brand-light p-3 text-sm">
              Share this link now — it will not be shown again: <strong>{shareUrl}</strong>
            </p>
          )}

          <ul className="mt-4 space-y-2">
            {reportLinks?.map((link) => (
              <li key={link.id} className="flex items-center justify-between rounded-lg bg-brand-light p-3 text-sm">
                <span>
                  {link.title} · expires {new Date(link.expiresAt).toLocaleDateString()} · {link.downloadCount} download(s)
                  {link.revoked && " · revoked"}
                </span>
                {!link.revoked && (
                  <button type="button" onClick={() => revokeMutation.mutate(link.id)} className="text-xs font-semibold text-brand-red">
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
