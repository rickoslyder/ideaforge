"use client";

import { useState } from "react";
import { Play, Square, RefreshCw, Columns, Grid3X3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelSelector } from "./model-selector";
import { ComparisonGrid } from "./comparison-grid";
import { useComparison } from "@/hooks/use-comparison";
import { useParallelChat } from "@/hooks/use-parallel-chat";
import type { ComparisonMode } from "@/types/comparison";

interface ComparisonContainerProps {
  prompt: string;
  systemPrompt?: string;
  apiEndpoint?: string;
  onSelectOutput?: (modelId: string, content: string) => void;
  className?: string;
}

export function ComparisonContainer({
  prompt,
  systemPrompt,
  apiEndpoint = "/api/chat",
  onSelectOutput,
  className,
}: ComparisonContainerProps) {
  const [selectedOutputId, setSelectedOutputId] = useState<string | null>(null);

  const {
    selectedModels,
    columns,
    mode,
    setMode,
    removeModel,
    isAnyStreaming,
  } = useComparison();

  const { startParallelStreams, stopAllStreams } = useParallelChat();

  const handleGenerate = () => {
    startParallelStreams(prompt, systemPrompt, apiEndpoint);
  };

  const handleStop = () => {
    stopAllStreams();
  };

  const handleSelectOutput = (modelId: string) => {
    setSelectedOutputId(modelId);
    const column = columns[modelId];
    if (column && onSelectOutput) {
      onSelectOutput(modelId, column.content);
    }
  };

  const toggleMode = () => {
    const modes: ComparisonMode[] = ["side-by-side", "grid", "sequential"];
    const currentIndex = modes.indexOf(mode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setMode(nextMode);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Model Comparison</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMode}
              title={`Current: ${mode}`}
            >
              {mode === "grid" ? (
                <Grid3X3 className="h-4 w-4" />
              ) : (
                <Columns className="h-4 w-4" />
              )}
            </Button>

            {isAnyStreaming ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleStop}
              >
                <Square className="h-4 w-4 mr-1" />
                Stop
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleGenerate}
                disabled={selectedModels.length === 0 || !prompt}
              >
                <Play className="h-4 w-4 mr-1" />
                Generate
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerate}
              disabled={isAnyStreaming || selectedModels.length === 0 || !prompt}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <ModelSelector />

        <ComparisonGrid
          models={selectedModels}
          columns={columns}
          selectedModelId={selectedOutputId || undefined}
          onSelectModel={handleSelectOutput}
          onRemoveModel={removeModel}
        />
      </CardContent>
    </Card>
  );
}
