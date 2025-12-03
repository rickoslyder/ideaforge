import { supabase } from "../client";
import type {
  Attachment,
  InsertAttachment,
  ExtractionStatus,
} from "../types";

export async function getAttachments(projectId: string): Promise<Attachment[]> {
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAttachment(
  attachmentId: string
): Promise<Attachment | null> {
  const { data, error } = await supabase
    .from("attachments")
    .select("*")
    .eq("id", attachmentId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createAttachment(
  attachment: InsertAttachment
): Promise<Attachment> {
  const { data, error } = await supabase
    .from("attachments")
    .insert(attachment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAttachmentContent(
  attachmentId: string,
  extractedContent: string,
  status: ExtractionStatus = "completed"
): Promise<Attachment> {
  const { data, error } = await supabase
    .from("attachments")
    .update({
      extracted_content: extractedContent,
      extraction_status: status,
    })
    .eq("id", attachmentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAttachmentStatus(
  attachmentId: string,
  status: ExtractionStatus
): Promise<void> {
  const { error } = await supabase
    .from("attachments")
    .update({ extraction_status: status })
    .eq("id", attachmentId);

  if (error) throw error;
}

export async function deleteAttachment(attachmentId: string): Promise<void> {
  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("id", attachmentId);

  if (error) throw error;
}

export async function deleteProjectAttachments(
  projectId: string
): Promise<void> {
  const { error } = await supabase
    .from("attachments")
    .delete()
    .eq("project_id", projectId);

  if (error) throw error;
}
