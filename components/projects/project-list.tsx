"use client";

import { ProjectCard } from "./project-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ProjectListItem } from "@/types/project";

interface ProjectListProps {
  projects: ProjectListItem[];
  isLoading?: boolean;
  onDelete: (localId: string) => void;
}

export function ProjectList({ projects, isLoading, onDelete }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <ProjectListSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <h3 className="text-lg font-semibold">No projects yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create your first project to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.localId}
          project={project}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function ProjectListSkeleton() {
  return (
    <div className="rounded-xl border p-6">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-2 w-2 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-10 w-full" />
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
