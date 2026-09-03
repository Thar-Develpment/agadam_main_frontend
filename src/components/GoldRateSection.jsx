import React, { useState, useEffect } from "react";
import { TrendingUp, Sparkles, ShieldCheck, Scale } from "lucide-react";
import { getSiteInfo } from "../services/api";

export default function GoldRateSection({ shopInfo }) {
  const [activeUnit, setActiveUnit] = useState("1g"); // "1g" | "8g" | "10g"

  // Base rates per 1 gram (initialized with benchmarks, updated dynamically via backend /user/site_info)
  const [rates, setRates] = useState({
    gold24k: {
      purity: "24K (999 Pure)",
      name: "24 Karat Pure Gold",
      desc: "Minted Gold Coins & Bullion Bars",
      pricePerGram: 7850,
      change: "+ ₹25",
      isUp: true,
      hallmark: "99.9% Purity Certified",
    },
    gold22k: {
      purity: "22K (916 BIS)",
      name: "22 Karat Standard Gold",
      desc: "Traditional & Bridal Jewellery",
      pricePerGram: 7195,
      change: "+ ₹20",
      isUp: true,
      hallmark: "BIS 916 Hallmarked",
      isFeatured: true,
    },
    gold18k: {
      purity: "18K (750 Purity)",
      name: "18 Karat Diamond Gold",
      desc: "Solitaire & Modern Fine Jewellery",
      pricePerGram: 5890,
      change: "+ ₹15",
      isUp: true,
      hallmark: "750 Hallmarked",
    },
    silver: {
      purity: "Fine Silver (999)",
      name: "Pure 999 Fine Silver",
      desc: "Pooja Articles, Coins & Silverware",
      pricePerGram: 94.5,
      change: "+ ₹0.50",
      isUp: true,
      hallmark: "99.9% Fine Silver",
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
                  if (purity.includes("24")) {
                    updated.gold24k = { ...updated.gold24k, pricePerGram: priceNum };
                  } else if (purity.includes("22")) {
                    updated.gold22k = { ...updated.gold22k, pricePerGram: priceNum };
                  } else if (purity.includes("18")) {
                    updated.gold18k = { ...updated.gold18k, pricePerGram: priceNum };
                  }
                } else if (mat === "silver") {
                  updated.silver = { ...updated.silver, pricePerGram: priceNum };
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

  const getMultiplier = (unit) => {
    if (unit === "8g") return 8;
    if (unit === "10g") return 10;
    return 1;
  };

  const getUnitLabel = (unit) => {
    if (unit === "8g") return "Per 8 Grams (1 Sovereign / Pavan)";
    if (unit === "10g") return "Per 10 Grams";
    return "Per 1 Gram";
  };

  const multiplier = getMultiplier(activeUnit);

  const formatPrice = (pricePerGram) => {
    const total = pricePerGram * multiplier;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: total % 1 === 0 ? 0 : 2,
    }).format(total);
  };

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <section id="rates" className="py-16 sm:py-20 bg-[#FAF9F5] text-stone-800 border-t border-stone-200 relative overflow-hidden text-left">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
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

          {/* Unit Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-stone-200/80 p-1.5 rounded-2xl self-start md:self-auto border border-stone-300/60 shadow-xs">
            <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider px-2 hidden sm:inline">
              Unit:
            </span>
            {[
              { id: "1g", label: "1 Gram" },
              { id: "8g", label: "8g (1 Pavan)" },
              { id: "10g", label: "10 Grams" },
            ].map((unit) => (
              <button
                key={unit.id}
                onClick={() => setActiveUnit(unit.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeUnit === unit.id
                    ? "bg-stone-900 text-[#D4AF37] shadow-sm"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/60"
                }`}
              >
                {unit.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rate Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: 22K Standard Gold (Featured) */}
          <div className="relative bg-gradient-to-b from-[#1C1917] via-stone-900 to-stone-950 text-white border-2 border-[#D4AF37] rounded-3xl p-6 sm:p-7 shadow-xl shadow-stone-900/15 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300">
            <span className="absolute -top-3 right-6 bg-gradient-to-r from-[#C5A059] to-[#D4AF37] text-stone-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
              Most Popular
            </span>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  {rates.gold22k.purity}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  {rates.gold22k.change}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-white">
                  {rates.gold22k.name}
                </h3>
                <p className="text-xs text-stone-400 font-light mt-0.5">
                  {rates.gold22k.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-800">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  {getUnitLabel(activeUnit)}
                </span>
                <span className="font-serif text-3xl font-bold text-[#F3E5AB] tracking-tight block mt-1">
                  {formatPrice(rates.gold22k.pricePerGram)}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400 font-mono">
              <span className="flex items-center gap-1 text-[#D4AF37]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {rates.gold22k.hallmark}
              </span>
            </div>
          </div>

          {/* Card 2: 24K Pure Gold */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/50 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">
                  {rates.gold24k.purity}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  {rates.gold24k.change}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {rates.gold24k.name}
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  {rates.gold24k.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  {getUnitLabel(activeUnit)}
                </span>
                <span className="font-serif text-3xl font-bold text-stone-900 tracking-tight block mt-1">
                  {formatPrice(rates.gold24k.pricePerGram)}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span className="flex items-center gap-1 text-[#B8860B]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {rates.gold24k.hallmark}
              </span>
            </div>
          </div>

          {/* Card 3: 18K Diamond Jewellery Gold */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-[#D4AF37]/50 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#B8860B] uppercase tracking-wider">
                  {rates.gold18k.purity}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  {rates.gold18k.change}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {rates.gold18k.name}
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  {rates.gold18k.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  {getUnitLabel(activeUnit)}
                </span>
                <span className="font-serif text-3xl font-bold text-stone-900 tracking-tight block mt-1">
                  {formatPrice(rates.gold18k.pricePerGram)}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span className="flex items-center gap-1 text-[#B8860B]">
                <ShieldCheck className="w-3.5 h-3.5" />
                {rates.gold18k.hallmark}
              </span>
            </div>
          </div>

          {/* Card 4: Fine Silver (999) */}
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-stone-400 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  {rates.silver.purity}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  {rates.silver.change}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {rates.silver.name}
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  {rates.silver.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                  {getUnitLabel(activeUnit)}
                </span>
                <span className="font-serif text-3xl font-bold text-stone-900 tracking-tight block mt-1">
                  {formatPrice(rates.silver.pricePerGram)}
                </span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono">
              <span className="flex items-center gap-1 text-stone-700">
                <Scale className="w-3.5 h-3.5" />
                {rates.silver.hallmark}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
