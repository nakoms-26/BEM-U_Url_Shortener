"use client";

import React, { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download, Upload, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [qrColor, setQrColor] = useState("#0f172a");
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
    <div className="flex flex-col min-h-full px-6 py-8 md:py-12 max-w-md mx-auto w-full gap-6 pb-24">
      
      {/* Input Section */}
      <div className="flex flex-col gap-4">
        
        {/* URL Input */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Target URL
          </label>
          <input
            type="text"
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none"
            placeholder="https://nakoms.id/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Logo Upload */}
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm flex flex-col justify-between">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              Logo Tengah
            </label>
            <div className="relative overflow-hidden w-full h-11 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center border border-slate-200">
               <input
                 type="file"
                 accept="image/*"
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                 onChange={handleLogoUpload}
               />
               <span className="text-xs font-semibold text-slate-600 flex items-center gap-2">
                 {logoUrl ? <ImageIcon className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                 {logoUrl ? "Ganti Logo" : "Upload"}
               </span>
            </div>
            {logoUrl && (
              <div className="mt-2.5 text-[10px] text-center text-slate-500 flex items-center justify-between px-1">
                 <span className="truncate w-2/3 text-left font-medium">{logoName}</span>
                 <button onClick={removeLogo} className="text-red-500 font-semibold hover:underline relative z-20">Hapus</button>
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm flex flex-col justify-between">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
              Warna QR
            </label>
            <div className="w-full flex justify-center pb-1">
              <ColorPicker value={qrColor} onValueChange={setQrColor}>
                <ColorPickerTrigger className="w-11 h-11 rounded-full shadow-inner border border-slate-200/50 p-0 flex items-center justify-center bg-transparent ring-2 ring-offset-2 ring-transparent focus:ring-violet-500 transition-all">
                  <ColorPickerSwatch className="w-full h-full rounded-full" />
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

      {/* QR Code Result & Download */}
      {url && (
        <div className="mt-2 flex flex-col items-center gap-6">
          <div className="w-full aspect-square bg-white border border-slate-200 shadow-sm rounded-[2rem] flex items-center justify-center p-8 relative overflow-hidden">
             {/* Subtle pattern background for the card */}
             <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
             
             <div ref={qrRef} className="relative z-10 w-full h-full flex items-center justify-center">
               <QRCodeCanvas
                 value={url}
                 size={240}
                 bgColor={"#ffffff00"}
                 fgColor={qrColor}
                 level={"H"}
                 includeMargin={false}
                 style={{ width: "100%", height: "auto", maxWidth: "240px" }}
                 imageSettings={
                   logoUrl && logoSize
                     ? {
                         src: logoUrl,
                         x: undefined,
                         y: undefined,
                         height: logoSize.height,
                         width: logoSize.width,
                         excavate: true,
                       }
                     : undefined
                 }
               />
             </div>
          </div>
          
          <button
            onClick={downloadQRCode}
            className="w-full py-4 rounded-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" /> Download QR Code
          </button>
        </div>
      )}
    </div>
  );
}
