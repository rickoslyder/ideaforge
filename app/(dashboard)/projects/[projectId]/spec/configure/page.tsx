"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SpecConfigurator } from "@/components/spec/spec-configurator";
import { useSpecConfig } from "@/hooks/use-spec-config";
import { Skeleton } from "@/components/ui/skeleton";

interface ConfigureSpecPageProps {
  params: { projectId: string };
}

export default function ConfigureSpecPage({ params }: ConfigureSpecPageProps) {
  const { projectId } = params;
  const router = useRouter();
  const { config, updateConfig, isLoading } = useSpecConfig(projectId);

  function handleGenerate() {
    router.push(`/projects/${projectId}/spec`);
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/projects/${projectId}/spec`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Spec
        </Button>

        <h1 className="text-2xl font-bold">Configure Specification</h1>
        <p className="text-muted-foreground mt-1">
          Choose which sections to include and customize the generation
          instructions.
        </p>
      </div>

      <SpecConfigurator
        config={config}
        onChange={updateConfig}
        onGenerate={handleGenerate}
        isGenerating={false}
      />
    </div>
  );
}
