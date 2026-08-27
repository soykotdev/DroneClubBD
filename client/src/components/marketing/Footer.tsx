import { Link } from "react-router-dom";
import { useState, type FormEvent } from "react";
import { Logo } from "@/components/brand/Logo";
import { useSiteSettings, useServices } from "@/hooks/usePublicData";
import { api } from "@/lib/api";

const QUICK_LINKS = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Equipment", href: "/equipment" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const { data: settings } = useSiteSettings();
  const { data: services } = useServices();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubscribe(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    try {
      await api.post("/public/newsletter", { email });
      setStatus("done");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <footer className="bg-brand-black text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <Logo height={32} plate />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            {settings?.footerDescription ??
              "Professional UAV solutions for surveying, LiDAR mapping, aerial imaging, infrastructure inspection and solar asset care."}
          </p>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-white">Services</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {services?.map((service) => (
              <li key={service._id}>
                <Link to={`/services/${service.slug}`} className="hover:text-white">
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-white">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link to={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          {settings?.contact?.email && <p className="mt-4 text-sm">{settings.contact.email}</p>}
          {settings?.contact?.phone && <p className="text-sm">{settings.contact.phone}</p>}
        </div>

        <div>
          <h3 className="font-heading text-sm font-semibold text-white">Stay Updated</h3>
          <form onSubmit={handleSubscribe} className="mt-4 flex flex-col gap-2">
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="min-h-[44px] rounded-full border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-white/40 focus:border-brand-red focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="min-h-[44px] rounded-full bg-brand-red px-4 text-sm font-semibold text-white transition hover:bg-brand-red-dark disabled:opacity-60"
            >
              {status === "loading" ? "Subscribing…" : "Subscribe"}
            </button>
            <span role="status" className="text-xs text-white/60">
              {status === "done" && "Subscribed — thank you."}
              {status === "error" && "Something went wrong. Please try again."}
            </span>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Drone Club Bangladesh. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms and Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
