"use client";

import { useState } from "react";
import { Check, Plus, X, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useComparison } from "@/hooks/use-comparison";
import { useModels, type AvailableModel } from "@/hooks/use-models";
import { PROVIDER_NAMES, type Provider } from "@/lib/llm/types";

const PROVIDER_COLORS: Record<Provider, string> = {
  openai: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  anthropic: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  google: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ollama: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  custom: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

interface ModelChipProps {
  model: AvailableModel;
  isSelected: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

function ModelChip({ model, isSelected, onToggle, disabled }: ModelChipProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled && !isSelected}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50",
        disabled && !isSelected && "opacity-50 cursor-not-allowed"
      )}
    >
      <div
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center",
          isSelected ? "bg-primary border-primary" : "border-muted-foreground"
        )}
      >
        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
      </div>
      <span className="font-medium">{model.displayName}</span>
      {model.inputCostPer1kTokens && (
        <span className="text-xs text-muted-foreground">
          ${model.inputCostPer1kTokens.toFixed(4)}/1K
        </span>
      )}
    </button>
  );
}

interface SelectedModelBadgeProps {
  model: {
    id: string;
    displayName: string;
    provider: Provider;
  };
  onRemove: () => void;
}

function SelectedModelBadge({ model, onRemove }: SelectedModelBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "flex items-center gap-1 pr-1",
        PROVIDER_COLORS[model.provider]
      )}
    >
      <span>{model.displayName}</span>
      <button
        onClick={onRemove}
        className="ml-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

export function ModelSelector() {
  const [open, setOpen] = useState(false);
  const [expandedProviders, setExpandedProviders] = useState<Provider[]>([
    "openai",
    "anthropic",
  ]);

  const {
    selectedModels,
    addModel,
    removeModel,
    isModelSelected,
    canAddModel,
    maxModels,
  } = useComparison();

  const { modelsByProvider, providerNames } = useModels();

  const toggleProvider = (provider: Provider) => {
    setExpandedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  };

  const handleModelToggle = (model: AvailableModel) => {
    if (isModelSelected(model.id)) {
      removeModel(model.id);
    } else if (canAddModel) {
      addModel(model);
    }
  };

  return (
    <div className="space-y-3">
      {/* Selected models display */}
      <div className="flex flex-wrap gap-2">
        {selectedModels.map((model) => (
          <SelectedModelBadge
            key={model.id}
            model={model}
            onRemove={() => removeModel(model.id)}
          />
        ))}

        {/* Add model button */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!canAddModel}
              className="gap-1"
            >
              <Plus className="h-4 w-4" />
              Add Model
              {selectedModels.length > 0 && (
                <span className="text-muted-foreground">
                  ({selectedModels.length}/{maxModels})
                </span>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Select Models to Compare
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 mt-4">
              {(Object.keys(modelsByProvider) as Provider[]).map((provider) => {
                const models = modelsByProvider[provider];
                if (models.length === 0) return null;

                return (
                  <Collapsible
                    key={provider}
                    open={expandedProviders.includes(provider)}
                    onOpenChange={() => toggleProvider(provider)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <Badge className={PROVIDER_COLORS[provider]}>
                          {providerNames[provider]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {models.filter((m) => isModelSelected(m.id)).length}/
                          {models.length} selected
                        </span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedProviders.includes(provider) && "rotate-180"
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="grid gap-2 pl-2">
                        {models.map((model) => (
                          <ModelChip
                            key={model.id}
                            model={model}
                            isSelected={isModelSelected(model.id)}
                            onToggle={() => handleModelToggle(model)}
                            disabled={!canAddModel}
                          />
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {selectedModels.length} of {maxModels} models selected
              </span>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hint text */}
      {selectedModels.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Select up to {maxModels} models to compare their outputs side-by-side
        </p>
      )}
    </div>
  );
}
