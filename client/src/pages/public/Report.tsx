import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Logo } from "@/components/brand/Logo";
import { Propeller } from "@/components/brand/Propeller";

interface ReportPayload {
  title: string;
  fileUrl: string;
  project: { title: string; referenceNumber: string; location: string } | null;
}

/**
 * Branded, token-gated report access page — spec Section 13/17. The token
 * is never guessable; an invalid/expired/revoked token renders the same
 * generic error, so no information about which tokens exist ever leaks.
 */
export default function Report() {
  const { secureToken = "" } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public", "report", secureToken],
    queryFn: () => api.get<ReportPayload>(`/public/reports/${secureToken}`),
    enabled: Boolean(secureToken),
    retry: false,
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-black px-4 py-16 text-white">
      <Helmet>
        <title>Secure Report — Drone Club Bangladesh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <Logo variant="icon" height={64} />

      <div className="mt-10 w-full max-w-md rounded-2xl bg-white p-8 text-brand-black shadow-2xl">
        {isLoading && (
          <div className="flex justify-center py-8">
            <Propeller size={32} />
          </div>
        )}

        {isError && (
          <>
            <h1 className="font-heading text-xl font-semibold">Link unavailable</h1>
            <p className="mt-3 text-sm text-brand-graphite">
              This report link is invalid, has expired or has been revoked. Please request a new link from Drone Club
              Bangladesh.
            </p>
          </>
        )}

        {data && (
          <>
            <h1 className="font-heading text-xl font-semibold">{data.title}</h1>
            {data.project && (
              <p className="mt-2 text-sm text-brand-graphite">
                {data.project.title} · {data.project.location} · Ref: {data.project.referenceNumber}
              </p>
            )}
            <a
              href={data.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block min-h-[44px] rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-red-dark"
            >
              Download Report
            </a>
          </>
        )}
      </div>
    </div>
  );
}
