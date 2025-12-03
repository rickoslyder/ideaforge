"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils/cn";
import type { PlanStep, PlanTask } from "@/types/plan";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types/plan";

interface PlanStepItemProps {
  step: PlanStep;
  onTaskToggle: (stepId: string, taskId: string, completed: boolean) => void;
}

export function PlanStepItem({ step, onTaskToggle }: PlanStepItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const completedTasks = step.tasks.filter((t) => t.completed).length;
  const totalTasks = step.tasks.length;
  const isComplete = totalTasks > 0 && completedTasks === totalTasks;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div
      className={cn(
        "border rounded-lg overflow-hidden",
        isComplete && "border-green-500/50 bg-green-500/5"
      )}
    >
      <button
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}

        <div className="flex items-center gap-2 shrink-0">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-muted-foreground">
            {step.order + 1}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium truncate">{step.title}</h3>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                CATEGORY_COLORS[step.category]
              )}
            >
              {CATEGORY_LABELS[step.category]}
            </span>
          </div>
          {!isExpanded && step.description && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {step.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-muted-foreground">
            {completedTasks}/{totalTasks}
          </span>
          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all",
                isComplete ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {step.description && (
            <p className="text-sm text-muted-foreground pl-11">
              {step.description}
            </p>
          )}

          {step.tasks.length > 0 && (
            <div className="space-y-2 pl-11">
              {step.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={(completed) =>
                    onTaskToggle(step.id, task.id, completed)
                  }
                />
              ))}
            </div>
          )}

          {step.dependencies && step.dependencies.length > 0 && (
            <div className="pl-11 text-xs text-muted-foreground">
              <span className="font-medium">Depends on: </span>
              {step.dependencies.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TaskItemProps {
  task: PlanTask;
  onToggle: (completed: boolean) => void;
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors",
        task.completed && "opacity-60"
      )}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            "text-sm",
            task.completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </span>
        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {task.description}
          </p>
        )}
      </div>
    </label>
  );
}
