import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Propeller } from "@/components/brand/Propeller";

interface SiteSettings {
  companyName: string;
  contact: { email?: string; phone?: string; address?: string };
  social: Record<string, string>;
  footerDescription?: string;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin", "settings"], queryFn: () => api.get<SiteSettings>("/admin/settings") });
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload: SiteSettings) => api.put("/admin/settings", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  if (isLoading || !form) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Propeller size={32} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-black">Site Settings</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate(form);
        }}
        className="mt-6 max-w-xl space-y-4 rounded-2xl border border-brand-border bg-white p-6"
      >
        <Field label="Company Name">
          <input className={fieldClass} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </Field>
        <Field label="Contact Email">
          <input type="email" className={fieldClass} value={form.contact.email ?? ""} onChange={(e) => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} />
        </Field>
        <Field label="Contact Phone">
          <input className={fieldClass} value={form.contact.phone ?? ""} onChange={(e) => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })} />
        </Field>
        <Field label="Address">
          <input className={fieldClass} value={form.contact.address ?? ""} onChange={(e) => setForm({ ...form, contact: { ...form.contact, address: e.target.value } })} />
        </Field>
        <Field label="Footer Description">
          <textarea rows={3} className={fieldClass} value={form.footerDescription ?? ""} onChange={(e) => setForm({ ...form, footerDescription: e.target.value })} />
        </Field>

        <button type="submit" disabled={saveMutation.isPending} className="min-h-[44px] rounded-full bg-brand-red px-6 text-sm font-semibold text-white disabled:opacity-60">
          {saveMutation.isPending ? "Saving…" : "Save Settings"}
        </button>
        {saved && <span className="ml-3 text-sm text-[color:var(--status-success)]">Saved.</span>}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-black">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

const fieldClass = "min-h-[44px] w-full rounded-lg border border-brand-border px-3 text-sm";
