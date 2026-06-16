"use client";

import type { FlowStage } from "@/store/gameStore";
import { useTranslation } from "@/hooks/useTranslation";

/** The recurring play steps, in order, shown as a progress indicator. */
const STEPS: { stage: FlowStage; key: string }[] = [
  { stage: "shop", key: "flow.step.shop" },
  { stage: "training", key: "flow.step.training" },
  { stage: "tournament", key: "flow.step.tournament" },
];

interface FlowStepperProps {
  current: FlowStage;
}

/** Horizontal "Discs → Training → Tournament" progress indicator. */
export default function FlowStepper({ current }: FlowStepperProps) {
  const { t } = useTranslation();
  const currentIndex = STEPS.findIndex((s) => s.stage === current);

  return (
    <ol className="stepper">
      {STEPS.map((step, index) => {
        const state =
          index === currentIndex
            ? "active"
            : index < currentIndex
            ? "done"
            : "todo";
        return (
          <li key={step.stage} className={`stepper-item stepper-${state}`}>
            <span className="stepper-num">{index + 1}</span>
            {t(step.key)}
          </li>
        );
      })}
    </ol>
  );
}
