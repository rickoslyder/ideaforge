"use client";

import { useState } from "react";
import { AlertTriangle, RotateCcw, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { ProjectSnapshot } from "@/lib/db/types";
import { PHASE_INFO } from "@/types/project";

interface RestoreDialogProps {
  snapshot: ProjectSnapshot | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function RestoreDialog({
  snapshot,
  open,
  onClose,
  onConfirm,
}: RestoreDialogProps) {
  const [isRestoring, setIsRestoring] = useState(false);

  if (!snapshot) return null;

  const phaseInfo = PHASE_INFO[snapshot.phase_at_snapshot];

  const handleConfirm = async () => {
    setIsRestoring(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Restore failed:", error);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Restore Snapshot
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">This action will overwrite current content</p>
                <p className="mt-1">
                  Your current project content will be replaced with the snapshot data.
                  A backup snapshot will be created automatically before restoring.
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Snapshot from:</span>
                <span className="font-medium">
                  {new Date(snapshot.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Phase:</span>
                <Badge variant="outline">{phaseInfo.label}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="secondary">
                  {snapshot.trigger === "auto" ? "Automatic" : "Manual"}
                </Badge>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isRestoring}
            className="bg-primary"
          >
            {isRestoring ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
