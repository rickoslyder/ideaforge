"use client";

import { cn } from "@/lib/utils";
import { ComparisonColumn } from "./comparison-column";
import type { SelectedModel, ComparisonColumn as ColumnData } from "@/types/comparison";

interface ComparisonGridProps {
  models: SelectedModel[];
  columns: Record<string, ColumnData>;
  selectedModelId?: string;
  onSelectModel?: (modelId: string) => void;
  onRemoveModel?: (modelId: string) => void;
  className?: string;
}

export function ComparisonGrid({
  models,
  columns,
  selectedModelId,
  onSelectModel,
  onRemoveModel,
  className,
}: ComparisonGridProps) {
  // Determine grid layout based on number of models
  const getGridClass = () => {
    switch (models.length) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case 4:
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4";
    }
  };

  if (models.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-muted-foreground">
          No models selected. Add models to compare their outputs.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4", getGridClass(), className)}>
      {models.map((model) => {
        const column = columns[model.id] || {
          modelId: model.id,
          content: "",
          isStreaming: false,
        };

        return (
          <ComparisonColumn
            key={model.id}
            model={model}
            column={column}
            isSelected={selectedModelId === model.id}
            onSelect={
              onSelectModel ? () => onSelectModel(model.id) : undefined
            }
            onRemove={
              onRemoveModel ? () => onRemoveModel(model.id) : undefined
            }
          />
        );
      })}
    </div>
  );
}
