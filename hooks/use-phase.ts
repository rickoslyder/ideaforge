"use client";

import { usePathname, useRouter } from "next/navigation";
import type { Phase } from "@/lib/db/types";
import { getNextPhase, getPreviousPhase, canAccessPhase } from "@/types/phase";

export function usePhase(projectLocalId: string, currentPhase: Phase) {
  const router = useRouter();
  const pathname = usePathname();

  // Extract current phase from URL
  const urlPhase = pathname.split("/").pop() as Phase | undefined;
  const activePhase = urlPhase && ["request", "spec", "plan"].includes(urlPhase)
    ? urlPhase as Phase
    : currentPhase;

  function navigateToPhase(phase: Phase) {
    if (canAccessPhase(currentPhase, phase)) {
      router.push(`/projects/${projectLocalId}/${phase}`);
    }
  }

  function goToNextPhase() {
    const next = getNextPhase(activePhase);
    if (next && canAccessPhase(currentPhase, next)) {
      navigateToPhase(next);
    }
  }

  function goToPreviousPhase() {
    const prev = getPreviousPhase(activePhase);
    if (prev) {
      navigateToPhase(prev);
    }
  }

  const canGoNext = (() => {
    const next = getNextPhase(activePhase);
    return next !== null && canAccessPhase(currentPhase, next);
  })();

  const canGoPrevious = getPreviousPhase(activePhase) !== null;

  return {
    activePhase,
    navigateToPhase,
    goToNextPhase,
    goToPreviousPhase,
    canGoNext,
    canGoPrevious,
  };
}
