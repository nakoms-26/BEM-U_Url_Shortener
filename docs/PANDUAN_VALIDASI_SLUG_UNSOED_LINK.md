# Panduan Integrasi Validasi Slug WordPress ke unsoed.link

Dokumen ini berisi panduan lengkap perintah dan kode yang perlu diubah pada aplikasi **`unsoed.link`** agar pengguna/admin tidak dapat membuat shortlink yang bertabrakan dengan halaman resmi WordPress di **`bem-unsoed.com`** maupun path sistem.

---

## 1. Lokasi File Data Slug (`reserved-slugs.json`)

File JSON yang berisi **111 slug terproteksi** (kategori path sistem, seluruh halaman resmi WordPress, dan artikel resmi BEM) telah disimpan di:

- **Path Server:** `/home/u256329210/reserved-slugs.json`

### Struktur File JSON:
```json
{
  "description": "Daftar slug yang dilarang digunakan pada pemendek tautan BEM Unsoed",
  "total_reserved": 111,
  "updated_at": "2026-09-17",
  "system_slugs": [
    "wp-admin", "wp-login", "wp-login.php", "wp-content", "wp-includes", "wp-json",
    "xmlrpc.php", "feed", "comments", "category", "tag", "author",
    "app", "api", "dashboard", "twibbon", "assets", "public",
    "favicon.ico", "robots.txt", "sitemap.xml"
  ],
  "wordpress_pages": [
    "advokasi-dan-kesejahteraan-mahasiswa", "aksi-dan-propaganda", "alertapeka",
    "analisis-isu-strategis", "beranda", "bingo", "biro-kesekretariatan",
    "biro-keuangan", "biro-ppm", "biro-psda", "blog", "coming-soon", "contact",
    "desa-cita", "e-magz", "ekonomi-kreatif", "event", "event-lawas", "faq",
    "galeri", "games", "games-2", "handbook", "hubungi-kami", "info-beasiswa",
    "info-beasiswa-old", "info-lomba", "info-magang", "info-magang-dan-beasiswa",
    "internship", "interstellar", "kalender-kbmu", "kementerianadkesma",
    "kementerianakspro", "kementeriananstrat", "kementerianmedkom",
    "kementerianmedkraf", "kementerianpempu", "kementerianpengmas",
    "kementerianpi", "kementerianpsdm", "kementerianrisdat", "kementrian-dagri",
    "kementrian-lugri", "keuangan", "komik", "luar-negeri", "manual",
    "media-komunikasi-dan-informasi", "media-kreatif-dan-aplikatif", "media-partner",
    "moca-jadul", "pangsud", "partnership", "pendaftaran-event",
    "pendaftaran-porsoed", "pendaftaran-starfest", "pengabdian-masyarakat",
    "pengembangan-literasi-dan-keilmuan", "pengembangan-sumber-daya-mahasiswa",
    "personalia", "podcast", "porsoed", "profile-kabinet", "prs", "riset-dan-data",
    "ruang-peluang", "s3", "sds", "sejarah-bem-unsoed", "sekretaris-kabinet",
    "seni-dan-olahraga", "seniora", "seniora-mengapresiasi", "seniora-pedia-2",
    "skyfest", "soedtify", "solo", "sop-unsoed", "spp"
  ],
  "wordpress_posts": [
    "beasiswa-beasiswa-smart-2022", "internship-digitalskillsarea", "magang-dpr-ri-batch-3",
    "magang-freeport", "magang-future-league-internship-program", "magang-inkompas",
    "magang-internship-humas-kemensteneg", "magang-program-kementerian-keuangan-periode-3",
    "mpm-berbagi-beasiswa-2022", "ousean-internship-program"
  ],
  "all_reserved_slugs": [ ... ]
}
```

---

## 2. Langkah-Langkah Perubahan di Proyek `unsoed.link`

Lokasi source code proyek ada di:
`/home/u256329210/domains/unsoed.link/hbuilds/last-source/`

### File 1: Buat Modul Helper Validasi
Buat file baru di `src/lib/reserved-slugs.ts`:

```typescript
// src/lib/reserved-slugs.ts
import reservedData from "@/lib/reserved-slugs.json";

const RESERVED_SET = new Set(
  (reservedData.all_reserved_slugs || []).map((s: string) => s.toLowerCase())
);

/**
 * Mengecek apakah slug dilarang digunakan (path sistem / halaman WP bem-unsoed.com)
 */
export function isReservedSlug(slug: string): boolean {
  if (!slug) return false;
  return RESERVED_SET.has(slug.trim().toLowerCase());
}
```

> **Tips:** Salin file `reserved-slugs.json` ke dalam `src/lib/reserved-slugs.json`:
> ```bash
> cp /home/u256329210/reserved-slugs.json /home/u256329210/domains/unsoed.link/hbuilds/last-source/src/lib/reserved-slugs.json
> ```

---

### File 2: Ubah Form Input Frontend (`ShortLinkForm.tsx`)
Buka file:
[ShortLinkForm.tsx](file:///home/u256329210/domains/unsoed.link/hbuilds/last-source/src/components/ShortLinkForm.tsx)

1. Tambahkan import di bagian paling atas:
   ```typescript
   import { isReservedSlug } from "@/lib/reserved-slugs";
   ```

2. Pada `formSchema`, tambahkan validasi `.refine()` pada field `slug`:
   ```typescript
   slug: z
     .string()
     .min(3, { message: "Slug minimal 3 karakter." })
     .max(50, { message: "Slug maksimal 50 karakter." })
     .regex(/^[a-zA-Z0-9-]+$/, {
       message: "Slug hanya boleh berisi huruf, angka, dan strip (-).",
     })
     .refine((val) => !isReservedSlug(val), {
       message: "Slug ini merupakan halaman resmi bem-unsoed.com atau path sistem.",
     }),
   ```

---

### File 3: Ubah Backend API (`route.ts`)
Buka file:
[route.ts](file:///home/u256329210/domains/unsoed.link/hbuilds/last-source/src/app/api/links/create/route.ts)

1. Tambahkan import:
   ```typescript
   import { isReservedSlug } from "@/lib/reserved-slugs";
   ```

2. Di dalam handler `POST`, tepat sebelum query `INSERT INTO links`:
   ```typescript
   if (isReservedSlug(slug)) {
     return NextResponse.json(
       { message: "Slug ini digunakan oleh halaman resmi bem-unsoed.com atau sistem dan tidak boleh dipakai." },
       { status: 400 }
     );
   }
   ```

---

## 3. Perintah Terminal untuk Build & Deploy Ulang

Setelah file-file di atas diubah, jalankan perintah berikut untuk meng-compile dan memperbarui aplikasi yang sedang berjalan:

```bash
# 1. Masuk ke direktori source code
cd /home/u256329210/domains/unsoed.link/hbuilds/last-source

# 2. Build aplikasi Next.js
npm run build

# 3. Sinkronisasikan hasil build ke direktori production nodejs
rsync -av --delete .next/ /home/u256329210/domains/unsoed.link/hbuilds/current/nodejs/.next/

# 4. Restart aplikasi Passenger / Node.js
mkdir -p /home/u256329210/domains/unsoed.link/hbuilds/current/nodejs/tmp
touch /home/u256329210/domains/unsoed.link/hbuilds/current/nodejs/tmp/restart.txt
```

---

## 4. Script Pembaruan Otomatis di Masa Depan

Jika di kemudian hari admin WordPress `bem-unsoed.com` membuat banyak halaman baru dan Anda ingin memperbarui file `reserved-slugs.json` secara otomatis, Anda cukup menjalankan perintah satu baris ini di terminal server:

```bash
node -e '
const fs = require("fs");
const { execSync } = require("child_process");

const systemSlugs = [
  "wp-admin", "wp-login", "wp-login.php", "wp-content", "wp-includes", "wp-json",
  "xmlrpc.php", "feed", "comments", "category", "tag", "author",
  "app", "api", "dashboard", "twibbon", "assets", "public",
  "favicon.ico", "robots.txt", "sitemap.xml"
];

const raw = execSync("mysql -h localhost -u u256329210_apps -p\"M3DI<0MI3ANGGa\" -N -e \"SELECT DISTINCT post_name FROM ap_posts WHERE post_status = '\''publish'\'' AND post_type = '\''page'\'' AND post_name != '\'''\'' ORDER BY post_name ASC;\" u256329210_apps").toString();

const wpPages = raw.split("\n").map(s => s.trim()).filter(s => s && !s.includes("casino") && !s.includes("slot"));

const allReserved = Array.from(new Set([...systemSlugs, ...wpPages])).sort();

fs.writeFileSync("/home/u256329210/reserved-slugs.json", JSON.stringify({
  total: allReserved.length,
  updated_at: new Date().toISOString().slice(0, 10),
  system_slugs: systemSlugs,
  wordpress_pages: wpPages,
  all_reserved_slugs: allReserved
}, null, 2));

console.log("Updated reserved-slugs.json with", allReserved.length, "slugs.");
'
```
