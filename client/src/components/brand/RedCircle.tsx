/**
 * The logo's red circular "O" — reused as hotspot marker, active nav
 * indicator, map marker, timeline progress point and dashboard status dot
 * per spec Section 8. `variant` controls which animation idea is applied.
 */
interface RedCircleProps {
  size?: number;
  variant?: "static" | "pulse" | "scan";
  className?: string;
}

export function RedCircle({ size = 14, variant = "static", className = "" }: RedCircleProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {variant === "scan" && (
        <span
          className="scan-ring absolute inset-0 rounded-full border-2"
          style={{ borderColor: "var(--brand-red)" }}
        />
      )}
      <span
        className={`relative rounded-full ${variant === "pulse" ? "red-circle-pulse" : ""}`}
        style={{ width: size, height: size, background: "var(--brand-red)", boxShadow: "0 0 0 3px var(--brand-red-glow)" }}
      />
    </span>
  );
}
