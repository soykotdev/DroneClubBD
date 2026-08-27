import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { RedCircle } from "@/components/brand/RedCircle";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Helmet>
        <title>Page Not Found — Drone Club Bangladesh</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <RedCircle size={20} variant="pulse" />
      <h1 className="mt-6 font-heading text-3xl font-semibold text-brand-black">Page not found</h1>
      <p className="mt-3 max-w-md text-brand-graphite">
        The page you are looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        to="/"
        className="mt-8 min-h-[44px] rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-dark"
      >
        Back to Home
      </Link>
    </div>
  );
}
