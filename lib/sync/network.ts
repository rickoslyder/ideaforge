// Network utilities for sync - kept separate to avoid Supabase import chain

// Check if we should attempt push (online check)
export function canPush(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

// Check if we're in a browser environment
export function isBrowser(): boolean {
  return typeof window !== "undefined";
}
