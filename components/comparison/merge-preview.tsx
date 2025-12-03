"use client";

import { useMemo } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mergeSections, validateMerge } from "@/lib/utils/merge-sections";
import type { CherryPickedSection } from "@/types/comparison";
import { useState } from "react";

interface MergePreviewProps {
  sections: CherryPickedSection[];
  onApply?: (content: string) => void;
  className?: string;
}

export function MergePreview({
  sections,
  onApply,
  className,
}: MergePreviewProps) {
  const [copied, setCopied] = useState(false);

  const mergedContent = useMemo(
    () => mergeSections(sections),
    [sections]
  );

  const issues = useMemo(
    () => validateMerge(sections),
    [sections]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mergedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApply) {
      onApply(mergedContent);
    }
  };

  if (sections.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>Select sections from the comparison to build your merged output</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            Merged Preview
            <Badge variant="secondary">{sections.length} sections</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
            {onApply && (
              <Button
                variant="default"
                size="sm"
                onClick={handleApply}
                className="h-8"
              >
                Apply
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {issues.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Potential issues detected:
              </p>
              <ul className="text-yellow-700 dark:text-yellow-300 mt-1 space-y-0.5">
                {issues.map((issue, i) => (
                  <li key={i} className="text-xs">
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none max-h-[400px] overflow-y-auto rounded-lg border p-4 bg-muted/30">
          <pre className="whitespace-pre-wrap text-sm">{mergedContent}</pre>
        </div>

        <div className="text-xs text-muted-foreground text-right">
          {mergedContent.length.toLocaleString()} characters
        </div>
      </CardContent>
    </Card>
  );
}
