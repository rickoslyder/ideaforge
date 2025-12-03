"use client";

import { use } from "react";
import { SpecPhase } from "@/components/spec/spec-phase";
import { useProject } from "@/hooks/use-project";
import { Skeleton } from "@/components/ui/skeleton";

interface SpecPageProps {
  params: Promise<{ projectId: string }>;
}

export default function SpecPage({ params }: SpecPageProps) {
  const { projectId } = use(params);
  const { project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="flex-1" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  // TODO: Get the finalized request from the project data
  const projectRequest = project.description || undefined;

  return (
    <div className="h-full">
      <SpecPhase
        projectId={projectId}
        projectName={project.name}
        projectRequest={projectRequest}
      />
    </div>
  );
}
