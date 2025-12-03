"use client";

import { Loader2 } from "lucide-react";

interface StreamingIndicatorProps {
  provider?: string;
  model?: string;
}

export function StreamingIndicator({
  provider,
  model,
}: StreamingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>
        {model ? `${model} is thinking...` : "AI is thinking..."}
      </span>
    </div>
  );
}
