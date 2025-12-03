import { nanoid } from "nanoid";
import type { PlanStep, PlanTask, StepCategory } from "@/types/plan";
import { tryParseJson } from "./retry-repair";

interface ParsedStep {
  title: string;
  description: string;
  tasks: string[];
  category?: string;
  dependencies?: string[];
}

interface ParsedPlan {
  summary: string;
  steps: ParsedStep[];
}

// Parse plan from structured JSON in AI response
export function parsePlanFromJson(text: string): PlanStep[] | null {
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;

  const parsed = tryParseJson<ParsedPlan>(jsonText);
  if (!parsed || !parsed.steps) return null;

  return parsed.steps.map((step, index) => ({
    id: nanoid(),
    order: index,
    title: step.title,
    description: step.description,
    tasks: step.tasks.map((task) => ({
      id: nanoid(),
      title: task,
      completed: false,
    })),
    dependencies: step.dependencies,
    category: normalizeCategory(step.category),
  }));
}

// Parse plan from markdown format
export function parsePlanFromMarkdown(text: string): PlanStep[] {
  const steps: PlanStep[] = [];
  const lines = text.split("\n");

  let currentStep: Partial<PlanStep> | null = null;
  let currentTasks: PlanTask[] = [];
  let order = 0;

  for (const line of lines) {
    // Match step headers (## Step 1: Title or ## 1. Title)
    const stepMatch = line.match(/^##\s*(?:Step\s*)?\d+[.:]\s*(.+)/i);
    if (stepMatch) {
      // Save previous step
      if (currentStep?.title) {
        steps.push({
          id: nanoid(),
          order: order++,
          title: currentStep.title,
          description: currentStep.description || "",
          tasks: currentTasks,
          category: currentStep.category || "other",
        } as PlanStep);
      }

      // Start new step
      currentStep = {
        title: stepMatch[1].trim(),
        description: "",
        category: inferCategory(stepMatch[1]),
      };
      currentTasks = [];
      continue;
    }

    // Match tasks (- [ ] Task or - Task or * Task)
    const taskMatch = line.match(/^[-*]\s*(?:\[[ x]?\])?\s*(.+)/);
    if (taskMatch && currentStep) {
      currentTasks.push({
        id: nanoid(),
        title: taskMatch[1].trim(),
        completed: line.includes("[x]"),
      });
      continue;
    }

    // Add to description if we're in a step
    if (currentStep && line.trim() && !line.startsWith("#")) {
      currentStep.description =
        (currentStep.description || "") + line.trim() + " ";
    }
  }

  // Save last step
  if (currentStep?.title) {
    steps.push({
      id: nanoid(),
      order: order++,
      title: currentStep.title,
      description: currentStep.description?.trim() || "",
      tasks: currentTasks,
      category: currentStep.category || "other",
    } as PlanStep);
  }

  return steps;
}

// Parse plan from either format
export function parsePlan(text: string): PlanStep[] {
  // Try JSON first
  const jsonSteps = parsePlanFromJson(text);
  if (jsonSteps && jsonSteps.length > 0) {
    return jsonSteps;
  }

  // Fall back to markdown
  return parsePlanFromMarkdown(text);
}

function normalizeCategory(category?: string): StepCategory {
  if (!category) return "other";

  const normalized = category.toLowerCase().trim();
  const validCategories: StepCategory[] = [
    "setup",
    "backend",
    "frontend",
    "database",
    "integration",
    "testing",
    "deployment",
    "documentation",
    "other",
  ];

  if (validCategories.includes(normalized as StepCategory)) {
    return normalized as StepCategory;
  }

  return inferCategory(category);
}

function inferCategory(text: string): StepCategory {
  const lower = text.toLowerCase();

  if (
    lower.includes("setup") ||
    lower.includes("install") ||
    lower.includes("config")
  ) {
    return "setup";
  }
  if (
    lower.includes("api") ||
    lower.includes("backend") ||
    lower.includes("server")
  ) {
    return "backend";
  }
  if (
    lower.includes("ui") ||
    lower.includes("frontend") ||
    lower.includes("component")
  ) {
    return "frontend";
  }
  if (
    lower.includes("database") ||
    lower.includes("schema") ||
    lower.includes("migration")
  ) {
    return "database";
  }
  if (
    lower.includes("integration") ||
    lower.includes("connect") ||
    lower.includes("third-party")
  ) {
    return "integration";
  }
  if (lower.includes("test") || lower.includes("qa")) {
    return "testing";
  }
  if (
    lower.includes("deploy") ||
    lower.includes("release") ||
    lower.includes("ci/cd")
  ) {
    return "deployment";
  }
  if (lower.includes("doc") || lower.includes("readme")) {
    return "documentation";
  }

  return "other";
}
