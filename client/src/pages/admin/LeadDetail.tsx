import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { INSPECTION_REQUEST_STATUSES, INSPECTION_REQUEST_PRIORITIES } from "@droneclub/shared";
import { api, ApiRequestError } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";

interface LeadDetailPayload {
  lead: {
    _id: string;
    referenceNumber: string;
    fullName: string;
    companyName: string;
    position?: string;
    email: string;
    phone: string;
    service: string;
    projectLocation: string;
    facilityType: string;
    systemCapacity?: string;
    panelQuantity?: string;
    siteArea?: string;
    preferredDate?: string;
    message?: string;
    attachments: Array<{ url: string; originalFilename: string }>;
    status: string;
    priority: string;
    estimatedValue?: number | null;
    convertedToProjectId?: string | null;
  };
  notes: Array<{ _id: string; note: string; createdAt: string }>;
}

export default function LeadDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", id],
    queryFn: () => api.get<LeadDetailPayload>(`/admin/leads/${id}`),
  });

  const updateMutation = useMutation({
    mutationFn: (update: { status?: string; priority?: string }) => api.patch(`/admin/leads/${id}`, update),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "leads", id] }),
  });

  const noteMutation = useMutation({
    mutationFn: (text: string) => api.post(`/admin/leads/${id}/notes`, { note: text }),
    onSuccess: () => {
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["admin", "leads", id] });
    },
  });

  const convertMutation = useMutation({
    mutationFn: () => api.post<{ _id: string }>(`/admin/leads/${id}/convert`),
    onSuccess: (project) => navigate(`/admin/projects/${project._id}`),
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Failed to convert to project"),
  });

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Propeller size={32} />
      </div>
    );
  }

  const { lead, notes } = data;

  return (
    <div>
      <Link to="/admin/leads" className="text-sm text-brand-graphite hover:text-brand-black">
        ← Back to requests
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-brand-black">{lead.referenceNumber}</h1>
        {!lead.convertedToProjectId ? (
          <button
            type="button"
            onClick={() => convertMutation.mutate()}
            disabled={convertMutation.isPending}
            className="min-h-[44px] rounded-full bg-brand-red px-5 text-sm font-semibold text-white hover:bg-brand-red-dark disabled:opacity-60"
          >
            {convertMutation.isPending ? "Converting…" : "Convert to Project"}
          </button>
        ) : (
          <Link to={`/admin/projects/${lead.convertedToProjectId}`} className="text-sm font-medium text-brand-red">
            View converted project →
          </Link>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-brand-red">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-2xl border border-brand-border bg-white p-6">
            <h2 className="font-heading text-base font-semibold text-brand-black">Contact & Project</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <Info label="Full Name" value={lead.fullName} />
              <Info label="Company" value={lead.companyName} />
              <Info label="Position" value={lead.position} />
              <Info label="Email" value={lead.email} />
              <Info label="Phone" value={lead.phone} />
              <Info label="Service" value={lead.service.replace(/-/g, " ")} />
              <Info label="Location" value={lead.projectLocation} />
              <Info label="Facility Type" value={lead.facilityType} />
              <Info label="System Capacity" value={lead.systemCapacity} />
              <Info label="Panel Quantity" value={lead.panelQuantity} />
              <Info label="Site Area" value={lead.siteArea} />
              <Info label="Preferred Date" value={lead.preferredDate} />
            </dl>
            {lead.message && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">Message</p>
                <p className="mt-1 text-sm text-brand-black">{lead.message}</p>
              </div>
            )}
            {lead.attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">Attachments</p>
                <ul className="mt-1 space-y-1">
                  {lead.attachments.map((file) => (
                    <li key={file.url}>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-brand-red hover:underline">
                        {file.originalFilename}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-brand-border bg-white p-6">
            <h2 className="font-heading text-base font-semibold text-brand-black">Internal Notes</h2>
            <div className="mt-4 flex gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note visible only to staff…"
                className="min-h-[44px] flex-1 rounded-lg border border-brand-border px-4 text-sm"
              />
              <button
                type="button"
                disabled={!note.trim() || noteMutation.isPending}
                onClick={() => noteMutation.mutate(note.trim())}
                className="min-h-[44px] rounded-full bg-brand-black px-5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <ul className="mt-4 space-y-3">
              {notes.map((n) => (
                <li key={n._id} className="rounded-lg bg-brand-light p-3 text-sm">
                  <p>{n.note}</p>
                  <p className="mt-1 text-xs text-brand-graphite">{new Date(n.createdAt).toLocaleString()}</p>
                </li>
              ))}
              {notes.length === 0 && <p className="text-sm text-brand-graphite">No notes yet.</p>}
            </ul>
          </section>
        </div>

        <section className="rounded-2xl border border-brand-border bg-white p-6">
          <h2 className="font-heading text-base font-semibold text-brand-black">Status</h2>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-brand-graphite">Status</label>
          <select
            value={lead.status}
            onChange={(e) => updateMutation.mutate({ status: e.target.value })}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-brand-border px-3 text-sm capitalize"
          >
            {INSPECTION_REQUEST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/-/g, " ")}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-brand-graphite">Priority</label>
          <select
            value={lead.priority}
            onChange={(e) => updateMutation.mutate({ priority: e.target.value })}
            className="mt-1 min-h-[44px] w-full rounded-lg border border-brand-border px-3 text-sm capitalize"
          >
            {INSPECTION_REQUEST_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </section>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-brand-graphite">{label}</dt>
      <dd className="mt-0.5 text-brand-black">{value}</dd>
    </div>
  );
}
