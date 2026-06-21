import bcrypt from "bcryptjs";

export const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  if (!password) return password;
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function legacyHash(password: string): string {
  if (!password) return password;
  return typeof btoa === "function"
    ? btoa(password).split("").reverse().join("")
    : Buffer.from(password).toString("base64").split("").reverse().join("");
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const isBcryptHash = hashedPassword.startsWith("$2a$") || hashedPassword.startsWith("$2b$");
  if (isBcryptHash) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  return hashedPassword === legacyHash(plainPassword) || hashedPassword === plainPassword;
}

export function isBcryptHash(hash: string): boolean {
  return hash.startsWith("$2a$") || hash.startsWith("$2b$");
}
