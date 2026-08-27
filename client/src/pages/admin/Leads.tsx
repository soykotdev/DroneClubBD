import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { INSPECTION_REQUEST_STATUSES, SERVICE_CATEGORIES } from "@droneclub/shared";
import { api } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";

interface Lead {
  _id: string;
  referenceNumber: string;
  fullName: string;
  companyName: string;
  email: string;
  service: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function Leads() {
  const [status, setStatus] = useState("");
  const [service, setService] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "leads", { status, service, search }],
    queryFn: () =>
      api.get<Lead[]>(
        `/admin/leads?${new URLSearchParams({ ...(status && { status }), ...(service && { service }), ...(search && { search }) })}`
      ),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-brand-black">Inspection Requests</h1>
        <a
          href={`/api/admin/leads/export.csv?${new URLSearchParams({ ...(status && { status }), ...(service && { service }) })}`}
          className="min-h-[44px] rounded-full border border-brand-border px-4 py-2 text-sm font-medium text-brand-black hover:bg-black/5"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search name, company, email, reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-h-[44px] flex-1 rounded-lg border border-brand-border px-4 text-sm"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="min-h-[44px] rounded-lg border border-brand-border px-3 text-sm">
          <option value="">All statuses</option>
          {INSPECTION_REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/-/g, " ")}
            </option>
          ))}
        </select>
        <select value={service} onChange={(e) => setService(e.target.value)} className="min-h-[44px] rounded-lg border border-brand-border px-3 text-sm">
          <option value="">All services</option>
          {SERVICE_CATEGORIES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/-/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-border bg-white">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Propeller size={28} />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="p-8 text-center text-sm text-brand-graphite">No inspection requests match these filters.</p>
        ) : (
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-brand-graphite">
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Priority</th>
                <th className="px-6 py-3">Received</th>
              </tr>
            </thead>
            <tbody>
              {data.map((lead) => (
                <tr key={lead._id} className="border-t border-brand-border hover:bg-brand-light">
                  <td className="px-6 py-3">
                    <Link to={`/admin/leads/${lead._id}`} className="font-medium text-brand-red">
                      {lead.referenceNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-3">
                    {lead.fullName}
                    <div className="text-xs text-brand-graphite">{lead.companyName}</div>
                  </td>
                  <td className="px-6 py-3 capitalize">{lead.service.replace(/-/g, " ")}</td>
                  <td className="px-6 py-3 capitalize">{lead.status.replace(/-/g, " ")}</td>
                  <td className="px-6 py-3 capitalize">{lead.priority}</td>
                  <td className="px-6 py-3">{new Date(lead.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
