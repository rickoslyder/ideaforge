"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSyncStore } from "@/stores/sync-store";
import { getSyncEngine, destroySyncEngine } from "@/lib/sync/engine";
import { OfflineBanner } from "@/components/sync/offline-banner";
import { ConflictDialog } from "@/components/sync/conflict-dialog";

const SYNC_INTERVAL = 30000; // 30 seconds

interface SyncProviderProps {
  children: React.ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const { isSignedIn } = useAuth();
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

  const {
    conflicts,
    setSyncState,
    setLastSyncedAt,
    setPendingChanges,
    setError,
    removeConflict,
  } = useSyncStore();

  const currentConflict = conflicts[0] || null;

  // Initialize sync engine
  useEffect(() => {
    if (!isSignedIn) {
      destroySyncEngine();
      return;
    }

    const engine = getSyncEngine({
      autoSyncInterval: SYNC_INTERVAL,
      onSyncStateChange: setSyncState,
      onPendingCountChange: setPendingChanges,
      onError: setError,
      onSyncComplete: setLastSyncedAt,
    });

    if (engine) {
      engine.start();
    }

    return () => {
      destroySyncEngine();
    };
  }, [isSignedIn, setSyncState, setPendingChanges, setError, setLastSyncedAt]);

  // Show conflict dialog when conflicts exist
  useEffect(() => {
    if (conflicts.length > 0 && !conflictDialogOpen) {
      setConflictDialogOpen(true);
    }
  }, [conflicts.length, conflictDialogOpen]);

  const handleResolveConflict = useCallback(
    async (conflictId: string, resolution: "local" | "remote") => {
      const conflict = conflicts.find((c) => c.id === conflictId);
      if (!conflict) return;

      // Apply resolution (in real app, would push the resolved version)
      // For now, just remove the conflict
      removeConflict(conflictId);

      if (conflicts.length <= 1) {
        setConflictDialogOpen(false);
        setSyncState("idle");
      }
    },
    [conflicts, removeConflict, setSyncState]
  );

  return (
    <>
      <OfflineBanner />
      {children}
      <ConflictDialog
        conflict={currentConflict}
        open={conflictDialogOpen}
        onOpenChange={setConflictDialogOpen}
        onResolve={handleResolveConflict}
      />
    </>
  );
}
