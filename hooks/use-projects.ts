"use client";

import { useAuth } from "@clerk/nextjs";
import {
  useLocalProjects,
  createLocalProject,
  updateLocalProject,
  deleteLocalProject,
} from "@/lib/local-db/hooks";
import type { ProjectListItem, CreateProjectInput, UpdateProjectInput } from "@/types/project";

export function useProjects() {
  const { userId } = useAuth();
  const projects = useLocalProjects(userId || "");

  const mappedProjects: ProjectListItem[] = (projects || []).map((p) => ({
    localId: p.localId,
    remoteId: p.remoteId,
    name: p.name,
    currentPhase: p.currentPhase,
    initialIdea: p.initialIdea,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }));

  async function createProject(input: CreateProjectInput) {
    if (!userId) throw new Error("Not authenticated");
    return createLocalProject(userId, input);
  }

  async function updateProject(localId: string, input: UpdateProjectInput) {
    return updateLocalProject(localId, input);
  }

  async function removeProject(localId: string) {
    return deleteLocalProject(localId);
  }

  return {
    projects: mappedProjects,
    isLoading: projects === undefined,
    createProject,
    updateProject,
    removeProject,
  };
}
