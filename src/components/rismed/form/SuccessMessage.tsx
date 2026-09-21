
"use client"

import * as React from "react"
import { CheckCircle2, MessageCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MenuType, JENIS_BANTUAN_OPTIONS, KEMENTERIAN_TO_KEMENKO } from "@/lib/rismed/constants"
import { getPJLookupsWithFallback } from "@/lib/rismed/pj"

interface SubmittedData {
    menu_type: MenuType
    website_sub_type?: "shortlink" | "laman_website" | "twibbon"
    kementerian: string
    nama: string
    jenis_bantuan?: "podcast" | "take_video" | "live_instagram" | "lainnya"
    platform_publikasi?: string[]
    tanggal_publikasi?: string
}

interface SuccessMessageProps {
    onReset: () => void
    submittedData?: SubmittedData
}

function getWhatsAppLink(nomor: string, message: string): string {
    const cleanNumber = nomor.replace(/\D/g, '')
    const encodedMessage = encodeURIComponent(message)
    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`
}

function getPJForBantuanTeknis(jenisBantuan: string): "A" | "B" {
    const option = JENIS_BANTUAN_OPTIONS.find(o => o.id === jenisBantuan)
    return option?.pj || "A"
}

export function SuccessMessage({ onReset, submittedData }: SuccessMessageProps) {
    const [pjData, setPjData] = React.useState<Awaited<ReturnType<typeof getPJLookupsWithFallback>> | null>(null)
    const [isLoadingPJ, setIsLoadingPJ] = React.useState(true)

    React.useEffect(() => {
        getPJLookupsWithFallback()
            .then(setPjData)
            .finally(() => setIsLoadingPJ(false))
    }, [])

    const getTemplateMessage = (
        menuType: MenuType | "twibbon",
        namaPemesan: string,
        kementerian: string,
        pjNama: string
    ): string => {
        switch (menuType) {
            case "desain_publikasi":
                return `Halo Kak ${pjNama}, saya ${namaPemesan} dari ${kementerian} izin konfirmasi pemesanan *Desain & Publikasi* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih!`
            case "twibbon":
                return `Halo Kak ${pjNama}, saya ${namaPemesan} dari ${kementerian} izin konfirmasi pemesanan *Twibbon* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih!`
            case "website":
                return `Halo Kak ${pjNama}, saya ${namaPemesan} dari ${kementerian} izin konfirmasi pemesanan *Laman Website* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih!`
            case "bantuan_teknis":
                return `Halo Kak ${pjNama}, saya ${namaPemesan} dari ${kementerian} izin konfirmasi pemesanan *Bantuan Teknis* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih!`
            case "survey":
                return `Halo Kak ${pjNama}, saya ${namaPemesan} dari ${kementerian} izin konfirmasi pemesanan *Publikasi Survey* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih!`
            default:
                return `Halo Kak ${pjNama}, saya ${namaPemesan} dari ${kementerian} izin konfirmasi pemesanan yang sudah saya submit melalui form RISET & MEDIA. Terima kasih!`
        }
    }

    const getPlatformMessage = (namaPemesan: string, kementerian: string, pjNama: string, platformLabel: string): string => {
        return `Halo Kak ${pjNama}, saya ${namaPemesan} dari ${kementerian} izin konfirmasi pemesanan *Desain & Publikasi* untuk platform *${platformLabel}* yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih!`
    }

    const getWhatsAppContacts = () => {
        if (!submittedData || !pjData) return []

    const contacts: { label: string; nama: string; nomor: string; message: string; isIntern?: boolean; prokerLabel?: string }[] = []

        switch (submittedData.menu_type) {
            case "desain_publikasi": {
                // Check if the only platform is "Repost" → use PJ Publikasi instead of PJ Desain
                const platforms = submittedData.platform_publikasi || []
                const isRepostOnly = platforms.length === 1 && platforms[0] === "Repost"
                const hasRepost = platforms.includes("Repost")

                if (hasRepost && submittedData.tanggal_publikasi) {
                    // Convert tanggal_publikasi to Indonesian day name
                    const date = new Date(submittedData.tanggal_publikasi)
                    const dayIndex = date.getDay() // 0=Sunday
                    // Map JS getDay() to Indonesian days
                    const dayMap: Record<number, string> = {
                        0: "Minggu", 1: "Senin", 2: "Selasa", 3: "Rabu",
                        4: "Kamis", 5: "Jumat", 6: "Sabtu"
                    }
                    const dayName = dayMap[dayIndex]

                    if (dayName && pjData.publikasi[dayName]) {
                        const pjPub = pjData.publikasi[dayName]
                        contacts.push({
                            label: `PJ Publikasi (${dayName})`,
                            nama: pjPub.nama,
                            nomor: pjPub.nomor,
                            message: `Halo Kak ${pjPub.nama}, saya ${submittedData.nama} dari ${submittedData.kementerian} izin konfirmasi pemesanan *Repost* hari ${dayName} yang sudah saya submit melalui form RISET & MEDIA. Mohon ditindaklanjuti ya kak. Terima kasih!`
                        })
                    }
                }

                // If not repost-only, still show PJ Desain Grafis
                if (!isRepostOnly) {
                    const pjDesain = pjData.desainGrafis[submittedData.kementerian]
                    if (pjDesain?.nomor) {
                        contacts.push({
                            label: "PJ Desain Grafis",
                            nama: pjDesain.nama,
                            nomor: pjDesain.nomor,
                            message: getTemplateMessage("desain_publikasi", submittedData.nama, submittedData.kementerian, pjDesain.nama)
                        })
                    }
                }

                // Check for special platform PJs (exclude Repost from this check)
                if (submittedData.platform_publikasi && submittedData.platform_publikasi.length > 0) {
                    const addedPJs = new Set<string>() // Prevent duplicates

                    Object.entries(pjData.platformKhusus).forEach(([key, pjPlatform]) => {
                        const hasMatchingPlatform = pjPlatform.platforms.some(platform => 
                            submittedData.platform_publikasi?.includes(platform)
                        )
                        
                        if (hasMatchingPlatform && !addedPJs.has(key)) {
                            addedPJs.add(key)
                            const matchedPlatforms = pjPlatform.platforms.filter(p => 
                                submittedData.platform_publikasi?.includes(p)
                            )
                            contacts.push({
                                label: `PJ ${matchedPlatforms.join(" & ")}`,
                                nama: pjPlatform.nama,
                                nomor: pjPlatform.nomor,
                                message: getPlatformMessage(submittedData.nama, submittedData.kementerian, pjPlatform.nama, matchedPlatforms.join(" & "))
                            })
                        }
                    })
                }

                // Add intern desain PJs (if kementerian matches)
                const internDesainPJs = pjData.internDesain[submittedData.kementerian]
                if (internDesainPJs && internDesainPJs.length > 0) {
                    internDesainPJs.forEach((intern) => {
                        contacts.push({
                            label: "PJ Desain (Intern)",
                            nama: intern.nama,
                            nomor: intern.nomor,
                            message: getTemplateMessage("desain_publikasi", submittedData.nama, submittedData.kementerian, intern.nama),
                            isIntern: true,
                            prokerLabel: intern.proker,
                        })
                    })
                }
                break
            }
            case "website": {
                if (submittedData.website_sub_type === "twibbon") {
                    const kemenko = KEMENTERIAN_TO_KEMENKO[submittedData.kementerian]
                    const pjTwibbon = (kemenko && pjData.twibbon?.[kemenko])
                        || pjData.twibbon?.[submittedData.kementerian]
                        || pjData.website[submittedData.kementerian]
                    if (pjTwibbon?.nomor) {
                        contacts.push({
                            label: `PJ Twibbon${kemenko ? ` (${kemenko})` : ""}`,
                            nama: pjTwibbon.nama,
                            nomor: pjTwibbon.nomor,
                            message: getTemplateMessage("twibbon", submittedData.nama, submittedData.kementerian, pjTwibbon.nama)
                        })
                    }
                } else {
                    const pjWebsite = pjData.website[submittedData.kementerian]
                    if (pjWebsite?.nomor) {
                        contacts.push({
                            label: "PJ Website",
                            nama: pjWebsite.nama,
                            nomor: pjWebsite.nomor,
                            message: getTemplateMessage("website", submittedData.nama, submittedData.kementerian, pjWebsite.nama)
                        })
                    }
                }

                // Add intern website PJs (if kementerian matches)
                const internWebPJs = pjData.internWebsite[submittedData.kementerian]
                if (internWebPJs && internWebPJs.length > 0) {
                    internWebPJs.forEach((intern) => {
                        contacts.push({
                            label: "PJ Website (Intern)",
                            nama: intern.nama,
                            nomor: intern.nomor,
                            message: getTemplateMessage(
                                submittedData.website_sub_type === "twibbon" ? "twibbon" : "website",
                                submittedData.nama, submittedData.kementerian, intern.nama
                            ),
                            isIntern: true,
                            prokerLabel: intern.proker,
                        })
                    })
                }
                break
            }
            case "bantuan_teknis": {
                const pjKey = submittedData.jenis_bantuan 
                    ? getPJForBantuanTeknis(submittedData.jenis_bantuan) 
                    : "A"
                const pjTeknis = pjData.bantuanTeknis[pjKey]
                if (pjTeknis?.nomor) {
                    contacts.push({
                        label: "PJ Bantuan Teknis",
                        nama: pjTeknis.nama,
                        nomor: pjTeknis.nomor,
                        message: getTemplateMessage("bantuan_teknis", submittedData.nama, submittedData.kementerian, pjTeknis.nama)
                    })
                }
                break
            }
            case "survey": {
                if (pjData.survey?.nomor) {
                    contacts.push({
                        label: "PJ Survey",
                        nama: pjData.survey.nama,
                        nomor: pjData.survey.nomor,
                        message: getTemplateMessage("survey", submittedData.nama, submittedData.kementerian, pjData.survey.nama)
                    })
                }
                break
            }
        }

        return contacts
    }

    const contacts = getWhatsAppContacts()

    const getMenuLabel = () => {
        if (submittedData?.menu_type === "website" && submittedData.website_sub_type === "twibbon") {
            return "Twibbon"
        }
        switch (submittedData?.menu_type) {
            case "desain_publikasi": return "Desain & Publikasi"
            case "website": return "Laman Website"
            case "bantuan_teknis": return "Bantuan Teknis"
            case "survey": return "Survey"
            default: return ""
        }
    }

    return (
        <div className="text-center py-12 space-y-6 animate-in zoom-in duration-500">
            <div className="flex justify-center"> 
                <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Pesanan Berhasil Dikirim!</h2>
                {submittedData && (
                    <p className="text-sm text-primary font-medium">
                        Jenis Layanan: {getMenuLabel()}
                    </p>
                )}
                <p className="text-gray-500 max-w-md mx-auto">
                    Terima kasih. Silakan hubungi PJ terkait via WhatsApp untuk konfirmasi lebih lanjut, dan doakan admin sehat selalu :)
                </p>
            </div>

            {isLoadingPJ ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : contacts.length > 0 ? (
                <div className="space-y-3 max-w-md mx-auto">
                    <p className="text-sm text-gray-600 font-medium">Hubungi PJ via WhatsApp:</p>
                    <div className="grid gap-3">
                        {contacts.map((contact, index) => (
                            <a
                                key={index}
                                href={getWhatsAppLink(contact.nomor, contact.message)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <Button 
                                    type="button"
                                    className={`w-full justify-start gap-3 text-white py-6 px-4 text-base rounded-xl transition-all shadow-xs ${
                                        contact.isIntern
                                            ? 'bg-amber-500 hover:bg-amber-600 border border-amber-600/30'
                                            : 'bg-green-600 hover:bg-green-700'
                                    }`}
                                >
                                    <MessageCircle className="w-5 h-5 shrink-0" />
                                    <div className="flex flex-col items-start text-left min-w-0">
                                        <span className="font-semibold text-sm sm:text-base leading-tight">Chat {contact.nama} - {contact.label}</span>
                                        {contact.isIntern && contact.prokerLabel && (
                                            <span className="text-xs text-amber-100 font-medium mt-0.5">Khusus Proker: {contact.prokerLabel}</span>
                                        )}
                                    </div>
                                </Button>
                            </a>
                        ))}
                    </div>
                </div>
            ) : submittedData && (
                <div className="space-y-3 max-w-md mx-auto">
                    <p className="text-sm text-yellow-600 font-medium">
                        PJ untuk kementerian Anda belum tersedia. Silakan hubungi admin.
                    </p>
                </div>
            )}

            <Button onClick={onReset} className="mt-6" variant="outline">
                Buat Pesanan Baru
            </Button>
        </div>
    )
}
