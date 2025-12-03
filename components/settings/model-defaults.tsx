"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ModelList } from "./model-list";
import { useModelConfig } from "@/hooks/use-model-config";
import { Skeleton } from "@/components/ui/skeleton";

export function ModelDefaults() {
  const { config, isLoading, setDefaultModel } = useModelConfig();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Default Model</CardTitle>
        <CardDescription>
          Choose the model to use by default for all phases. You can override
          this per phase below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ModelList
          selectedModel={config.defaultModel}
          onSelectModel={setDefaultModel}
        />
      </CardContent>
    </Card>
  );
}
