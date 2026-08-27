import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EQUIPMENT_CATEGORIES } from "@droneclub/shared";
import { api, ApiRequestError } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";

interface AdminEquipment {
  _id: string;
  name: string;
  slug: string;
  category: string;
  status: string;
}

const emptyForm = {
  name: "",
  slug: "",
  category: EQUIPMENT_CATEGORIES[0],
  shortDescription: "",
  useCase: "",
  imageUrl: "",
  imageAlt: "",
  status: "draft" as "draft" | "published",
};

export default function Equipment() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["admin", "equipment"], queryFn: () => api.get<AdminEquipment[]>("/admin/equipment") });

  const createMutation = useMutation({
    mutationFn: () =>
      api.post("/admin/equipment", {
        name: form.name,
        slug: form.slug || slugify(form.name),
        category: form.category,
        shortDescription: form.shortDescription,
        useCase: form.useCase,
        image: { url: form.imageUrl, alt: form.imageAlt },
        specifications: [],
        availability: "in-service",
        status: form.status,
        displayOrder: data?.length ?? 0,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "equipment"] });
      setShowForm(false);
      setForm(emptyForm);
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiRequestError ? err.message : "Failed to create equipment entry"),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-semibold text-brand-black">Equipment</h1>
        <button type="button" onClick={() => setShowForm((s) => !s)} className="min-h-[44px] rounded-full bg-brand-red px-5 text-sm font-semibold text-white hover:bg-brand-red-dark">
          {showForm ? "Cancel" : "New Equipment"}
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
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={fieldClass} />
          <input placeholder="Slug (auto-generated if blank)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className={fieldClass} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as typeof form.category })} className={fieldClass}>
            {EQUIPMENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })} className={fieldClass}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <input required placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className={fieldClass} />
          <input required placeholder="Image alt text" value={form.imageAlt} onChange={(e) => setForm({ ...form, imageAlt: e.target.value })} className={fieldClass} />
          <textarea required placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className={`${fieldClass} sm:col-span-2`} rows={2} />
          <textarea required placeholder="Use case" value={form.useCase} onChange={(e) => setForm({ ...form, useCase: e.target.value })} className={`${fieldClass} sm:col-span-2`} rows={3} />
          {error && <p className="text-sm text-brand-red sm:col-span-2">{error}</p>}
          <button type="submit" disabled={createMutation.isPending} className="min-h-[44px] rounded-full bg-brand-black px-5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
            {createMutation.isPending ? "Saving…" : "Save Equipment"}
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
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={item._id} className="border-t border-brand-border">
                  <td className="px-6 py-3 font-medium text-brand-black">{item.name}</td>
                  <td className="px-6 py-3 capitalize">{item.category}</td>
                  <td className="px-6 py-3 capitalize">{item.status}</td>
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
