"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/hooks/use-project";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { project, isLoading } = useProject(projectId);

  useEffect(() => {
    if (!isLoading && project) {
      // Redirect to current phase
      router.replace(`/projects/${projectId}/${project.currentPhase}`);
    }
  }, [isLoading, project, projectId, router]);

  return null;
}
