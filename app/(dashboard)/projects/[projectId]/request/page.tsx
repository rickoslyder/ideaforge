"use client";

import { use } from "react";
import { RequestPhase } from "@/components/request/request-phase";
import { useProject } from "@/hooks/use-project";
import { Skeleton } from "@/components/ui/skeleton";

interface RequestPageProps {
  params: Promise<{ projectId: string }>;
}

export default function RequestPage({ params }: RequestPageProps) {
  const { projectId } = use(params);
  const { project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4 gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="flex-1" />
        <Skeleton className="h-12" />
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

  return (
    <div className="h-full">
      <RequestPhase
        projectId={projectId}
        projectName={project.name}
        projectDescription={project.description || undefined}
      />
    </div>
  );
}
