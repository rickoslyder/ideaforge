// Retry and repair utilities for handling LLM response issues

export interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  maxDelayMs: 10000,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, delayMs, backoffMultiplier, maxDelayMs } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let currentDelay = delayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors
      if (isNonRetryableError(lastError)) {
        throw lastError;
      }

      if (attempt < maxRetries) {
        await sleep(currentDelay);
        currentDelay = Math.min(currentDelay * backoffMultiplier, maxDelayMs);
      }
    }
  }

  throw lastError;
}

function isNonRetryableError(error: Error): boolean {
  const message = error.message.toLowerCase();

  // Don't retry authentication errors
  if (message.includes("unauthorized") || message.includes("invalid api key")) {
    return true;
  }

  // Don't retry validation errors
  if (message.includes("invalid") || message.includes("required")) {
    return true;
  }

  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Attempt to repair malformed JSON responses
export function repairJson(text: string): string {
  let repaired = text.trim();

  // Remove markdown code fences
  repaired = repaired.replace(/^```json?\s*/i, "").replace(/\s*```$/i, "");

  // Try to find JSON object or array
  const jsonMatch = repaired.match(/[\[{][\s\S]*[\]}]/);
  if (jsonMatch) {
    repaired = jsonMatch[0];
  }

  // Fix common issues
  // Trailing commas before closing brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, "$1");

  // Missing quotes around keys
  repaired = repaired.replace(
    /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g,
    '$1"$2"$3'
  );

  return repaired;
}

export function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    // Try repaired version
    try {
      return JSON.parse(repairJson(text)) as T;
    } catch {
      return null;
    }
  }
}
