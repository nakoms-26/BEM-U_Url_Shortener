import { NextRequest, NextResponse } from "next/server";
import { twibbonPool } from "@/lib/db";
import { z } from "zod";
import { ResultSetHeader } from "mysql2";
import { SUPER_ADMIN_COOKIE_NAME, hasSuperAdminAccess } from "@/lib/admin-auth";

const toggleStatusSchema = z.object({
  id: z.coerce.number().min(1),
  isActive: z.boolean(),
  password: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = toggleStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Data tidak valid." },
        { status: 400 }
      );
    }

    const { id, isActive, password } = parsed.data;

    const superCookie = request.cookies.get(SUPER_ADMIN_COOKIE_NAME)?.value;
    const isAuthedByCookie = hasSuperAdminAccess(superCookie);
    const expectedSuperPassword = process.env.SUPER_ADMIN_EDIT_PASSWORD;

    const isPasswordValid =
      Boolean(password) &&
      Boolean(expectedSuperPassword) &&
      password === expectedSuperPassword;

    if (!isAuthedByCookie && !isPasswordValid) {
      return NextResponse.json(
        { message: "Hanya Super Admin yang dapat mengubah status twibbon." },
        { status: 401 }
      );
    }

    const [result] = await twibbonPool.query<ResultSetHeader>(
      "UPDATE twibbon SET isActive = ?, updatedAt = NOW(3) WHERE id = ?",
      [isActive ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Twibbon tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Status twibbon diubah menjadi ${isActive ? "Aktif" : "Nonaktif"}`,
      isActive,
    });
  } catch (error: any) {
    console.error("Toggle status error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengubah status twibbon." },
      { status: 500 }
    );
  }
}
