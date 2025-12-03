// Database types matching Supabase schema

export type Phase = "request" | "spec" | "plan";
export type SyncStatus = "synced" | "pending" | "conflict";
export type MessageRole = "user" | "assistant" | "system";
export type AttachmentType = "file" | "url" | "text";
export type ExtractionStatus = "pending" | "processing" | "completed" | "failed";
export type Provider = "openai" | "anthropic" | "google" | "ollama" | "custom";
export type Theme = "light" | "dark" | "system";
export type SnapshotTrigger = "auto" | "manual";

export interface UserPreferences {
  id: string;
  clerk_user_id: string;
  default_model: string | null;
  theme: Theme;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  clerk_user_id: string;
  name: string;
  initial_idea: string | null;
  current_phase: Phase;
  request_content: string | null;
  spec_content: string | null;
  spec_config: SpecConfig | null;
  plan_content: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  local_id: string | null;
  sync_status: SyncStatus;
  last_synced_at: string | null;
}

export interface Message {
  id: string;
  project_id: string;
  phase: Phase;
  role: MessageRole;
  content: string;
  model: string | null;
  provider: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  cost: number | null;
  created_at: string;
  local_id: string | null;
  sync_status: SyncStatus;
}

export interface Attachment {
  id: string;
  project_id: string;
  type: AttachmentType;
  name: string;
  original_filename: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  storage_path: string | null;
  source_url: string | null;
  extracted_content: string | null;
  extraction_status: ExtractionStatus;
  created_at: string;
  local_id: string | null;
  sync_status: SyncStatus;
}

export interface ApiKey {
  id: string;
  clerk_user_id: string;
  provider: Provider;
  name: string | null;
  encrypted_key: string;
  endpoint_url: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectSnapshot {
  id: string;
  project_id: string;
  trigger: SnapshotTrigger;
  phase_at_snapshot: Phase;
  snapshot_data: ProjectSnapshotData;
  created_at: string;
}

export interface ProjectSnapshotData {
  name: string;
  current_phase: Phase;
  request_content: string | null;
  spec_content: string | null;
  spec_config: SpecConfig | null;
  plan_content: string | null;
}

export interface SpecConfig {
  sections: SpecSection[];
}

export interface SpecSection {
  id: string;
  name: string;
  included: boolean;
  detailLevel: "brief" | "standard" | "comprehensive";
  guidance: string;
  includeCodeExamples?: boolean;
}

// Insert types (without generated fields)
export type InsertUserPreferences = Omit<
  UserPreferences,
  "id" | "created_at" | "updated_at"
>;

export type InsertProject = Omit<
  Project,
  "id" | "created_at" | "updated_at" | "deleted_at" | "last_synced_at"
>;

export type InsertMessage = Omit<Message, "id" | "created_at">;

export type InsertAttachment = Omit<Attachment, "id" | "created_at">;

export type InsertApiKey = Omit<ApiKey, "id" | "created_at" | "updated_at">;

export type InsertProjectSnapshot = Omit<ProjectSnapshot, "id" | "created_at">;

// Update types (partial, without immutable fields)
export type UpdateProject = Partial<
  Omit<Project, "id" | "clerk_user_id" | "created_at">
>;

export type UpdateMessage = Partial<
  Omit<Message, "id" | "project_id" | "created_at">
>;

export type UpdateApiKey = Partial<
  Omit<ApiKey, "id" | "clerk_user_id" | "created_at">
>;
