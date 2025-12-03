import { supabase } from "../client";
import type { ApiKey, InsertApiKey, UpdateApiKey, Provider } from "../types";

export async function getApiKeys(userId: string): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getApiKey(
  userId: string,
  provider: Provider,
  name?: string
): Promise<ApiKey | null> {
  let query = supabase
    .from("api_keys")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("provider", provider);

  if (name) {
    query = query.eq("name", name);
  } else {
    query = query.eq("is_default", true);
  }

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function getDefaultApiKey(
  userId: string,
  provider: Provider
): Promise<ApiKey | null> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("provider", provider)
    .eq("is_default", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
  // If this is marked as default, unset other defaults for this provider
  if (apiKey.is_default) {
    await supabase
      .from("api_keys")
      .update({ is_default: false })
      .eq("clerk_user_id", apiKey.clerk_user_id)
      .eq("provider", apiKey.provider);
  }

  const { data, error } = await supabase
    .from("api_keys")
    .insert(apiKey)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateApiKey(
  apiKeyId: string,
  userId: string,
  updates: UpdateApiKey
): Promise<ApiKey> {
  // If setting as default, unset other defaults for this provider
  if (updates.is_default) {
    const existing = await supabase
      .from("api_keys")
      .select("provider")
      .eq("id", apiKeyId)
      .single();

    if (existing.data) {
      await supabase
        .from("api_keys")
        .update({ is_default: false })
        .eq("clerk_user_id", userId)
        .eq("provider", existing.data.provider)
        .neq("id", apiKeyId);
    }
  }

  const { data, error } = await supabase
    .from("api_keys")
    .update(updates)
    .eq("id", apiKeyId)
    .eq("clerk_user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteApiKey(
  apiKeyId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", apiKeyId)
    .eq("clerk_user_id", userId);

  if (error) throw error;
}

export async function getApiKeysByProvider(
  userId: string,
  provider: Provider
): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from("api_keys")
    .select("*")
    .eq("clerk_user_id", userId)
    .eq("provider", provider)
    .order("is_default", { ascending: false });

  if (error) throw error;
  return data || [];
}
