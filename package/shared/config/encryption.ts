import * as crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:v1:";

let hasWarnedMissingKey = false;

/**
 * Resolves a 32-byte Buffer key for database connection string encryption.
 * Priority:
 * 1. DATABASE_ENCRYPTION_KEY (hex encoded 64 chars)
 * 2. BACKUP_ENCRYPTION_KEY (hex encoded 64 chars)
 * 3. Fallback deterministic dev key in non-production environments
 */
function getEncryptionKey(): Buffer {
  const keyHex = process.env.DATABASE_ENCRYPTION_KEY || process.env.BACKUP_ENCRYPTION_KEY;

  if (keyHex) {
    const keyBuf = Buffer.from(keyHex.trim(), "hex");
    if (keyBuf.length === 32) {
      return keyBuf;
    }
    console.error(
      `[Security] Invalid encryption key length (${keyBuf.length} bytes). Must be 32 bytes (64 hex characters).`
    );
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CRITICAL: DATABASE_ENCRYPTION_KEY is required in production and must be a 64-character hex string (32 bytes)."
    );
  }

  if (!hasWarnedMissingKey) {
    console.warn(
      "[Security Notice] DATABASE_ENCRYPTION_KEY is not set. Using local development fallback key. DO NOT USE IN PRODUCTION."
    );
    hasWarnedMissingKey = true;
  }

  // Deterministic local dev key (SHA-256 of static seed = exactly 32 bytes)
  return crypto.createHash("sha256").update("backlify-local-dev-fallback-key-2026").digest();
}

/**
 * Encrypts a sensitive database connection string at rest.
 * Output format: enc:v1:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 * Idempotent: If the string is already encrypted with enc:v1:, returns as-is.
 */
export function encryptDatabaseUrl(plainUrl: string): string {
  if (!plainUrl || typeof plainUrl !== "string") {
    return plainUrl;
  }

  const trimmed = plainUrl.trim();
  if (trimmed.startsWith(PREFIX)) {
    return trimmed;
  }

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(trimmed, "utf8", "hex");
    encrypted += cipher.final("hex");

    const authTag = cipher.getAuthTag();

    return `${PREFIX}${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
  } catch (err) {
    console.error("[Security] Failed to encrypt database connection string:", err);
    throw new Error("Failed to securely encrypt database URL at rest.");
  }
}

/**
 * Decrypts a stored database connection string.
 * Backward-compatible: If string is NOT prefixed with enc:v1:, returns plaintext as-is.
 */
export function decryptDatabaseUrl(storedUrl: string): string {
  if (!storedUrl || typeof storedUrl !== "string") {
    return storedUrl;
  }

  const trimmed = storedUrl.trim();
  if (!trimmed.startsWith(PREFIX)) {
    // Unencrypted legacy URL
    return trimmed;
  }

  try {
    const parts = trimmed.slice(PREFIX.length).split(":");
    if (parts.length !== 3) {
      throw new Error("Invalid encrypted database URL payload structure.");
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (err) {
    console.error("[Security] Failed to decrypt database connection string:", err);
    throw new Error("Failed to decrypt database connection string. Ensure DATABASE_ENCRYPTION_KEY is valid.");
  }
}

/**
 * Checks if a connection string is encrypted at rest.
 */
export function isEncryptedDatabaseUrl(url: string): boolean {
  return typeof url === "string" && url.trim().startsWith(PREFIX);
}

/**
 * Masks the password in a PostgreSQL connection string for secure UI display.
 * E.g. postgresql://postgres:secret123@db.host.com:5432/mydb -> postgresql://postgres:••••••••@db.host.com:5432/mydb
 * If encrypted, it first decrypts before masking.
 */
export function maskDatabaseUrl(url: string): string {
  if (!url || typeof url !== "string") return "";

  const plain = decryptDatabaseUrl(url);

  // Match: <scheme>://<user>:<password>@<host...>
  // Splits cleanly on the last @ before the host/port/path
  const match = plain.match(/^([^:]+:\/\/[^:]+:)(.*)(@[^@]+)$/);
  if (match) {
    return `${match[1]}••••••••${match[3]}`;
  }

  // Fallback for URLs without username e.g. postgresql://:password@host/db
  return plain.replace(/(:\/\/)(:[^@]+)(@)/, "$1:••••••••$3");
}
