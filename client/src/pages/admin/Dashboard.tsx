import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";

interface DashboardData {
  totalEnquiries: number;
  newRequests: number;
  requestsByService: Array<{ service: string; count: number }>;
  pendingQuotations: number;
  activeProjects: number;
  completedProjects: number;
  publishedProjects: number;
  publishedServices: number;
  reportsUploaded: number;
  monthlyLeads: Array<{ month: string; count: number }>;
  recentEnquiries: Array<{ id: string; referenceNumber: string; fullName: string; companyName: string; service: string; status: string; createdAt: string }>;
}

const STAT_LABELS: Array<{ key: keyof DashboardData; label: string }> = [
  { key: "totalEnquiries", label: "Total Enquiries" },
  { key: "newRequests", label: "New Requests" },
  { key: "pendingQuotations", label: "Pending Quotations" },
  { key: "activeProjects", label: "Active Projects" },
  { key: "completedProjects", label: "Completed Projects" },
  { key: "publishedProjects", label: "Published Projects" },
  { key: "publishedServices", label: "Published Services" },
  { key: "reportsUploaded", label: "Active Report Links" },
];

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "dashboard"], queryFn: () => api.get<DashboardData>("/admin/dashboard") });

  if (isLoading || !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Propeller size={32} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-black">Dashboard</h1>
      <p className="mt-1 text-sm text-brand-graphite">
        Figures below come directly from the database — a value shows 0 rather than a placeholder when there is no data yet.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {STAT_LABELS.map(({ key, label }) => (
          <div key={key} className="rounded-2xl border border-brand-border bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-graphite">{label}</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-brand-black">{String(data[key])}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-brand-border bg-white p-6">
        <h2 className="font-heading text-base font-semibold text-brand-black">Monthly Leads</h2>
        {data.monthlyLeads.length === 0 ? (
          <p className="mt-4 text-sm text-brand-graphite">No inspection requests recorded yet.</p>
        ) : (
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyLeads} aria-label="Monthly inspection requests">
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="var(--brand-red)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {/* Accessible text summary of the chart, per spec Section 19. */}
        <ul className="sr-only">
          {data.monthlyLeads.map((point) => (
            <li key={point.month}>
              {point.month}: {point.count} inspection requests
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-brand-border bg-white">
        <h2 className="p-6 pb-0 font-heading text-base font-semibold text-brand-black">Recent Enquiries</h2>
        {data.recentEnquiries.length === 0 ? (
          <p className="p-6 text-sm text-brand-graphite">No enquiries yet.</p>
        ) : (
          <table className="mt-4 w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-t border-brand-border text-xs uppercase tracking-wide text-brand-graphite">
                <th className="px-6 py-3">Reference</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Service</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentEnquiries.map((lead) => (
                <tr key={lead.id} className="border-t border-brand-border">
                  <td className="px-6 py-3 font-medium text-brand-black">{lead.referenceNumber}</td>
                  <td className="px-6 py-3">
                    {lead.fullName} · {lead.companyName}
                  </td>
                  <td className="px-6 py-3 capitalize">{lead.service.replace(/-/g, " ")}</td>
                  <td className="px-6 py-3 capitalize">{lead.status.replace(/-/g, " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
