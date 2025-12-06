import { supabase } from "../client";
import type { ApiToken, InsertApiToken } from "../types";
import {
  generateToken,
  getTokenPrefix,
  hashToken,
  type TokenValidation,
} from "@/lib/auth/api-token";

// Public token info (without hash)
export type ApiTokenPublic = Omit<ApiToken, "token_hash">;

/**
 * Create a new API token
 * Returns the raw token (only shown once) along with the stored record
 */
export async function createApiToken(
  userId: string,
  name: string,
  options?: {
    scopes?: string[];
    expiresInDays?: number;
  }
): Promise<{ token: string; record: ApiTokenPublic }> {
  const token = generateToken();
  const tokenHash = await hashToken(token);
  const tokenPrefix = getTokenPrefix(token);

  const expiresAt = options?.expiresInDays
    ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const insertData: InsertApiToken = {
    clerk_user_id: userId,
    name,
    token_prefix: tokenPrefix,
    token_hash: tokenHash,
    scopes: options?.scopes || ["capture:write"],
    expires_at: expiresAt,
  };

  const { data, error } = await supabase
    .from("api_tokens")
    .insert(insertData)
    .select("id, clerk_user_id, name, token_prefix, scopes, last_used_at, expires_at, created_at, revoked_at")
    .single();

  if (error) throw error;

  return {
    token,
    record: data,
  };
}

/**
 * List all tokens for a user (excludes revoked)
 */
export async function getApiTokens(userId: string): Promise<ApiTokenPublic[]> {
  const { data, error } = await supabase
    .from("api_tokens")
    .select("id, clerk_user_id, name, token_prefix, scopes, last_used_at, expires_at, created_at, revoked_at")
    .eq("clerk_user_id", userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Validate a token by its hash
 * Returns user info if valid, error message if not
 */
export async function validateToken(token: string): Promise<TokenValidation> {
  const tokenHash = await hashToken(token);

  const { data, error } = await supabase
    .from("api_tokens")
    .select("id, clerk_user_id, scopes, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .single();

  if (error && error.code === "PGRST116") {
    return { valid: false, error: "Invalid token" };
  }
  if (error) throw error;

  if (data.revoked_at) {
    return { valid: false, error: "Token has been revoked" };
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "Token has expired" };
  }

  // Update last_used_at (fire and forget)
  updateTokenLastUsed(data.id).catch(console.error);

  return {
    valid: true,
    userId: data.clerk_user_id,
    tokenId: data.id,
    scopes: data.scopes,
  };
}

/**
 * Update the last_used_at timestamp for a token
 */
export async function updateTokenLastUsed(tokenId: string): Promise<void> {
  await supabase
    .from("api_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", tokenId);
}

/**
 * Revoke a token (soft delete)
 */
export async function revokeApiToken(
  tokenId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("api_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", tokenId)
    .eq("clerk_user_id", userId);

  if (error) throw error;
}

/**
 * Delete a token permanently (use revokeApiToken for soft delete)
 */
export async function deleteApiToken(
  tokenId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("api_tokens")
    .delete()
    .eq("id", tokenId)
    .eq("clerk_user_id", userId);

  if (error) throw error;
}

/**
 * Check if a user has any active tokens
 */
export async function hasActiveTokens(userId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from("api_tokens")
    .select("*", { count: "exact", head: true })
    .eq("clerk_user_id", userId)
    .is("revoked_at", null);

  if (error) throw error;
  return (count ?? 0) > 0;
}
