import { supabase } from "../client";
import type { UserPreferences, InsertUserPreferences, Theme } from "../types";

export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createUserPreferences(
  preferences: InsertUserPreferences
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .insert(preferences)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertUserPreferences(
  userId: string,
  preferences: Partial<Omit<UserPreferences, "id" | "clerk_user_id" | "created_at">>
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .upsert(
      {
        clerk_user_id: userId,
        ...preferences,
      },
      {
        onConflict: "clerk_user_id",
      }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserPreferences(
  userId: string,
  updates: Partial<Pick<UserPreferences, "default_model" | "theme">>
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .update(updates)
    .eq("clerk_user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setDefaultModel(
  userId: string,
  model: string
): Promise<UserPreferences> {
  return updateUserPreferences(userId, { default_model: model });
}

export async function setTheme(
  userId: string,
  theme: Theme
): Promise<UserPreferences> {
  return updateUserPreferences(userId, { theme });
}

export async function deleteUserPreferences(userId: string): Promise<void> {
  const { error } = await supabase
    .from("user_preferences")
    .delete()
    .eq("clerk_user_id", userId);

  if (error) throw error;
}

// Webhook handlers for Clerk events
export async function handleUserCreated(clerkUserId: string): Promise<void> {
  await createUserPreferences({
    clerk_user_id: clerkUserId,
    default_model: "gemini/gemini-2.5-flash-preview-05-20",
    theme: "system",
  });
}

export async function handleUserDeleted(clerkUserId: string): Promise<void> {
  // Delete user preferences
  await deleteUserPreferences(clerkUserId);

  // Soft delete all user projects
  await supabase
    .from("projects")
    .update({ deleted_at: new Date().toISOString() })
    .eq("clerk_user_id", clerkUserId);

  // Delete all user API keys
  await supabase.from("api_keys").delete().eq("clerk_user_id", clerkUserId);
}
