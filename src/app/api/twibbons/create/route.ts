import { NextRequest, NextResponse } from "next/server";
import { twibbonPool } from "@/lib/db";
import { createTwibbonApiSchema } from "@/lib/twibbon-schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { SUPER_ADMIN_COOKIE_NAME, hasSuperAdminAccess } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTwibbonApiSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Data tidak valid.";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const {
      title,
      slug,
      description,
      type,
      chromaColor,
      layerUrl,
      thumbnailUrl,
      isActive,
      password,
    } = parsed.data;

    const superCookie = request.cookies.get(SUPER_ADMIN_COOKIE_NAME)?.value;
    const isAuthedByCookie = hasSuperAdminAccess(superCookie);
    const expectedSuperAdminPassword = process.env.SUPER_ADMIN_EDIT_PASSWORD;

    const isPasswordValid =
      Boolean(password) &&
      Boolean(expectedSuperAdminPassword) &&
      password === expectedSuperAdminPassword;

    if (!isAuthedByCookie && !isPasswordValid) {
      return NextResponse.json(
        { message: "Password Super Admin salah. Hanya Super Admin yang berwenang membuat twibbon." },
        { status: 401 }
      );
    }

    // Cek apakah slug sudah digunakan
    const [existingRows] = await twibbonPool.query<RowDataPacket[]>(
      "SELECT id FROM twibbon WHERE slug = ? LIMIT 1",
      [slug]
    );

    if (existingRows.length > 0) {
      return NextResponse.json(
        { message: "Slug ini sudah digunakan oleh twibbon lain. Silakan ganti slug." },
        { status: 409 }
      );
    }

    const config = {
      overlayType: type,
      chromaKey:
        type === "VIDEO"
          ? {
              color: chromaColor || "#00FF00",
              similarity: 0.1,
              smoothness: 0.08,
            }
          : null,
      canvasSize: { width: 1080, height: 1080 },
    };

    const [insertResult] = await twibbonPool.query<ResultSetHeader>(
      `INSERT INTO twibbon (title, slug, description, type, overlayFile, thumbnail, config, isActive, downloadsCount, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW(3), NOW(3))`,
      [
        title,
        slug,
        description || null,
        type,
        layerUrl,
        thumbnailUrl,
        JSON.stringify(config),
        isActive ? 1 : 0,
      ]
    );

    return NextResponse.json({
      message: "Twibbon berhasil dibuat!",
      id: insertResult.insertId,
    });
  } catch (error: any) {
    console.error("Create twibbon error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "Slug twibbon sudah terdaftar." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: `Gagal membuat twibbon: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}
