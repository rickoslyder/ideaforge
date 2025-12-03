import { supabase } from "@/lib/db/client";
import type { Project, Message } from "@/lib/db/types";
import type { SyncConflict } from "@/stores/sync-store";
import { detectConflict, createConflict, autoResolve, type EntityWithTimestamp } from "./conflict-resolver";

export interface PullResult {
  projects: Project[];
  messages: Message[];
  conflicts: SyncConflict[];
  lastSyncedAt: string;
}

export interface LocalData {
  projects: Record<string, Project>;
  messages: Record<string, Message>;
}

// Pull changes from Supabase since last sync
export async function pullChanges(
  userId: string,
  lastSyncedAt: string | null,
  localData: LocalData
): Promise<PullResult> {
  const conflicts: SyncConflict[] = [];
  const syncTime = new Date().toISOString();

  // Build query for projects
  let projectsQuery = supabase
    .from("projects")
    .select("*")
    .eq("clerk_user_id", userId);

  if (lastSyncedAt) {
    projectsQuery = projectsQuery.gt("updated_at", lastSyncedAt);
  }

  const { data: remoteProjects, error: projectsError } = await projectsQuery;
  if (projectsError) throw projectsError;

  // Check for project conflicts
  const resolvedProjects: Project[] = [];
  for (const remote of remoteProjects || []) {
    const localProject = remote.local_id ? localData.projects[remote.local_id] : null;

    if (localProject && detectConflict(
      localProject as unknown as EntityWithTimestamp,
      remote as unknown as EntityWithTimestamp,
      lastSyncedAt
    )) {
      const conflict = createConflict(
        "project",
        remote.id,
        localProject as unknown as EntityWithTimestamp,
        remote as unknown as EntityWithTimestamp
      );
      conflicts.push(conflict);
      // Auto-resolve with latest-wins for now
      const { data } = autoResolve(
        localProject as unknown as EntityWithTimestamp,
        remote as unknown as EntityWithTimestamp
      );
      resolvedProjects.push(data as unknown as Project);
    } else {
      resolvedProjects.push(remote);
    }
  }

  // Build query for messages
  let messagesQuery = supabase.from("messages").select("*");

  if (lastSyncedAt) {
    messagesQuery = messagesQuery.gt("updated_at", lastSyncedAt);
  }

  // Filter by user's projects
  const projectIds = Object.values(localData.projects)
    .map((p) => p.id)
    .filter(Boolean);

  if (projectIds.length > 0) {
    messagesQuery = messagesQuery.in("project_id", projectIds);
  }

  const { data: remoteMessages, error: messagesError } = await messagesQuery;
  if (messagesError) throw messagesError;

  // Check for message conflicts
  const resolvedMessages: Message[] = [];
  for (const remote of remoteMessages || []) {
    const localMessage = remote.local_id ? localData.messages[remote.local_id] : null;

    if (localMessage && detectConflict(
      localMessage as unknown as EntityWithTimestamp,
      remote as unknown as EntityWithTimestamp,
      lastSyncedAt
    )) {
      const conflict = createConflict(
        "message",
        remote.id,
        localMessage as unknown as EntityWithTimestamp,
        remote as unknown as EntityWithTimestamp
      );
      conflicts.push(conflict);
      const { data } = autoResolve(
        localMessage as unknown as EntityWithTimestamp,
        remote as unknown as EntityWithTimestamp
      );
      resolvedMessages.push(data as unknown as Message);
    } else {
      resolvedMessages.push(remote);
    }
  }

  return {
    projects: resolvedProjects,
    messages: resolvedMessages,
    conflicts,
    lastSyncedAt: syncTime,
  };
}

// Get all remote data for initial sync
export async function fullPull(userId: string): Promise<PullResult> {
  const syncTime = new Date().toISOString();

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("*")
    .eq("clerk_user_id", userId)
    .is("deleted_at", null);

  if (projectsError) throw projectsError;

  const projectIds = (projects || []).map((p) => p.id);

  let messages: Message[] = [];
  if (projectIds.length > 0) {
    const { data, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .in("project_id", projectIds);

    if (messagesError) throw messagesError;
    messages = data || [];
  }

  return {
    projects: projects || [],
    messages,
    conflicts: [],
    lastSyncedAt: syncTime,
  };
}
