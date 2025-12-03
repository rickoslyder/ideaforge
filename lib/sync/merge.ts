import type { Project, Message } from "@/lib/db/types";

// Merge remote data into local storage
export function mergeProjects(
  local: Project[],
  remote: Project[]
): Project[] {
  const merged = new Map<string, Project>();

  // Add local projects by local_id
  for (const project of local) {
    const key = project.local_id || project.id;
    merged.set(key, project);
  }

  // Merge remote projects
  for (const project of remote) {
    const key = project.local_id || project.id;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, project);
    } else {
      // Take newer version
      const existingTime = existing.updated_at
        ? new Date(existing.updated_at).getTime()
        : 0;
      const remoteTime = project.updated_at
        ? new Date(project.updated_at).getTime()
        : 0;

      if (remoteTime >= existingTime) {
        merged.set(key, { ...existing, ...project });
      }
    }
  }

  return Array.from(merged.values());
}

export function mergeMessages(
  local: Message[],
  remote: Message[]
): Message[] {
  const merged = new Map<string, Message>();

  // Add local messages
  for (const message of local) {
    const key = message.local_id || message.id;
    merged.set(key, message);
  }

  // Merge remote messages - use created_at since messages are immutable
  for (const message of remote) {
    const key = message.local_id || message.id;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, message);
    } else {
      const existingTime = existing.created_at
        ? new Date(existing.created_at).getTime()
        : 0;
      const remoteTime = message.created_at
        ? new Date(message.created_at).getTime()
        : 0;

      if (remoteTime >= existingTime) {
        merged.set(key, { ...existing, ...message });
      }
    }
  }

  return Array.from(merged.values());
}

// Create a lookup map by local_id
export function createLocalIdMap<T extends { local_id?: string; id: string }>(
  items: T[]
): Record<string, T> {
  const map: Record<string, T> = {};
  for (const item of items) {
    if (item.local_id) {
      map[item.local_id] = item;
    }
  }
  return map;
}
