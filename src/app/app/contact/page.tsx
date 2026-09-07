"use client";

import { Instagram } from "lucide-react";
import Image from "next/image";

export default function Contact() {
  return (
    <div className="flex flex-col min-h-full px-6 py-8 md:py-12 max-w-md mx-auto w-full gap-6 pb-24 items-center justify-center">
      
      <div className="w-full bg-white border border-slate-200 shadow-sm rounded-[2rem] p-8 text-center flex flex-col items-center relative overflow-hidden">
        
        {/* Subtle pattern background for the card just like QR page */}
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        {/* Avatar */}
        <div className="relative mb-5 z-10">
           <div className="h-24 w-24 rounded-full border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center shadow-sm">
             <Image 
               src="/Adminn.jpg" 
               alt="Admin" 
               width={96} 
               height={96}
               className="h-full w-full object-cover"
               onError={(e) => {
                 e.currentTarget.style.display = 'none';
                 const span = document.createElement('span');
                 span.className = 'text-xl font-bold text-slate-400 tracking-wider';
                 span.innerText = 'NK';
                 e.currentTarget.parentElement?.appendChild(span);
               }}
             />
           </div>
        </div>

        {/* Text */}
        <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1 relative z-10">
          Developer & Admin
        </h2>
        
        <div className="flex flex-col gap-0.5 mb-6 relative z-10">
          <span className="text-sm font-semibold text-slate-700">
            Kementerian Media Komunikasi
          </span>
          <span className="text-xs font-medium text-slate-500">
            Direktorat Jenderal Website
          </span>
        </div>

        <p className="text-slate-500 text-xs mb-8 leading-relaxed max-w-[250px] mx-auto relative z-10">
          Menemukan bug atau punya pertanyaan seputar aplikasi? Jangan ragu untuk menghubungi kami.
        </p>

        {/* Button */}
        <a
          href="https://www.instagram.com/nakomisme/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-4 rounded-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold shadow-[0_8px_20px_rgba(124,58,237,0.3)] transition-all flex items-center justify-center gap-2 relative z-10"
        >
          <Instagram className="h-5 w-5" /> Laporkan Kendala
        </a>
        
      </div>
      
    </div>
  );
}
