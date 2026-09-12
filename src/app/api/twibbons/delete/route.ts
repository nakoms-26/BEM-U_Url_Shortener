import { NextRequest, NextResponse } from "next/server";
import { twibbonPool } from "@/lib/db";
import { deleteTwibbonApiSchema } from "@/lib/twibbon-schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { SUPER_ADMIN_COOKIE_NAME, hasSuperAdminAccess } from "@/lib/admin-auth";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = deleteTwibbonApiSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Data tidak valid.";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { id, slug, confirmationSlug, password } = parsed.data;

    const superCookie = request.cookies.get(SUPER_ADMIN_COOKIE_NAME)?.value;
    const isAuthedByCookie = hasSuperAdminAccess(superCookie);
    const expectedPassword = process.env.SUPER_ADMIN_EDIT_PASSWORD;

    const isPasswordValid =
      Boolean(password) &&
      Boolean(expectedPassword) &&
      password === expectedPassword;

    if (!isAuthedByCookie && !isPasswordValid) {
      return NextResponse.json(
        { message: "Password Super Admin salah." },
        { status: 401 }
      );
    }

    if (confirmationSlug !== slug) {
      return NextResponse.json(
        { message: "Slug konfirmasi tidak sesuai." },
        { status: 400 }
      );
    }

    const [existingRows] = await twibbonPool.query<RowDataPacket[]>(
      "SELECT id, slug FROM twibbon WHERE id = ? LIMIT 1",
      [id]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { message: "Twibbon tidak ditemukan." },
        { status: 404 }
      );
    }

    const [deleteResult] = await twibbonPool.query<ResultSetHeader>(
      "DELETE FROM twibbon WHERE id = ?",
      [id]
    );

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { message: "Gagal menghapus twibbon." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Twibbon berhasil dihapus!",
    });
  } catch (error: any) {
    console.error("Delete twibbon error:", error);
    return NextResponse.json(
      { message: `Gagal menghapus twibbon: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}
