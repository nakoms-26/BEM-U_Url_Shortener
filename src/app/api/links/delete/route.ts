import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const deleteLinkSchema = z.object({
  id: z.string().min(1, { message: "ID link tidak valid." }),
  slug: z
    .string()
    .min(3, { message: "Slug minimal 3 karakter." })
    .max(50, { message: "Slug maksimal 50 karakter." })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Slug hanya boleh berisi huruf, angka, dan strip (-).",
    }),
  confirmationSlug: z
    .string()
    .min(1, { message: "Konfirmasi slug wajib diisi." }),
  password: z.string().min(1, { message: "Password wajib diisi." }),
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = deleteLinkSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Data tidak valid.";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { id, slug, confirmationSlug, password } = parsed.data;
    const expectedPassword = process.env.SUPER_ADMIN_EDIT_PASSWORD;

    if (!expectedPassword) {
      return NextResponse.json(
        { message: "SUPER_ADMIN_EDIT_PASSWORD belum dikonfigurasi." },
        { status: 500 },
      );
    }

    if (password !== expectedPassword) {
      return NextResponse.json(
        { message: "Password super admin salah." },
        { status: 401 },
      );
    }

    if (confirmationSlug !== slug) {
      return NextResponse.json(
        { message: "Slug konfirmasi tidak sesuai." },
        { status: 400 },
      );
    }

    const [existingRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, slug FROM links WHERE id = ? LIMIT 1",
      [id]
    );

    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json(
        { message: "Data link tidak ditemukan." },
        { status: 404 },
      );
    }

    if (existingRows[0].slug !== slug) {
      return NextResponse.json(
        { message: "Slug tidak sesuai dengan data yang dipilih." },
        { status: 400 },
      );
    }

    const [deleteResult] = await pool.query<ResultSetHeader>(
      "DELETE FROM links WHERE id = ? AND slug = ?",
      [id, slug]
    );

    if (deleteResult.affectedRows === 0) {
      return NextResponse.json(
        { message: "Gagal menghapus link atau data sudah tidak ada." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Berhasil menghapus link." });
  } catch (error: any) {
    console.error("Delete link error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat memproses delete." },
      { status: 500 },
    );
  }
}
