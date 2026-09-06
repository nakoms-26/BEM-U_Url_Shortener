import { cookies } from "next/headers";
import pool from "@/lib/db";
import DatabaseClient from "@/components/DatabaseClient";
import DatabaseAccessGate from "@/components/DatabaseAccessGate";
import {
  DATABASE_ACCESS_COOKIE_NAME,
  hasDatabaseAccess,
} from "@/lib/admin-auth";
import { RowDataPacket } from "mysql2";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface LinkRow extends RowDataPacket {
  id: string;
  lembaga: string | null;
  slug: string;
  url_asli: string | null;
  jumlah_klik: number | null;
  created_at: Date | string;
}

export default async function Database() {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(DATABASE_ACCESS_COOKIE_NAME)?.value;

  if (!hasDatabaseAccess(accessCookie)) {
    return <DatabaseAccessGate />;
  }

  try {
    const [rows] = await pool.query<LinkRow[]>(
      "SELECT id, lembaga, slug, url_asli, jumlah_klik, created_at FROM links ORDER BY created_at DESC"
    );

    const links = rows.map((row) => ({
      id: row.id,
      lembaga: row.lembaga,
      slug: row.slug,
      url_asli: row.url_asli,
      jumlah_klik: row.jumlah_klik,
      created_at:
        row.created_at instanceof Date
          ? row.created_at.toISOString()
          : String(row.created_at),
    }));

    return (
      <div
        className="relative flex min-h-screen items-start sm:items-center justify-center
               p-4 pt-10 sm:pt-4 overflow-hidden font-sans"
      >
        <div
          className="absolute inset-0 z-10 bg-zinc-50/0 dark:bg-zinc-950/80
                   pointer-events-none"
        />
        <DatabaseClient initialLinks={links} />
      </div>
    );
  } catch (error: any) {
    console.error("Gagal mengambil data dari MySQL:", error.message);
    return (
      <div className="text-white text-center mt-20">Gagal memuat data.</div>
    );
  }
}
