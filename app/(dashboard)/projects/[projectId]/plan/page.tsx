"use client";

import { use } from "react";
import { PlanPhase } from "@/components/plan/plan-phase";
import { useProject } from "@/hooks/use-project";
import { Skeleton } from "@/components/ui/skeleton";

interface PlanPageProps {
  params: Promise<{ projectId: string }>;
}

export default function PlanPage({ params }: PlanPageProps) {
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

  // TODO: Get actual request and spec from project data/database
  const projectRequest = project.description || undefined;
  const projectSpec = undefined; // Would come from stored spec

  return (
    <div className="h-full">
      <PlanPhase
        projectId={projectId}
        projectName={project.name}
        projectRequest={projectRequest}
        projectSpec={projectSpec}
      />
    </div>
  );
}
