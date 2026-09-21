import * as pjActions from "./actions/pj";
import {
  PJ_DESAIN_GRAFIS,
  PJ_WEBSITE,
  PJ_TWIBBON,
  PJ_BANTUAN_TEKNIS,
  PJ_SURVEY,
  PJ_PLATFORM_KHUSUS,
  PJ_PUBLIKASI,
  PJ_INTERN_DESAIN,
  PJ_INTERN_WEBSITE,
} from "./constants";

// ─── Types ───
export interface PJContact {
  id: string;
  nama: string;
  nomor: string;
  role: PJCategory | string | null;
  created_at: string;
}

export interface PJMapping {
  id: string;
  category: string;
  lookup_key: string;
  pj_id: string | null;
  platforms: string[] | null;
  updated_at: string;
  pj_contacts?: PJContact | null;
}

export const DAYS_OF_WEEK = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;

export type PJCategory =
  | "desain_grafis"
  | "website"
  | "twibbon"
  | "bantuan_teknis"
  | "survey"
  | "platform_khusus"
  | "publikasi"
  | "intern_desain"
  | "intern_website";

export const PJ_CATEGORY_LABELS: Record<PJCategory, string> = {
  desain_grafis: "PJ Desain Grafis",
  website: "PJ Website",
  twibbon: "PJ Twibbon",
  bantuan_teknis: "PJ Bantuan Teknis",
  survey: "PJ Survey",
  platform_khusus: "PJ Platform Khusus",
  publikasi: "PJ Publikasi",
  intern_desain: "PJ Desain (Intern)",
  intern_website: "PJ Website (Intern)",
};

// Intern PJ entry — includes proker label for display
export interface InternPJEntry {
  nama: string;
  nomor: string;
  proker: string;
}

// ─── Contacts CRUD ───
export async function fetchPJContacts(): Promise<PJContact[]> {
  const data = await pjActions.fetchPJContacts();
  return data as PJContact[];
}

export async function createPJContact(
  nama: string,
  nomor: string,
  role: string | null
): Promise<{ success: boolean; error?: string }> {
  return await pjActions.createPJContact(nama, nomor, role);
}

export async function updatePJContact(
  id: string,
  nama: string,
  nomor: string,
  role: string | null
): Promise<{ success: boolean; error?: string }> {
  return await pjActions.updatePJContact(id, nama, nomor, role);
}

export async function deletePJContact(id: string): Promise<{ success: boolean; error?: string }> {
  return await pjActions.deletePJContact(id);
}

// ─── Mappings ───
export async function fetchAllPJMappings(): Promise<PJMapping[]> {
  const data = await pjActions.fetchAllPJMappings();
  return data as PJMapping[];
}

export async function updatePJMapping(
  id: string,
  pj_id: string | null,
): Promise<{ success: boolean; error?: string }> {
  return await pjActions.updatePJMapping(id, pj_id);
}

export async function createPJMapping(
  category: string,
  lookup_key: string,
  pj_id: string | null = null,
  platforms: string[] | null = null
): Promise<{ success: boolean; data?: PJMapping; error?: string }> {
  const res = await pjActions.createPJMapping(category, lookup_key, pj_id, platforms);
  return { success: res.success, data: res.data as PJMapping, error: res.error };
}


// ─── Convert DB mappings to the same format as constants (for SuccessMessage) ───
export function buildPJLookups(mappings: PJMapping[]) {
  const desainGrafis: Record<string, { nama: string; nomor: string }> = {};
  const website: Record<string, { nama: string; nomor: string }> = {};
  const twibbon: Record<string, { nama: string; nomor: string }> = {};
  const bantuanTeknis: Record<string, { nama: string; nomor: string }> = {};
  let survey: { nama: string; nomor: string } = { nama: "", nomor: "" };
  const platformKhusus: Record<
    string,
    { nama: string; nomor: string; platforms: string[] }
  > = {};
  const publikasi: Record<string, { nama: string; nomor: string }> = {};

  // Intern lookups: key = kementerian, value = array of intern PJs with proker labels
  const internDesain: Record<string, InternPJEntry[]> = {};
  const internWebsite: Record<string, InternPJEntry[]> = {};

  mappings.forEach((m) => {
    // Skip if no PJ is assigned
    if (!m.pj_contacts) return;

    const contact = { nama: m.pj_contacts.nama, nomor: m.pj_contacts.nomor };

    switch (m.category) {
      case "desain_grafis":
        desainGrafis[m.lookup_key] = contact;
        break;
      case "website":
        website[m.lookup_key] = contact;
        break;
      case "twibbon":
        twibbon[m.lookup_key] = contact;
        break;
      case "bantuan_teknis":
        bantuanTeknis[m.lookup_key] = contact;
        break;
      case "survey":
        survey = contact;
        break;
      case "platform_khusus":
        platformKhusus[m.lookup_key] = {
          ...contact,
          platforms: m.platforms || [],
        };
        break;
      case "publikasi":
        publikasi[m.lookup_key] = contact;
        break;
      case "intern_desain":
        // platforms stores kementerian list, lookup_key stores proker name
        if (m.platforms) {
          m.platforms.forEach((kem) => {
            if (!internDesain[kem]) internDesain[kem] = [];
            internDesain[kem].push({ ...contact, proker: m.lookup_key });
          });
        }
        break;
      case "intern_website":
        if (m.platforms) {
          m.platforms.forEach((kem) => {
            if (!internWebsite[kem]) internWebsite[kem] = [];
            internWebsite[kem].push({ ...contact, proker: m.lookup_key });
          });
        }
        break;
    }
  });

  // Fallback to constants if not yet populated in database
  const resolvedInternDesain = Object.keys(internDesain).length > 0 ? internDesain : PJ_INTERN_DESAIN;
  const resolvedInternWebsite = Object.keys(internWebsite).length > 0 ? internWebsite : PJ_INTERN_WEBSITE;
  const resolvedPublikasi = Object.keys(publikasi).length > 0 ? publikasi : PJ_PUBLIKASI;

  return {
    desainGrafis,
    website,
    twibbon,
    bantuanTeknis,
    survey,
    platformKhusus,
    publikasi: resolvedPublikasi,
    internDesain: resolvedInternDesain,
    internWebsite: resolvedInternWebsite,
  };
}

// ─── Get PJ lookups with fallback to constants ───
export async function getPJLookupsWithFallback() {
  const mappings = await fetchAllPJMappings();

  if (mappings.length === 0) {
    // Fallback to constants
    return {
      desainGrafis: PJ_DESAIN_GRAFIS,
      website: PJ_WEBSITE,
      twibbon: PJ_TWIBBON,
      bantuanTeknis: PJ_BANTUAN_TEKNIS as Record<
        string,
        { nama: string; nomor: string }
      >,
      survey: PJ_SURVEY,
      platformKhusus: PJ_PLATFORM_KHUSUS,
      publikasi: PJ_PUBLIKASI,
      internDesain: PJ_INTERN_DESAIN,
      internWebsite: PJ_INTERN_WEBSITE,
    };
  }

  return buildPJLookups(mappings);
}
