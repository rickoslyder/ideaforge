import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project } from "@/lib/db/types";

const PROJECTS_KEY = ["projects"];

export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async (): Promise<Project[]> => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, projectId],
    queryFn: async (): Promise<Project> => {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) throw new Error("Failed to fetch project");
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; initial_idea?: string }) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Project>) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update project");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (projectId: string) => {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}
