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

  // Try to find JSON object or array start
  const startMatch = repaired.match(/[\[{]/);
  if (startMatch) {
    repaired = repaired.slice(startMatch.index);
  }

  // Fix common issues
  // Trailing commas before closing brackets
  repaired = repaired.replace(/,(\s*[}\]])/g, "$1");

  // Missing quotes around keys
  repaired = repaired.replace(
    /([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g,
    '$1"$2"$3'
  );

  // Handle truncated JSON by attempting to close open structures
  repaired = attemptToCloseTruncatedJson(repaired);

  return repaired;
}

// Attempt to close truncated JSON by adding missing closing brackets
function attemptToCloseTruncatedJson(text: string): string {
  // Count open and close brackets
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escape = false;

  for (const char of text) {
    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{") openBraces++;
    if (char === "}") openBraces--;
    if (char === "[") openBrackets++;
    if (char === "]") openBrackets--;
  }

  // If we're in a string, try to close it
  if (inString) {
    // Find a good place to cut - last complete-looking value
    const lastQuote = text.lastIndexOf('"');
    if (lastQuote > 0) {
      // Check if this looks like a complete value
      const afterQuote = text.slice(lastQuote + 1).trim();
      if (!afterQuote || afterQuote.startsWith(",") || afterQuote.startsWith("]") || afterQuote.startsWith("}")) {
        // Already closed
      } else {
        // Try to close the string
        text = text.slice(0, lastQuote + 1);
        // Recount brackets
        return attemptToCloseTruncatedJson(text);
      }
    }
  }

  // Remove trailing incomplete elements (like trailing commas or partial values)
  text = text.replace(/,\s*$/, "");
  text = text.replace(/:\s*$/, ': null');
  text = text.replace(/:\s*"[^"]*$/, ': ""');

  // Add missing closing brackets
  let result = text;
  for (let i = 0; i < openBrackets; i++) {
    result += "]";
  }
  for (let i = 0; i < openBraces; i++) {
    result += "}";
  }

  return result;
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
