import { useCallback, useRef, useState } from "react";
import { RedCircle } from "@/components/brand/RedCircle";

interface CompareSliderProps {
  beforeSrc: string;
  beforeAlt: string;
  afterSrc: string;
  afterAlt: string;
}

/**
 * Accessible RGB/thermal before-and-after slider per spec Section 10:
 * mouse + touch dragging, keyboard arrow control, labelled, reset button,
 * red circular handle.
 */
export function CompareSlider({ beforeSrc, beforeAlt, afterSrc, afterAlt }: CompareSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }, []);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full select-none overflow-hidden rounded-2xl bg-brand-black sm:aspect-[16/9]"
        onMouseMove={(event) => draggingRef.current && updateFromClientX(event.clientX)}
        onMouseUp={() => (draggingRef.current = false)}
        onMouseLeave={() => (draggingRef.current = false)}
        onTouchMove={(event) => updateFromClientX(event.touches[0]!.clientX)}
      >
        <img src={afterSrc} alt={afterAlt} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img
            src={beforeSrc}
            alt={beforeAlt}
            className="h-full object-cover"
            style={{ width: containerRef.current?.clientWidth ?? "100%", maxWidth: "none" }}
            draggable={false}
          />
        </div>

        <div
          className="absolute top-0 h-full w-0.5 bg-white/80"
          style={{ left: `${position}%` }}
          aria-hidden="true"
        />

        <div
          role="slider"
          tabIndex={0}
          aria-label="Reveal thermal vs. RGB imagery"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% RGB, ${100 - Math.round(position)}% thermal`}
          className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full bg-white shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red"
          style={{ left: `${position}%` }}
          onMouseDown={() => (draggingRef.current = true)}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 5));
            if (event.key === "ArrowRight") setPosition((p) => Math.min(100, p + 5));
            if (event.key === "Home") setPosition(0);
            if (event.key === "End") setPosition(100);
          }}
        >
          <RedCircle size={16} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-brand-graphite">
        <div className="flex gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand-black" /> RGB
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--thermal-orange)" }} /> Thermal
          </span>
        </div>
        <button
          type="button"
          onClick={() => setPosition(50)}
          className="min-h-[44px] rounded-full border border-brand-border px-4 text-xs font-semibold text-brand-black transition hover:bg-brand-light"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
