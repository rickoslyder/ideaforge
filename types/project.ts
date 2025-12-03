import type { Phase, SpecConfig } from "@/lib/db/types";

// Client-side project types

export interface ProjectListItem {
  localId: string;
  remoteId?: string;
  name: string;
  currentPhase: Phase;
  initialIdea?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectDetail extends ProjectListItem {
  requestContent?: string;
  specContent?: string;
  specConfig?: SpecConfig;
  planContent?: string;
}

export interface CreateProjectInput {
  name: string;
  initialIdea?: string;
}

export interface UpdateProjectInput {
  name?: string;
  currentPhase?: Phase;
  requestContent?: string;
  specContent?: string;
  specConfig?: SpecConfig;
  planContent?: string;
}

// Phase display information
export const PHASE_INFO: Record<
  Phase,
  { label: string; description: string; color: string }
> = {
  request: {
    label: "Request",
    description: "Refine your idea into a structured request",
    color: "hsl(var(--phase-request))",
  },
  spec: {
    label: "Specification",
    description: "Generate a detailed technical specification",
    color: "hsl(var(--phase-spec))",
  },
  plan: {
    label: "Plan",
    description: "Create a step-by-step implementation plan",
    color: "hsl(var(--phase-plan))",
  },
};

export const PHASES: Phase[] = ["request", "spec", "plan"];
