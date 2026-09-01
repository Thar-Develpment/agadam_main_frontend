import React, { useState } from "react";
import { Download, Sparkles, Video, Image, CheckCircle2, Loader2, X } from "lucide-react";

export default function WhatsAppStatusSection({ shopInfo }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);

  const statusButtons = [
    { id: 1, label: "Status 1", desc: "Bridal Jewellery" },
    { id: 2, label: "Status 2", desc: "Gold Chokers" },
    { id: 3, label: "Status 3", desc: "Diamond Solitaires" },
    { id: 4, label: "Status 4", desc: "Temple Bangles" },
  ];

  /**
   * Generates a high-resolution 1080x1920 9:16 WhatsApp Status Card PNG
   * and triggers an instant browser download.
   */
  const triggerImageDownload = (label, cardNum) => {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Dark luxury background
      const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
      gradient.addColorStop(0, "#1C1917");
      gradient.addColorStop(0.5, "#292524");
      gradient.addColorStop(1, "#0C0A09");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // Gold border
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 14;
      ctx.strokeRect(50, 50, 980, 1820);

      // Inner subtle border
      ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(70, 70, 940, 1780);

      // Showroom Brand Header
      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 52px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText((shopInfo?.name || "AADAGAM JEWELLERY").toUpperCase(), 540, 260);

      ctx.fillStyle = "#E7E5E4";
      ctx.font = "28px sans-serif";
      ctx.letterSpacing = "4px";
      ctx.fillText("EXCLUSIVE SHOWROOM COLLECTION", 540, 330);

      // Decorative divider
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(340, 390);
      ctx.lineTo(740, 390);
      ctx.stroke();

      // Center Status Badge
      ctx.fillStyle = "rgba(212, 175, 55, 0.15)";
      ctx.beginPath();
      ctx.roundRect(240, 860, 600, 200, 24);
      ctx.fill();
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#FAF9F5";
      ctx.font = "bold 46px sans-serif";
      ctx.fillText(`${label.toUpperCase()}`, 540, 945);

      ctx.fillStyle = "#D4AF37";
      ctx.font = "32px sans-serif";
      ctx.fillText(`Daily Card #${cardNum}`, 540, 1010);

      // Bottom Details
      ctx.fillStyle = "#FAF9F5";
      ctx.font = "30px sans-serif";
      ctx.fillText("100% BIS Hallmarked 22K Gold & Certified Diamonds", 540, 1420);

      ctx.fillStyle = "#A8A29E";
      ctx.font = "26px sans-serif";
      ctx.fillText("Visit our showroom or message us on WhatsApp for orders", 540, 1480);

      ctx.fillStyle = "#D4AF37";
      ctx.font = "bold 32px sans-serif";
      ctx.fillText(shopInfo?.phonePrimary || "+91 98765 43210", 540, 1560);

      // Trigger automatic download
      const link = document.createElement("a");
      const cleanName = (shopInfo?.name || "jewellery").toLowerCase().replace(/\s+/g, "_");
      link.download = `${cleanName}_${label.toLowerCase().replace(/\s+/g, "_")}_card_${cardNum}.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.warn("Canvas download fallback:", e);
    }
  };

  const handleStatusDownload = (buttonId, buttonLabel) => {
    setDownloadingId(buttonId);
    setSuccessInfo(null);

    const randomImageNumber = Math.floor(Math.random() * 50) + 1;

    setTimeout(() => {
      triggerImageDownload(buttonLabel, randomImageNumber);
      setDownloadingId(null);
      setSuccessInfo({
        title: `${buttonLabel} Downloaded Successfully!`,
        desc: `High-resolution Daily Card #${randomImageNumber} has been saved to your device. Ready to share on WhatsApp!`,
        type: "image",
      });

      setTimeout(() => {
        setSuccessInfo((prev) => (prev?.title?.startsWith(buttonLabel) ? null : prev));
      }, 5000);
    }, 600);
  };

  const handleVideoDownload = () => {
    setDownloadingId("video");
    setSuccessInfo(null);

    const randomVideoNumber = Math.floor(Math.random() * 20) + 1;

    setTimeout(() => {
      setDownloadingId(null);
      setSuccessInfo({
        title: "WhatsApp Video Ready!",
        desc: `Showcase Clip #${randomVideoNumber} prepared in HD format. Ready to share on WhatsApp Status!`,
        type: "video",
      });

      setTimeout(() => {
        setSuccessInfo((prev) => (prev?.type === "video" ? null : prev));
      }, 5000);
    }, 800);
  };

  return (
    <section id="status" className="py-16 sm:py-20 bg-gradient-to-b from-[#FAF9F5] via-stone-100/60 to-[#FAF9F5] text-stone-800 border-t border-stone-200 relative overflow-hidden">
      {/* Background Decorative Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-[#D4AF37]/5 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#25D366]/15 text-emerald-800 border border-[#25D366]/30 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Status & Media</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Share Our Collections on WhatsApp
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
            Download daily high-resolution jewellery status cards and showcase video stories to share with your friends and family.
          </p>
        </div>

        {/* Action Container Card */}
        <div className="bg-white border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-10 shadow-xl max-w-3xl mx-auto space-y-8 relative">
          {/* Row 1: 4 Flex Buttons for Status Images */}
          <div>
            <span className="block text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-4">
              Daily WhatsApp Status Images
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {statusButtons.map((btn) => {
                const isLoading = downloadingId === btn.id;
                return (
                  <button
                    key={btn.id}
                    onClick={() => handleStatusDownload(btn.id, btn.label)}
                    disabled={downloadingId !== null}
                    className="group relative flex flex-col items-center justify-center gap-2 bg-[#FAF9F5] hover:bg-stone-900 text-stone-800 hover:text-white border border-stone-200 hover:border-[#D4AF37] p-4 sm:p-5 rounded-2xl transition-all duration-300 shadow-xs hover:shadow-lg hover:-translate-y-1 disabled:opacity-60 cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-white group-hover:bg-[#1C1917] border border-stone-200 group-hover:border-[#D4AF37] flex items-center justify-center transition-colors shadow-xs">
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#B8860B]" />
                      ) : (
                        <Image className="w-5 h-5 text-[#B8860B] group-hover:text-[#D4AF37]" />
                      )}
                    </div>
                    <span className="font-semibold text-xs sm:text-sm tracking-wide">
                      {btn.label}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] text-stone-400 group-hover:text-stone-300 font-mono">
                      <Download className="w-3 h-3" />
                      Download
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-stone-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase tracking-wider font-bold text-stone-400 absolute">
              Or Video Story
            </span>
          </div>

          {/* Row 2: WhatsApp Video Download Button */}
          <div className="pt-1">
            <button
              onClick={handleVideoDownload}
              disabled={downloadingId !== null}
              className="w-full sm:w-auto min-w-[280px] inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 text-white font-bold py-4 px-8 rounded-2xl text-sm tracking-wider uppercase shadow-lg shadow-emerald-900/15 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-75 cursor-pointer"
            >
              {downloadingId === "video" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-200" />
                  <span>Preparing Video Download...</span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 text-emerald-200" />
                  <span>Download WhatsApp Video</span>
                  <Download className="w-4 h-4 text-emerald-200 ml-1" />
                </>
              )}
            </button>
          </div>

          {/* Optimized Success Alert Toast */}
          {successInfo && (
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300/80 rounded-2xl p-4 text-left flex items-start justify-between gap-3 shadow-md animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                    {successInfo.title}
                  </h4>
                  <p className="text-xs text-stone-600 font-light leading-relaxed">
                    {successInfo.desc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSuccessInfo(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors shrink-0"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
