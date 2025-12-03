"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ColumnHeader } from "./column-header";
import { StreamingColumn } from "./streaming-column";
import type { SelectedModel, ComparisonColumn as ColumnData } from "@/types/comparison";

interface ComparisonColumnProps {
  model: SelectedModel;
  column: ColumnData;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  className?: string;
}

export function ComparisonColumn({
  model,
  column,
  isSelected,
  onSelect,
  onRemove,
  className,
}: ComparisonColumnProps) {
  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <ColumnHeader
        displayName={model.displayName}
        provider={model.provider}
        isStreaming={column.isStreaming}
        hasError={!!column.error}
        inputTokens={column.inputTokens}
        outputTokens={column.outputTokens}
        isSelected={isSelected}
        onSelect={onSelect}
        onRemove={onRemove}
      />
      <StreamingColumn
        content={column.content}
        isStreaming={column.isStreaming}
        error={column.error}
        className="flex-1 min-h-[200px] max-h-[600px]"
      />
    </Card>
  );
}
