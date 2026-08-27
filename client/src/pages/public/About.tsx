import { Helmet } from "react-helmet-async";

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      <Helmet>
        <title>About — Drone Club Bangladesh</title>
      </Helmet>

      <h1 className="font-heading text-[clamp(2rem,4vw,3rem)] font-semibold text-brand-black">About Drone Club Bangladesh</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-brand-graphite">
        Drone Club Bangladesh provides drone-based solar panel inspection, aerial cleaning, operation and maintenance
        support, drone equipment supply and professional drone training.
      </p>

      <div className="relative mt-10 overflow-hidden rounded-2xl">
        <img
          src="/assets/images/12-company-team.png"
          alt="Placeholder team photograph — to be replaced with a real team photo from the admin media library"
          className="w-full object-cover"
        />
        <span className="absolute bottom-3 right-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
          Temporary placeholder — replace via Admin → Media Library
        </span>
      </div>

      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-brand-graphite">
        Company history, team profiles and additional details will be added here as they are confirmed and entered
        through the admin panel — nothing on this page is invented.
      </p>
    </div>
  );
}
