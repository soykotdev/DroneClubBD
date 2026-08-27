import { useEffect, useState, type ReactNode } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactInfoSchema,
  projectInfoSchema,
  supportingInfoSchema,
  type ContactInfoInput,
  type ProjectInfoInput,
  type SupportingInfoInput,
} from "@droneclub/shared";
import { SERVICE_CATEGORIES } from "@droneclub/shared";
import { StepIndicator } from "@/components/forms/StepIndicator";
import { RedCircle } from "@/components/brand/RedCircle";
import { Propeller } from "@/components/brand/Propeller";
import { api, ApiRequestError } from "@/lib/api";

const SERVICE_LABELS: Record<(typeof SERVICE_CATEGORIES)[number], string> = {
  "solar-panel-inspection": "Solar Panel Inspection",
  "solar-panel-cleaning": "Solar Panel Cleaning",
  "operation-maintenance": "Operation & Maintenance",
  "uav-survey-mapping": "UAV Survey & Mapping",
  "lidar-survey": "UAV LiDAR Survey",
  "drone-photogrammetry": "Drone Photogrammetry",
  "aerial-image-acquisition": "Aerial Image Acquisition",
  "3d-mapping-modeling": "3D Mapping & Modeling",
  "power-line-tower-inspection": "Power Line & Tower Inspection",
  "construction-progress-monitoring": "Construction Progress Monitoring",
  "disaster-assessment": "Flood & Disaster Assessment",
  "equipment-training": "Drone Equipment & Training",
};

const STEP_LABELS = ["Contact", "Project", "Supporting Info"];
const DRAFT_KEY = "dcb_inspection_request_draft";

type FormValues = ContactInfoInput & ProjectInfoInput & Omit<SupportingInfoInput, "consent"> & { consent: boolean };

export default function RequestInspection() {
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [sitePlan, setSitePlan] = useState<FileList | null>(null);
  const [images, setImages] = useState<FileList | null>(null);
  const [documents, setDocuments] = useState<FileList | null>(null);

  const schema = [contactInfoSchema, projectInfoSchema, supportingInfoSchema][step]!;
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: loadDraft(),
    mode: "onBlur",
  });

  // Session draft preservation (text fields only — never files) per spec Section 12.
  useEffect(() => {
    const subscription = { unsubscribe: () => undefined };
    const interval = setInterval(() => {
      const values = getValues();
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
    }, 2000);
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [getValues]);

  function loadDraft(): Partial<FormValues> {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  async function goNext() {
    const fieldsForStep = Object.keys((schema as unknown as { shape: object }).shape ?? {}) as Array<keyof FormValues>;
    const valid = await trigger(fieldsForStep);
    if (valid) setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: FormValues) {
    setStatus("submitting");
    setServerError(null);

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      formData.append(key, String(value));
    });
    appendFiles(formData, "sitePlan", sitePlan);
    appendFiles(formData, "images", images);
    appendFiles(formData, "documents", documents);

    try {
      const result = await api.post<{ referenceNumber: string }>("/public/inspection-requests", formData, { isFormData: true });
      setReferenceNumber(result.referenceNumber);
      setStatus("success");
      sessionStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      setStatus("error");
      setServerError(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success" && referenceNumber) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
        <RedCircle size={20} variant="pulse" />
        <h1 className="mt-6 font-heading text-2xl font-semibold text-brand-black">Request received</h1>
        <p className="mt-3 text-brand-graphite">
          Your reference number is <strong className="text-brand-black">{referenceNumber}</strong>. Our team will
          review your request and get back to you.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Helmet>
        <title>Request a Service — Drone Club Bangladesh</title>
      </Helmet>
      <h1 className="font-heading text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold text-brand-black">Request a Service</h1>

      <div className="mt-8">
        <StepIndicator steps={STEP_LABELS} currentStep={step} />
      </div>

      <form
        className="mt-10 space-y-5"
        noValidate
        onSubmit={step === STEP_LABELS.length - 1 ? handleSubmit(onSubmit) : (e) => e.preventDefault()}
      >
        {/* Honeypot — must remain empty; a bot filling it silently fails validation server-side. */}
        <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register("companyWebsite")} />

        {step === 0 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">Contact Information</legend>
            <Field label="Full Name" error={errors.fullName?.message}>
              <input className={inputClass} {...register("fullName")} />
            </Field>
            <Field label="Company Name" error={errors.companyName?.message}>
              <input className={inputClass} {...register("companyName")} />
            </Field>
            <Field label="Position (optional)">
              <input className={inputClass} {...register("position")} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input type="email" className={inputClass} {...register("email")} />
            </Field>
            <Field label="Phone" error={errors.phone?.message}>
              <input type="tel" className={inputClass} {...register("phone")} />
            </Field>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">Project Information</legend>
            <Field label="Service Required" error={errors.service?.message}>
              <select className={inputClass} {...register("service")} defaultValue="">
                <option value="" disabled>
                  Select a service
                </option>
                {SERVICE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {SERVICE_LABELS[cat]}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Project Location" error={errors.projectLocation?.message}>
              <input className={inputClass} {...register("projectLocation")} />
            </Field>
            <Field label="Site / Facility Type" error={errors.facilityType?.message}>
              <input className={inputClass} placeholder="e.g. Solar farm, construction site, transmission corridor" {...register("facilityType")} />
            </Field>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Approximate System Capacity (optional)">
                <input className={inputClass} placeholder="e.g. 5 MW" {...register("systemCapacity")} />
              </Field>
              <Field label="Approximate Panel Quantity (optional)">
                <input className={inputClass} {...register("panelQuantity")} />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Site Area (optional)">
                <input className={inputClass} placeholder="e.g. 10,000 m²" {...register("siteArea")} />
              </Field>
              <Field label="Preferred Date (optional)">
                <input type="date" className={inputClass} {...register("preferredDate")} />
              </Field>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-5">
            <legend className="sr-only">Supporting Information</legend>
            <Field label="Message (optional)">
              <textarea rows={4} className={inputClass} {...register("message")} />
            </Field>
            <Field label="Site Plan (optional)">
              <input type="file" accept="image/*,application/pdf" multiple className={fileInputClass} onChange={(e) => setSitePlan(e.target.files)} />
            </Field>
            <Field label="Supporting Images (optional)">
              <input type="file" accept="image/*" multiple className={fileInputClass} onChange={(e) => setImages(e.target.files)} />
            </Field>
            <Field label="Supporting Documents (optional)">
              <input type="file" accept="application/pdf" multiple className={fileInputClass} onChange={(e) => setDocuments(e.target.files)} />
            </Field>

            <div className="flex items-start gap-3">
              <input id="consent" type="checkbox" className="mt-1 h-5 w-5" {...register("consent", { setValueAs: (v) => v === true || v === "true" })} onChange={(e) => setValue("consent", e.target.checked)} />
              <label htmlFor="consent" className="text-sm text-brand-graphite">
                I consent to Drone Club Bangladesh contacting me about this request and processing the information
                provided for that purpose.
              </label>
            </div>
            {errors.consent && <p className="text-sm text-brand-red">{errors.consent.message}</p>}
          </fieldset>
        )}

        {serverError && (
          <p role="alert" className="text-sm text-brand-red">
            {serverError}
          </p>
        )}

        <div className="flex justify-between pt-4">
          {step > 0 ? (
            <button type="button" onClick={goBack} className="min-h-[44px] rounded-full border border-brand-border px-6 text-sm font-semibold text-brand-black">
              Back
            </button>
          ) : (
            <span />
          )}

          {step < STEP_LABELS.length - 1 ? (
            <button type="button" onClick={goNext} className="min-h-[44px] rounded-full bg-brand-red px-6 text-sm font-semibold text-white transition hover:bg-brand-red-dark">
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-red px-6 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:opacity-60"
            >
              {status === "submitting" && <Propeller size={16} color="white" />}
              {status === "submitting" ? "Submitting…" : "Submit Request"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function appendFiles(formData: FormData, field: string, files: FileList | null) {
  if (!files) return;
  Array.from(files).forEach((file) => formData.append(field, file));
}

const inputClass =
  "mt-1 min-h-[44px] w-full rounded-lg border border-brand-border px-4 py-2 focus:border-brand-red focus:outline-none";
const fileInputClass = "mt-1 w-full text-sm text-brand-graphite file:mr-4 file:min-h-[44px] file:rounded-full file:border-0 file:bg-brand-light file:px-4 file:text-sm file:font-semibold file:text-brand-black";

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-brand-black">{label}</label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-brand-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
