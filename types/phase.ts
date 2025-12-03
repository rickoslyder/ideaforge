import type { Phase } from "@/lib/db/types";

export type { Phase };

export interface PhaseConfig {
  id: Phase;
  label: string;
  description: string;
  icon: string;
}

export const PHASE_CONFIGS: PhaseConfig[] = [
  {
    id: "request",
    label: "Request",
    description: "Refine your idea into a structured request",
    icon: "MessageSquare",
  },
  {
    id: "spec",
    label: "Specification",
    description: "Generate a detailed technical specification",
    icon: "FileText",
  },
  {
    id: "plan",
    label: "Plan",
    description: "Create a step-by-step implementation plan",
    icon: "ListChecks",
  },
];

export function getPhaseIndex(phase: Phase): number {
  return PHASE_CONFIGS.findIndex((p) => p.id === phase);
}

export function getNextPhase(phase: Phase): Phase | null {
  const index = getPhaseIndex(phase);
  if (index < PHASE_CONFIGS.length - 1) {
    return PHASE_CONFIGS[index + 1].id;
  }
  return null;
}

export function getPreviousPhase(phase: Phase): Phase | null {
  const index = getPhaseIndex(phase);
  if (index > 0) {
    return PHASE_CONFIGS[index - 1].id;
  }
  return null;
}

export function isPhaseComplete(
  currentPhase: Phase,
  checkPhase: Phase
): boolean {
  return getPhaseIndex(checkPhase) < getPhaseIndex(currentPhase);
}

export function canAccessPhase(currentPhase: Phase, targetPhase: Phase): boolean {
  return getPhaseIndex(targetPhase) <= getPhaseIndex(currentPhase);
}
