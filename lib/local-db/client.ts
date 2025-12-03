import Dexie, { type Table } from "dexie";
import type {
  LocalProject,
  LocalMessage,
  LocalAttachment,
  SyncQueueItem,
  PricingCacheItem,
} from "./schema";
import { INDEXES, SCHEMA_VERSION } from "./schema";

export class IdeaForgeDB extends Dexie {
  projects!: Table<LocalProject, string>;
  messages!: Table<LocalMessage, string>;
  attachments!: Table<LocalAttachment, string>;
  syncQueue!: Table<SyncQueueItem, string>;
  pricingCache!: Table<PricingCacheItem, string>;

  constructor() {
    super("ideaforge");

    // Version 1: Initial schema
    this.version(1).stores({
      projects: "localId, remoteId, clerkUserId, syncStatus, updatedAt",
      messages: "localId, remoteId, projectLocalId, [projectLocalId+phase], createdAt",
      attachments: "localId, remoteId, projectLocalId, syncStatus",
      syncQueue: "id, table, operation, createdAt",
      pricingCache: "id",
    });

    // Version 2: Add localId index to syncQueue
    this.version(SCHEMA_VERSION).stores({
      projects: INDEXES.projects,
      messages: INDEXES.messages,
      attachments: INDEXES.attachments,
      syncQueue: INDEXES.syncQueue,
      pricingCache: INDEXES.pricingCache,
    });
  }
}

// Singleton instance
let dbInstance: IdeaForgeDB | null = null;

export function getDb(): IdeaForgeDB {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in the browser");
  }

  if (!dbInstance) {
    dbInstance = new IdeaForgeDB();
  }

  return dbInstance;
}

// For testing and cleanup
export function resetDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export async function clearAllData(): Promise<void> {
  const db = getDb();
  await Promise.all([
    db.projects.clear(),
    db.messages.clear(),
    db.attachments.clear(),
    db.syncQueue.clear(),
    db.pricingCache.clear(),
  ]);
}
