/**
 * GOOGLE APPS SCRIPT - OTOMATISASI PEMBUATAN FOLDER GOOGLE DRIVE
 * BEM UNIVERSITAS JENDERAL SOEDIRMAN (RISMED)
 * 
 * Struktur Hirarki:
 * My Drive
 *  └── DESGRAF X PUBS
 *       └── [Kementerian] (cth: MEDKOM)
 *            └── [Bulan] (cth: OKTOBER)
 *                 └── [tanggal - jam] (cth: 09/092026 - 10.00)
 * 
 * Hanya memproses pesanan dengan platform:
 * Feeds, IGS (Story), Spotify, X (Twitter), WAC (WhatsApp Channel).
 */

// ==========================================================
// 1. KONFIGURASI
// ==========================================================
const CONFIG = {
  // Nama folder root di My Drive
  ROOT_FOLDER_NAME: "DESGRAF X PUBS",
  
  // (Opsional) Jika folder "DESGRAF X PUBS" sudah ada dan ingin dikunci via Folder ID:
  // ROOT_FOLDER_ID: "PASTE_FOLDER_ID_DISINI_JIKA_ADA",

  // Kolom target di Spreadsheet untuk menyimpan URL Folder Drive (Kolom A=1, B=2, dst)
  SPREADSHEET_LINK_COL: 8,

  // Mapping nama kementerian ke singkatan resmi
  KEMENTERIAN_MAP: {
    "Lingkar Presiden": "LINGPRES",
    "Biro Kesekretariatan": "Kesekretariatan",
    "Biro Keuangan": "Keuangan",
    "Biro Pengembangan Sumber Daya Anggota": "PSDA",
    "Biro Pengendali & Penjamin Mutu": "PPM",
    "Kementerian Pengembangan Sumber Daya Mahasiswa": "PSDM",
    "Kementerian Seni dan Olahraga": "SENIORA",
    "Kementerian Prestasi dan Inovasi": "PI",
    "Kementerian Dalam Negeri": "DAGRI",
    "Kementerian Luar Negeri": "LUGRI",
    "Kementerian Pengabdian Masyarakat": "PENGMAS",
    "Kementerian Advokasi Kesejahteraan Mahasiswa": "ADKESMA",
    "Kementerian Aksi dan Propaganda": "AKSPRO",
    "Kementerian Analisis Isu Strategis": "ANSTRAT",
    "Kementerian Pemberdayaan Perempuan": "PEMPU",
    "Kementerian Media Kreatif dan Aplikatif": "MEDKRAF",
    "Kementerian Media Komunikasi dan Informasi": "MEDKOM",
    "Kementerian Riset dan Data": "RISDAT",
    "Satuan Pengawas Internal": "SPI"
  },

  // Daftar nama bulan kapital (Indonesia)
  NAMA_BULAN: [
    "JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI",
    "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"
  ],

  // Target platform yang diproses
  TARGET_PLATFORM_REGEX: /feed|story|igs|spotify|\bx\b|twitter|wac|whatsapp/i
};

// ==========================================================
// 2. FUNGSI PEMBUATAN DIREKTORI
// ==========================================================

/**
 * Mendapatkan folder yang sudah ada atau membuatnya jika belum ada (anti-duplikasi)
 */
function getOrCreateFolder(parentFolder, folderName) {
  if (!parentFolder) {
    throw new Error("Parameter parentFolder kosong. Jika ingin melakukan pengetesan di Apps Script, pilih fungsi 'testGenerate' pada dropdown di atas lalu klik Run.");
  }
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

/**
 * Mendapatkan root folder "DESGRAF X PUBS" di My Drive
 */
function getRootFolder() {
  if (CONFIG.ROOT_FOLDER_ID) {
    return DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID);
  }
  const roots = DriveApp.getRootFolder().getFoldersByName(CONFIG.ROOT_FOLDER_NAME);
  if (roots.hasNext()) {
    return roots.next();
  }
  return DriveApp.getRootFolder().createFolder(CONFIG.ROOT_FOLDER_NAME);
}

/**
 * Membuat struktur hirarkis:
 * My Drive > DESGRAF X PUBS > [Kementerian] > [Bulan] > [tanggal - jam]
 */
function createOrderFolder(kementerianInput, tanggalInput, waktuInput, platformInput) {
  const platformStr = Array.isArray(platformInput) ? platformInput.join(", ") : String(platformInput || "");

  // 1. Verifikasi apakah platform pesanan sesuai kriteria target
  if (!CONFIG.TARGET_PLATFORM_REGEX.test(platformStr)) {
    Logger.log("Platform bukan Feeds/IGS/Spotify/X/WAC. Dilewati.");
    return null;
  }

  // 2. Root Folder: DESGRAF X PUBS
  const rootFolder = getRootFolder();

  // 3. Level 1: [Kementerian] (cth: MEDKOM)
  const kementerianClean = CONFIG.KEMENTERIAN_MAP[kementerianInput] || kementerianInput || "LAINNYA";
  const kementerianFolder = getOrCreateFolder(rootFolder, kementerianClean.toUpperCase());

  // 4. Level 2: [Bulan] (cth: OKTOBER)
  const dateObj = tanggalInput ? new Date(tanggalInput) : new Date();
  const namaBulan = CONFIG.NAMA_BULAN[dateObj.getMonth()];
  const bulanFolder = getOrCreateFolder(kementerianFolder, namaBulan);

  // 5. Level 3: [tanggal - jam] (cth: 09/09/2026 - 10.00)
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const yyyy = dateObj.getFullYear();

  let jamClean = "10.00";
  if (waktuInput) {
    const timeMatch = String(waktuInput).match(/\d{2}[.:]\d{2}/);
    jamClean = timeMatch ? timeMatch[0].replace(':', '.') : String(waktuInput);
  }

  const orderFolderName = `${dd}/${mm}/${yyyy} - ${jamClean}`;
  const targetFolder = getOrCreateFolder(bulanFolder, orderFolderName);

  // Berikan hak akses siapa saja dengan link dapat mengedit / upload
  try {
    targetFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
  } catch (e) {
    Logger.log("Warning sharing: " + e.toString());
  }

  return {
    path: `My Drive > ${CONFIG.ROOT_FOLDER_NAME} > ${kementerianClean.toUpperCase()} > ${namaBulan} > ${orderFolderName}`,
    folderName: orderFolderName,
    folderUrl: targetFolder.getUrl(),
    folderId: targetFolder.getId()
  };
}

// ==========================================================
// 3. TRIGGER GOOGLE SPREADSHEET (onFormSubmit)
// ==========================================================
function onFormSubmit(e) {
  try {
    const sheet = e.range ? e.range.getSheet() : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const row = e.range ? e.range.getRow() : sheet.getLastRow();
    
    // Sesuaikan indeks kolom sheet Anda:
    // Contoh kolom: [0]=Timestamp, [1]=Nama, [2]=Kementerian, [3]=Tanggal, [4]=Waktu, [5]=Platform
    const values = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    const kementerian = values[2];
    const tanggal = values[3];
    const waktu = values[4];
    const platform = values[5];

    const result = createOrderFolder(kementerian, tanggal, waktu, platform);
    
    if (result && result.folderUrl) {
      sheet.getRange(row, CONFIG.SPREADSHEET_LINK_COL).setValue(result.folderUrl);
      Logger.log("Folder berhasil dibuat di: " + result.path);
    }
  } catch (err) {
    Logger.log("Error onFormSubmit: " + err.toString());
  }
}

// ==========================================================
// 4. API / WEBHOOK UNTUK APLIKASI WEB NEXT.JS (doPost)
// ==========================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const result = createOrderFolder(
      data.kementerian,
      data.tanggal_publikasi,
      data.waktu_publikasi,
      data.platform_publikasi
    );

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      data: result
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Google Apps Script Drive Automator BEM Unsoed is running"
  })).setMimeType(ContentService.MimeType.JSON);
}

// ==========================================================
// 5. TEST MANUAL (Bisa dijalankan langsung di Apps Script)
// ==========================================================
function testGenerate() {
  const result = createOrderFolder(
    "Kementerian Media Komunikasi dan Informasi",
    "2026-10-09",
    "10.00 (Feeds)",
    ["Instagram Feed", "Whatsapp Channel"]
  );
  Logger.log(JSON.stringify(result, null, 2));
}
