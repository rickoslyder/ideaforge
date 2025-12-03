// API Key encryption/decryption utilities
// Uses AES-GCM with a key derived from the app secret + user ID

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const ITERATIONS = 100000;

async function deriveKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
}

function getEncryptionPassword(userId: string): string {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET environment variable is not set");
  }
  return `${secret}:${userId}`;
}

export async function encryptApiKey(
  apiKey: string,
  userId: string
): Promise<string> {
  const password = getEncryptionPassword(userId);
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);

  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

  // Derive key and encrypt
  const key = await deriveKey(password, salt);
  const encrypted = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    data
  );

  // Combine salt + iv + encrypted data
  const combined = new Uint8Array(
    salt.length + iv.length + encrypted.byteLength
  );
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  // Return as base64
  return btoa(String.fromCharCode(...combined));
}

export async function decryptApiKey(
  encryptedKey: string,
  userId: string
): Promise<string> {
  const password = getEncryptionPassword(userId);

  // Decode from base64
  const combined = new Uint8Array(
    atob(encryptedKey)
      .split("")
      .map((c) => c.charCodeAt(0))
  );

  // Extract salt, iv, and encrypted data
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH);

  // Derive key and decrypt
  const key = await deriveKey(password, salt);
  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    encrypted
  );

  return new TextDecoder().decode(decrypted);
}

// Mask API key for display (show last 4 characters)
export function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 4) {
    return "****";
  }
  return "*".repeat(apiKey.length - 4) + apiKey.slice(-4);
}
