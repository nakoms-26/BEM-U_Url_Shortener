import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { z } from "zod";
import crypto from "crypto";

const createLinkSchema = z.object({
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
  slug: z
    .string()
    .min(3, { message: "Slug minimal 3 karakter." })
    .max(50, { message: "Slug maksimal 50 karakter." })
    .regex(/^[a-zA-Z0-9-]+$/, {
      message: "Slug hanya boleh berisi huruf, angka, dan strip (-).",
    }),
  lembaga: z.string().min(1, { message: "Silakan pilih lembaga." }),
  password: z.string().min(1, { message: "Password wajib diisi." }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createLinkSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Data tidak valid.";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const { urlAsli, slug, lembaga, password } = parsed.data;
    const expectedPassword = process.env.ADMIN_EDIT_PASSWORD;

    if (!expectedPassword) {
      return NextResponse.json(
        { message: "ADMIN_EDIT_PASSWORD belum dikonfigurasi." },
        { status: 500 },
      );
    }

    if (password !== expectedPassword) {
      return NextResponse.json(
        { message: "Hanya admin BEM yang diperbolehkan membuat link." },
        { status: 401 },
      );
    }

    const finalUrl = /^https?:\/\//i.test(urlAsli)
      ? urlAsli
      : `https://${urlAsli}`;

    const id = crypto.randomUUID();

    try {
      await pool.query(
        "INSERT INTO links (id, url_asli, slug, lembaga, jumlah_klik) VALUES (?, ?, ?, ?, 0)",
        [id, finalUrl, slug, lembaga]
      );

      return NextResponse.json({ message: "Berhasil membuat link." });
    } catch (dbError: any) {
      if (dbError.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { message: "Slug ini sudah digunakan. Silakan pilih slug lain." },
          { status: 409 },
        );
      }

      return NextResponse.json(
        { message: `Gagal membuat link: ${dbError.message}` },
        { status: 500 },
      );
    }
  } catch {
    return NextResponse.json(
      { message: "Terjadi kesalahan server saat memproses pembuatan link." },
      { status: 500 },
    );
  }
}
