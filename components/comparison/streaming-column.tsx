"use client";

import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StreamingColumnProps {
  content: string;
  isStreaming: boolean;
  error?: string;
  className?: string;
  autoScroll?: boolean;
}

export function StreamingColumn({
  content,
  isStreaming,
  error,
  className,
  autoScroll = true,
}: StreamingColumnProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (autoScroll && isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming, autoScroll]);

  if (error) {
    return (
      <div className={cn("p-4 text-center", className)}>
        <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-sm text-destructive font-medium">Error</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  if (!content && !isStreaming) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        <p className="text-sm">No content yet</p>
        <p className="text-xs mt-1">Start generation to see output</p>
      </div>
    );
  }

  if (!content && isStreaming) {
    return (
      <div className={cn("p-4 space-y-3", className)}>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)}
    >
      <div
        ref={contentRef}
        className="p-4 prose prose-sm dark:prose-invert max-w-none overflow-y-auto h-full"
      >
        <div className="whitespace-pre-wrap">{content}</div>
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}
