import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { twibbonPool } from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { SUPER_ADMIN_COOKIE_NAME, hasSuperAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TwibbonRow extends RowDataPacket {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  type: "IMAGE" | "VIDEO";
  overlayFile: string;
  thumbnail: string;
  config: any;
  isActive: number | boolean;
  downloadsCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CountRow extends RowDataPacket {
  total: number;
}

interface SumRow extends RowDataPacket {
  totalDownloads: number;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const superCookie = cookieStore.get(SUPER_ADMIN_COOKIE_NAME)?.value;
    const isSuperAdmin = hasSuperAdminAccess(superCookie);

    // Jika bukan super admin, HANYA ambil twibbon yang aktif / terpublikasi
    const query = isSuperAdmin
      ? "SELECT id, title, slug, description, type, overlayFile, thumbnail, config, isActive, downloadsCount, createdAt, updatedAt FROM twibbon ORDER BY createdAt DESC"
      : "SELECT id, title, slug, description, type, overlayFile, thumbnail, config, isActive, downloadsCount, createdAt, updatedAt FROM twibbon WHERE isActive = 1 ORDER BY createdAt DESC";

    const [rows] = await twibbonPool.query<TwibbonRow[]>(query);

    const [totalRows] = await twibbonPool.query<CountRow[]>(
      isSuperAdmin
        ? "SELECT COUNT(*) as total FROM twibbon"
        : "SELECT COUNT(*) as total FROM twibbon WHERE isActive = 1"
    );

    const [activeRows] = await twibbonPool.query<CountRow[]>(
      "SELECT COUNT(*) as total FROM twibbon WHERE isActive = 1"
    );

    const [downloadRows] = await twibbonPool.query<SumRow[]>(
      isSuperAdmin
        ? "SELECT SUM(downloadsCount) as totalDownloads FROM twibbon"
        : "SELECT SUM(downloadsCount) as totalDownloads FROM twibbon WHERE isActive = 1"
    );

    const twibbons = rows.map((row) => {
      let parsedConfig = row.config;
      if (typeof row.config === "string") {
        try {
          parsedConfig = JSON.parse(row.config);
        } catch {
          parsedConfig = {};
        }
      }

      return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        description: row.description,
        type: row.type,
        overlayFile: row.overlayFile,
        thumbnail: row.thumbnail,
        config: parsedConfig,
        isActive: Boolean(row.isActive),
        downloadsCount: row.downloadsCount || 0,
        createdAt:
          row.createdAt instanceof Date
            ? row.createdAt.toISOString()
            : String(row.createdAt),
        updatedAt:
          row.updatedAt instanceof Date
            ? row.updatedAt.toISOString()
            : String(row.updatedAt),
      };
    });

    return NextResponse.json({
      twibbons,
      isSuperAdmin,
      stats: {
        total: totalRows[0]?.total || 0,
        active: activeRows[0]?.total || 0,
        totalDownloads: downloadRows[0]?.totalDownloads || 0,
      },
    });
  } catch (error: any) {
    console.error("Error fetching twibbons list:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data twibbon dari database." },
      { status: 500 }
    );
  }
}
