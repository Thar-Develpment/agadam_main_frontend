import React, { useState, useEffect } from "react";
import { TrendingUp, Sparkles, ShieldCheck, Scale, Coins } from "lucide-react";
import { getSiteInfo } from "../services/api";

export default function GoldRateSection({ shopInfo }) {
  const [activeUnit, setActiveUnit] = useState("1g"); // "1g" | "8g" | "10g"
  const [activeCategory, setActiveCategory] = useState("all"); // "all" | "gold" | "silver"

  // Base rates per 1 gram (initialized with benchmark rates, updated via backend /user/site_info)
  const [rates, setRates] = useState({
    gold24k: {
      purity: "24K (999 Pure)",
      name: "24 Karat Pure Gold",
      desc: "Minted Gold Coins & Bullion Bars",
      pricePerGram: 7850,
      change: "+ ₹25",
      isUp: true,
      hallmark: "99.9% Purity Certified",
      material: "gold",
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
      material: "gold",
    },
    gold18k: {
      purity: "18K (750 Purity)",
      name: "18 Karat Diamond Gold",
      desc: "Solitaire & Modern Fine Jewellery",
      pricePerGram: 5890,
      change: "+ ₹15",
      isUp: true,
      hallmark: "750 Hallmarked",
      material: "gold",
    },
    silver999: {
      purity: "Fine Silver (999)",
      name: "Pure 999 Fine Silver",
      desc: "Minted Silver Coins & Bullion Bars",
      pricePerGram: 94.5,
      change: "+ ₹0.50",
      isUp: true,
      hallmark: "99.9% Pure Silver",
      material: "silver",
    },
    silver925: {
      purity: "Sterling Silver (925)",
      name: "925 Sterling Silver",
      desc: "Designer Silver Jewellery & Ornaments",
      pricePerGram: 88.0,
      change: "+ ₹0.40",
      isUp: true,
      hallmark: "925 BIS Hallmarked",
      material: "silver",
    },
    silver800: {
      purity: "Standard Silver (800)",
      name: "Traditional Silverware",
      desc: "Pooja Articles, Lamps & Utensils",
      pricePerGram: 76.5,
      change: "+ ₹0.30",
      isUp: true,
      hallmark: "800 Purity Silverware",
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
                  if (purity.includes("24")) {
                    updated.gold24k = { ...updated.gold24k, pricePerGram: priceNum };
                  } else if (purity.includes("22")) {
                    updated.gold22k = { ...updated.gold22k, pricePerGram: priceNum };
                  } else if (purity.includes("18")) {
                    updated.gold18k = { ...updated.gold18k, pricePerGram: priceNum };
                  }
                } else if (mat === "silver") {
                  if (purity.includes("24") || purity.includes("999") || purity.includes("fine")) {
                    updated.silver999 = { ...updated.silver999, pricePerGram: priceNum };
                  } else if (purity.includes("22") || purity.includes("925") || purity.includes("sterling")) {
                    updated.silver925 = { ...updated.silver925, pricePerGram: priceNum };
                  } else if (purity.includes("18") || purity.includes("800") || purity.includes("standard")) {
                    updated.silver800 = { ...updated.silver800, pricePerGram: priceNum };
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

  const goldList = [rates.gold22k, rates.gold24k, rates.gold18k];
  const silverList = [rates.silver999, rates.silver925, rates.silver800];

  return (
    <section id="rates" className="py-16 sm:py-20 bg-[#FAF9F5] text-stone-800 border-t border-stone-200 relative overflow-hidden text-left">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
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

          {/* Controls: Material Filter & Unit Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-2xl border border-stone-300/60 text-xs font-semibold">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeCategory === "all" ? "bg-stone-900 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                All Variants (6)
              </button>
              <button
                onClick={() => setActiveCategory("gold")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeCategory === "gold" ? "bg-[#B8860B] text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Gold (3)
              </button>
              <button
                onClick={() => setActiveCategory("silver")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeCategory === "silver" ? "bg-stone-700 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Silver (3)
              </button>
            </div>

            {/* Unit Switcher Tabs */}
            <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-2xl border border-stone-300/60 text-xs font-bold">
              {[
                { id: "1g", label: "1 Gram" },
                { id: "8g", label: "8g (1 Pavan)" },
                { id: "10g", label: "10 Grams" },
              ].map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setActiveUnit(unit.id)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeUnit === unit.id
                      ? "bg-stone-900 text-[#D4AF37] shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  {unit.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 1. Gold Bullion Rates (3 Karat Variants) */}
        {(activeCategory === "all" || activeCategory === "gold") && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#B8860B]">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Gold Bullion Rates (3 Karat Variants)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {goldList.map((item, idx) => (
                <div
                  key={idx}
                  className={`relative rounded-3xl p-6 sm:p-7 shadow-sm transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between ${
                    item.isFeatured
                      ? "bg-gradient-to-b from-[#1C1917] via-stone-900 to-stone-950 text-white border-2 border-[#D4AF37] shadow-xl"
                      : "bg-white border border-stone-200 hover:border-[#D4AF37]/50 hover:shadow-xl"
                  }`}
                >
                  {item.isFeatured && (
                    <span className="absolute -top-3 right-6 bg-gradient-to-r from-[#C5A059] to-[#D4AF37] text-stone-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold uppercase tracking-wider ${item.isFeatured ? "text-[#D4AF37]" : "text-[#B8860B]"}`}>
                        {item.purity}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                        item.isFeatured
                          ? "text-emerald-400 bg-emerald-950/60 border border-emerald-500/30"
                          : "text-emerald-700 bg-emerald-50 border border-emerald-200"
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        {item.change}
                      </span>
                    </div>

                    <div>
                      <h4 className={`font-serif text-xl font-bold ${item.isFeatured ? "text-white" : "text-stone-900"}`}>
                        {item.name}
                      </h4>
                      <p className={`text-xs font-light mt-0.5 ${item.isFeatured ? "text-stone-400" : "text-stone-500"}`}>
                        {item.desc}
                      </p>
                    </div>

                    <div className={`pt-3 border-t ${item.isFeatured ? "border-stone-800" : "border-stone-100"}`}>
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                        {getUnitLabel(activeUnit)}
                      </span>
                      <span className={`font-serif text-3xl font-bold tracking-tight block mt-1 ${item.isFeatured ? "text-[#F3E5AB]" : "text-stone-900"}`}>
                        {formatPrice(item.pricePerGram)}
                      </span>
                    </div>
                  </div>

                  <div className={`pt-4 mt-4 border-t flex items-center justify-between text-[11px] font-mono ${
                    item.isFeatured ? "border-stone-800/80 text-[#D4AF37]" : "border-stone-100 text-[#B8860B]"
                  }`}>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {item.hallmark}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Silver Bullion Rates (3 Purity Variants) */}
        {(activeCategory === "all" || activeCategory === "silver") && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-700">
                <Coins className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Silver Bullion Rates (3 Purity Variants)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {silverList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-stone-400 flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                        {item.purity}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <TrendingUp className="w-3 h-3" />
                        {item.change}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-serif text-xl font-bold text-stone-900">
                        {item.name}
                      </h4>
                      <p className="text-xs text-stone-500 font-light mt-0.5">
                        {item.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-stone-100">
                      <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                        {getUnitLabel(activeUnit)}
                      </span>
                      <span className="font-serif text-3xl font-bold text-stone-900 tracking-tight block mt-1">
                        {formatPrice(item.pricePerGram)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-600 font-mono">
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5" />
                      {item.hallmark}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
