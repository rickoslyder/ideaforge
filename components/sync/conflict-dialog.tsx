"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConflictDiff } from "./conflict-diff";
import type { SyncConflict } from "@/stores/sync-store";

interface ConflictDialogProps {
  conflict: SyncConflict | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (conflictId: string, resolution: "local" | "remote") => void;
}

export function ConflictDialog({
  conflict,
  open,
  onOpenChange,
  onResolve,
}: ConflictDialogProps) {
  const [selectedVersion, setSelectedVersion] = useState<"local" | "remote" | null>(null);

  if (!conflict) return null;

  const handleResolve = () => {
    if (!selectedVersion) return;
    onResolve(conflict.id, selectedVersion);
    setSelectedVersion(null);
    onOpenChange(false);
  };

  const entityTypeLabel = {
    project: "Project",
    message: "Message",
    attachment: "Attachment",
  }[conflict.entityType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Sync Conflict Detected
          </DialogTitle>
          <DialogDescription>
            This {entityTypeLabel.toLowerCase()} was modified both locally and remotely.
            Choose which version to keep.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="text-sm text-muted-foreground mb-4">
            <div>Local updated: {new Date(conflict.localUpdatedAt).toLocaleString()}</div>
            <div>Remote updated: {new Date(conflict.remoteUpdatedAt).toLocaleString()}</div>
          </div>

          <ConflictDiff
            localData={conflict.localData as Record<string, unknown>}
            remoteData={conflict.remoteData as Record<string, unknown>}
            selectedVersion={selectedVersion}
            onSelect={setSelectedVersion}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleResolve} disabled={!selectedVersion}>
            Apply {selectedVersion === "local" ? "Local" : selectedVersion === "remote" ? "Remote" : "Selected"} Version
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
