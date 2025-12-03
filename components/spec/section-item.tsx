"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { SpecSection } from "@/types/spec";

interface SectionItemProps {
  section: SpecSection;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (section: SpecSection) => void;
}

export function SectionItem({
  section,
  onToggle,
  onDelete,
  onEdit,
}: SectionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-card border rounded-lg",
        isDragging && "opacity-50 shadow-lg",
        !section.enabled && "opacity-60"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <Switch
        checked={section.enabled}
        onCheckedChange={(enabled) => onToggle(section.id, enabled)}
        disabled={section.required}
      />

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit(section)}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{section.name}</span>
          {section.required && (
            <span className="text-xs text-muted-foreground">(required)</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {section.description}
        </p>
      </div>

      {!section.required && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(section.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
