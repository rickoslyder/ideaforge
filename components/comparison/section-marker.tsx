"use client";

import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CherryPickedSection } from "@/types/comparison";

interface SectionMarkerProps {
  section: CherryPickedSection;
  index: number;
  onRemove: () => void;
  isDragging?: boolean;
  className?: string;
}

export function SectionMarker({
  section,
  index,
  onRemove,
  isDragging,
  className,
}: SectionMarkerProps) {
  const preview =
    section.content.length > 80
      ? section.content.slice(0, 80) + "..."
      : section.content;

  return (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded-lg border bg-background",
        isDragging && "opacity-50 ring-2 ring-primary",
        className
      )}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />

      <Badge variant="outline" className="shrink-0">
        {index + 1}
      </Badge>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium truncate">
            {section.sectionId}
          </span>
          <Badge variant="secondary" className="text-xs">
            {section.modelId}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {preview}
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onRemove}
        className="h-6 w-6 p-0 shrink-0"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
