"use client"

import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { WebsiteFormValues } from "@/lib/rismed/schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, ExternalLink, Link2, Globe, ImageIcon } from "lucide-react"

type WebsiteSubType = "shortlink" | "laman_website" | "twibbon"

interface FormWebsiteProps {
    form: UseFormReturn<WebsiteFormValues>
    step: "detail" | "review"
    onOrderShortlink?: (values: WebsiteFormValues) => Promise<void>
}

const SUB_TYPE_OPTIONS: { id: WebsiteSubType; label: string; description: string; icon: typeof Link2 }[] = [
    { id: "shortlink", label: "Shortlink", description: "Pembuatan shortlink untuk link yang sudah ada", icon: Link2 },
    { id: "laman_website", label: "Laman Website", description: "Pengajuan fitur atau laman baru di website", icon: Globe },
    { id: "twibbon", label: "Twibbon", description: "Pemesanan platform twibbon", icon: ImageIcon },
]

export function FormWebsite({ form, step, onOrderShortlink }: FormWebsiteProps) {
    const [shortlinkError, setShortlinkError] = useState<string | null>(null)
    const [isLoadingShortlink, setIsLoadingShortlink] = useState(false)
    const { register, formState: { errors }, getValues, setValue, watch, trigger } = form

    const selectedSubType = watch("website_sub_type") as WebsiteSubType | undefined
    const formatTwibbon = watch("format_twibbon")

    const handleSubTypeSelect = (subType: WebsiteSubType) => {
        setValue("website_sub_type", subType, { shouldValidate: false })
    }

    const handlePesanShortlink = async () => {
        const values = getValues()
        setShortlinkError(null)

        if (!values.tujuan_pemesanan || values.tujuan_pemesanan.trim() === "") {
            setShortlinkError("Tujuan Pemesanan Link harus diisi terlebih dahulu")
            return
        }

        try {
            setIsLoadingShortlink(true)
            const isValid = await trigger(["tujuan_pemesanan"])
            if (!isValid) {
                setShortlinkError("Mohon periksa kembali form Anda")
                return
            }

            if (onOrderShortlink) {
                await onOrderShortlink(values)
            }

            window.open("https://unsoed.link/app", "_blank")
        } catch (error) {
            setShortlinkError("Terjadi kesalahan. Silakan coba lagi.")
            console.error(error)
        } finally {
            setIsLoadingShortlink(false)
        }
    }

    const handleFormatToggle = (checked: boolean) => {
        setValue("format_twibbon", checked ? "video" : "gambar", { shouldValidate: true })
        if (checked) {
            setValue("warna_chroma_key", "#00ff00", { shouldValidate: false })
        } else {
            setValue("warna_chroma_key", "", { shouldValidate: false })
        }
    }

    if (step === "detail") {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Pemesanan Laman Website</h2>
                    <p className="text-muted-foreground text-sm">
                        Pilih jenis pemesanan website yang Anda butuhkan
                    </p>

                    {/* Sub-type selector cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {SUB_TYPE_OPTIONS.map((option) => {
                            const Icon = option.icon
                            const isSelected = selectedSubType === option.id
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSubTypeSelect(option.id)}
                                    className={`relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all duration-200 hover:shadow-md ${isSelected
                                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                                        : "border-border hover:border-primary/40"
                                        }`}
                                >
                                    <div className={`rounded-full p-2.5 ${isSelected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        }`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-foreground"}`}>
                                        {option.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground leading-tight">
                                        {option.description}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-primary" />
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Shortlink form */}
                    {selectedSubType === "shortlink" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="tujuan_pemesanan">Tujuan Pemesanan Link</Label>
                                <Input
                                    id="tujuan_pemesanan"
                                    placeholder="Contoh: OPREC Internship, Pendaftaran Event, dll"
                                    {...register("tujuan_pemesanan")}
                                />
                                {errors.tujuan_pemesanan && <p className="text-sm text-destructive">{errors.tujuan_pemesanan.message}</p>}
                                <p className="text-xs text-muted-foreground">
                                    Jelaskan kebutuhan link yang ingin Anda pesan
                                </p>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                                <p className="text-sm text-amber-800 font-semibold mb-3">Pesan Shortlink</p>
                                {shortlinkError && (
                                    <p className="text-sm text-destructive mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {shortlinkError}
                                    </p>
                                )}
                                <Button
                                    type="button"
                                    onClick={handlePesanShortlink}
                                    disabled={isLoadingShortlink}
                                    className="w-full flex items-center gap-2"
                                >
                                    {isLoadingShortlink ? "Memproses..." : "Pesan Shortlink"} <ExternalLink className="w-4 h-4" />
                                </Button>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Password: &quot;kausacipta&quot;
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Laman Website form */}
                    {selectedSubType === "laman_website" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="tujuan_pemesanan">Tujuan Pemesanan Laman</Label>
                                <Input
                                    id="tujuan_pemesanan"
                                    placeholder="Contoh: Halaman Pendaftaran Event, Laman Informasi, dll"
                                    {...register("tujuan_pemesanan")}
                                />
                                {errors.tujuan_pemesanan && <p className="text-sm text-destructive">{errors.tujuan_pemesanan.message}</p>}
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-semibold mb-1">Format Pengajuan Fitur/Laman:</p>
                                    <ul className="list-disc ml-4 space-y-1">
                                        <li><strong>Nama fitur/laman:</strong> (nama fitur atau laman)</li>
                                        <li><strong>Deskripsi:</strong> (penjelasan fitur/laman)</li>
                                        <li><strong>Lampiran:</strong> (dokumen konten dan aset)</li>
                                    </ul>
                                    <p className="mt-2 text-xs italic">Setelah submit, wajib bersinergi dengan PIC untuk menetapkan konsep.</p>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="link_pengajuan_fitur">Pengajuan Fitur/Laman di Website (Link GDocs) - Opsional</Label>
                                <Input
                                    id="link_pengajuan_fitur"
                                    placeholder="https://docs.google.com/..."
                                    {...register("link_pengajuan_fitur")}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="link_pendaftaran_event">Pembuatan Pendaftaran Event di Website (Link GDocs) - Opsional</Label>
                                <Input
                                    id="link_pendaftaran_event"
                                    placeholder="https://docs.google.com/... (lampirkan pamflet event)"
                                    {...register("link_pendaftaran_event")}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Lampirkan pamflet event dalam dokumen
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Twibbon form */}
                    {selectedSubType === "twibbon" && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300 pt-2">
                            <div className="grid gap-2">
                                <Label htmlFor="judul_kampanye">Judul Twibbon</Label>
                                <Input
                                    id="judul_kampanye"
                                    placeholder="Contoh: Soedirman Digital School"
                                    {...register("judul_kampanye")}
                                />
                                {errors.judul_kampanye && <p className="text-sm text-destructive">{errors.judul_kampanye.message}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="nama_url_twibbon">Nama URL Twibbon</Label>
                                <div className="flex items-center gap-0">
                                    <span className="inline-flex items-center px-3 h-10 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm whitespace-nowrap">
                                        twibbon.bem-unsoed.com/
                                    </span>
                                    <Input
                                        id="nama_url_twibbon"
                                        placeholder="SDS"
                                        className="rounded-l-none"
                                        {...register("nama_url_twibbon")}
                                    />
                                </div>
                                {errors.nama_url_twibbon && <p className="text-sm text-destructive">{errors.nama_url_twibbon.message}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="caption_twibbon">Caption Twibbon</Label>
                                <Textarea
                                    id="caption_twibbon"
                                    placeholder="Tulis caption twibbon di sini..."
                                    rows={4}
                                    {...register("caption_twibbon")}
                                />
                                {errors.caption_twibbon && <p className="text-sm text-destructive">{errors.caption_twibbon.message}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label>Format Twibbon</Label>
                                <div className="flex items-center gap-3 p-3 rounded-md border border-input bg-background">
                                    <span className={`text-sm font-medium ${formatTwibbon !== "video" ? "text-primary" : "text-muted-foreground"}`}>
                                        Gambar
                                    </span>
                                    <Switch
                                        checked={formatTwibbon === "video"}
                                        onCheckedChange={handleFormatToggle}
                                    />
                                    <span className={`text-sm font-medium ${formatTwibbon === "video" ? "text-primary" : "text-muted-foreground"}`}>
                                        Video
                                    </span>
                                </div>
                                {errors.format_twibbon && <p className="text-sm text-destructive">{errors.format_twibbon.message}</p>}
                            </div>

                            {formatTwibbon === "video" && (
                                <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <Label htmlFor="warna_chroma_key">Warna Chroma Key (Hex Code)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="warna_chroma_key"
                                            placeholder="Contoh: #00FF00"
                                            {...register("warna_chroma_key")}
                                            className="flex-1"
                                        />
                                        {watch("warna_chroma_key") && (
                                            <div
                                                className="h-10 w-10 rounded-md border border-input shrink-0"
                                                style={{ backgroundColor: watch("warna_chroma_key") || "#ffffff" }}
                                            />
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setValue("warna_chroma_key", "#00ff00", { shouldValidate: true })}
                                            className="shrink-0"
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                    {errors.warna_chroma_key && <p className="text-sm text-destructive">{errors.warna_chroma_key.message}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        Warna latar belakang untuk efek chroma key pada video twibbon
                                    </p>
                                </div>
                            )}

                            <div className="grid gap-2">
                                <Label htmlFor="tanggal_publikasi_twibbon">Tanggal Publikasi Twibbon</Label>
                                <Input
                                    id="tanggal_publikasi_twibbon"
                                    type="date"
                                    {...register("tanggal_publikasi_twibbon")}
                                />
                                {errors.tanggal_publikasi_twibbon && <p className="text-sm text-destructive">{errors.tanggal_publikasi_twibbon.message}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="link_asset_twibbon">Link Asset</Label>
                                <Input
                                    id="link_asset_twibbon"
                                    placeholder="https://drive.google.com/..."
                                    {...register("link_asset_twibbon")}
                                />
                                {errors.link_asset_twibbon && <p className="text-sm text-destructive">{errors.link_asset_twibbon.message}</p>}
                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-1">
                                    <p className="text-xs text-blue-800 font-semibold mb-1">Asset yang diperlukan:</p>
                                    <ul className="list-disc ml-4 text-xs text-blue-700 space-y-0.5">
                                        <li>File twibbon utama</li>
                                        <li>Thumbnail twibbon</li>
                                    </ul>
                                    <p className="text-xs text-blue-600 mt-2">
                                        Contoh link asset:{" "}
                                        <a
                                            href="https://drive.google.com/drive/folders/1CD96578p_xpDB4h43ht7wHZV8wXhz5QK?usp=drive_link"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="underline hover:text-blue-800 font-bold italic"
                                        >
                                            Lihat contoh folder asset
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Review step
    const values = getValues()

    const getSubTypeLabel = () => {
        switch (values.website_sub_type) {
            case "shortlink": return "Shortlink"
            case "laman_website": return "Laman Website"
            case "twibbon": return "Twibbon"
            default: return "-"
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Review Pesanan Website</h2>
                <p className="text-muted-foreground text-sm">
                    Mohon periksa kembali data pesanan Anda sebelum dikirim.
                </p>

                <div className="bg-secondary/30 rounded-lg p-4 space-y-4 text-sm">
                    <div>
                        <h3 className="font-semibold text-foreground">Identitas</h3>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            <span className="text-muted-foreground">Nama:</span>
                            <span className="col-span-2 font-medium">{values.nama}</span>
                            <span className="text-muted-foreground">Kementerian:</span>
                            <span className="col-span-2 font-medium">{values.kementerian}</span>
                            <span className="text-muted-foreground">WhatsApp:</span>
                            <span className="col-span-2 font-medium">{values.nomor_whatsapp}</span>
                        </div>
                    </div>

                    <div className="border-t border-border pt-3">
                        <h3 className="font-semibold text-foreground">Detail Pemesanan</h3>
                        <div className="grid grid-cols-3 gap-1 mt-1">
                            <span className="text-muted-foreground">Jenis:</span>
                            <span className="col-span-2 font-medium">{getSubTypeLabel()}</span>

                            {/* Shortlink / Laman Website review */}
                            {(values.website_sub_type === "shortlink" || values.website_sub_type === "laman_website") && (
                                <>
                                    <span className="text-muted-foreground">Tujuan:</span>
                                    <span className="col-span-2 font-medium">{values.tujuan_pemesanan}</span>
                                </>
                            )}

                            {/* Twibbon review */}
                            {values.website_sub_type === "twibbon" && (
                                <>
                                    <span className="text-muted-foreground">Judul Twibbon:</span>
                                    <span className="col-span-2 font-medium">{values.judul_kampanye}</span>
                                    <span className="text-muted-foreground">URL Twibbon:</span>
                                    <span className="col-span-2 font-medium">twibbon.bem-unsoed.com/{values.nama_url_twibbon}</span>
                                    <span className="text-muted-foreground">Caption:</span>
                                    <span className="col-span-2 font-medium whitespace-pre-wrap">{values.caption_twibbon}</span>
                                    <span className="text-muted-foreground">Format:</span>
                                    <span className="col-span-2 font-medium">{values.format_twibbon === "video" ? "Video" : "Gambar"}</span>
                                    {values.format_twibbon === "video" && (
                                        <>
                                            <span className="text-muted-foreground">Chroma Key:</span>
                                            <span className="col-span-2 font-medium flex items-center gap-2">
                                                {values.warna_chroma_key}
                                                <span
                                                    className="inline-block h-4 w-4 rounded border border-border"
                                                    style={{ backgroundColor: values.warna_chroma_key || "#ffffff" }}
                                                />
                                            </span>
                                        </>
                                    )}
                                    <span className="text-muted-foreground">Tanggal Publikasi:</span>
                                    <span className="col-span-2 font-medium">{values.tanggal_publikasi_twibbon}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Lampiran section */}
                    {(values.website_sub_type === "laman_website" && (values.link_pengajuan_fitur || values.link_pendaftaran_event)) && (
                        <div className="border-t border-border pt-3">
                            <h3 className="font-semibold text-foreground">Lampiran</h3>
                            <div className="flex flex-col gap-2 mt-1">
                                {values.link_pengajuan_fitur && (
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs">Pengajuan Fitur/Laman:</span>
                                        <a href={values.link_pengajuan_fitur} target="_blank" className="text-blue-600 hover:underline truncate">{values.link_pengajuan_fitur}</a>
                                    </div>
                                )}
                                {values.link_pendaftaran_event && (
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-xs">Pendaftaran Event:</span>
                                        <a href={values.link_pendaftaran_event} target="_blank" className="text-blue-600 hover:underline truncate">{values.link_pendaftaran_event}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {values.website_sub_type === "twibbon" && values.link_asset_twibbon && (
                        <div className="border-t border-border pt-3">
                            <h3 className="font-semibold text-foreground">Asset Twibbon</h3>
                            <div className="flex flex-col gap-1 mt-1">
                                <span className="text-muted-foreground text-xs">Link Asset:</span>
                                <a href={values.link_asset_twibbon} target="_blank" className="text-blue-600 hover:underline truncate">{values.link_asset_twibbon}</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
