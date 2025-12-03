"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectableSectionProps {
  id: string;
  title: string;
  content: string;
  level: number;
  isSelected: boolean;
  modelId?: string;
  onSelect: () => void;
  className?: string;
}

export function SelectableSection({
  id,
  title,
  content,
  level,
  isSelected,
  modelId,
  onSelect,
  className,
}: SelectableSectionProps) {
  // Truncate content for preview
  const preview =
    content.length > 200 ? content.slice(0, 200) + "..." : content;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        "hover:border-primary/50 hover:bg-muted/50",
        isSelected && "border-primary bg-primary/10",
        className
      )}
      style={{ marginLeft: `${(level - 1) * 12}px` }}
    >
      <div className="flex items-start gap-2">
        <div
          className={cn(
            "mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0",
            isSelected ? "bg-primary border-primary" : "border-muted-foreground"
          )}
        >
          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-sm truncate">{title}</h4>
            {modelId && (
              <span className="text-xs text-muted-foreground">
                from {modelId}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {preview}
          </p>
        </div>
      </div>
    </button>
  );
}
