"use client";

import { PlanStepItem } from "./plan-step-item";
import type { PlanStep } from "@/types/plan";

interface PlanStepListProps {
  steps: PlanStep[];
  onTaskToggle: (stepId: string, taskId: string, completed: boolean) => void;
}

export function PlanStepList({ steps, onTaskToggle }: PlanStepListProps) {
  const totalTasks = steps.reduce((sum, step) => sum + step.tasks.length, 0);
  const completedTasks = steps.reduce(
    (sum, step) => sum + step.tasks.filter((t) => t.completed).length,
    0
  );
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {steps.length} steps • {totalTasks} tasks
        </span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {completedTasks}/{totalTasks} completed
          </span>
          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="font-medium">{Math.round(overallProgress)}%</span>
        </div>
      </div>

      <div className="space-y-3">
        {steps
          .sort((a, b) => a.order - b.order)
          .map((step) => (
            <PlanStepItem
              key={step.id}
              step={step}
              onTaskToggle={onTaskToggle}
            />
          ))}
      </div>
    </div>
  );
}
