export type AttachmentType = "file" | "url" | "text";

export type ExtractionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface Attachment {
  id: string;
  projectId: string;
  type: AttachmentType;
  name: string;
  originalFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
  storagePath?: string;
  sourceUrl?: string;
  content?: string; // For text type or extracted content
  extractedContent?: string;
  extractionStatus: ExtractionStatus;
  createdAt: string;
}

export interface CreateAttachmentInput {
  projectId: string;
  type: AttachmentType;
  name: string;
  originalFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
  sourceUrl?: string;
  content?: string;
}

export interface AttachmentWithFile extends Omit<Attachment, "id"> {
  file?: File;
}
