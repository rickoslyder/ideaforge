import type { Phase, SyncStatus, MessageRole, AttachmentType, ExtractionStatus, SpecConfig } from "@/lib/db/types";

// Local database schema types (mirror Supabase but optimized for IndexedDB)

export interface LocalProject {
  localId: string;
  remoteId?: string;
  clerkUserId: string;
  name: string;
  initialIdea?: string;
  currentPhase: Phase;
  requestContent?: string;
  specContent?: string;
  specConfig?: SpecConfig;
  planContent?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  syncStatus: SyncStatus;
  lastSyncedAt?: Date;
}

export interface LocalMessage {
  localId: string;
  remoteId?: string;
  projectLocalId: string;
  phase: Phase;
  role: MessageRole;
  content: string;
  model?: string;
  provider?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  createdAt: Date;
  syncStatus: SyncStatus;
}

export interface LocalAttachment {
  localId: string;
  remoteId?: string;
  projectLocalId: string;
  type: AttachmentType;
  name: string;
  originalFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
  storagePath?: string;
  sourceUrl?: string;
  extractedContent?: string;
  extractionStatus: ExtractionStatus;
  createdAt: Date;
  syncStatus: SyncStatus;
}

export interface SyncQueueItem {
  id: string;
  table: "projects" | "messages" | "attachments";
  operation: "insert" | "update" | "delete";
  localId: string;
  data: Record<string, unknown>;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
  createdAt: Date;
}

export interface PricingCacheItem {
  id: string;
  data: Record<string, unknown>;
  fetchedAt: Date;
}

// Schema version for migrations
export const SCHEMA_VERSION = 2;

// Index definitions for Dexie
export const INDEXES = {
  projects: "localId, remoteId, clerkUserId, syncStatus, updatedAt",
  messages: "localId, remoteId, projectLocalId, [projectLocalId+phase], createdAt",
  attachments: "localId, remoteId, projectLocalId, syncStatus",
  syncQueue: "id, table, operation, localId, createdAt",
  pricingCache: "id",
} as const;
