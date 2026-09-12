import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hasDatabaseAccess } from "@/lib/admin-auth";

export async function GET() {
  const cookieStore = await cookies();
  const dbCookie = cookieStore.get("njm_database_access")?.value;

  // Izinkan jika ada cookie akses admin atau konfigurasi upload aktif
  const secret = process.env.UPLOAD_SECRET || "BemUnsoedUploadSecret2026";
  const url = process.env.NEXT_PUBLIC_UPLOAD_API_URL || "https://assets.unsoed.link/upload.php";

  return NextResponse.json({
    secret,
    url,
  });
}
