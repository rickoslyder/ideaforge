import { supabase } from "@/lib/db/client";
import type { QueuedChange } from "./queue";
import { removeFromQueue, markChangeRetried } from "./queue";
import { withRetry, isRetryableError } from "./retry";

export interface PushResult {
  success: boolean;
  changeId: string;
  entityId?: string;
  error?: string;
}

export interface PushSummary {
  total: number;
  successful: number;
  failed: number;
  results: PushResult[];
}

// Process a single queued change
async function processChange(
  change: QueuedChange,
  userId: string
): Promise<PushResult> {
  try {
    switch (change.entityType) {
      case "project":
        return await pushProject(change, userId);
      case "message":
        return await pushMessage(change);
      case "attachment":
        return await pushAttachment(change);
      default:
        return {
          success: false,
          changeId: change.id,
          error: `Unknown entity type: ${change.entityType}`,
        };
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    // Check if error is retryable
    if (isRetryableError(error)) {
      markChangeRetried(change.id, errorMessage);
    }

    return {
      success: false,
      changeId: change.id,
      error: errorMessage,
    };
  }
}

// Push project changes
async function pushProject(
  change: QueuedChange,
  userId: string
): Promise<PushResult> {
  const data = change.data as Record<string, unknown>;

  switch (change.operation) {
    case "create": {
      const { data: result, error } = await supabase
        .from("projects")
        .insert({
          ...data,
          local_id: change.localId,
          clerk_user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      removeFromQueue(change.id);
      return {
        success: true,
        changeId: change.id,
        entityId: result.id,
      };
    }

    case "update": {
      const { data: result, error } = await supabase
        .from("projects")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("local_id", change.localId)
        .eq("clerk_user_id", userId)
        .select()
        .single();

      if (error) throw error;

      removeFromQueue(change.id);
      return {
        success: true,
        changeId: change.id,
        entityId: result.id,
      };
    }

    case "delete": {
      const { error } = await supabase
        .from("projects")
        .update({ deleted_at: new Date().toISOString() })
        .eq("local_id", change.localId)
        .eq("clerk_user_id", userId);

      if (error) throw error;

      removeFromQueue(change.id);
      return {
        success: true,
        changeId: change.id,
      };
    }
  }
}

// Push message changes
async function pushMessage(change: QueuedChange): Promise<PushResult> {
  const data = change.data as Record<string, unknown>;

  switch (change.operation) {
    case "create": {
      const { data: result, error } = await supabase
        .from("messages")
        .insert({
          ...data,
          local_id: change.localId,
        })
        .select()
        .single();

      if (error) throw error;

      removeFromQueue(change.id);
      return {
        success: true,
        changeId: change.id,
        entityId: result.id,
      };
    }

    case "update": {
      const { data: result, error } = await supabase
        .from("messages")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("local_id", change.localId)
        .select()
        .single();

      if (error) throw error;

      removeFromQueue(change.id);
      return {
        success: true,
        changeId: change.id,
        entityId: result.id,
      };
    }

    case "delete": {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("local_id", change.localId);

      if (error) throw error;

      removeFromQueue(change.id);
      return {
        success: true,
        changeId: change.id,
      };
    }
  }
}

// Push attachment changes
async function pushAttachment(change: QueuedChange): Promise<PushResult> {
  const data = change.data as Record<string, unknown>;

  switch (change.operation) {
    case "create": {
      const { data: result, error } = await supabase
        .from("attachments")
        .insert({
          ...data,
          local_id: change.localId,
        })
        .select()
        .single();

      if (error) throw error;

      removeFromQueue(change.id);
      return {
        success: true,
        changeId: change.id,
        entityId: result.id,
      };
    }

    case "update": {
      const { data: result, error } = await supabase
        .from("attachments")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("local_id", change.localId)
        .select()
        .single();

      if (error) throw error;

      removeFromQueue(change.id);
      return {
        success: true,
        changeId: change.id,
        entityId: result.id,
      };
    }

    case "delete": {
      const { error } = await supabase
        .from("attachments")
        .delete()
        .eq("local_id", change.localId);

      if (error) throw error;

      removeFromQueue(change.id);
      return {
        success: true,
        changeId: change.id,
      };
    }
  }
}

// Push all queued changes
export async function pushChanges(
  changes: QueuedChange[],
  userId: string
): Promise<PushSummary> {
  const results: PushResult[] = [];

  // Process changes in order (maintain consistency)
  for (const change of changes) {
    const result = await withRetry(
      () => processChange(change, userId),
      { maxRetries: 1 } // Single retry during push, queue handles long-term retries
    ).catch((error) => ({
      success: false,
      changeId: change.id,
      error: error instanceof Error ? error.message : String(error),
    }));

    results.push(result);

    // Stop on critical errors
    if (!result.success && result.error?.includes("unauthorized")) {
      break;
    }
  }

  const successful = results.filter((r) => r.success).length;

  return {
    total: changes.length,
    successful,
    failed: results.length - successful,
    results,
  };
}

// Re-export canPush from network for backwards compatibility
export { canPush } from "./network";
