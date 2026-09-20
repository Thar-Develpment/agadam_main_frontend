import React, { useState, useEffect } from "react";
import { TrendingUp, Sparkles, ShieldCheck, Scale, Coins, Award, CheckCircle2 } from "lucide-react";
import { getSiteInfo } from "../services/api";

export default function GoldRateSection({ shopInfo }) {
  // Base rates per 1 gram (initialized with benchmark rates, updated via backend /user/site_info)
  const [rates, setRates] = useState({
    gold: {
      purity: "22K (916 BIS)",
      name: "22 Karat Standard Gold",
      desc: "Traditional & Bridal Jewellery",
      pricePerGram: 7195,
      change: "+ ₹20",
      isUp: true,
      hallmark: "BIS 916 Hallmarked",
      isFeatured: true,
      material: "gold",
    },
    silver: {
      purity: "Fine Silver (999)",
      name: "Pure 999 Fine Silver",
      desc: "Minted Silver Coins & Bullion Bars",
      pricePerGram: 94.5,
      change: "+ ₹0.50",
      isUp: true,
      hallmark: "99.9% Pure Silver",
      material: "silver",
    },
  });

  useEffect(() => {
    async function fetchLivePrices() {
      try {
        const res = await getSiteInfo();
        if (res && res.success === 1 && Array.isArray(res.priceData) && res.priceData.length > 0) {
          setRates((prevRates) => {
            const updated = { ...prevRates };
            res.priceData.forEach((item) => {
              const mat = (item.material || "").toLowerCase();
              const purity = (item.purity || "").toLowerCase();
              const priceNum = Number(item.price);

              if (!isNaN(priceNum) && priceNum > 0) {
                if (mat === "gold") {
                  if (purity.includes("22") || purity.includes("916") || !updated.gold.pricePerGram) {
                    updated.gold = {
                      ...updated.gold,
                      pricePerGram: priceNum,
                      purity: item.purity || updated.gold.purity,
                      change: item.change || updated.gold.change,
                    };
                  }
                } else if (mat === "silver") {
                  if (purity.includes("999") || purity.includes("925") || !updated.silver.pricePerGram) {
                    updated.silver = {
                      ...updated.silver,
                      pricePerGram: priceNum,
                      purity: item.purity || updated.silver.purity,
                      change: item.change || updated.silver.change,
                    };
                  }
                }
              }
            });
            return updated;
          });
        }
      } catch (err) {
        console.warn("Using default benchmark gold/silver rates:", err);
      }
    }
    fetchLivePrices();
  }, []);

  const formatPrice = (pricePerGram) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: pricePerGram % 1 === 0 ? 0 : 2,
    }).format(pricePerGram);
  };

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <section id="rates" className="py-16 sm:py-20 bg-[#FAF9F5] text-stone-800 border-t border-stone-200 relative overflow-hidden text-left">
      {/* Background Ambient Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 pb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 text-[#B8860B] border border-[#D4AF37]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Bullion Market Rates</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Today's Gold & Silver Rate
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm font-light mt-1">
              Official showroom bullion rates in {shopInfo?.city || "your city"} for {todayStr}.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-stone-700 bg-stone-100/90 px-4 py-2 rounded-2xl border border-stone-200 shadow-xs">
            <Award className="w-4 h-4 text-[#B8860B]" />
            <span>100% Certified Purity Guaranteed</span>
          </div>
        </div>

        {/* Two Realistic Metallic Bullion Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* 1. REALISTIC GOLD BULLION CARD (GOLD COLOR BACKGROUND) */}
          <div className="group relative rounded-3xl p-7 sm:p-8 bg-gradient-to-br from-[#FFF9E6] via-[#FCE49C] via-[#E6B325] to-[#B8860B] text-[#361302] border-2 border-[#D4AF37] shadow-[0_20px_45px_rgba(212,175,55,0.35)] hover:shadow-[0_25px_55px_rgba(212,175,55,0.45)] hover:border-[#FFF1BD] transition-all duration-500 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
            {/* Specular Radial Gold Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(circle_at_70%_20%,_rgba(255,255,255,0.5),_transparent_65%)] pointer-events-none" />

            {/* Custom 3D CSS Gold Bullion Medallion */}
            <div className="absolute top-6 right-6 pointer-events-none z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#78590F] via-[#D4AF37] to-[#FFF6D4] p-1 shadow-[0_10px_20px_rgba(69,45,3,0.5),_inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center transform group-hover:rotate-6 group-hover:scale-105 transition-all duration-500">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#523C07] via-[#D4AF37] to-[#FFF9E6] border border-[#FFECA6] flex flex-col items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.4)]">
                  <Sparkles className="w-5 h-5 text-[#302303] filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" />
                  <span className="font-serif text-[10px] sm:text-[11px] font-black text-[#261B02] tracking-tight filter drop-shadow-[0_1px_0_rgba(255,245,210,0.9)] mt-0.5">
                    22K GOLD
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 relative z-10 pr-24 sm:pr-28">
              {/* Header Badge & Purity */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-[#FEF3C7] bg-[#78350F] border border-[#92400E] shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#FDE68A]" />
                  {rates.gold.purity}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md text-emerald-100 bg-emerald-900 border border-emerald-700 shadow-sm">
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                  {rates.gold.change}
                </span>
              </div>

              {/* Title & Description */}
              <div className="pt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#78350F] block mb-1">
                  FINE GOLD BULLION
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#361302] tracking-tight filter drop-shadow-xs">
                  {rates.gold.name}
                </h3>
                <p className="text-xs text-[#573A07] font-semibold mt-1">
                  {rates.gold.desc}
                </p>
              </div>

              {/* Price Display */}
              <div className="pt-4 border-t border-[#78350F]/20">
                <span className="text-[11px] uppercase font-mono font-extrabold text-[#78350F] tracking-widest block">
                  PER 1 GRAM RATE
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-4xl sm:text-5xl font-black text-[#2B0E01] tracking-tight filter drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]">
                    {formatPrice(rates.gold.pricePerGram)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer Hallmark Certification */}
            <div className="pt-4 mt-6 border-t border-[#78350F]/20 flex items-center justify-between text-xs font-mono font-bold text-[#361302] relative z-10">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#78350F]" />
                <span>{rates.gold.hallmark}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-sans text-[#FEF3C7] bg-[#522409] px-2.5 py-1 rounded-md border border-[#78350F] font-semibold shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Showroom Benchmark
              </span>
            </div>
          </div>

          {/* 2. REALISTIC SILVER BULLION CARD (SILVER COLOR BACKGROUND) */}
          <div className="group relative rounded-3xl p-7 sm:p-8 bg-gradient-to-br from-[#FFFFFF] via-[#F1F5F9] via-[#CBD5E1] to-[#64748B] text-[#0F172A] border-2 border-[#94A3B8] shadow-[0_20px_45px_rgba(148,163,184,0.3)] hover:shadow-[0_25px_55px_rgba(148,163,184,0.4)] hover:border-[#FFFFFF] transition-all duration-500 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
            {/* Specular Radial Silver Glow */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[radial-gradient(circle_at_70%_20%,_rgba(255,255,255,0.8),_transparent_65%)] pointer-events-none" />

            {/* Custom 3D CSS Silver Ingot Medallion */}
            <div className="absolute top-6 right-6 pointer-events-none z-10">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#475569] via-[#CBD5E1] to-[#FFFFFF] p-1 shadow-[0_10px_20px_rgba(15,23,42,0.4),_inset_0_2px_4px_rgba(255,255,255,0.9)] flex items-center justify-center transform group-hover:-rotate-6 group-hover:scale-105 transition-all duration-500">
                <div className="w-full h-full rounded-xl bg-gradient-to-tr from-[#334155] via-[#E2E8F0] to-[#FFFFFF] border border-[#F8FAFC] flex flex-col items-center justify-center shadow-[inset_0_2px_6px_rgba(0,0,0,0.3)]">
                  <Coins className="w-5 h-5 text-slate-800 filter drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]" />
                  <span className="font-serif text-[10px] sm:text-[11px] font-black text-slate-900 tracking-tight filter drop-shadow-[0_1px_0_rgba(255,255,255,0.9)] mt-0.5">
                    999 SILVER
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 relative z-10 pr-24 sm:pr-28">
              {/* Header Badge & Purity */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-[#F8FAFC] bg-[#1E293B] border border-[#334155] shadow-sm">
                  <Coins className="w-3.5 h-3.5 text-slate-300" />
                  {rates.silver.purity}
                </span>

                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-md text-emerald-100 bg-emerald-900 border border-emerald-700 shadow-sm">
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                  {rates.silver.change}
                </span>
              </div>

              {/* Title & Description */}
              <div className="pt-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#334155] block mb-1">
                  PURE SILVER BULLION
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight filter drop-shadow-xs">
                  {rates.silver.name}
                </h3>
                <p className="text-xs text-[#334155] font-semibold mt-1">
                  {rates.silver.desc}
                </p>
              </div>

              {/* Price Display */}
              <div className="pt-4 border-t border-[#334155]/20">
                <span className="text-[11px] uppercase font-mono font-extrabold text-[#334155] tracking-widest block">
                  PER 1 GRAM RATE
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-serif text-4xl sm:text-5xl font-black text-[#090D16] tracking-tight filter drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
                    {formatPrice(rates.silver.pricePerGram)}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Footer Hallmark Certification */}
            <div className="pt-4 mt-6 border-t border-[#334155]/20 flex items-center justify-between text-xs font-mono font-bold text-[#0F172A] relative z-10">
              <span className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#334155]" />
                <span>{rates.silver.hallmark}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-sans text-[#F8FAFC] bg-[#1E293B] px-2.5 py-1 rounded-md border border-[#334155] font-semibold shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Showroom Benchmark
              </span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}


