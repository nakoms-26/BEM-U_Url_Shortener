import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const updateLinkSchema = z.object({
  id: z.string().min(1, { message: "ID link tidak valid." }),
  slug: z
    .string()
    .min(3, { message: "Slug minimal 3 karakter." })
    .max(50, { message: "Slug maksimal 50 karakter." })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Slug hanya boleh berisi huruf, angka, dan strip (-).",
    }),
  urlAsli: z
    .string()
    .min(1, { message: "URL Asli tidak boleh kosong." })
    .regex(
      /^(?:(?:https?:\/\/)?(?:www\.)?)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:[\/?#][^\s]*)?$/,
      {
        message:
          "Format URL tidak valid (contoh: google.com atau https://google.com)",
      },
    ),
  lembaga: z.string().min(1, { message: "Silakan pilih lembaga." }),
  password: z.string().min(1, { message: "Password wajib diisi." }),
});

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateLinkSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Data tidak valid.";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { id, slug, urlAsli, lembaga, password } = parsed.data;
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

    const finalUrl = /^https?:\/\//i.test(urlAsli)
      ? urlAsli
      : `https://${urlAsli}`;

    // Cek duplikasi slug untuk ID lain
    const [dupRows] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM links WHERE slug = ? AND id != ? LIMIT 1",
      [slug, id]
    );

    if (dupRows.length > 0) {
      return NextResponse.json(
        { message: "Slug ini sudah digunakan. Silakan pilih slug lain." },
        { status: 409 },
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE links SET slug = ?, url_asli = ?, lembaga = ? WHERE id = ?",
      [slug, finalUrl, lembaga, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "Data link tidak ditemukan atau tidak bisa diperbarui." },
        { status: 404 },
      );
    }

    const [updatedRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, lembaga, slug, url_asli, jumlah_klik, created_at FROM links WHERE id = ? LIMIT 1",
      [id]
    );

    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { message: "Data link tidak ditemukan setelah update." },
        { status: 404 },
      );
    }

    const row = updatedRows[0];
    const updatedLink = {
      id: row.id,
      lembaga: row.lembaga,
      slug: row.slug,
      url_asli: row.url_asli,
      jumlah_klik: row.jumlah_klik,
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    };

    return NextResponse.json({ message: "Berhasil", link: updatedLink });
  } catch (error: any) {
    console.error("Update link error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat memproses update." },
      { status: 500 },
    );
  }
}
