"use client";

import React, { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { GlassButton } from "@/components/ui/glass-button";
import { Download } from "lucide-react";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/ui/color-picker";
import { GlassCard } from "@/components/ui/glass-card";

export default function QRCodeGeneratorPage() {
  const [url, setUrl] = useState("https://unsoed.link");
  const [qrColor, setQrColor] = useState("#ffffff");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoSize, setLogoSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [logoName, setLogoName] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setUrl((prev) => (prev === "https://unsoed.link" ? window.location.origin : prev));
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = String(reader.result ?? "");
      setLogoUrl(imageUrl);

      const image = new Image();
      image.onload = () => {
        const maxSize = 0.25 * 180; // Maksimal salah satu sisi logo adalah 25% dari ukuran QR Code (180x180)
        const scale = Math.min(
          maxSize / image.naturalWidth,
          maxSize / image.naturalHeight,
          1,
        );

        setLogoSize({
          width: Math.round(image.naturalWidth * scale * 1.5),
          height: Math.round(image.naturalHeight * scale * 1.5),
        });
      };
      image.src = imageUrl;
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoUrl("");
    setLogoSize(null);
    setLogoName("");
  };

  // Fungsi untuk mengunduh QR Code sebagai gambar PNG
  const downloadQRCode = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (canvas) {
      const pngUrl = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      const downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "BEM-QRCode.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="relative flex min-h-screen items-start sm:items-center justify-center p-4 pt-10 sm:pt-4 overflow-hidden font-sans">
      <div className="absolute inset-0 z-10 bg-zinc-50/0 pointer-events-none" />{" "}
      {/* Kamu bisa ganti div ini dengan <GlassCard> milikmu */}
      <main className="w-full max-w-sm  ">
        <GlassCard className="my-auto w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-5 sm:p-8 lg:mb-25">
          <h1 className="text-xl sm:text-2xl font-bold text-center mb-5 sm:mb-6 text-white">
            Generate QR Code
          </h1>

          <div className="space-y-5 sm:space-y-6">
            <div className="flex flex-col gap-3">
              {/* Input URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  URL
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-white/6 border border-white/10 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  placeholder="https://unsoed.link"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="flex flex-row gap-10">
                {/* Input Logo (upload) */}
                <div className="w-1/2 justify-start flex flex-col">
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Logo (Opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className=" text-sm text-white file:bg-transparent file:border file:border-white/10 file:px-3 file:py-2 rounded-lg cursor-pointer"
                    onChange={handleLogoUpload}
                  />
                  {logoUrl && (
                    <div className="mt-3 flex items-center gap-3">
                      {/* <img
                      src={logoUrl}
                      alt="logo preview"
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-md object-cover border border-white/10"
                    /> */}
                      <div className="flex-1">
                        <div className="text-sm text-white/90">{logoName}</div>
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="text-sm text-cyan-300 underline mt-1"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {/* Input Warna */}
                <div className="md:max-w-30">
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Warna QR Code
                  </label>
                  <div className="flex items-center gap-3">
                    <ColorPicker value={qrColor} onValueChange={setQrColor}>
                      <ColorPickerTrigger className="w-16 h-10 rounded-lg overflow-hidden border-0 p-0 flex items-center justify-center bg-transparent">
                        <ColorPickerSwatch className="w-full h-full rounded-lg" />
                      </ColorPickerTrigger>
                      <ColorPickerContent side="bottom">
                        <ColorPickerArea />
                        <ColorPickerEyeDropper />
                        <ColorPickerHueSlider />
                        <ColorPickerFormatSelect />
                        <ColorPickerInput />
                      </ColorPickerContent>
                    </ColorPicker>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Hasil QR Code */}
          {url && (
            <div className="mt-5 sm:mt-6 flex flex-col items-center space-y-4">
              <div className="w-full flex items-center justify-center">
                <div ref={qrRef} className="rounded-lg">
                  <QRCodeCanvas
                    value={url}
                    size={180}
                    bgColor={"#ffffff00"} // Transparan background
                    fgColor={qrColor}
                    level={"H"} // Level Error Correction 'H' (High) wajib jika pakai logo
                    includeMargin={false}
                    imageSettings={
                      logoUrl && logoSize
                        ? {
                            src: logoUrl,
                            x: undefined,
                            y: undefined,
                            height: logoSize.height,
                            width: logoSize.width,
                            excavate: true, // Membuat area kosong di tengah untuk logo
                          }
                        : undefined
                    }
                  />
                </div>
              </div>

              <GlassButton className="lg:mt-3" onClick={downloadQRCode}>
                Download PNG <Download className="ml-2" />
              </GlassButton>
            </div>
          )}
        </GlassCard>
      </main>
    </div>
  );
}
