import { RedCircle } from "@/components/brand/RedCircle";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <ol className="flex items-center justify-between gap-2" aria-label="Form progress">
      {steps.map((label, index) => {
        const state = index < currentStep ? "done" : index === currentStep ? "active" : "upcoming";
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold"
              style={{
                borderColor: state === "upcoming" ? "var(--brand-border)" : "var(--brand-red)",
                background: state === "done" ? "var(--brand-red)" : "white",
                color: state === "done" ? "white" : "var(--brand-black)",
              }}
              aria-current={state === "active" ? "step" : undefined}
            >
              {state === "active" ? <RedCircle size={10} variant="pulse" /> : index + 1}
            </span>
            <span className="hidden text-sm font-medium text-brand-graphite sm:inline">{label}</span>
            {index < steps.length - 1 && <span className="h-px flex-1 bg-brand-border" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
