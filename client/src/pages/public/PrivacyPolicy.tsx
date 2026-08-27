import { Helmet } from "react-helmet-async";

export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <Helmet>
        <title>Privacy Policy — Drone Club Bangladesh</title>
      </Helmet>
      <h1 className="font-heading text-[clamp(2rem,4vw,2.75rem)] font-semibold text-brand-black">Privacy Policy</h1>
      <p className="mt-6 text-brand-graphite">
        This page is a placeholder pending a finalised privacy policy from Drone Club Bangladesh. Content here is
        managed from the admin panel under Pages, and will be replaced with the confirmed policy text — nothing
        specific is asserted here that has not been confirmed by the company.
      </p>
    </div>
  );
}
