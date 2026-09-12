import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  DATABASE_ACCESS_COOKIE_NAME,
  SUPER_ADMIN_COOKIE_NAME,
  DATABASE_ACCESS_MAX_AGE,
  getDatabaseAccessToken,
  getSuperAdminAccessToken,
} from "@/lib/admin-auth";

const verifySuperAdminPasswordSchema = z.object({
  password: z.string().min(1, { message: "Password wajib diisi." }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifySuperAdminPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Data tidak valid.";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const expectedPassword = process.env.SUPER_ADMIN_EDIT_PASSWORD;
    if (!expectedPassword) {
      return NextResponse.json(
        { message: "SUPER_ADMIN_EDIT_PASSWORD belum dikonfigurasi." },
        { status: 500 },
      );
    }

    if (parsed.data.password !== expectedPassword) {
      return NextResponse.json(
        { message: "Password super admin salah." },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ message: "Password valid." });
    const superToken = getSuperAdminAccessToken();
    const adminToken = getDatabaseAccessToken() || superToken;
    const isSecure = process.env.NODE_ENV === "production";

    if (superToken) {
      response.cookies.set({
        name: SUPER_ADMIN_COOKIE_NAME,
        value: superToken,
        httpOnly: true,
        sameSite: "lax",
        secure: isSecure,
        path: "/",
        maxAge: DATABASE_ACCESS_MAX_AGE,
      });
    }

    if (adminToken) {
      response.cookies.set({
        name: DATABASE_ACCESS_COOKIE_NAME,
        value: adminToken,
        httpOnly: true,
        sameSite: "lax",
        secure: isSecure,
        path: "/",
        maxAge: DATABASE_ACCESS_MAX_AGE,
      });
    }

    return response;
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat verifikasi password." },
      { status: 500 },
    );
  }
}
