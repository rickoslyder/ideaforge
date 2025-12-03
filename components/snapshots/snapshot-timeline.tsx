"use client";

import { useState } from "react";
import { History, Plus, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SnapshotCard } from "./snapshot-card";
import { SnapshotPreview } from "./snapshot-preview";
import { RestoreDialog } from "./restore-dialog";
import type { ProjectSnapshot } from "@/lib/db/types";

interface SnapshotTimelineProps {
  snapshots: ProjectSnapshot[];
  isLoading: boolean;
  onCreateSnapshot: () => Promise<void>;
  onDeleteSnapshot: (id: string) => Promise<void>;
  onRestoreSnapshot: (id: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export function SnapshotTimeline({
  snapshots,
  isLoading,
  onCreateSnapshot,
  onDeleteSnapshot,
  onRestoreSnapshot,
  onRefresh,
}: SnapshotTimelineProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [previewSnapshot, setPreviewSnapshot] = useState<ProjectSnapshot | null>(null);
  const [restoreSnapshot, setRestoreSnapshot] = useState<ProjectSnapshot | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      await onCreateSnapshot();
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this snapshot?")) return;
    setDeletingId(id);
    try {
      await onDeleteSnapshot(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async () => {
    if (!restoreSnapshot) return;
    await onRestoreSnapshot(restoreSnapshot.id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Version History
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button onClick={handleCreate} disabled={isCreating} size="sm">
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Snapshot
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="w-0.5 flex-1" />
                </div>
                <Skeleton className="flex-1 h-32" />
              </div>
            ))}
          </div>
        ) : snapshots.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No snapshots yet</p>
            <p className="text-sm mt-1">
              Create a snapshot to save the current state of your project
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {snapshots.map((snapshot, index) => (
              <SnapshotCard
                key={snapshot.id}
                snapshot={snapshot}
                isFirst={index === 0}
                onPreview={() => setPreviewSnapshot(snapshot)}
                onRestore={() => setRestoreSnapshot(snapshot)}
                onDelete={() => handleDelete(snapshot.id)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <SnapshotPreview
        snapshot={previewSnapshot}
        open={!!previewSnapshot}
        onClose={() => setPreviewSnapshot(null)}
      />

      <RestoreDialog
        snapshot={restoreSnapshot}
        open={!!restoreSnapshot}
        onClose={() => setRestoreSnapshot(null)}
        onConfirm={handleRestore}
      />
    </Card>
  );
}
