import { NextRequest, NextResponse } from "next/server";

// Kata kunci yang sering dipakai bot judi/spam
const SPAM_KEYWORDS = [
  "casino", "казино", "judi", "slot", "poker", "togel", "bet", "gambling",
  "promo", "bonus", "pin-up", "pinup", "1xbet", "mostbet", "melbet",
  "промо", "бонус", "турнир",
];

// Parameter query yang mencurigakan (dipakai bot Next.js exploit)
const SUSPICIOUS_PARAMS = ["nxtPslug", "nxtPpath", "__nextLocale"];

function isSpamRequest(req: NextRequest): boolean {
  const url = req.nextUrl;
  const pathname = decodeURIComponent(url.pathname).toLowerCase();
  const search = decodeURIComponent(url.search).toLowerCase();

  // Cek kata kunci spam di pathname
  for (const keyword of SPAM_KEYWORDS) {
    if (pathname.includes(keyword.toLowerCase())) return true;
  }

  // Cek parameter query mencurigakan yang dieksploitasi bot
  for (const param of SUSPICIOUS_PARAMS) {
    if (url.searchParams.has(param)) return true;
  }

  // Cek kata kunci spam di query string
  for (const keyword of SPAM_KEYWORDS) {
    if (search.includes(keyword.toLowerCase())) return true;
  }

  return false;
}

export function proxy(req: NextRequest) {
  if (isSpamRequest(req)) {
    // Kembalikan 403 Forbidden tanpa meneruskan ke server/database
    return new NextResponse("Forbidden", { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan middleware di semua route kecuali static files & API internal
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
