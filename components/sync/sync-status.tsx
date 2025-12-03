"use client";

import { Cloud, CloudOff, RefreshCw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSync } from "@/hooks/use-sync";
import { formatDistanceToNow } from "date-fns";

export function SyncStatus() {
  const {
    syncState,
    lastSyncedAt,
    pendingChanges,
    isOnline,
    isSyncing,
    triggerSync,
  } = useSync();

  const getStatusIcon = () => {
    if (!isOnline) {
      return <CloudOff className="h-4 w-4 text-muted-foreground" />;
    }
    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (syncState === "error") {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    return <Cloud className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (!isOnline) return "Offline";
    if (isSyncing) return "Syncing...";
    if (syncState === "error") return "Sync error";
    if (pendingChanges > 0) return `${pendingChanges} pending`;
    return "Synced";
  };

  const getLastSyncText = () => {
    if (!lastSyncedAt) return "Never synced";
    return `Last synced ${formatDistanceToNow(new Date(lastSyncedAt), { addSuffix: true })}`;
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2 h-8",
              !isOnline && "text-muted-foreground"
            )}
            onClick={() => isOnline && triggerSync()}
            disabled={isSyncing || !isOnline}
          >
            {getStatusIcon()}
            <span className="text-xs hidden sm:inline">{getStatusText()}</span>
            {pendingChanges > 0 && isOnline && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {pendingChanges}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getLastSyncText()}</p>
          {pendingChanges > 0 && (
            <p className="text-xs text-muted-foreground">
              {pendingChanges} change{pendingChanges !== 1 ? "s" : ""} pending
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
