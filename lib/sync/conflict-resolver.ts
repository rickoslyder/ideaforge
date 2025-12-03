import type { SyncConflict } from "@/stores/sync-store";

export type ConflictResolution = "local" | "remote" | "merge";

export interface EntityWithTimestamp {
  id?: string;
  local_id?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  [key: string]: unknown;
}

// Detect if there's a conflict between local and remote versions
export function detectConflict(
  local: EntityWithTimestamp,
  remote: EntityWithTimestamp,
  lastSyncedAt: string | null
): boolean {
  if (!lastSyncedAt) return false;

  const lastSync = new Date(lastSyncedAt).getTime();
  const localUpdated = local.updated_at ? new Date(local.updated_at).getTime() : 0;
  const remoteUpdated = remote.updated_at ? new Date(remote.updated_at).getTime() : 0;

  return localUpdated > lastSync && remoteUpdated > lastSync;
}

// Create a conflict record
export function createConflict(
  entityType: SyncConflict["entityType"],
  entityId: string,
  local: EntityWithTimestamp,
  remote: EntityWithTimestamp
): SyncConflict {
  return {
    id: crypto.randomUUID(),
    entityType,
    entityId,
    localData: local,
    remoteData: remote,
    localUpdatedAt: local.updated_at || new Date().toISOString(),
    remoteUpdatedAt: remote.updated_at || new Date().toISOString(),
  };
}

// Auto-resolve conflicts based on strategy
export function autoResolve(
  local: EntityWithTimestamp,
  remote: EntityWithTimestamp,
  strategy: "latest-wins" | "local-wins" | "remote-wins" = "latest-wins"
): { winner: "local" | "remote"; data: EntityWithTimestamp } {
  switch (strategy) {
    case "local-wins":
      return { winner: "local", data: local };
    case "remote-wins":
      return { winner: "remote", data: remote };
    case "latest-wins":
    default: {
      const localTime = local.updated_at ? new Date(local.updated_at).getTime() : 0;
      const remoteTime = remote.updated_at ? new Date(remote.updated_at).getTime() : 0;
      return localTime >= remoteTime
        ? { winner: "local", data: local }
        : { winner: "remote", data: remote };
    }
  }
}

// Get fields that differ between two versions
export function getDifferingFields(
  local: EntityWithTimestamp,
  remote: EntityWithTimestamp
): string[] {
  const differing: string[] = [];
  const allKeys = Array.from(new Set([...Object.keys(local), ...Object.keys(remote)]));

  for (const key of allKeys) {
    if (["id", "local_id", "created_at", "updated_at"].includes(key)) continue;
    if (JSON.stringify(local[key]) !== JSON.stringify(remote[key])) {
      differing.push(key);
    }
  }
  return differing;
}
