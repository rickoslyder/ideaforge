"use client";

import { Loader2, AlertCircle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PROVIDER_NAMES, type Provider } from "@/lib/llm/types";

const PROVIDER_COLORS: Record<Provider, string> = {
  openai: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  anthropic: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  google: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  ollama: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  custom: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

interface ColumnHeaderProps {
  displayName: string;
  provider: Provider;
  isStreaming: boolean;
  hasError?: boolean;
  inputTokens?: number;
  outputTokens?: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
}

export function ColumnHeader({
  displayName,
  provider,
  isStreaming,
  hasError,
  inputTokens,
  outputTokens,
  isSelected,
  onSelect,
  onRemove,
}: ColumnHeaderProps) {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-muted/50">
      <div className="flex items-center gap-2">
        <Badge className={cn("text-xs", PROVIDER_COLORS[provider])}>
          {PROVIDER_NAMES[provider]}
        </Badge>
        <span className="font-medium">{displayName}</span>
        {isStreaming && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {hasError && (
          <AlertCircle className="h-4 w-4 text-destructive" />
        )}
      </div>

      <div className="flex items-center gap-2">
        {(inputTokens || outputTokens) && (
          <span className="text-xs text-muted-foreground">
            {inputTokens?.toLocaleString() || "?"} / {outputTokens?.toLocaleString() || "?"} tokens
          </span>
        )}

        {onSelect && (
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={onSelect}
            className="h-7"
          >
            {isSelected ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Selected
              </>
            ) : (
              "Select"
            )}
          </Button>
        )}

        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
