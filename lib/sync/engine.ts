import { getRetryableChanges, getPendingCount } from "./queue";
import { canPush } from "./network";
import type { SyncState } from "@/stores/sync-store";

export interface SyncEngineConfig {
  autoSyncInterval: number; // ms
  onSyncStateChange: (state: SyncState) => void;
  onPendingCountChange: (count: number) => void;
  onError: (error: string) => void;
  onSyncComplete: (timestamp: string) => void;
}

export class SyncEngine {
  private config: SyncEngineConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(config: SyncEngineConfig) {
    this.config = config;
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Initial sync
    this.sync();

    // Set up interval
    this.intervalId = setInterval(() => {
      this.sync();
    }, this.config.autoSyncInterval);

    // Listen for online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", this.handleOnline);
      window.addEventListener("offline", this.handleOffline);
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  stop(): void {
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (typeof window !== "undefined") {
      window.removeEventListener("online", this.handleOnline);
      window.removeEventListener("offline", this.handleOffline);
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    }
  }

  private handleOnline = (): void => {
    this.config.onSyncStateChange("idle");
    this.sync();
  };

  private handleOffline = (): void => {
    this.config.onSyncStateChange("offline");
  };

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible" && canPush()) {
      this.sync();
    }
  };

  async sync(): Promise<void> {
    if (!canPush()) {
      this.config.onSyncStateChange("offline");
      return;
    }

    const changes = getRetryableChanges();
    this.config.onPendingCountChange(getPendingCount());

    if (changes.length === 0) {
      this.config.onSyncStateChange("idle");
      return;
    }

    this.config.onSyncStateChange("syncing");

    try {
      const response = await fetch("/api/sync/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      this.config.onPendingCountChange(getPendingCount());

      if (result.failed > 0) {
        this.config.onError(`${result.failed} changes failed to sync`);
        this.config.onSyncStateChange("error");
      } else {
        const timestamp = new Date().toISOString();
        this.config.onSyncComplete(timestamp);
        this.config.onSyncStateChange("idle");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sync failed";
      this.config.onError(message);
      this.config.onSyncStateChange("error");
    }
  }

  // Force immediate sync
  forceSync(): void {
    this.sync();
  }

  // Update pending count (call after local changes)
  updatePendingCount(): void {
    this.config.onPendingCountChange(getPendingCount());
  }
}

// Singleton instance
let engineInstance: SyncEngine | null = null;

export function getSyncEngine(config?: SyncEngineConfig): SyncEngine | null {
  if (typeof window === "undefined") return null;

  if (!engineInstance && config) {
    engineInstance = new SyncEngine(config);
  }

  return engineInstance;
}

export function destroySyncEngine(): void {
  if (engineInstance) {
    engineInstance.stop();
    engineInstance = null;
  }
}
