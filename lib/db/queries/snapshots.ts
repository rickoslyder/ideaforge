import { supabase } from "../client";
import type {
  ProjectSnapshot,
  InsertProjectSnapshot,
  ProjectSnapshotData,
  Project,
} from "../types";

export async function getSnapshots(
  projectId: string
): Promise<ProjectSnapshot[]> {
  const { data, error } = await supabase
    .from("project_snapshots")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSnapshot(
  snapshotId: string
): Promise<ProjectSnapshot | null> {
  const { data, error } = await supabase
    .from("project_snapshots")
    .select("*")
    .eq("id", snapshotId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createSnapshot(
  snapshot: InsertProjectSnapshot
): Promise<ProjectSnapshot> {
  const { data, error } = await supabase
    .from("project_snapshots")
    .insert(snapshot)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createSnapshotFromProject(
  project: Project,
  trigger: "auto" | "manual"
): Promise<ProjectSnapshot> {
  const snapshotData: ProjectSnapshotData = {
    name: project.name,
    current_phase: project.current_phase,
    request_content: project.request_content,
    spec_content: project.spec_content,
    spec_config: project.spec_config,
    plan_content: project.plan_content,
  };

  return createSnapshot({
    project_id: project.id,
    trigger,
    phase_at_snapshot: project.current_phase,
    snapshot_data: snapshotData,
  });
}

export async function deleteSnapshot(snapshotId: string): Promise<void> {
  const { error } = await supabase
    .from("project_snapshots")
    .delete()
    .eq("id", snapshotId);

  if (error) throw error;
}

export async function deleteProjectSnapshots(
  projectId: string
): Promise<void> {
  const { error } = await supabase
    .from("project_snapshots")
    .delete()
    .eq("project_id", projectId);

  if (error) throw error;
}

export async function getLatestSnapshot(
  projectId: string
): Promise<ProjectSnapshot | null> {
  const { data, error } = await supabase
    .from("project_snapshots")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}
