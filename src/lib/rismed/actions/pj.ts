"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export interface PJContactData {
  id: string;
  nama: string;
  nomor: string;
  role: string | null;
  created_at: string;
}

export interface PJMappingData {
  id: string;
  category: string;
  lookup_key: string;
  pj_id: string | null;
  platforms: string[] | null;
  updated_at: string;
  pj_contacts?: PJContactData | null;
}

export async function fetchPJContacts(): Promise<PJContactData[]> {
  try {
    const contacts = await prisma.pJContact.findMany({
      orderBy: { nama: "asc" },
    });
    return contacts.map((c) => ({
      id: c.id,
      nama: c.nama,
      nomor: c.nomor,
      role: c.role,
      created_at: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
    }));
  } catch (error: unknown) {
    console.error("Error fetching PJ contacts:", getErrorMessage(error));
    return [];
  }
}

export async function createPJContact(
  nama: string,
  nomor: string,
  role: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.pJContact.create({
      data: {
        nama,
        nomor,
        role,
      },
    });
    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/pj");
    return { success: true };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error creating PJ contact:", msg);
    return { success: false, error: msg };
  }
}

export async function updatePJContact(
  id: string,
  nama: string,
  nomor: string,
  role: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.pJContact.update({
      where: { id },
      data: {
        nama,
        nomor,
        role,
      },
    });
    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/pj");
    return { success: true };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error updating PJ contact:", msg);
    return { success: false, error: msg };
  }
}

export async function deletePJContact(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.pJContact.delete({
      where: { id },
    });
    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/pj");
    return { success: true };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error deleting PJ contact:", msg);
    return { success: false, error: msg };
  }
}

export async function fetchAllPJMappings(): Promise<PJMappingData[]> {
  try {
    const mappings = await prisma.pJMapping.findMany({
      include: {
        pjContact: true,
      },
      orderBy: [
        { category: "asc" },
        { lookupKey: "asc" },
      ],
    });

    return mappings.map((m) => ({
      id: m.id,
      category: m.category,
      lookup_key: m.lookupKey,
      pj_id: m.pjId,
      platforms: Array.isArray(m.platforms) 
        ? (m.platforms as string[])
        : (typeof m.platforms === 'string' ? JSON.parse(m.platforms) : null),
      updated_at: m.updatedAt ? new Date(m.updatedAt).toISOString() : new Date().toISOString(),
      pj_contacts: m.pjContact ? {
        id: m.pjContact.id,
        nama: m.pjContact.nama,
        nomor: m.pjContact.nomor,
        role: m.pjContact.role,
        created_at: m.pjContact.createdAt ? new Date(m.pjContact.createdAt).toISOString() : new Date().toISOString(),
      } : null,
    }));
  } catch (error: unknown) {
    console.error("Error fetching PJ mappings:", getErrorMessage(error));
    return [];
  }
}

export async function updatePJMapping(
  id: string,
  pj_id: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.pJMapping.update({
      where: { id },
      data: {
        pjId: pj_id,
      },
    });
    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/pj");
    return { success: true };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error updating PJ mapping:", msg);
    return { success: false, error: msg };
  }
}

export async function createPJMapping(
  category: string,
  lookup_key: string,
  pj_id: string | null = null,
  platforms: string[] | null = null
): Promise<{ success: boolean; data?: PJMappingData; error?: string }> {
  try {
    const created = await prisma.pJMapping.create({
      data: {
        category,
        lookupKey: lookup_key,
        pjId: pj_id,
        platforms: platforms || undefined,
      },
      include: {
        pjContact: true,
      },
    });
    revalidatePath("/app/rismed/admin");
    revalidatePath("/app/rismed/pj");
    return {
      success: true,
      data: {
        id: created.id,
        category: created.category,
        lookup_key: created.lookupKey,
        pj_id: created.pjId,
        platforms: Array.isArray(created.platforms) 
          ? (created.platforms as string[])
          : (typeof created.platforms === 'string' ? JSON.parse(created.platforms) : null),
        updated_at: created.updatedAt ? new Date(created.updatedAt).toISOString() : new Date().toISOString(),
        pj_contacts: created.pjContact ? {
          id: created.pjContact.id,
          nama: created.pjContact.nama,
          nomor: created.pjContact.nomor,
          role: created.pjContact.role,
          created_at: created.pjContact.createdAt ? new Date(created.pjContact.createdAt).toISOString() : new Date().toISOString(),
        } : null,
      },
    };
  } catch (error: unknown) {
    const msg = getErrorMessage(error);
    console.error("Error creating PJ mapping:", msg);
    return { success: false, error: msg };
  }
}
