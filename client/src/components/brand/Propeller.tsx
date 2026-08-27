/**
 * Three-blade propeller motif traced from the logo — used ONLY for loading
 * states (initial loader, button loading, admin data loading) per spec
 * Section 8. Never used as ambient/continuous site-wide decoration.
 */
interface PropellerProps {
  size?: number;
  spinning?: boolean;
  className?: string;
  color?: string;
}

export function Propeller({ size = 32, spinning = true, className = "", color = "var(--brand-black)" }: PropellerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      role="img"
      aria-label="Loading"
      className={`${spinning ? "propeller-spin" : ""} ${className}`}
    >
      <circle cx="24" cy="24" r="3.5" fill="var(--brand-red)" />
      {[0, 120, 240].map((angle) => (
        <path
          key={angle}
          d="M24 24 C 24 14, 30 8, 38 9 C 36 17, 31 22, 24 24 Z"
          fill={color}
          opacity={0.9}
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
    </svg>
  );
}
