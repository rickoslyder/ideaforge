"use client";

import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IssueList } from "./issue-list";
import type { CoherenceAnalysis } from "@/lib/llm/coherence";

interface CoherenceResultProps {
  analysis: CoherenceAnalysis;
  className?: string;
}

export function CoherenceResult({ analysis, className }: CoherenceResultProps) {
  const scoreColor =
    analysis.overall_coherence_score >= 8
      ? "text-green-500"
      : analysis.overall_coherence_score >= 5
        ? "text-yellow-500"
        : "text-red-500";

  const scoreLabel =
    analysis.overall_coherence_score >= 8
      ? "Good"
      : analysis.overall_coherence_score >= 5
        ? "Needs Work"
        : "Poor";

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Coherence Analysis</CardTitle>
          <div className="flex items-center gap-2">
            <span className={cn("text-2xl font-bold", scoreColor)}>
              {analysis.overall_coherence_score}
            </span>
            <span className="text-sm text-muted-foreground">/10</span>
            <Badge
              variant={
                analysis.overall_coherence_score >= 8 ? "default" : "secondary"
              }
            >
              {scoreLabel}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="p-3 rounded-lg bg-muted">
          <p className="text-sm">{analysis.summary}</p>
        </div>

        {/* Issues */}
        <IssueList issues={analysis.issues} />

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-sm">
          {analysis.issues.filter((i) => i.severity === "high").length === 0 ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">
                No critical issues detected
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">
                Critical issues require attention
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
