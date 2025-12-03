"use client";

import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { CoherenceIssue } from "@/lib/llm/coherence";

const SEVERITY_CONFIG = {
  high: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-900/20",
    borderColor: "border-red-200 dark:border-red-800",
  },
  medium: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
  },
  low: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
};

const TYPE_LABELS: Record<string, string> = {
  contradiction: "Contradiction",
  flow: "Flow Issue",
  terminology: "Terminology",
  style: "Style",
  completeness: "Completeness",
};

interface IssueListProps {
  issues: CoherenceIssue[];
  className?: string;
}

export function IssueList({ issues, className }: IssueListProps) {
  if (issues.length === 0) {
    return (
      <div
        className={cn(
          "text-center py-6 text-muted-foreground text-sm",
          className
        )}
      >
        No issues detected
      </div>
    );
  }

  // Group issues by severity
  const highIssues = issues.filter((i) => i.severity === "high");
  const mediumIssues = issues.filter((i) => i.severity === "medium");
  const lowIssues = issues.filter((i) => i.severity === "low");

  return (
    <div className={cn("space-y-3", className)}>
      {/* Summary */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-medium">{issues.length} issues found:</span>
        {highIssues.length > 0 && (
          <Badge variant="destructive">{highIssues.length} high</Badge>
        )}
        {mediumIssues.length > 0 && (
          <Badge className="bg-yellow-500">{mediumIssues.length} medium</Badge>
        )}
        {lowIssues.length > 0 && (
          <Badge variant="secondary">{lowIssues.length} low</Badge>
        )}
      </div>

      {/* Issue cards */}
      <div className="space-y-2">
        {issues.map((issue, index) => {
          const config = SEVERITY_CONFIG[issue.severity];
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border",
                config.bgColor,
                config.borderColor
              )}
            >
              <div className="flex items-start gap-2">
                <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", config.color)} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[issue.type] || issue.type}
                    </Badge>
                    {issue.location && (
                      <span className="text-xs text-muted-foreground">
                        {issue.location}
                      </span>
                    )}
                  </div>
                  <p className="text-sm">{issue.description}</p>
                  {issue.suggestion && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium">Suggestion:</span>{" "}
                      {issue.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
