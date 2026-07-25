import { randomBytes, createCipheriv, createDecipheriv } from "crypto"
import { ALGORITHM } from "./config"

/**
 * Encrypt text using AES-256-GCM.
 * @returns Encrypted string in format "iv:authTag:ciphertext"
 */
export function encrypt(text: string, key: string): string {
  const keyBuffer = Buffer.from(key, "hex")
  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, keyBuffer, iv)

  let encrypted = cipher.update(text, "utf8", "hex")
  encrypted += cipher.final("hex")

  const authTag = cipher.getAuthTag()

  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`
}

/**
 * Decrypt AES-256-GCM encrypted data.
 */
export function decrypt(encryptedData: string, key: string): string {
  const keyBuffer = Buffer.from(key, "hex")
  const parts = encryptedData.split(":")
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted data format: expected iv:authTag:ciphertext")
  }
  const [ivHex, authTagHex, encrypted] = parts

  const iv = Buffer.from(ivHex, "hex")
  const authTag = Buffer.from(authTagHex, "hex")
  const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv)
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encrypted, "hex", "utf8")
  decrypted += decipher.final("utf8")

  return decrypted
}
