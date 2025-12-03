import { supabase } from "../client";
import type { Message, InsertMessage, Phase } from "../types";

export async function getMessages(
  projectId: string,
  phase: Phase
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", projectId)
    .eq("phase", phase)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getAllProjectMessages(
  projectId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createMessage(message: InsertMessage): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert(message)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createMessages(
  messages: InsertMessage[]
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .insert(messages)
    .select();

  if (error) throw error;
  return data || [];
}

export async function deleteProjectMessages(
  projectId: string,
  phase?: Phase
): Promise<void> {
  let query = supabase.from("messages").delete().eq("project_id", projectId);

  if (phase) {
    query = query.eq("phase", phase);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function getMessagesByLocalIds(
  localIds: string[]
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .in("local_id", localIds);

  if (error) throw error;
  return data || [];
}
