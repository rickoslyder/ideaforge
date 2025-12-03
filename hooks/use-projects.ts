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
  console.log("[useProjects] Hook called");

  let userId: string | null | undefined;
  try {
    console.log("[useProjects] About to call useAuth()");
    const auth = useAuth();
    console.log("[useProjects] useAuth() returned:", typeof auth, auth);
    userId = auth.userId;
    console.log("[useProjects] userId:", userId);
  } catch (error) {
    console.error("[useProjects] useAuth() threw error:", error);
    throw error;
  }

  console.log("[useProjects] About to call useLocalProjects");
  const projects = useLocalProjects(userId || "");
  console.log("[useProjects] useLocalProjects returned:", projects?.length, "projects");

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
