"use client";

import { cn } from "@/lib/utils";
import { getDifferingFields } from "@/lib/sync/conflict-resolver";

interface ConflictDiffProps {
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  selectedVersion: "local" | "remote" | null;
  onSelect: (version: "local" | "remote") => void;
}

export function ConflictDiff({
  localData,
  remoteData,
  selectedVersion,
  onSelect,
}: ConflictDiffProps) {
  const differingFields = getDifferingFields(localData, remoteData);

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "(empty)";
    if (typeof value === "string") {
      return value.length > 100 ? `${value.slice(0, 100)}...` : value;
    }
    return JSON.stringify(value, null, 2);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Local Version */}
      <button
        onClick={() => onSelect("local")}
        className={cn(
          "p-4 rounded-lg border text-left transition-colors",
          selectedVersion === "local"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <div className="font-medium mb-2 flex items-center justify-between">
          <span>Local Version</span>
          {selectedVersion === "local" && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
              Selected
            </span>
          )}
        </div>
        <div className="space-y-2 text-sm">
          {differingFields.map((field) => (
            <div key={field}>
              <div className="text-xs text-muted-foreground">{field}</div>
              <div className="font-mono text-xs bg-muted p-1 rounded truncate">
                {formatValue(localData[field])}
              </div>
            </div>
          ))}
        </div>
      </button>

      {/* Remote Version */}
      <button
        onClick={() => onSelect("remote")}
        className={cn(
          "p-4 rounded-lg border text-left transition-colors",
          selectedVersion === "remote"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <div className="font-medium mb-2 flex items-center justify-between">
          <span>Remote Version</span>
          {selectedVersion === "remote" && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
              Selected
            </span>
          )}
        </div>
        <div className="space-y-2 text-sm">
          {differingFields.map((field) => (
            <div key={field}>
              <div className="text-xs text-muted-foreground">{field}</div>
              <div className="font-mono text-xs bg-muted p-1 rounded truncate">
                {formatValue(remoteData[field])}
              </div>
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}
