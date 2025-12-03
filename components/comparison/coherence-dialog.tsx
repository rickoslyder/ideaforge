"use client";

import { useState } from "react";
import { Search, Wand2, Loader2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CoherenceResult } from "./coherence-result";
import { useCoherenceCheck } from "@/hooks/use-coherence-check";

interface CoherenceDialogProps {
  content: string;
  onApplySmoothed?: (content: string) => void;
  trigger?: React.ReactNode;
  className?: string;
}

export function CoherenceDialog({
  content,
  onApplySmoothed,
  trigger,
  className,
}: CoherenceDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"analyze" | "smooth">("analyze");
  const [copied, setCopied] = useState(false);

  const {
    isAnalyzing,
    isSmoothing,
    analysis,
    smoothedContent,
    error,
    analyze,
    smooth,
    reset,
  } = useCoherenceCheck();

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      reset();
      setActiveTab("analyze");
    }
  };

  const handleAnalyze = () => {
    analyze(content);
  };

  const handleSmooth = () => {
    smooth(content);
  };

  const handleCopy = async () => {
    if (smoothedContent) {
      await navigator.clipboard.writeText(smoothedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (smoothedContent && onApplySmoothed) {
      onApplySmoothed(smoothedContent);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <Search className="h-4 w-4 mr-1" />
            Check Coherence
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Coherence Validation</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "analyze" | "smooth")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analyze" className="gap-1">
              <Search className="h-4 w-4" />
              Highlight Issues
            </TabsTrigger>
            <TabsTrigger value="smooth" className="gap-1">
              <Wand2 className="h-4 w-4" />
              Auto-Smooth
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Analyze the merged content to identify inconsistencies,
              contradictions, and areas that need improvement.
            </p>

            {!analysis && !isAnalyzing && (
              <Button onClick={handleAnalyze} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Analyze Content
              </Button>
            )}

            {isAnalyzing && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">
                  Analyzing coherence...
                </p>
              </div>
            )}

            {analysis && <CoherenceResult analysis={analysis} />}

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
          </TabsContent>

          <TabsContent value="smooth" className="mt-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Automatically smooth the content to fix inconsistencies and
              improve flow while preserving all key information.
            </p>

            {!smoothedContent && !isSmoothing && (
              <Button onClick={handleSmooth} className="w-full">
                <Wand2 className="h-4 w-4 mr-2" />
                Auto-Smooth Content
              </Button>
            )}

            {isSmoothing && (
              <div className="space-y-4">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Smoothing content...
                  </p>
                </div>
                {smoothedContent && (
                  <div className="prose prose-sm dark:prose-invert max-w-none max-h-[300px] overflow-y-auto rounded-lg border p-4 bg-muted/30">
                    <pre className="whitespace-pre-wrap text-sm">
                      {smoothedContent}
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />
                    </pre>
                  </div>
                )}
              </div>
            )}

            {!isSmoothing && smoothedContent && (
              <div className="space-y-4">
                <div className="prose prose-sm dark:prose-invert max-w-none max-h-[300px] overflow-y-auto rounded-lg border p-4 bg-muted/30">
                  <pre className="whitespace-pre-wrap text-sm">
                    {smoothedContent}
                  </pre>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </>
                    )}
                  </Button>
                  {onApplySmoothed && (
                    <Button size="sm" onClick={handleApply}>
                      Apply Smoothed Version
                    </Button>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
