"use client";

import { useParams, notFound } from "next/navigation";
import { ProjectHeader } from "@/components/projects/project-header";
import { PhaseIndicator } from "@/components/phases/phase-indicator";
import { useProject } from "@/hooks/use-project";
import { usePhase } from "@/hooks/use-phase";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const projectId = params.projectId as string;
  const { project, isLoading } = useProject(projectId);

  if (isLoading) {
    return <ProjectLayoutSkeleton />;
  }

  if (!project) {
    notFound();
  }

  return (
    <ProjectLayoutContent project={project} projectId={projectId}>
      {children}
    </ProjectLayoutContent>
  );
}

function ProjectLayoutContent({
  project,
  projectId,
  children,
}: {
  project: NonNullable<ReturnType<typeof useProject>["project"]>;
  projectId: string;
  children: React.ReactNode;
}) {
  const { activePhase, navigateToPhase } = usePhase(projectId, project.currentPhase);

  return (
    <div className="flex h-full flex-col">
      <ProjectHeader name={project.name} projectId={projectId} />
      <PhaseIndicator
        currentPhase={project.currentPhase}
        activePhase={activePhase}
        onPhaseClick={navigateToPhase}
      />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

function ProjectLayoutSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
      <div className="flex items-center justify-center gap-2 border-b px-4 py-3">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-0.5 w-12" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-0.5 w-12" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}
