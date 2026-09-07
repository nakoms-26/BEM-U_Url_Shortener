"use client";

import React, { useEffect, useRef, useState } from "react";
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

export default function QRCodeGeneratorPage() {
  const [url, setUrl] = useState("https://unsoed.link");
  const [qrColor, setQrColor] = useState("#0f172a");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoName, setLogoName] = useState("");
  const [logoSizeMultiplier, setLogoSizeMultiplier] = useState(0.4);

  // Style Options
  type DotType = "dots" | "rounded" | "classy" | "classy-rounded" | "square" | "extra-rounded";
  const [dotsType, setDotsType] = useState<DotType>("square");
  const [cornerType, setCornerType] = useState<"square" | "extra-rounded" | "dot">("square");

  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<any>(null); // For QRCodeStyling instance

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.origin) {
      setUrl((prev) => (prev === "https://unsoed.link" ? window.location.origin : prev));
    }

    // Import dynamically to avoid SSR window errors
    import("qr-code-styling").then((module) => {
      const QRCodeStyling = module.default;
      qrCodeInstance.current = new QRCodeStyling({
        width: 280,
        height: 280,
        type: "svg",
        data: url || "https://unsoed.link",
        margin: 5,
        qrOptions: { typeNumber: 0, mode: "Byte", errorCorrectionLevel: "H" },
        imageOptions: { hideBackgroundDots: true, imageSize: logoSizeMultiplier, margin: 5, crossOrigin: "anonymous" },
        dotsOptions: { type: "square", color: "#0f172a" },
        backgroundOptions: { color: "#ffffff00" }, // transparent
        cornersSquareOptions: { type: "square", color: "#0f172a" },
      });

      if (qrRef.current) {
        qrRef.current.innerHTML = "";
        qrCodeInstance.current.append(qrRef.current);
      }
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, []); // Initialize once

  // Update QR code when props change
  useEffect(() => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.update({
        data: url || "https://unsoed.link",
        image: logoUrl,
        dotsOptions: { type: dotsType, color: qrColor },
        cornersSquareOptions: { type: cornerType, color: qrColor },
        cornersDotOptions: { type: cornerType === "extra-rounded" ? "dot" : "square", color: qrColor },
        imageOptions: { hideBackgroundDots: true, imageSize: logoSizeMultiplier, margin: 5, crossOrigin: "anonymous" }
      });
    }
  }, [url, qrColor, logoUrl, dotsType, cornerType, logoSizeMultiplier]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoUrl("");
    setLogoName("");
  };

  const downloadQRCode = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({ name: "BEM-QRCode", extension: "png" });
    }
  };

  return (
    <div className="flex flex-col min-h-full px-6 py-8 md:py-12 max-w-md mx-auto w-full gap-6 pb-24">
      {/* Input Section */}
      <div className="flex flex-col gap-4">

        {/* URL Input */}
        <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm focus-within:ring-2 focus-within:ring-violet-500/20 focus-within:border-violet-500 transition-all">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Target URL</label>
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

          {/* Style Pattern */}
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm flex flex-col">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Gaya Pattern</label>
            <select
              value={dotsType}
              onChange={(e) => setDotsType(e.target.value as DotType)}
              className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="square">Kotak Klasik</option>
              <option value="dots">Titik-Titik</option>
              <option value="rounded">Rounded</option>
              <option value="classy">Classy</option>
              <option value="classy-rounded">Classy Rounded</option>
              <option value="extra-rounded">Extra Rounded</option>
            </select>
          </div>

          {/* Style Corner */}
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm flex flex-col">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Sudut Mata</label>
            <select
              value={cornerType}
              onChange={(e) => setCornerType(e.target.value as any)}
              className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-2 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="square">Kotak Klasik</option>
              <option value="extra-rounded">Membulat</option>
              <option value="dot">Titik (Dot)</option>
            </select>
          </div>

          {/* Logo Upload */}
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm flex flex-col">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Logo Tengah</label>
            <div className="relative overflow-hidden w-full h-11 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-center border border-slate-200 cursor-pointer">
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
              <div className="mt-2.5 flex flex-col gap-2">
                <div className="text-[10px] text-slate-500 flex items-center justify-between px-1">
                  <span className="truncate w-2/3 text-left font-medium">{logoName}</span>
                  <button onClick={removeLogo} className="text-red-500 font-semibold hover:underline relative z-20">Hapus</button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold tracking-widest text-slate-400">SIZE</span>
                  <input
                    type="range" min="0.1" max="0.4" step="0.05"
                    value={logoSizeMultiplier}
                    onChange={(e) => setLogoSizeMultiplier(parseFloat(e.target.value))}
                    className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                </div>
                <span className="text-[8px] text-slate-400 leading-tight text-center">Ukuran logo dibatasi maks 40% agar QR tetap bisa di-scan.</span>
              </div>
            )}
          </div>

          {/* Color Picker */}
          <div className="bg-white border border-slate-200 rounded-[1.5rem] p-4 shadow-sm flex flex-col">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Warna QR</label>
            <div className="w-full flex-1 flex flex-col justify-center">
              <ColorPicker value={qrColor} onValueChange={setQrColor}>
                <ColorPickerTrigger className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center px-3 gap-3 ring-2 ring-offset-2 ring-transparent focus:ring-violet-500 transition-all cursor-pointer hover:bg-slate-100">
                  <ColorPickerSwatch className="w-5 h-5 rounded-md shadow-inner border border-slate-200/50" />
                  <span className="text-xs font-semibold text-slate-700 font-mono uppercase">{qrColor}</span>
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
      <div className="mt-2 flex flex-col items-center gap-6">
        <div className="w-full aspect-square bg-white border border-slate-200 shadow-sm rounded-[2rem] flex items-center justify-center p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
          <div ref={qrRef} className="relative z-10 w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-[280px]"></div>
        </div>

        <button
          onClick={downloadQRCode}
          className="w-full py-4 rounded-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" /> Download QR Code
        </button>
      </div>
    </div>
  );
}
