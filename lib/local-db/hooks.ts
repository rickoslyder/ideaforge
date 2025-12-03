"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { nanoid } from "nanoid";
import { getDb } from "./client";
import type { LocalProject, LocalMessage, LocalAttachment, SyncQueueItem } from "./schema";
import type { Phase, SpecConfig } from "@/lib/db/types";

// Project hooks

export function useLocalProjects(userId: string) {
  return useLiveQuery(
    () =>
      getDb()
        .projects.where("clerkUserId")
        .equals(userId)
        .filter((p) => !p.deletedAt)
        .sortBy("updatedAt")
        .then((projects) => projects.reverse()),
    [userId],
    []
  );
}

export function useLocalProject(localId: string) {
  return useLiveQuery(
    () => getDb().projects.get(localId),
    [localId],
    undefined
  );
}

// Message hooks

export function useLocalMessages(projectLocalId: string, phase: Phase) {
  return useLiveQuery(
    () =>
      getDb()
        .messages.where("[projectLocalId+phase]")
        .equals([projectLocalId, phase])
        .sortBy("createdAt"),
    [projectLocalId, phase],
    []
  );
}

// Attachment hooks

export function useLocalAttachments(projectLocalId: string) {
  return useLiveQuery(
    () =>
      getDb()
        .attachments.where("projectLocalId")
        .equals(projectLocalId)
        .sortBy("createdAt"),
    [projectLocalId],
    []
  );
}

// Sync queue hooks

export function useSyncQueue() {
  return useLiveQuery(
    () => getDb().syncQueue.orderBy("createdAt").toArray(),
    [],
    []
  );
}

export function usePendingSyncCount() {
  return useLiveQuery(() => getDb().syncQueue.count(), [], 0);
}

// CRUD operations with sync queue

export async function createLocalProject(
  userId: string,
  data: { name: string; initialIdea?: string }
): Promise<LocalProject> {
  const db = getDb();
  const now = new Date();
  const localId = nanoid();

  const project: LocalProject = {
    localId,
    clerkUserId: userId,
    name: data.name,
    initialIdea: data.initialIdea,
    currentPhase: "request",
    createdAt: now,
    updatedAt: now,
    syncStatus: "pending",
  };

  await db.projects.add(project);

  // Queue for sync
  await queueSync("projects", "insert", localId, project);

  return project;
}

export async function updateLocalProject(
  localId: string,
  updates: Partial<Omit<LocalProject, "localId" | "clerkUserId" | "createdAt">>
): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db.projects.update(localId, {
    ...updates,
    updatedAt: now,
    syncStatus: "pending",
  });

  const project = await db.projects.get(localId);
  if (project) {
    await queueSync("projects", "update", localId, project);
  }
}

export async function updateProjectPhase(
  localId: string,
  phase: Phase,
  content?: string
): Promise<void> {
  const updates: Partial<LocalProject> = {
    currentPhase: phase,
  };

  if (phase === "spec" && content) {
    updates.requestContent = content;
  } else if (phase === "plan" && content) {
    updates.specContent = content;
  }

  await updateLocalProject(localId, updates);
}

export async function deleteLocalProject(localId: string): Promise<void> {
  const db = getDb();
  const now = new Date();

  // Soft delete
  await db.projects.update(localId, {
    deletedAt: now,
    updatedAt: now,
    syncStatus: "pending",
  });

  const project = await db.projects.get(localId);
  if (project) {
    await queueSync("projects", "delete", localId, project);
  }
}

export async function createLocalMessage(
  projectLocalId: string,
  data: Omit<LocalMessage, "localId" | "projectLocalId" | "createdAt" | "syncStatus">
): Promise<LocalMessage> {
  const db = getDb();
  const localId = nanoid();

  const message: LocalMessage = {
    ...data,
    localId,
    projectLocalId,
    createdAt: new Date(),
    syncStatus: "pending",
  };

  await db.messages.add(message);
  await queueSync("messages", "insert", localId, message);

  return message;
}

export async function createLocalAttachment(
  projectLocalId: string,
  data: Omit<LocalAttachment, "localId" | "projectLocalId" | "createdAt" | "syncStatus">
): Promise<LocalAttachment> {
  const db = getDb();
  const localId = nanoid();

  const attachment: LocalAttachment = {
    ...data,
    localId,
    projectLocalId,
    createdAt: new Date(),
    syncStatus: "pending",
  };

  await db.attachments.add(attachment);
  await queueSync("attachments", "insert", localId, attachment);

  return attachment;
}

export async function updateLocalAttachment(
  localId: string,
  updates: Partial<Omit<LocalAttachment, "localId" | "projectLocalId" | "createdAt">>
): Promise<void> {
  const db = getDb();

  await db.attachments.update(localId, {
    ...updates,
    syncStatus: "pending",
  });

  const attachment = await db.attachments.get(localId);
  if (attachment) {
    await queueSync("attachments", "update", localId, attachment);
  }
}

export async function deleteLocalAttachment(localId: string): Promise<void> {
  const db = getDb();
  const attachment = await db.attachments.get(localId);

  if (attachment) {
    await db.attachments.delete(localId);
    await queueSync("attachments", "delete", localId, attachment);
  }
}

// Sync queue helpers

async function queueSync(
  table: SyncQueueItem["table"],
  operation: SyncQueueItem["operation"],
  localId: string,
  data: Record<string, unknown>
): Promise<void> {
  const db = getDb();

  // Remove any existing pending operations for this item
  await db.syncQueue
    .where("localId")
    .equals(localId)
    .delete();

  const queueItem: SyncQueueItem = {
    id: nanoid(),
    table,
    operation,
    localId,
    data,
    attempts: 0,
    createdAt: new Date(),
  };

  await db.syncQueue.add(queueItem);
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  await getDb().syncQueue.delete(id);
}

export async function updateSyncQueueItem(
  id: string,
  updates: Partial<Pick<SyncQueueItem, "attempts" | "lastAttempt" | "error">>
): Promise<void> {
  await getDb().syncQueue.update(id, updates);
}

// Bulk operations for sync

export async function markProjectSynced(
  localId: string,
  remoteId: string
): Promise<void> {
  await getDb().projects.update(localId, {
    remoteId,
    syncStatus: "synced",
    lastSyncedAt: new Date(),
  });
}

export async function markMessageSynced(
  localId: string,
  remoteId: string
): Promise<void> {
  await getDb().messages.update(localId, {
    remoteId,
    syncStatus: "synced",
  });
}

export async function markAttachmentSynced(
  localId: string,
  remoteId: string
): Promise<void> {
  await getDb().attachments.update(localId, {
    remoteId,
    syncStatus: "synced",
  });
}
