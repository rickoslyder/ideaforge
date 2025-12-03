"use client";

import { useState, useCallback, useEffect } from "react";
import type { ProjectSnapshot } from "@/lib/db/types";

interface UseSnapshotsReturn {
  snapshots: ProjectSnapshot[];
  isLoading: boolean;
  error: string | null;
  createSnapshot: (trigger?: "auto" | "manual") => Promise<void>;
  deleteSnapshot: (snapshotId: string) => Promise<void>;
  restoreSnapshot: (snapshotId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSnapshots(projectId: string): UseSnapshotsReturn {
  const [snapshots, setSnapshots] = useState<ProjectSnapshot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshots = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${projectId}/snapshots`);
      if (!response.ok) throw new Error("Failed to fetch snapshots");
      const data = await response.json();
      setSnapshots(data.snapshots || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchSnapshots();
  }, [fetchSnapshots]);

  const createSnapshot = useCallback(
    async (trigger: "auto" | "manual" = "manual") => {
      try {
        const response = await fetch(`/api/projects/${projectId}/snapshots`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trigger }),
        });

        if (!response.ok) throw new Error("Failed to create snapshot");
        await fetchSnapshots();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create snapshot");
        throw err;
      }
    },
    [projectId, fetchSnapshots]
  );

  const deleteSnapshot = useCallback(
    async (snapshotId: string) => {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/snapshots/${snapshotId}`,
          { method: "DELETE" }
        );

        if (!response.ok) throw new Error("Failed to delete snapshot");
        setSnapshots((prev) => prev.filter((s) => s.id !== snapshotId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete snapshot");
        throw err;
      }
    },
    [projectId]
  );

  const restoreSnapshot = useCallback(
    async (snapshotId: string) => {
      try {
        const response = await fetch(
          `/api/projects/${projectId}/snapshots/${snapshotId}/restore`,
          { method: "POST" }
        );

        if (!response.ok) throw new Error("Failed to restore snapshot");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to restore snapshot");
        throw err;
      }
    },
    [projectId]
  );

  return {
    snapshots,
    isLoading,
    error,
    createSnapshot,
    deleteSnapshot,
    restoreSnapshot,
    refresh: fetchSnapshots,
  };
}
