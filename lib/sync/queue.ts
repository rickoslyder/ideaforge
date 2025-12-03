import type { SyncStatus } from "@/lib/db/types";

export type SyncOperation = "create" | "update" | "delete";

export interface QueuedChange {
  id: string;
  entityType: "project" | "message" | "attachment";
  entityId: string;
  localId: string;
  operation: SyncOperation;
  data: unknown;
  createdAt: string;
  retryCount: number;
  lastError?: string;
}

const QUEUE_KEY = "ideaforge-sync-queue";

// Get all queued changes
export function getQueuedChanges(): QueuedChange[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save queue to localStorage
function saveQueue(queue: QueuedChange[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error("Failed to save sync queue:", error);
  }
}

// Add a change to the queue
export function queueChange(
  change: Omit<QueuedChange, "id" | "createdAt" | "retryCount">
): QueuedChange {
  const queue = getQueuedChanges();

  // Check for existing change to same entity
  const existingIndex = queue.findIndex(
    (c) =>
      c.entityType === change.entityType &&
      c.localId === change.localId
  );

  const newChange: QueuedChange = {
    ...change,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    retryCount: 0,
  };

  if (existingIndex >= 0) {
    // Merge operations: if existing is create and new is update, keep create
    const existing = queue[existingIndex];
    if (existing.operation === "create" && change.operation === "update") {
      queue[existingIndex] = {
        ...existing,
        data: change.data,
        createdAt: new Date().toISOString(),
      };
    } else if (change.operation === "delete") {
      // If delete, remove from queue if it was a create, otherwise update to delete
      if (existing.operation === "create") {
        queue.splice(existingIndex, 1);
        saveQueue(queue);
        return newChange;
      }
      queue[existingIndex] = newChange;
    } else {
      queue[existingIndex] = newChange;
    }
  } else {
    queue.push(newChange);
  }

  saveQueue(queue);
  return newChange;
}

// Remove a change from the queue
export function removeFromQueue(changeId: string): void {
  const queue = getQueuedChanges();
  const filtered = queue.filter((c) => c.id !== changeId);
  saveQueue(filtered);
}

// Update retry count for a failed change
export function markChangeRetried(changeId: string, error?: string): void {
  const queue = getQueuedChanges();
  const index = queue.findIndex((c) => c.id === changeId);

  if (index >= 0) {
    queue[index] = {
      ...queue[index],
      retryCount: queue[index].retryCount + 1,
      lastError: error,
    };
    saveQueue(queue);
  }
}

// Clear the entire queue
export function clearQueue(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(QUEUE_KEY);
}

// Get count of pending changes
export function getPendingCount(): number {
  return getQueuedChanges().length;
}

// Get changes that have not exceeded max retries
export function getRetryableChanges(maxRetries: number = 3): QueuedChange[] {
  return getQueuedChanges().filter((c) => c.retryCount < maxRetries);
}
