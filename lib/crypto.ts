import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Encrypts Whop OAuth tokens before they're stored on Creator — they grant
// read access to a creator's Whop account for as long as they're valid.
const ALGORITHM = "aes-256-gcm";

function getKey(): Buffer {
  const key = process.env.TOKEN_ENCRYPTION_KEY;
  if (!key) throw new Error("TOKEN_ENCRYPTION_KEY is not set");
  const buf = Buffer.from(key, "base64");
  if (buf.length !== 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY must decode to 32 bytes (base64-encoded)");
  }
  return buf;
}

export function encryptToken(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv, authTag, encrypted].map((b) => b.toString("base64")).join(".");
}

export function decryptToken(ciphertext: string): string {
  const [ivB64, authTagB64, encryptedB64] = ciphertext.split(".");
  if (!ivB64 || !authTagB64 || !encryptedB64) {
    throw new Error("Malformed encrypted token");
  }
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
