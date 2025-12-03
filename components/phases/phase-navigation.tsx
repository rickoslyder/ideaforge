"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Phase } from "@/lib/db/types";
import { PHASE_CONFIGS, getPhaseIndex } from "@/types/phase";

interface PhaseNavigationProps {
  activePhase: Phase;
  canGoNext: boolean;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function PhaseNavigation({
  activePhase,
  canGoNext,
  canGoPrevious,
  onNext,
  onPrevious,
}: PhaseNavigationProps) {
  const currentIndex = getPhaseIndex(activePhase);
  const prevPhase = currentIndex > 0 ? PHASE_CONFIGS[currentIndex - 1] : null;
  const nextPhase = currentIndex < PHASE_CONFIGS.length - 1 ? PHASE_CONFIGS[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between border-t bg-background p-4">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        {prevPhase ? prevPhase.label : "Back"}
      </Button>

      <Button
        onClick={onNext}
        disabled={!canGoNext}
        className="gap-2"
      >
        {nextPhase ? nextPhase.label : "Finish"}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
