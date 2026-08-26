import React, { useState } from "react";
import { X, QrCode, Copy, Check, ExternalLink, Download } from "lucide-react";

export default function QRCodeModal({ isOpen, onClose, shopInfo }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const qrData = shopInfo?.qrCode || {
    imageUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://agadamjewellery.com&color=1c1917&bgcolor=faf9f6",
    title: "Scan to Visit Our Digital Store",
    subtitle: "Share our website easily with friends & family",
    websiteUrl: "https://agadamjewellery.com",
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrData.websiteUrl || window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
      <div 
        className="bg-[#FAF9F5] border border-[#D4AF37]/30 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 p-2 rounded-full transition-colors"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D4AF37]/10 text-[#B8860B] mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            {qrData.title}
          </h3>
          <p className="text-sm text-stone-600 mt-1">
            {qrData.subtitle}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col items-center shadow-inner mb-6">
          <img
            src={qrData.imageUrl}
            alt="Website QR Code"
            className="w-52 h-52 object-contain rounded-lg gold-border-glow"
          />
          <div className="mt-3 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#B8860B] bg-[#D4AF37]/10 px-3 py-1 rounded-full">
              Official Digital Catalogue
            </span>
          </div>
        </div>

        {/* Website URL display & copy action */}
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-stone-100 border border-stone-200 rounded-lg p-2.5 text-xs text-stone-700">
            <span className="truncate font-mono mr-2">{qrData.websiteUrl}</span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 bg-[#D4AF37] hover:bg-[#B8860B] text-white px-3 py-1.5 rounded-md font-medium text-xs transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy
                </>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <a
              href={qrData.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Open Website
            </a>
            <a
              href={qrData.imageUrl}
              download="Agadam_Jewellery_QR.png"
              className="inline-flex items-center justify-center gap-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
              title="Download QR Image"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
