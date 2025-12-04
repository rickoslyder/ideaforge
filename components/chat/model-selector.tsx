"use client";

import { ChevronDown, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useModelConfig } from "@/hooks/use-model-config";
import { useModels } from "@/hooks/use-models";
import type { Phase } from "@/lib/db/types";
import Link from "next/link";

interface ModelSelectorProps {
  phase: Phase;
  disabled?: boolean;
}

export function ModelSelector({ phase, disabled }: ModelSelectorProps) {
  const { getModelForPhase, setPhaseModel, config } = useModelConfig();
  const { models, modelsByProvider, getModelByModelString, providerNames } = useModels();

  const currentModel = getModelForPhase(phase);
  const modelInfo = getModelByModelString(currentModel);
  const isOverridden = !!config.phaseModels[phase];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
          disabled={disabled}
        >
          <Sparkles className="h-3 w-3" />
          <span className="max-w-[120px] truncate">
            {modelInfo?.displayName || currentModel}
          </span>
          {isOverridden && (
            <span className="text-[10px] text-primary">(custom)</span>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[220px]">
        <DropdownMenuLabel className="text-xs">Select Model</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(["openai", "anthropic", "google", "ollama"] as const).map((provider) => {
          const providerModels = modelsByProvider[provider];
          if (providerModels.length === 0) return null;

          return (
            <div key={provider}>
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                {providerNames[provider]}
              </DropdownMenuLabel>
              {providerModels.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setPhaseModel(phase, model.model)}
                  className="text-xs"
                >
                  <span className={currentModel === model.model ? "font-medium" : ""}>
                    {model.displayName}
                  </span>
                  {currentModel === model.model && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          );
        })}

        <DropdownMenuSeparator />

        {isOverridden && (
          <DropdownMenuItem
            onClick={() => setPhaseModel(phase, null)}
            className="text-xs"
          >
            Use default model
          </DropdownMenuItem>
        )}

        <DropdownMenuItem asChild className="text-xs">
          <Link href="/settings/models">
            <Settings className="h-3 w-3 mr-2" />
            Model settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
