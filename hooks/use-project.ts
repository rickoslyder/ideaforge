"use client";

import { useLocalProject, updateLocalProject, updateProjectPhase } from "@/lib/local-db/hooks";
import type { Phase, SpecConfig } from "@/lib/db/types";
import type { ProjectDetail, UpdateProjectInput } from "@/types/project";

export function useProject(localId: string) {
  const localProject = useLocalProject(localId);

  const project: ProjectDetail | undefined = localProject
    ? {
        localId: localProject.localId,
        remoteId: localProject.remoteId,
        name: localProject.name,
        currentPhase: localProject.currentPhase,
        initialIdea: localProject.initialIdea,
        requestContent: localProject.requestContent,
        specContent: localProject.specContent,
        specConfig: localProject.specConfig,
        planContent: localProject.planContent,
        createdAt: localProject.createdAt,
        updatedAt: localProject.updatedAt,
      }
    : undefined;

  async function updateProject(updates: UpdateProjectInput) {
    await updateLocalProject(localId, updates);
  }

  async function advanceToPhase(phase: Phase, content?: string) {
    await updateProjectPhase(localId, phase, content);
  }

  async function savePhaseContent(phase: Phase, content: string) {
    const updates: UpdateProjectInput = {};
    if (phase === "request") {
      updates.requestContent = content;
    } else if (phase === "spec") {
      updates.specContent = content;
    } else if (phase === "plan") {
      updates.planContent = content;
    }
    await updateProject(updates);
  }

  async function saveSpecConfig(config: SpecConfig) {
    await updateProject({ specConfig: config });
  }

  return {
    project,
    isLoading: localProject === undefined,
    updateProject,
    advanceToPhase,
    savePhaseContent,
    saveSpecConfig,
  };
}
