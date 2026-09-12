import { NextRequest, NextResponse } from "next/server";
import { twibbonPool } from "@/lib/db";
import { updateTwibbonApiSchema } from "@/lib/twibbon-schemas";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { SUPER_ADMIN_COOKIE_NAME, hasSuperAdminAccess } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = updateTwibbonApiSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Data tidak valid.";
      return NextResponse.json({ message: firstError }, { status: 400 });
    }

    const {
      id,
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
        { message: "Password Super Admin salah. Hanya Super Admin yang berwenang mengubah twibbon." },
        { status: 401 }
      );
    }

    // Ambil data lama
    const [existingRows] = await twibbonPool.query<RowDataPacket[]>(
      "SELECT id, overlayFile, thumbnail, config FROM twibbon WHERE id = ? LIMIT 1",
      [id]
    );

    if (existingRows.length === 0) {
      return NextResponse.json(
        { message: "Twibbon tidak ditemukan." },
        { status: 404 }
      );
    }

    const existing = existingRows[0];

    // Cek duplikasi slug di ID lain
    const [dupRows] = await twibbonPool.query<RowDataPacket[]>(
      "SELECT id FROM twibbon WHERE slug = ? AND id != ? LIMIT 1",
      [slug, id]
    );

    if (dupRows.length > 0) {
      return NextResponse.json(
        { message: "Slug ini sudah digunakan oleh twibbon lain." },
        { status: 409 }
      );
    }

    const finalOverlayFile = layerUrl || existing.overlayFile;
    const finalThumbnail = thumbnailUrl || existing.thumbnail;

    let parsedConfig: any = {};
    if (typeof existing.config === "string") {
      try {
        parsedConfig = JSON.parse(existing.config);
      } catch {
        parsedConfig = {};
      }
    } else if (typeof existing.config === "object" && existing.config !== null) {
      parsedConfig = existing.config;
    }

    const updatedConfig = {
      ...parsedConfig,
      overlayType: type,
      chromaKey:
        type === "VIDEO"
          ? {
              color: chromaColor || "#00FF00",
              similarity: 0.1,
              smoothness: 0.08,
            }
          : null,
      canvasSize: parsedConfig.canvasSize || { width: 1080, height: 1080 },
    };

    const [updateResult] = await twibbonPool.query<ResultSetHeader>(
      `UPDATE twibbon
       SET title = ?, slug = ?, description = ?, type = ?, overlayFile = ?, thumbnail = ?, config = ?, isActive = ?, updatedAt = NOW(3)
       WHERE id = ?`,
      [
        title,
        slug,
        description || null,
        type,
        finalOverlayFile,
        finalThumbnail,
        JSON.stringify(updatedConfig),
        isActive ? 1 : 0,
        id,
      ]
    );

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { message: "Gagal memperbarui twibbon." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Twibbon berhasil diperbarui!",
    });
  } catch (error: any) {
    console.error("Update twibbon error:", error);
    return NextResponse.json(
      { message: `Gagal memperbarui twibbon: ${error.message || "Kesalahan server"}` },
      { status: 500 }
    );
  }
}
