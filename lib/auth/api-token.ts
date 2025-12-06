// API Token generation and validation utilities
// Tokens are hashed (SHA-256) for storage - never stored in plain text

const TOKEN_PREFIX = "idfc_";
const TOKEN_LENGTH = 32; // Characters after prefix
const TOKEN_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Generate a secure random token
 * Format: idfc_ + 32 alphanumeric characters
 * Example: idfc_abc123def456ghi789jkl012mno345pq
 */
export function generateToken(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(TOKEN_LENGTH));
  let token = TOKEN_PREFIX;

  for (let i = 0; i < TOKEN_LENGTH; i++) {
    token += TOKEN_ALPHABET[randomBytes[i] % TOKEN_ALPHABET.length];
  }

  return token;
}

/**
 * Extract the prefix from a token for identification
 * Returns first 8 chars after "idfc_" (e.g., "idfc_abc12345" -> "idfc_abc1")
 */
export function getTokenPrefix(token: string): string {
  if (!token.startsWith(TOKEN_PREFIX)) {
    throw new Error("Invalid token format");
  }
  // Return idfc_ + first 4 chars of the random part
  return token.slice(0, TOKEN_PREFIX.length + 4);
}

/**
 * Hash a token using SHA-256 for secure storage
 */
export async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate token format
 */
export function isValidTokenFormat(token: string): boolean {
  if (!token.startsWith(TOKEN_PREFIX)) {
    return false;
  }
  const randomPart = token.slice(TOKEN_PREFIX.length);
  if (randomPart.length !== TOKEN_LENGTH) {
    return false;
  }
  // Check all characters are alphanumeric
  return /^[A-Za-z0-9]+$/.test(randomPart);
}

/**
 * Extract token from Authorization header
 * Expects: "Bearer idfc_..."
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader) {
    return null;
  }
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.slice(7); // Remove "Bearer "
  if (!isValidTokenFormat(token)) {
    return null;
  }
  return token;
}

export interface TokenValidationResult {
  valid: true;
  userId: string;
  tokenId: string;
  scopes: string[];
}

export interface TokenValidationError {
  valid: false;
  error: string;
}

export type TokenValidation = TokenValidationResult | TokenValidationError;
