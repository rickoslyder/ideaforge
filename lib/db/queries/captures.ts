import { supabase } from "../client";
import type {
  QuickCapture,
  InsertQuickCapture,
  CaptureSourceType,
} from "../types";
import { createProject } from "./projects";
import { nanoid } from "nanoid";

/**
 * Create a new quick capture in the inbox
 */
export async function createCapture(
  capture: InsertQuickCapture
): Promise<QuickCapture> {
  const { data, error } = await supabase
    .from("quick_captures")
    .insert(capture)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all unconverted captures for a user
 */
export async function getCaptures(userId: string): Promise<QuickCapture[]> {
  const { data, error } = await supabase
    .from("quick_captures")
    .select("*")
    .eq("clerk_user_id", userId)
    .is("project_id", null)
    .is("converted_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get a single capture by ID
 */
export async function getCapture(
  captureId: string,
  userId: string
): Promise<QuickCapture | null> {
  const { data, error } = await supabase
    .from("quick_captures")
    .select("*")
    .eq("id", captureId)
    .eq("clerk_user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

/**
 * Convert a capture to a full project
 */
export async function convertCaptureToProject(
  captureId: string,
  userId: string,
  options?: {
    name?: string; // Override project name (default: capture title)
  }
): Promise<{ capture: QuickCapture; projectId: string }> {
  // Get the capture
  const capture = await getCapture(captureId, userId);
  if (!capture) {
    throw new Error("Capture not found");
  }

  if (capture.project_id) {
    throw new Error("Capture already converted to project");
  }

  // Build initial idea from capture metadata
  let initialIdea = capture.idea || "";
  if (capture.selected_text) {
    initialIdea += initialIdea ? "\n\n---\n\n" : "";
    initialIdea += `Selected text:\n${capture.selected_text}`;
  }
  if (capture.source_url) {
    initialIdea += initialIdea ? "\n\n" : "";
    initialIdea += `Source: ${capture.source_url}`;
    if (capture.source_title) {
      initialIdea += ` (${capture.source_title})`;
    }
  }

  // Create the project
  const project = await createProject({
    clerk_user_id: userId,
    name: options?.name || capture.title,
    initial_idea: initialIdea || null,
    current_phase: "request",
    request_content: null,
    spec_content: null,
    spec_config: null,
    plan_content: null,
    local_id: nanoid(),
    sync_status: "synced",
  });

  // Update the capture with the project reference
  const { data: updatedCapture, error } = await supabase
    .from("quick_captures")
    .update({
      project_id: project.id,
      converted_at: new Date().toISOString(),
    })
    .eq("id", captureId)
    .eq("clerk_user_id", userId)
    .select()
    .single();

  if (error) throw error;

  return {
    capture: updatedCapture,
    projectId: project.id,
  };
}

/**
 * Create capture and immediately convert to project
 */
export async function createCaptureAsProject(
  userId: string,
  data: {
    title: string;
    idea?: string;
    sourceUrl?: string;
    sourceTitle?: string;
    selectedText?: string;
    sourceType?: CaptureSourceType;
    tags?: string[];
    metadata?: Record<string, unknown>;
  }
): Promise<{ projectId: string; localId: string }> {
  // Build initial idea from all available data
  let initialIdea = data.idea || "";
  if (data.selectedText) {
    initialIdea += initialIdea ? "\n\n---\n\n" : "";
    initialIdea += `Selected text:\n${data.selectedText}`;
  }
  if (data.sourceUrl) {
    initialIdea += initialIdea ? "\n\n" : "";
    initialIdea += `Source: ${data.sourceUrl}`;
    if (data.sourceTitle) {
      initialIdea += ` (${data.sourceTitle})`;
    }
  }
  if (data.tags && data.tags.length > 0) {
    initialIdea += initialIdea ? "\n\n" : "";
    initialIdea += `Tags: ${data.tags.join(", ")}`;
  }

  const localId = nanoid();

  // Create the project directly
  const project = await createProject({
    clerk_user_id: userId,
    name: data.title,
    initial_idea: initialIdea || null,
    current_phase: "request",
    request_content: null,
    spec_content: null,
    spec_config: null,
    plan_content: null,
    local_id: localId,
    sync_status: "synced",
  });

  return {
    projectId: project.id,
    localId,
  };
}

/**
 * Delete a capture
 */
export async function deleteCapture(
  captureId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("quick_captures")
    .delete()
    .eq("id", captureId)
    .eq("clerk_user_id", userId);

  if (error) throw error;
}

/**
 * Get inbox count for a user
 */
export async function getInboxCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("quick_captures")
    .select("*", { count: "exact", head: true })
    .eq("clerk_user_id", userId)
    .is("project_id", null)
    .is("converted_at", null);

  if (error) throw error;
  return count ?? 0;
}
