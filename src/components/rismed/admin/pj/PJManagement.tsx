"use client";

import * as React from "react";
import {
  KEMENKO_GROUPS,
  KEMENKO_NAMES,
} from "@/lib/rismed/constants";
import {
  PJCategory,
  PJContact,
  PJMapping,
  DAYS_OF_WEEK,
  PJ_CATEGORY_LABELS,
} from "@/lib/rismed/pj";
import {
  fetchAllPJMappings,
  fetchPJContacts,
  createPJContact,
  updatePJContact,
  deletePJContact,
  updatePJMapping,
  createPJMapping,
} from "@/lib/rismed/actions/pj";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users2,
  UserCog,
  Pencil,
  Trash2,
  Phone,
  Check,
  CheckCircle2,
  CalendarDays,
  ClipboardList,
} from "lucide-react";
import { PJPageSkeleton } from "@/components/rismed/shared/Skeletons";

export function PJManagement() {
  const [pjMappings, setPjMappings] = React.useState<PJMapping[]>([]);
  const [pjContacts, setPjContacts] = React.useState<PJContact[]>([]);
  const [isPjLoading, setIsPjLoading] = React.useState(true);

  // PJ Contacts Editing State
  const [editingContactId, setEditingContactId] = React.useState<string | null>(null);
  const [contactNama, setContactNama] = React.useState("");
  const [contactNomor, setContactNomor] = React.useState("");
  const [contactRole, setContactRole] = React.useState<string | null>(null);
  const [contactSaving, setContactSaving] = React.useState(false);

  const fetchPJs = React.useCallback(async () => {
    setIsPjLoading(true);
    try {
      const [fetchedMappings, contacts] = await Promise.all([
        fetchAllPJMappings(),
        fetchPJContacts(),
      ]);
      let mappings = fetchedMappings;

      // Ensure default day mappings exist for 'publikasi' category
      const existingPublikasiDays = new Set(
        mappings.filter((m) => m.category === "publikasi").map((m) => m.lookup_key)
      );
      let createdAny = false;
      for (const day of DAYS_OF_WEEK) {
        if (!existingPublikasiDays.has(day)) {
          await createPJMapping("publikasi", day);
          createdAny = true;
        }
      }

      // Ensure default mappings exist for 'twibbon' category (per Kemenko)
      const existingTwibbonKeys = new Set(
        mappings.filter((m) => m.category === "twibbon").map((m) => m.lookup_key)
      );
      for (const kemenko of KEMENKO_NAMES) {
        if (!existingTwibbonKeys.has(kemenko)) {
          await createPJMapping("twibbon", kemenko);
          createdAny = true;
        }
      }

      if (createdAny) {
        mappings = await fetchAllPJMappings();
      }

      setPjMappings(mappings);
      setPjContacts(contacts);
    } catch (error) {
      console.error("Error fetching PJs:", error);
    } finally {
      setIsPjLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPJs();
  }, [fetchPJs]);

  const startEditContact = (contact: PJContact | null) => {
    if (contact) {
      setEditingContactId(contact.id);
      setContactNama(contact.nama);
      setContactNomor(contact.nomor);
      setContactRole(contact.role || null);
    } else {
      setEditingContactId("new");
      setContactNama("");
      setContactNomor("");
      setContactRole(null);
    }
  };

  const cancelEditContact = () => {
    setEditingContactId(null);
    setContactNama("");
    setContactNomor("");
    setContactRole(null);
  };

  const saveContact = async () => {
    if (!contactNama || !contactNomor || !contactRole) {
      alert("Nama, Nomor, dan Kategori Role harus diisi!");
      return;
    }
    setContactSaving(true);
    try {
      let res;
      if (editingContactId && editingContactId !== "new") {
        res = await updatePJContact(editingContactId, contactNama, contactNomor, contactRole);
      } else {
        res = await createPJContact(contactNama, contactNomor, contactRole);
      }

      if (res.success) {
        await fetchPJs();
        cancelEditContact();
      } else {
        alert("Gagal menyimpan kontak PJ: " + res.error);
      }
    } catch (e) {
      console.error(e);
      alert("Terjadi kesalahan");
    } finally {
      setContactSaving(false);
    }
  };

  const hapusContact = async (id: string) => {
    if (!confirm("Yakin ingin menghapus PJ ini? Kementrian yang ditugaskan akan menjadi kosong.")) return;
    setContactSaving(true);
    try {
      const res = await deletePJContact(id);
      if (res.success) {
        await fetchPJs();
      } else {
        alert("Gagal menghapus PJ: " + res.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setContactSaving(false);
    }
  };

  const handleMappingChange = async (mappingId: string, newPjId: string) => {
    const pjId = newPjId === "none" ? null : newPjId;
    try {
      const res = await updatePJMapping(mappingId, pjId);
      if (res.success) {
        await fetchPJs();
      } else {
        alert("Gagal merubah penugasan PJ.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isPjLoading) {
    return <PJPageSkeleton />;
  }

  const categories: PJCategory[] = [
    "desain_grafis",
    "website",
    "twibbon",
    "bantuan_teknis",
    "survey",
    "platform_khusus",
    "publikasi",
    "intern_desain",
    "intern_website",
  ];

  const toggleRole = (roleKey: string) => {
    const currentRoles = contactRole
      ? contactRole.split(",").map((r) => r.trim()).filter(Boolean)
      : [];
    if (currentRoles.includes(roleKey)) {
      const updated = currentRoles.filter((r) => r !== roleKey);
      setContactRole(updated.length > 0 ? updated.join(",") : null);
    } else {
      setContactRole([...currentRoles, roleKey].join(","));
    }
  };

  const isContactEligibleForCategory = (contact: PJContact, targetCat: PJCategory) => {
    if (!contact.role) return false;
    const roles = contact.role.split(",").map((r) => r.trim());
    if (roles.includes(targetCat)) return true;
    // PJ Publikasi and PJ Twibbon can also serve each other
    if (targetCat === "twibbon" && roles.includes("publikasi")) return true;
    if (targetCat === "publikasi" && roles.includes("twibbon")) return true;
    return false;
  };

  const renderRoleBadges = (roleStr: string | null) => {
    if (!roleStr) return <span className="text-muted-foreground italic">Belum Diatur</span>;
    const roles = roleStr.split(",").map((r) => r.trim()).filter(Boolean);
    if (roles.length === 0) return <span className="text-muted-foreground italic">Belum Diatur</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {roles.map((r) => (
          <span
            key={r}
            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
          >
            {PJ_CATEGORY_LABELS[r as PJCategory] || r}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="px-3 sm:px-6 pt-2 sm:pt-4 mb-2">
        <h2 className="text-lg sm:text-xl font-bold tracking-tight">Kelola Penanggung Jawab (PJ)</h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Atur Master Data PJ dan ubah Penugasan Kementerian.
        </p>
      </div>

      <div className="px-3 sm:px-6">
        <Accordion type="multiple" defaultValue={["master", "penugasan"]} className="w-full space-y-4">
          {/* Master Data PJ */}
          <AccordionItem value="master" className="border rounded-lg bg-card text-card-foreground shadow-xs px-3 sm:px-4">
            <AccordionTrigger className="hover:no-underline py-3 sm:py-4">
              <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
                <Users2 className="w-5 h-5 text-primary" />
                Master Data PJ
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1">
              <div className="flex justify-end mb-3 sm:mb-4">
                {!editingContactId && (
                  <Button size="sm" onClick={() => startEditContact(null)} className="h-8 text-xs px-3">
                    Tambah PJ
                  </Button>
                )}
              </div>

              {/* Mobile View for Master Data PJ */}
              <div className="block sm:hidden space-y-3">
                {editingContactId === "new" && (
                  <div className="p-3 border rounded-lg bg-accent/20 space-y-2.5">
                    <h4 className="font-semibold text-xs text-primary">Tambah PJ Baru</h4>
                    <Input
                      value={contactNama}
                      onChange={(e) => setContactNama(e.target.value)}
                      placeholder="Nama PJ"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={contactNomor}
                      onChange={(e) => setContactNomor(e.target.value)}
                      placeholder="Nomor WA (628...)"
                      className="h-8 text-xs"
                    />
                    <div className="space-y-1.5">
                      <div className="text-[11px] text-muted-foreground font-medium">Pilih Kategori Role (Bisa lebih dari 1):</div>
                      <div className="flex flex-wrap gap-1.5">
                        {categories.map((c) => {
                          const selected = (contactRole ? contactRole.split(",").map((r) => r.trim()) : []).includes(c);
                          return (
                            <button
                              key={c}
                              type="button"
                              onClick={() => toggleRole(c)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                                selected
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                  : "bg-background hover:bg-muted text-muted-foreground border-input"
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-xs border flex items-center justify-center transition-colors ${
                                  selected
                                    ? "bg-primary-foreground text-primary border-primary-foreground"
                                    : "border-muted-foreground/60"
                                }`}
                              >
                                {selected && <Check className="w-2 h-2 stroke-[3]" />}
                              </div>
                              {PJ_CATEGORY_LABELS[c]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={cancelEditContact} disabled={contactSaving}>
                        Batal
                      </Button>
                      <Button size="sm" className="h-8 text-xs px-3 bg-green-600 hover:bg-green-700 text-white" onClick={saveContact} disabled={contactSaving}>
                        Simpan
                      </Button>
                    </div>
                  </div>
                )}

                {pjContacts.map((contact) => (
                  <div key={contact.id} className="p-3 border rounded-lg bg-background shadow-xs space-y-2">
                    {editingContactId === contact.id ? (
                      <div className="space-y-2.5">
                        <h4 className="font-semibold text-xs text-primary">Edit PJ: {contact.nama}</h4>
                        <Input
                          value={contactNama}
                          onChange={(e) => setContactNama(e.target.value)}
                          placeholder="Nama PJ"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={contactNomor}
                          onChange={(e) => setContactNomor(e.target.value)}
                          placeholder="Nomor WA"
                          className="h-8 text-xs"
                        />
                        <div className="space-y-1.5">
                          <div className="text-[11px] text-muted-foreground font-medium">Pilih Kategori Role (Bisa lebih dari 1):</div>
                          <div className="flex flex-wrap gap-1.5">
                            {categories.map((c) => {
                              const selected = (contactRole ? contactRole.split(",").map((r) => r.trim()) : []).includes(c);
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => toggleRole(c)}
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                                    selected
                                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                      : "bg-background hover:bg-muted text-muted-foreground border-input"
                                  }`}
                                >
                                  <div
                                    className={`w-3 h-3 rounded-xs border flex items-center justify-center transition-colors ${
                                      selected
                                        ? "bg-primary-foreground text-primary border-primary-foreground"
                                        : "border-muted-foreground/60"
                                    }`}
                                  >
                                    {selected && <Check className="w-2 h-2 stroke-[3]" />}
                                  </div>
                                  {PJ_CATEGORY_LABELS[c]}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1">
                          <Button size="sm" variant="outline" className="h-8 text-xs px-3" onClick={cancelEditContact} disabled={contactSaving}>
                            Batal
                          </Button>
                          <Button size="sm" className="h-8 text-xs px-3 bg-green-600 hover:bg-green-700 text-white" onClick={saveContact} disabled={contactSaving}>
                            Simpan
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-semibold text-sm">{contact.nama}</div>
                          {renderRoleBadges(contact.role)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground/70" />
                          <span>{contact.nomor}</span>
                        </div>
                        <div className="flex justify-end gap-2 pt-1 border-t mt-2">
                          <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => startEditContact(contact)}>
                            <Pencil className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => hapusContact(contact.id)}>
                            <Trash2 className="w-3 h-3 mr-1" /> Hapus
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {pjContacts.length === 0 && editingContactId !== "new" && (
                  <div className="text-center text-xs text-muted-foreground py-4 italic border rounded-lg">
                    Belum ada data Master PJ.
                  </div>
                )}
              </div>

              {/* Desktop View for Master Data PJ */}
              <div className="hidden sm:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama PJ</TableHead>
                      <TableHead>Nomor WA</TableHead>
                      <TableHead>Kategori PJ</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editingContactId === "new" && (
                      <TableRow>
                        <TableCell>
                          <Input
                            value={contactNama}
                            onChange={(e) => setContactNama(e.target.value)}
                            placeholder="Nama PJ"
                            className="h-8 text-xs min-w-[120px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={contactNomor}
                            onChange={(e) => setContactNomor(e.target.value)}
                            placeholder="Nomor WA (628...)"
                            className="h-8 text-xs min-w-[120px]"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 min-w-[220px]">
                            {categories.map((c) => {
                              const selected = (contactRole ? contactRole.split(",").map((r) => r.trim()) : []).includes(c);
                              return (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => toggleRole(c)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all ${
                                    selected
                                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                      : "bg-background hover:bg-muted text-muted-foreground border-input"
                                  }`}
                                >
                                  <div
                                    className={`w-2.5 h-2.5 rounded-xs border flex items-center justify-center transition-colors ${
                                      selected
                                        ? "bg-primary-foreground text-primary border-primary-foreground"
                                        : "border-muted-foreground/60"
                                    }`}
                                  >
                                    {selected && <Check className="w-2 h-2 stroke-[3]" />}
                                  </div>
                                  {PJ_CATEGORY_LABELS[c]}
                                </button>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-7 px-2" onClick={cancelEditContact} disabled={contactSaving}>
                              Batal
                            </Button>
                            <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white" onClick={saveContact} disabled={contactSaving}>
                              Simpan
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {pjContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>
                          {editingContactId === contact.id ? (
                            <Input
                              value={contactNama}
                              onChange={(e) => setContactNama(e.target.value)}
                              className="h-8 text-xs min-w-[120px]"
                            />
                          ) : (
                            <span className="font-semibold">{contact.nama}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingContactId === contact.id ? (
                            <Input
                              value={contactNomor}
                              onChange={(e) => setContactNomor(e.target.value)}
                              className="h-8 text-xs min-w-[120px]"
                            />
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{contact.nomor}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingContactId === contact.id ? (
                            <div className="flex flex-wrap gap-1 min-w-[220px]">
                              {categories.map((c) => {
                                const selected = (contactRole ? contactRole.split(",").map((r) => r.trim()) : []).includes(c);
                                return (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => toggleRole(c)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border transition-all ${
                                      selected
                                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                        : "bg-background hover:bg-muted text-muted-foreground border-input"
                                    }`}
                                  >
                                    <div
                                      className={`w-2.5 h-2.5 rounded-xs border flex items-center justify-center transition-colors ${
                                        selected
                                          ? "bg-primary-foreground text-primary border-primary-foreground"
                                          : "border-muted-foreground/60"
                                      }`}
                                    >
                                      {selected && <Check className="w-2 h-2 stroke-[3]" />}
                                    </div>
                                    {PJ_CATEGORY_LABELS[c]}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            renderRoleBadges(contact.role)
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {editingContactId === contact.id ? (
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button size="sm" variant="outline" className="h-7 px-2" onClick={cancelEditContact} disabled={contactSaving}>
                                Batal
                              </Button>
                              <Button size="sm" className="h-7 px-2 bg-green-600 hover:bg-green-700 text-white" onClick={saveContact} disabled={contactSaving}>
                                Simpan
                              </Button>
                            </div>
                          ) : (
                            <div className="flex flex-wrap justify-end gap-2">
                              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => startEditContact(contact)}>
                                <Pencil className="w-3 h-3 mr-1" /> Edit
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => hapusContact(contact.id)}>
                                <Trash2 className="w-3 h-3 mr-1" /> Hapus
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {pjContacts.length === 0 && editingContactId !== "new" && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                          Belum ada data Master PJ.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Penugasan Kementerian */}
      <div className="px-3 sm:px-6 mt-6 sm:mt-8 mb-4">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-primary" />
          Penugasan Kementerian
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-3 sm:mb-4">
          Pilih kategori di bawah untuk mengatur PJ kementerian.
        </p>
        <Accordion type="multiple" className="w-full space-y-3">
          {categories.map((cat) => {
            const pjs = pjMappings.filter((p) => p.category === cat);
            return (
              <AccordionItem key={cat} value={cat} className="border rounded-md px-2.5 sm:px-3 bg-muted/20">
                <AccordionTrigger className="hover:no-underline py-2.5 sm:py-3">
                  <div className="flex items-center gap-2 font-semibold text-sm sm:text-base">
                    <UserCog className="w-4 h-4 text-primary" />
                    {PJ_CATEGORY_LABELS[cat]}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  {cat === "publikasi" ? (
                    <div className="space-y-4 pt-2">
                      {/* Ringkasan Penugasan PJ Publikasi */}
                      <div className="p-3 sm:p-4 bg-background/60 rounded-lg border">
                        <h4 className="font-semibold text-xs sm:text-sm flex items-center gap-2 mb-2">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          Ringkasan Penugasan PJ Publikasi (Maks. 2 Hari / Orang)
                        </h4>
                        {pjContacts.filter((c) => isContactEligibleForCategory(c, "publikasi")).length === 0 ? (
                          <p className="text-xs text-muted-foreground italic">
                            Belum ada Kontak PJ dengan Kategori &quot;PJ Publikasi&quot; atau &quot;PJ Twibbon&quot;. Silakan tambahkan Kontak PJ di Master Data PJ di atas.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                            {pjContacts
                              .filter((c) => isContactEligibleForCategory(c, "publikasi"))
                              .map((contact) => {
                                const assignedDays = pjMappings
                                  .filter((m) => m.category === "publikasi" && m.pj_id === contact.id)
                                  .map((m) => m.lookup_key);
                                const count = assignedDays.length;
                                const isMax = count >= 2;

                                return (
                                  <div
                                    key={contact.id}
                                    className={`p-2.5 sm:p-3 rounded-md border text-xs flex flex-col justify-between transition-all ${
                                      isMax
                                        ? "bg-amber-500/10 border-amber-500/30"
                                        : count > 0
                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                        : "bg-background border-border"
                                    }`}
                                  >
                                    <div className="flex items-center justify-between font-semibold">
                                      <span>{contact.nama}</span>
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                          isMax
                                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                            : count > 0
                                            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                                            : "bg-muted text-muted-foreground"
                                        }`}
                                      >
                                        {count}/2 Hari
                                      </span>
                                    </div>
                                    <div className="mt-1.5 text-[11px] text-muted-foreground">
                                      {count > 0 ? (
                                        <span>Hari: <strong>{assignedDays.join(", ")}</strong></span>
                                      ) : (
                                        <span className="italic">Belum ada hari</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>

                      {/* Mobile View for PJ Publikasi per Hari */}
                      <div className="block sm:hidden space-y-3">
                        {DAYS_OF_WEEK.map((day) => {
                          const mapping = pjMappings.find(
                            (m) => m.category === "publikasi" && m.lookup_key === day
                          );
                          const currentPjId = mapping?.pj_id || null;
                          const pubContacts = pjContacts.filter((c) => isContactEligibleForCategory(c, "publikasi"));

                          return (
                            <div key={day} className="p-3 border rounded-lg bg-background space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                                  <CalendarDays className="w-4 h-4 text-primary" />
                                  {day}
                                </div>
                                {mapping?.pj_contacts ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {mapping.pj_contacts.nama}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic bg-muted px-2 py-0.5 rounded-full">
                                    Belum ditugaskan
                                  </span>
                                )}
                              </div>

                              <div className="space-y-1">
                                <div className="text-[11px] text-muted-foreground font-medium">Pilih PJ Publikasi:</div>
                                <div className="flex flex-wrap gap-1.5">
                                  {pubContacts.length === 0 ? (
                                    <span className="text-xs text-muted-foreground italic">
                                      Belum ada kontak PJ Publikasi
                                    </span>
                                  ) : (
                                    pubContacts.map((contact) => {
                                      const isChecked = currentPjId === contact.id;
                                      const contactAssignedDays = pjMappings
                                        .filter((m) => m.category === "publikasi" && m.pj_id === contact.id)
                                        .map((m) => m.lookup_key);
                                      const count = contactAssignedDays.length;
                                      const isLimitReached = count >= 2 && !isChecked;

                                      return (
                                        <button
                                          key={contact.id}
                                          type="button"
                                          onClick={() => {
                                            if (!mapping) return;
                                            if (isChecked) {
                                              handleMappingChange(mapping.id, "none");
                                            } else {
                                              if (count >= 2) {
                                                alert(
                                                  `PJ ${contact.nama} sudah mengambil 2 hari (${contactAssignedDays.join(
                                                    ", "
                                                  )}). Maksimal 2 hari per 1 orang PJ Publikasi!`
                                                );
                                                return;
                                              }
                                              handleMappingChange(mapping.id, contact.id);
                                            }
                                          }}
                                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                                            isChecked
                                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                                              : isLimitReached
                                              ? "bg-muted/50 text-muted-foreground/60 border-transparent opacity-60"
                                              : "bg-background hover:bg-accent border-input"
                                          }`}
                                        >
                                          <div
                                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${
                                              isChecked
                                                ? "bg-primary-foreground text-primary border-primary-foreground"
                                                : "border-muted-foreground/60"
                                            }`}
                                          >
                                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                          </div>
                                          <span>{contact.nama}</span>
                                          <span className="text-[10px] opacity-80 font-mono">
                                            ({count}/2)
                                          </span>
                                        </button>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Desktop View for PJ Publikasi per Hari */}
                      <div className="hidden sm:block overflow-x-auto border rounded-md bg-background">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[140px]">Hari</TableHead>
                              <TableHead>Pilih PJ Publikasi (Checklist)</TableHead>
                              <TableHead className="w-[180px]">PJ Terpilih</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {DAYS_OF_WEEK.map((day) => {
                              const mapping = pjMappings.find(
                                (m) => m.category === "publikasi" && m.lookup_key === day
                              );
                              const currentPjId = mapping?.pj_id || null;
                              const pubContacts = pjContacts.filter((c) => isContactEligibleForCategory(c, "publikasi"));

                              return (
                                <TableRow key={day}>
                                  <TableCell className="font-semibold text-sm">
                                    <div className="flex items-center gap-2">
                                      <CalendarDays className="w-4 h-4 text-primary" />
                                      {day}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-2 items-center">
                                      {pubContacts.length === 0 ? (
                                        <span className="text-xs text-muted-foreground italic">
                                          Belum ada kontak PJ Publikasi di Master Data
                                        </span>
                                      ) : (
                                        pubContacts.map((contact) => {
                                          const isChecked = currentPjId === contact.id;
                                          const contactAssignedDays = pjMappings
                                            .filter(
                                              (m) =>
                                                m.category === "publikasi" && m.pj_id === contact.id
                                            )
                                            .map((m) => m.lookup_key);
                                          const count = contactAssignedDays.length;
                                          const isLimitReached = count >= 2 && !isChecked;

                                          return (
                                            <button
                                              key={contact.id}
                                              type="button"
                                              onClick={() => {
                                                if (!mapping) return;
                                                if (isChecked) {
                                                  handleMappingChange(mapping.id, "none");
                                                } else {
                                                  if (count >= 2) {
                                                    alert(
                                                      `PJ ${contact.nama} sudah mengambil 2 hari (${contactAssignedDays.join(
                                                        ", "
                                                      )}). Maksimal 2 hari per 1 orang PJ Publikasi!`
                                                    );
                                                    return;
                                                  }
                                                  handleMappingChange(mapping.id, contact.id);
                                                }
                                              }}
                                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                                                isChecked
                                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                                  : isLimitReached
                                                  ? "bg-muted/50 text-muted-foreground/60 border-transparent hover:border-amber-500/30"
                                                  : "bg-background hover:bg-accent hover:text-accent-foreground border-input"
                                              }`}
                                            >
                                              <div
                                                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                  isChecked
                                                    ? "bg-primary-foreground text-primary border-primary-foreground"
                                                    : "border-muted-foreground/60"
                                                }`}
                                              >
                                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                              </div>
                                              <span>{contact.nama}</span>
                                              <span className="text-[10px] opacity-80 font-mono">
                                                ({count}/2)
                                              </span>
                                            </button>
                                          );
                                        })
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {mapping?.pj_contacts ? (
                                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                        <CheckCircle2 className="w-4 h-4" />
                                        {mapping.pj_contacts.nama}
                                      </div>
                                    ) : (
                                      <span className="text-xs text-muted-foreground italic">
                                        Belum ditugaskan
                                      </span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Mobile View for Standard Penugasan */}
                      <div className="block sm:hidden space-y-2.5">
                        {pjs.length === 0 ? (
                          <div className="text-center text-xs text-muted-foreground py-4 italic border rounded-lg">
                            Belum ada data penugasan untuk kategori ini.
                          </div>
                        ) : (
                          pjs.map((pjMap) => (
                            <div key={pjMap.id} className="p-3 border rounded-lg bg-background space-y-2">
                              <div className="font-semibold text-xs sm:text-sm">
                                {pjMap.lookup_key}
                                {cat === "platform_khusus" && pjMap.platforms && (
                                  <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                    Platforms: {pjMap.platforms.join(", ")}
                                  </div>
                                )}
                                {cat === "twibbon" && (
                                  <div className="text-[10px] text-muted-foreground font-normal mt-0.5">
                                    Menaungi: {KEMENKO_GROUPS.find((g) => g.name === pjMap.lookup_key)?.kementerian.map((k) => k.replace("Kementerian ", "").replace("Biro ", "")).join(", ")}
                                  </div>
                                )}
                              </div>
                              <Select
                                value={pjMap.pj_id || "none"}
                                onValueChange={(val) => handleMappingChange(pjMap.id, val)}
                              >
                                <SelectTrigger className="h-9 text-xs w-full">
                                  <SelectValue placeholder="Pilih PJ..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none" className="text-muted-foreground italic">-- Tidak ada PJ --</SelectItem>
                                  {pjContacts
                                    .filter((contact) => isContactEligibleForCategory(contact, cat))
                                    .map((contact) => (
                                      <SelectItem key={contact.id} value={contact.id}>
                                        {contact.nama} ({contact.nomor})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Desktop View for Standard Penugasan */}
                      <div className="hidden sm:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40%]">
                                {cat === "twibbon" ? "Kemenko / Koordinator" : "Identifier / Kementerian"}
                              </TableHead>
                              <TableHead className="w-[60%]">Penugasan PJ</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pjs.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground py-6">
                                  Belum ada data penugasan untuk kategori ini.
                                </TableCell>
                              </TableRow>
                            ) : (
                              pjs.map((pjMap) => (
                                <TableRow key={pjMap.id}>
                                  <TableCell className="font-medium align-top">
                                    <div className="mt-1.5">{pjMap.lookup_key}</div>
                                    {cat === "platform_khusus" && pjMap.platforms && (
                                      <div className="text-[10px] text-muted-foreground mt-1">
                                        {pjMap.platforms.join(", ")}
                                      </div>
                                    )}
                                    {cat === "twibbon" && (
                                      <div className="text-[11px] text-muted-foreground font-normal mt-1">
                                        Menaungi: {KEMENKO_GROUPS.find((g) => g.name === pjMap.lookup_key)?.kementerian.map((k) => k.replace("Kementerian ", "").replace("Biro ", "")).join(", ")}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={pjMap.pj_id || "none"}
                                      onValueChange={(val) => handleMappingChange(pjMap.id, val)}
                                    >
                                      <SelectTrigger className="h-9 text-xs sm:text-sm w-full min-w-[140px] max-w-[300px]">
                                        <SelectValue placeholder="Pilih PJ..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none" className="text-muted-foreground italic">-- Tidak ada PJ --</SelectItem>
                                        {pjContacts
                                          .filter((contact) => isContactEligibleForCategory(contact, cat))
                                          .map((contact) => (
                                            <SelectItem key={contact.id} value={contact.id}>
                                              {contact.nama} ({contact.nomor})
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
