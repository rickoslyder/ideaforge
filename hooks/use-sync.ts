"use client";

import { useCallback } from "react";
import { useSyncStore } from "@/stores/sync-store";
import { getQueuedChanges, getRetryableChanges, clearQueue } from "@/lib/sync/queue";
import { canPush } from "@/lib/sync/push";

export function useSync() {
  const {
    syncState,
    lastSyncedAt,
    pendingChanges,
    isOnline,
    conflicts,
    error,
    setSyncState,
    setLastSyncedAt,
    setPendingChanges,
    addConflict,
    removeConflict,
    clearConflicts,
    setError,
    reset,
  } = useSyncStore();

  const refreshPendingCount = useCallback(() => {
    const count = getQueuedChanges().length;
    setPendingChanges(count);
  }, [setPendingChanges]);

  const triggerSync = useCallback(async () => {
    if (!canPush() || syncState === "syncing") return;

    setSyncState("syncing");
    setError(null);

    try {
      const changes = getRetryableChanges();

      if (changes.length === 0) {
        setSyncState("idle");
        return;
      }

      const response = await fetch("/api/sync/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.failed > 0) {
        setError(`${result.failed} changes failed to sync`);
        setSyncState("error");
      } else {
        setSyncState("idle");
        setLastSyncedAt(new Date().toISOString());
      }

      refreshPendingCount();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Sync failed";
      setError(message);
      setSyncState("error");
    }
  }, [syncState, setSyncState, setError, setLastSyncedAt, refreshPendingCount]);

  const pullFromRemote = useCallback(async (fullSync = false) => {
    if (!isOnline || syncState === "syncing") return;

    setSyncState("syncing");
    setError(null);

    try {
      const response = await fetch("/api/sync/pull", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastSyncedAt: fullSync ? null : lastSyncedAt,
          fullSync,
          localData: { projects: {}, messages: {} },
        }),
      });

      if (!response.ok) {
        throw new Error(`Pull failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Handle conflicts
      for (const conflict of result.conflicts || []) {
        addConflict(conflict);
      }

      setLastSyncedAt(result.lastSyncedAt);
      setSyncState(result.conflicts?.length > 0 ? "error" : "idle");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Pull failed";
      setError(message);
      setSyncState("error");
    }
  }, [isOnline, syncState, lastSyncedAt, setSyncState, setError, setLastSyncedAt, addConflict]);

  const resolveConflict = useCallback((conflictId: string) => {
    removeConflict(conflictId);
    if (conflicts.length <= 1) {
      setSyncState("idle");
    }
  }, [conflicts.length, removeConflict, setSyncState]);

  const clearAllData = useCallback(() => {
    clearQueue();
    clearConflicts();
    reset();
    setPendingChanges(0);
  }, [clearConflicts, reset, setPendingChanges]);

  return {
    // State
    syncState,
    lastSyncedAt,
    pendingChanges,
    isOnline,
    conflicts,
    error,
    hasConflicts: conflicts.length > 0,
    isSyncing: syncState === "syncing",

    // Actions
    triggerSync,
    pullFromRemote,
    resolveConflict,
    clearAllData,
    refreshPendingCount,
  };
}
