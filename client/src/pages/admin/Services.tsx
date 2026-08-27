import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SERVICE_CATEGORIES } from "@droneclub/shared";
import { api, ApiRequestError } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";

interface AdminService {
  _id: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  status: string;
}

const emptyForm = {
  title: "",
  slug: "",
  category: SERVICE_CATEGORIES[0],
  summary: "",
  description: "",
  heroImageUrl: "",
  heroImageAlt: "",
  status: "draft" as "draft" | "published",
};

export default function Services() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "services"], queryFn: () => api.get<AdminService[]>("/admin/services") });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post("/admin/services", {
        title: form.title,
        slug: form.slug || slugify(form.title),
        category: form.category,
        summary: form.summary,
        description: form.description,
        heroImage: { url: form.heroImageUrl, alt: form.heroImageAlt },
        status: form.status,
        displayOrder: data?.length ?? 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "services"] });
      setShowForm(false);
      setForm(emptyForm);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Failed to create service"),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-brand-black">Services</h1>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="min-h-[44px] rounded-full bg-brand-red px-5 text-sm font-semibold text-white hover:bg-brand-red-dark"
        >
          {showForm ? "Cancel" : "New Service"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="mt-4 grid gap-3 rounded-2xl border border-brand-border bg-white p-6 sm:grid-cols-2"
        >
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldClass} />
          <input placeholder="Slug (auto-generated if blank)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={fieldClass} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })} className={fieldClass}>
            {SERVICE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })} className={fieldClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <input required placeholder="Hero image URL" value={form.heroImageUrl} onChange={(e) => setForm({ ...form, heroImageUrl: e.target.value })} className={fieldClass} />
          <input required placeholder="Hero image alt text" value={form.heroImageAlt} onChange={(e) => setForm({ ...form, heroImageAlt: e.target.value })} className={fieldClass} />
          <textarea required placeholder="Summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} className={`${fieldClass} sm:col-span-2`} rows={2} />
          <textarea required placeholder="Full description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${fieldClass} sm:col-span-2`} rows={4} />
          {error && <p className="text-sm text-brand-red sm:col-span-2">{error}</p>}
          <button type="submit" disabled={createMutation.isPending} className="min-h-[44px] rounded-full bg-brand-black px-5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
            {createMutation.isPending ? "Saving…" : "Save Service"}
          </button>
        </form>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-border bg-white">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Propeller size={28} />
          </div>
        ) : (
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-brand-graphite">
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((service) => (
                <tr key={service._id} className="border-t border-brand-border">
                  <td className="px-6 py-3 font-medium text-brand-black">{service.title}</td>
                  <td className="px-6 py-3 capitalize">{service.category.replace(/-/g, " ")}</td>
                  <td className="px-6 py-3 capitalize">{service.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

const fieldClass = "min-h-[44px] rounded-lg border border-brand-border px-3 text-sm";
