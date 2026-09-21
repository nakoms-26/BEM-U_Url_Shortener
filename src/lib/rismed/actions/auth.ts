"use server";

import { cookies } from "next/headers";
import crypto from "crypto";
import {
  DATABASE_ACCESS_COOKIE_NAME,
  SUPER_ADMIN_COOKIE_NAME,
  DATABASE_ACCESS_MAX_AGE,
  getDatabaseAccessToken,
  getSuperAdminAccessToken,
  hasDatabaseAccess,
  hasSuperAdminAccess,
} from "@/lib/admin-auth";

const SESSION_COOKIE_NAME = "admin_session";
const CLIENT_HINT_COOKIE_NAME = "admin_logged_in";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getSecretKey(): string {
  return process.env.ADMIN_SESSION_SECRET || "rizzmed-secure-auth-secret-unsoed-2026";
}

function generateToken(): string {
  const expiry = Date.now() + SESSION_DURATION_MS;
  const payload = `${expiry}:admin`;
  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(payload)
    .digest("hex");
  return `${payload}:${signature}`;
}

function verifyToken(token: string): boolean {
  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;
    const [expiryStr, user, signature] = parts;
    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;
    if (user !== "admin") return false;

    const expectedSignature = crypto
      .createHmac("sha256", getSecretKey())
      .update(`${expiryStr}:${user}`)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function loginAdmin(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const validUsername = process.env.ADMIN_USERNAME || "admin";
  const validPassword = process.env.ADMIN_PASSWORD || "rizzmed2026";
  const portalAdminPassword = process.env.ADMIN_EDIT_PASSWORD;
  const portalSuperPassword = process.env.SUPER_ADMIN_EDIT_PASSWORD;

  const isRismedMatch =
    (username === validUsername || !username) && password === validPassword;
  const isPortalAdminMatch =
    portalAdminPassword && password === portalAdminPassword;
  const isPortalSuperMatch =
    portalSuperPassword && password === portalSuperPassword;

  if (isRismedMatch || isPortalAdminMatch || isPortalSuperMatch) {
    const token = generateToken();
    const cookieStore = await cookies();

    // Set Rismed admin session
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    cookieStore.set(CLIENT_HINT_COOKIE_NAME, "true", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    // Also synchronize portal admin access cookie
    const adminToken = getDatabaseAccessToken();
    if (adminToken) {
      cookieStore.set(DATABASE_ACCESS_COOKIE_NAME, adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: DATABASE_ACCESS_MAX_AGE,
      });
    }

    if (isPortalSuperMatch) {
      const superToken = getSuperAdminAccessToken();
      if (superToken) {
        cookieStore.set(SUPER_ADMIN_COOKIE_NAME, superToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: DATABASE_ACCESS_MAX_AGE,
        });
      }
    }

    return { success: true };
  }

  return { success: false, error: "Username atau password salah" };
}

export async function logoutAdmin(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete(CLIENT_HINT_COOKIE_NAME);
  cookieStore.delete(DATABASE_ACCESS_COOKIE_NAME);
  cookieStore.delete(SUPER_ADMIN_COOKIE_NAME);
  return { success: true };
}

export async function checkAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();

  // 1. Check portal admin & super admin session
  const adminCookie = cookieStore.get(DATABASE_ACCESS_COOKIE_NAME)?.value;
  const superCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)?.value;
  if (hasSuperAdminAccess(superCookie) || hasDatabaseAccess(adminCookie, superCookie)) {
    return true;
  }

  // 2. Check Rismed admin token
  const session = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (session && verifyToken(session)) {
    return true;
  }

  return false;
}
