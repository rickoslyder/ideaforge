export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
};

export function calculateBackoff(
  attempt: number,
  options: Partial<RetryOptions> = {}
): number {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const delay = opts.baseDelay * Math.pow(opts.backoffFactor, attempt);
  // Add jitter (±10%)
  const jitter = delay * 0.1 * (Math.random() * 2 - 1);
  return Math.min(delay + jitter, opts.maxDelay);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on client errors (4xx)
      if (
        error instanceof Response &&
        error.status >= 400 &&
        error.status < 500
      ) {
        throw lastError;
      }

      if (attempt < opts.maxRetries - 1) {
        const delay = calculateBackoff(attempt, opts);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}

export function isRetryableError(error: unknown): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return true;
  }

  // HTTP errors
  if (error instanceof Response) {
    // Retry on server errors (5xx) and some specific client errors
    return error.status >= 500 || error.status === 429;
  }

  return false;
}
