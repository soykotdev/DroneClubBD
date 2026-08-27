/**
 * Renders the supplied logo unmodified (spec Section 2: "Do not redesign
 * the company logo") — but the source file is a wide horizontal wordmark
 * (≈5.6:1), not a square icon, so it must never be force-cropped into a
 * circle (that was clipping most of the logo down to a meaningless sliver).
 *
 * Two variants, both derived from the same untouched artwork:
 * - "full"  — the complete wordmark ("DRONECLUB BANGLADESH" + mark), shown
 *             at its natural aspect ratio via object-contain. Use wherever
 *             there's enough horizontal room (desktop navbar, footer).
 * - "icon"  — a tight crop of just the red-D + propeller mark, inside a
 *             circular white plate. Use wherever space is icon-sized
 *             (compact mobile navbar, admin sidebar, avatar-style slots).
 */
interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
  imgClassName?: string;
  /** Rendered height in px. Width follows the artwork's own aspect ratio. */
  height?: number;
  /**
   * Wraps the "full" wordmark in a white plate — per spec Section 2: "For
   * dark footer areas, use a white background plate behind the original
   * logo unless an officially approved reversed logo exists." The "icon"
   * variant always has its own plate, so this only affects "full".
   */
  plate?: boolean;
}

const LOGO_FULL_ASPECT_RATIO = 1397 / 248;

export function Logo({ variant = "full", className = "", imgClassName = "", height = 40, plate = false }: LogoProps) {
  if (variant === "icon") {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-white shadow-sm ${className}`}
        style={{ width: height, height }}
      >
        <img
          src="/assets/images/logo-icon.png"
          alt="Drone Club Bangladesh"
          className={`h-[85%] w-[85%] rounded-full object-contain ${imgClassName}`}
        />
      </span>
    );
  }

  const width = height * LOGO_FULL_ASPECT_RATIO;

  const img = (
    <img
      src="/assets/images/logo-full.png"
      alt="Drone Club Bangladesh"
      className={`h-full w-full object-contain ${imgClassName}`}
    />
  );

  if (plate) {
    const padding = height * 0.18;
    return (
      <span
        className={`inline-flex shrink-0 items-center rounded-xl bg-white shadow-sm ${className}`}
        style={{ height: height + padding, paddingInline: padding, paddingBlock: padding / 2 }}
      >
        <span className="inline-flex" style={{ height, width }}>
          {img}
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex shrink-0 items-center ${className}`} style={{ height, width }}>
      {img}
    </span>
  );
}
