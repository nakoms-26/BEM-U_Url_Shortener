# BEM UNSOED URL Shortener🚀

![Next.js](https://img.shields.io/badge/Next.js-000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

Sebuah aplikasi pemendek URL (URL Shortener) profesional yang dirancang khusus untuk kebutuhan publikasi **BEM Universitas Jenderal Soedirman**. Aplikasi ini mengubah tautan yang panjang (seperti Google Drive atau Form) menjadi tautan pendek yang tepercaya, estetis, dan mudah diingat.

## ✨ Fitur Utama

- **🔗 Custom Slugs:** Buat tautan pendek dengan nama yang Anda inginkan (misal: `unsoed.link/oprec`).
- **🛡️ Admin Verification:** Keamanan ekstra dengan sistem password untuk memastikan hanya admin yang berwenang yang dapat membuat tautan.
- **💎 Glassmorphism UI:** Antarmuka modern dengan efek kaca yang elegan, dibangun menggunakan komponen kustom.
- **📊 Click Tracking:** Melacak jumlah klik pada setiap tautan secara real-time.
- **🏢 Institutional Branding:** Terintegrasi dengan identitas visual BEM Unsoed.
- **📱 Responsive Design:** Pengalaman pengguna yang mulus di perangkat desktop maupun mobile.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Database & Auth:** [Supabase](https://supabase.com/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Form Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

## 🚀 Memulai (Local Development)

### 1. Prasyarat
Pastikan Anda sudah menginstal:
- Node.js (versi terbaru direkomendasikan)
- NPM atau PNPM

### 2. Instalasi
Clone repositori ini dan instal dependensinya:
```bash
git clone https://github.com/username/najmisurlshortener.git
cd najmisurlshortener
npm install
```

### 3. Konfigurasi Environment Variables
Buat file `.env.local` di root direktori dan tambahkan kredensial Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Menjalankan Server
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

## 📂 Struktur Proyek

- `src/app`: Routing Next.js (Home, Shortener, Database, dan Dynamic Redirects).
- `src/components`: Komponen UI kustom, termasuk sistem desain *Glassmorphism*.
- `src/lib`: Konfigurasi Supabase, utilitas, dan konstanta.
- `public`: Aset statis seperti logo dan ikon.

## 🔒 Keamanan

Aplikasi ini menggunakan sistem verifikasi password sederhana untuk pembuatan tautan baru. Password default diatur di sisi klien (untuk prototipe ini), namun sangat disarankan untuk dipindahkan ke sisi server atau menggunakan Supabase Auth untuk penggunaan produksi yang lebih aman.

## 🤝 Kontribusi

Kontribusi selalu terbuka! Jika Anda ingin meningkatkan aplikasi ini, silakan buat *Pull Request* atau laporkan *Issue*.

---

Dibuat dengan ❤️ untuk **BEM Unsoed**.
