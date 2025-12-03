"use client";

import { MessageSquare, FileText, ListChecks, Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Phase } from "@/lib/db/types";
import { PHASE_CONFIGS, isPhaseComplete, canAccessPhase } from "@/types/phase";

const icons = {
  MessageSquare,
  FileText,
  ListChecks,
};

interface PhaseIndicatorProps {
  currentPhase: Phase;
  activePhase: Phase;
  onPhaseClick: (phase: Phase) => void;
}

export function PhaseIndicator({
  currentPhase,
  activePhase,
  onPhaseClick,
}: PhaseIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 border-b bg-background px-4 py-3">
      {PHASE_CONFIGS.map((phase, index) => {
        const Icon = icons[phase.icon as keyof typeof icons];
        const isComplete = isPhaseComplete(currentPhase, phase.id);
        const isActive = activePhase === phase.id;
        const canAccess = canAccessPhase(currentPhase, phase.id);

        return (
          <div key={phase.id} className="flex items-center">
            {index > 0 && (
              <div
                className={cn(
                  "mx-2 h-0.5 w-8 sm:w-12",
                  isComplete ? "bg-primary" : "bg-border"
                )}
              />
            )}

            <button
              onClick={() => canAccess && onPhaseClick(phase.id)}
              disabled={!canAccess}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 sm:py-2",
                isActive && "bg-primary text-primary-foreground",
                !isActive && isComplete && "text-primary hover:bg-primary/10",
                !isActive && !isComplete && canAccess && "text-muted-foreground hover:bg-secondary",
                !canAccess && "cursor-not-allowed text-muted-foreground/50"
              )}
            >
              {isComplete ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">{phase.label}</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
