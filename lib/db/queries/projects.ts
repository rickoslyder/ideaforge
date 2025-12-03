import { supabase } from "../client";
import type {
  Project,
  InsertProject,
  UpdateProject,
  Phase,
} from "../types";

export async function getProjects(userId: string): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("clerk_user_id", userId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getProject(
  projectId: string,
  userId: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("clerk_user_id", userId)
    .is("deleted_at", null)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createProject(
  project: InsertProject
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProject(
  projectId: string,
  userId: string,
  updates: UpdateProject
): Promise<Project> {
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .eq("clerk_user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProjectPhase(
  projectId: string,
  userId: string,
  phase: Phase,
  content?: string
): Promise<Project> {
  const updates: UpdateProject = {
    current_phase: phase,
  };

  // Save content from previous phase
  if (phase === "spec" && content) {
    updates.request_content = content;
  } else if (phase === "plan" && content) {
    updates.spec_content = content;
  }

  return updateProject(projectId, userId, updates);
}

export async function deleteProject(
  projectId: string,
  userId: string
): Promise<void> {
  // Soft delete
  const { error } = await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", projectId)
    .eq("clerk_user_id", userId);

  if (error) throw error;
}

export async function getProjectsByLocalIds(
  localIds: string[],
  userId: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("clerk_user_id", userId)
    .in("local_id", localIds);

  if (error) throw error;
  return data || [];
}
