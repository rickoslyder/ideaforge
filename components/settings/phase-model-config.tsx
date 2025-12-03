"use client";

import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { ModelList } from "./model-list";
import { useModelConfig } from "@/hooks/use-model-config";
import { useModels } from "@/hooks/use-models";
import type { Phase } from "@/lib/db/types";
import { PHASE_INFO } from "@/types/project";

export function PhaseModelConfig() {
  const { config, setPhaseModel, getModelForPhase, resetToDefaults } =
    useModelConfig();
  const { getModelByModelString } = useModels();
  const [openPhases, setOpenPhases] = useState<Phase[]>([]);

  const togglePhase = (phase: Phase) => {
    setOpenPhases((prev) =>
      prev.includes(phase) ? prev.filter((p) => p !== phase) : [...prev, phase]
    );
  };

  const phases: Phase[] = ["request", "spec", "plan"];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Phase-Specific Models</CardTitle>
            <CardDescription>
              Override the default model for specific phases
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {phases.map((phase) => {
          const phaseInfo = PHASE_INFO[phase];
          const currentModel = config.phaseModels[phase];
          const effectiveModel = getModelForPhase(phase);
          const modelInfo = getModelByModelString(effectiveModel);
          const isOpen = openPhases.includes(phase);
          const isOverridden = !!currentModel;

          return (
            <Collapsible
              key={phase}
              open={isOpen}
              onOpenChange={() => togglePhase(phase)}
            >
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center justify-between w-full p-4 rounded-lg border transition-colors",
                    isOpen ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-left">
                        {phaseInfo.label} Phase
                      </div>
                      <div className="text-xs text-muted-foreground text-left">
                        {modelInfo?.displayName || effectiveModel}
                        {isOverridden && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Custom
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen && "rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 pl-2">
                <div className="space-y-3">
                  {isOverridden && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPhaseModel(phase, null)}
                    >
                      Use Default Model
                    </Button>
                  )}
                  <ModelList
                    selectedModel={effectiveModel}
                    onSelectModel={(model) => setPhaseModel(phase, model)}
                    showPricing={false}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </CardContent>
    </Card>
  );
}
