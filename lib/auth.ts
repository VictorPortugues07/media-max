import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "mm_admin_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "mediamax_secret_key_2026_safe_session");

export async function createSession(): Promise<string> {
  return new SignJWT({ sub: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function getSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, secret());
    return true;
  } catch {
    return false;
  }
}

export async function checkCredentials(user: string, password: string): Promise<boolean> {
  const adminUser = process.env.ADMIN_USER || "admin";
  const adminPass = process.env.ADMIN_PASSWORD || "mediamax2026";
  return user === adminUser && password === adminPass;
}

export const SESSION_COOKIE = COOKIE_NAME;