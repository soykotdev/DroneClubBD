import { Link } from "react-router-dom";
import { RedCircle } from "@/components/brand/RedCircle";
import { SignalArc } from "@/components/brand/SignalArc";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-brand-black py-24 text-white">
      <img
        src="/assets/images/14-final-cta-background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-black/50" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <RedCircle size={20} variant="scan" />
          <SignalArc size={56} />
        </div>
        <h2 className="font-heading text-[clamp(1.75rem,4vw,3rem)] font-semibold">
          Know What Is Happening Across Every Site.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            to="/request-inspection"
            className="min-h-[44px] rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-dark"
          >
            Request a Service
          </Link>
          <Link
            to="/contact"
            className="min-h-[44px] rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Talk to Our Team
          </Link>
        </div>
      </div>
    </section>
  );
}
