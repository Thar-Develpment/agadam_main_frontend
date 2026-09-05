import React from "react";
import { Sparkles, CheckCircle, Quote, Gem } from "lucide-react";
import { getTenantSubdomain, getShopPrefix } from "../services/apiClient";

export default function AboutSection({ aboutContent, galleryImages = [], shopInfo = null }) {
  if (!aboutContent) return null;

  const activeSubdomain = getTenantSubdomain();
  const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase() + " JEWELLERY";
  const shopName = (shopInfo?.name || defaultShopName).toUpperCase();
  const brandNameOnly = shopName.replace(/\s+JEWELLERY/gi, "").trim();

  // Use the first image from the showroom's gallery, or fallback to luxury jewellery image
  const showcaseItem = galleryImages && galleryImages.length > 0 ? galleryImages[0] : null;
  const showcaseImage =
    showcaseItem?.imageUrl ||
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80";
  const showcaseTitle = showcaseItem?.title || `${brandNameOnly} Signature Collection`;

  // Dynamically replace default brand names in history paragraphs with the current shop's name
  const formattedParagraphs = aboutContent.historyParagraphs?.map((paragraph) => {
    if (typeof paragraph !== "string") return paragraph;
    return paragraph
      .replace(/Rajeshwar Aadagam, Aadagam Jewellery/gi, `${shopName}`)
      .replace(/Aadagam Jewellery/gi, `${shopName}`)
      .replace(/Rajeshwar Aadagam/gi, `${brandNameOnly} Artisans`)
      .replace(/Aadagam/gi, brandNameOnly);
  });

  return (
    <section id="about" className="py-16 sm:py-24 bg-[#FAF9F5] text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 text-[#B8860B] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border border-[#D4AF37]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Our Story & Legacy</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
            {aboutContent.title}
          </h2>
          {aboutContent.subtitle && (
            <p className="text-stone-600 text-sm sm:text-base font-light italic">
              "{aboutContent.subtitle}"
            </p>
          )}
        </div>

        {/* Main Article Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left Column: Rich History Text */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-block border-l-4 border-[#D4AF37] pl-4">
              <h3 className="font-serif text-2xl font-bold text-stone-900">
                A Journey of Craftsmanship & Trust
              </h3>
            </div>

            <div className="space-y-4 text-stone-700 text-sm sm:text-base font-light leading-relaxed">
              {formattedParagraphs?.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Specializations List */}
            {Array.isArray(aboutContent.specialization) && aboutContent.specialization.length > 0 && (
              <div className="pt-4 border-t border-stone-200">
                <h4 className="font-serif font-bold text-stone-900 text-lg mb-3">
                  Our Master Specializations:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-medium text-stone-800">
                  {aboutContent.specialization.map((spec, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#B8860B] shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Universal Showroom Masterpiece Card with Gallery Image */}
          <div className="lg:col-span-5">
            <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-[#D4AF37]/30">
              <div className="absolute top-6 right-6 text-[#D4AF37]/20">
                <Quote className="w-16 h-16" />
              </div>

              <div className="relative z-10 space-y-6">
                {/* Real Showroom Gallery Image */}
                <div className="aspect-4/3 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 relative group">
                  <img
                    src={showcaseImage}
                    alt={showcaseTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#D4AF37]/40 text-[10px] font-mono text-[#D4AF37] tracking-wider uppercase">
                    {showcaseTitle}
                  </div>
                </div>

                <blockquote className="font-serif italic text-base sm:text-lg text-stone-200 leading-relaxed">
                  "Jewellery is not merely an ornament; it is a sacred record of love, heritage, and emotion passed from one generation to the next."
                </blockquote>

                <div className="pt-2 border-t border-stone-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-[#D4AF37] text-lg">
                      {shopName}
                    </h4>
                    <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                      100% BIS Hallmarked Purity Guarantee
                    </p>
                  </div>
                  <Gem className="w-6 h-6 text-[#D4AF37] shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
