import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  DATABASE_ACCESS_COOKIE_NAME,
  SUPER_ADMIN_COOKIE_NAME,
  DATABASE_ACCESS_MAX_AGE,
  getDatabaseAccessToken,
  getSuperAdminAccessToken,
} from "@/lib/admin-auth";

const loginSchema = z.object({
  password: z.string().min(1, { message: "Password wajib diisi." }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Data tidak valid." },
        { status: 400 }
      );
    }

    const { password } = parsed.data;
    const adminPassword = process.env.ADMIN_EDIT_PASSWORD;
    const superAdminPassword = process.env.SUPER_ADMIN_EDIT_PASSWORD;

    if (!adminPassword && !superAdminPassword) {
      return NextResponse.json(
        { message: "Password admin belum dikonfigurasi di server." },
        { status: 500 }
      );
    }

    const isSecure = process.env.NODE_ENV === "production";

    // 1. Cek Super Admin
    if (superAdminPassword && password === superAdminPassword) {
      const superToken = getSuperAdminAccessToken();
      const adminToken = getDatabaseAccessToken() || superToken;

      const response = NextResponse.json({
        success: true,
        role: "SUPER_ADMIN",
        message: "Berhasil masuk sebagai Super Admin.",
      });

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
    }

    // 2. Cek Admin Biasa
    if (adminPassword && password === adminPassword) {
      const adminToken = getDatabaseAccessToken();

      const response = NextResponse.json({
        success: true,
        role: "ADMIN",
        message: "Berhasil masuk sebagai Admin.",
      });

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
    }

    return NextResponse.json(
      { message: "Password salah. Silakan periksa kembali." },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat memproses login." },
      { status: 500 }
    );
  }
}
