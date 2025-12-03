import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SyncState = "idle" | "syncing" | "error" | "offline";

export interface SyncConflict {
  id: string;
  entityType: "project" | "message" | "attachment";
  entityId: string;
  localData: unknown;
  remoteData: unknown;
  localUpdatedAt: string;
  remoteUpdatedAt: string;
}

interface SyncStore {
  // State
  syncState: SyncState;
  lastSyncedAt: string | null;
  pendingChanges: number;
  isOnline: boolean;
  conflicts: SyncConflict[];
  error: string | null;

  // Actions
  setSyncState: (state: SyncState) => void;
  setLastSyncedAt: (timestamp: string) => void;
  setPendingChanges: (count: number) => void;
  incrementPendingChanges: () => void;
  decrementPendingChanges: () => void;
  setIsOnline: (online: boolean) => void;
  addConflict: (conflict: SyncConflict) => void;
  removeConflict: (id: string) => void;
  clearConflicts: () => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useSyncStore = create<SyncStore>()(
  persist(
    (set) => ({
      syncState: "idle",
      lastSyncedAt: null,
      pendingChanges: 0,
      isOnline: true,
      conflicts: [],
      error: null,

      setSyncState: (syncState) => set({ syncState }),
      setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
      setPendingChanges: (pendingChanges) => set({ pendingChanges }),
      incrementPendingChanges: () =>
        set((state) => ({ pendingChanges: state.pendingChanges + 1 })),
      decrementPendingChanges: () =>
        set((state) => ({
          pendingChanges: Math.max(0, state.pendingChanges - 1),
        })),
      setIsOnline: (isOnline) => set({ isOnline }),
      addConflict: (conflict) =>
        set((state) => ({
          conflicts: [...state.conflicts, conflict],
        })),
      removeConflict: (id) =>
        set((state) => ({
          conflicts: state.conflicts.filter((c) => c.id !== id),
        })),
      clearConflicts: () => set({ conflicts: [] }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          syncState: "idle",
          error: null,
          conflicts: [],
        }),
    }),
    {
      name: "ideaforge-sync",
      partialize: (state) => ({
        lastSyncedAt: state.lastSyncedAt,
        pendingChanges: state.pendingChanges,
      }),
    }
  )
);
