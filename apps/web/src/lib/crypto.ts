import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

function getKey(): Buffer {
  const secret =
    process.env.APP_ENCRYPTION_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createHash("sha256").update(secret || "development-insecure-key").digest();
}

export interface EncryptedSecret {
  encrypted: string;
  iv: string;
  tag: string;
}

export function encryptSecret(plaintext: string): EncryptedSecret {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return {
    encrypted: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
  };
}

export function decryptSecret(secret: EncryptedSecret): string {
  const decipher = createDecipheriv(ALGO, getKey(), Buffer.from(secret.iv, "base64"));
  decipher.setAuthTag(Buffer.from(secret.tag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(secret.encrypted, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}