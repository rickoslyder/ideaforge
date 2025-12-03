export interface PlanStep {
  id: string;
  order: number;
  title: string;
  description: string;
  tasks: PlanTask[];
  dependencies?: string[];
  category: StepCategory;
}

export interface PlanTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export type StepCategory =
  | "setup"
  | "backend"
  | "frontend"
  | "database"
  | "integration"
  | "testing"
  | "deployment"
  | "documentation"
  | "other";

export interface GeneratedPlan {
  id: string;
  projectId: string;
  steps: PlanStep[];
  summary: string;
  createdAt: string;
  version: number;
}

export const CATEGORY_LABELS: Record<StepCategory, string> = {
  setup: "Setup",
  backend: "Backend",
  frontend: "Frontend",
  database: "Database",
  integration: "Integration",
  testing: "Testing",
  deployment: "Deployment",
  documentation: "Documentation",
  other: "Other",
};

export const CATEGORY_COLORS: Record<StepCategory, string> = {
  setup: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  backend: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  frontend: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  database: "bg-green-500/10 text-green-600 dark:text-green-400",
  integration: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  testing: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  deployment: "bg-red-500/10 text-red-600 dark:text-red-400",
  documentation: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  other: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};
