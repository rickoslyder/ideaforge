// Sync-related types

export type SyncOperation = "insert" | "update" | "delete";

export type SyncTable = "projects" | "messages" | "attachments";

export interface SyncConflict {
  localId: string;
  remoteId: string;
  table: SyncTable;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  localUpdatedAt: Date;
  remoteUpdatedAt: Date;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  conflicts: SyncConflict[];
  errors: SyncError[];
}

export interface SyncError {
  localId: string;
  table: SyncTable;
  operation: SyncOperation;
  error: string;
  retryable: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  pendingCount: number;
  hasConflicts: boolean;
}

export type ConflictResolution = "keep-local" | "keep-remote" | "merge";

export interface ResolvedConflict {
  localId: string;
  resolution: ConflictResolution;
  mergedData?: Record<string, unknown>;
}

// Sync queue item (re-exported for convenience)
export type { SyncQueueItem } from "@/lib/local-db/schema";
