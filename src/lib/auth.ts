import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-lush-leaves-2026-development-only";

// PBKDF2 Password Hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":");
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return hash === originalHash;
  } catch {
    return false;
  }
}

// JWT Sign and Verify
export interface TokenPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

// Helper to authenticate request and get the user token payload
export function getAuthUser(req: Request): TokenPayload | null {
  try {
    // 1. Check Authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      return verifyToken(token);
    }

    // 2. Check Cookie header (useful for page loads / server actions)
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/token=([^;]+)/);
      if (match) {
        return verifyToken(match[1]);
      }
    }
  } catch (err) {
    console.error("Auth header parsing error:", err);
  }
  return null;
}
