import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StepIndicator } from "./StepIndicator";

describe("StepIndicator", () => {
  it("marks the current step with aria-current for screen readers", () => {
    render(<StepIndicator steps={["Contact", "Project", "Supporting Info"]} currentStep={1} />);

    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(3);

    const current = screen.getByText("Project").closest("li");
    expect(current?.querySelector('[aria-current="step"]')).toBeInTheDocument();
  });
});
