import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactMessageSchema, type ContactMessageInput } from "@droneclub/shared";
import { api, ApiRequestError } from "@/lib/api";
import { useSiteSettings } from "@/hooks/usePublicData";
import { RedCircle } from "@/components/brand/RedCircle";

export default function Contact() {
  const { data: settings } = useSiteSettings();
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactMessageInput>({ resolver: zodResolver(contactMessageSchema) });

  async function onSubmit(values: ContactMessageInput) {
    setServerError(null);
    try {
      await api.post("/public/contact", values);
      setSubmitted(true);
      reset();
    } catch (error) {
      setServerError(error instanceof ApiRequestError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <Helmet>
        <title>Contact — Drone Club Bangladesh</title>
      </Helmet>
      <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold text-brand-black">Contact</h1>
      {settings?.contact?.email && <p className="mt-3 text-brand-graphite">{settings.contact.email}</p>}
      {settings?.contact?.phone && <p className="text-brand-graphite">{settings.contact.phone}</p>}

      {submitted ? (
        <div role="status" className="mt-10 flex items-center gap-3 rounded-2xl bg-brand-light p-6">
          <RedCircle size={14} variant="pulse" />
          <p className="text-brand-black">Thank you — your message has been received. Our team will respond soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-5" noValidate>
          {/* Honeypot — hidden from real users, filled only by bots. */}
          <input type="text" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" {...register("companyWebsite")} />

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-black">
              Name
            </label>
            <input id="name" className="mt-1 min-h-[44px] w-full rounded-lg border border-brand-border px-4 focus:border-brand-red focus:outline-none" {...register("name")} />
            {errors.name && <p className="mt-1 text-sm text-brand-red">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-black">
              Email
            </label>
            <input id="email" type="email" className="mt-1 min-h-[44px] w-full rounded-lg border border-brand-border px-4 focus:border-brand-red focus:outline-none" {...register("email")} />
            {errors.email && <p className="mt-1 text-sm text-brand-red">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-brand-black">
              Subject (optional)
            </label>
            <input id="subject" className="mt-1 min-h-[44px] w-full rounded-lg border border-brand-border px-4 focus:border-brand-red focus:outline-none" {...register("subject")} />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-brand-black">
              Message
            </label>
            <textarea id="message" rows={5} className="mt-1 w-full rounded-lg border border-brand-border px-4 py-2 focus:border-brand-red focus:outline-none" {...register("message")} />
            {errors.message && <p className="mt-1 text-sm text-brand-red">{errors.message.message}</p>}
          </div>

          {serverError && (
            <p role="alert" className="text-sm text-brand-red">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:opacity-60"
          >
            {isSubmitting ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
