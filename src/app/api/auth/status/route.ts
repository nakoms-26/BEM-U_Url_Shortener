import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DATABASE_ACCESS_COOKIE_NAME,
  SUPER_ADMIN_COOKIE_NAME,
  hasDatabaseAccess,
  hasSuperAdminAccess,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get(DATABASE_ACCESS_COOKIE_NAME)?.value;
  const superCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)?.value;

  const isSuperAdmin = hasSuperAdminAccess(superCookie);
  const isAdmin = isSuperAdmin || hasDatabaseAccess(adminCookie, superCookie);

  return NextResponse.json({
    isAdmin,
    isSuperAdmin,
  });
}
