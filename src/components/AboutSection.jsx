import React from "react";
import { Sparkles, Gem } from "lucide-react";
import { getTenantSubdomain, getShopPrefix, resolveFullImageUrl } from "../services/apiClient";
import { parseStoryContent } from "../services/api";

export default function AboutSection({ aboutContent, galleryImages = [], shopInfo = null }) {
  if (!aboutContent) return null;

  const activeSubdomain = getTenantSubdomain();
  const defaultShopName = (getShopPrefix(activeSubdomain) || "EXCLUSIVE").toUpperCase() + " JEWELLERY";
  const shopName = (shopInfo?.name || defaultShopName).toUpperCase();
  const brandNameOnly = shopName.replace(/\s+JEWELLERY/gi, "").trim();

  // Parse raw content if it contains JSON payload
  let rawText = "";
  if (Array.isArray(aboutContent.historyParagraphs) && aboutContent.historyParagraphs.length > 0) {
    rawText = aboutContent.historyParagraphs.join("\n\n");
  } else if (typeof aboutContent.historyParagraphs === "string") {
    rawText = aboutContent.historyParagraphs;
  } else if (typeof aboutContent.content === "string") {
    rawText = aboutContent.content;
  }

  const parsed = parseStoryContent(rawText, aboutContent.image || aboutContent.imageUrl);
  const cleanStoryText = parsed.storyText || rawText;
  const customStoryImage = parsed.imageUrl || (aboutContent.image ? resolveFullImageUrl(aboutContent.image) : null) || (aboutContent.imageUrl ? resolveFullImageUrl(aboutContent.imageUrl) : null);

  const showcaseItem = galleryImages && galleryImages.length > 0 ? galleryImages[0] : null;
  const showcaseImage =
    customStoryImage ||
    (showcaseItem?.imageUrl ? resolveFullImageUrl(showcaseItem.imageUrl) : null) ||
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80";
  const showcaseTitle = customStoryImage
    ? `${brandNameOnly} Heritage & Craft`
    : showcaseItem?.title || `${brandNameOnly} Signature Collection`;

  // Process history paragraphs (handling single strings with line breaks or array of paragraphs)
  const allParagraphs = cleanStoryText
    ? cleanStoryText.split(/\r?\n\r?\n/).map((p) => p.trim()).filter(Boolean)
    : [];

  // Dynamically replace default brand names in history paragraphs with the current shop's name
  const formattedParagraphs = allParagraphs.map((paragraph) => {
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
            {aboutContent.title || "Our Heritage & Passion for Perfection"}
          </h2>
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
                <p key={idx} className="whitespace-pre-line leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Right Column: Showroom Masterpiece Card with Our Story Image */}
          <div className="lg:col-span-5">
            <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-[#D4AF37]/30">
              <div className="relative z-10 space-y-5">
                {/* Real Showroom Gallery / Our Story Image */}
                <div className="aspect-4/3 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 relative group shadow-inner">
                  <img
                    src={showcaseImage}
                    alt={showcaseTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-3 left-3 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#D4AF37]/40 text-[10px] font-mono text-[#D4AF37] tracking-wider uppercase">
                    {showcaseTitle}
                  </div>
                </div>

                {/* Showroom Brand Info & Logo Footer */}
                <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-4">
                  <div className="text-left">
                    <h4 className="font-serif font-bold text-[#D4AF37] text-lg sm:text-xl tracking-wide">
                      {shopName}
                    </h4>
                    <span className="text-[11px] text-stone-400 uppercase tracking-widest block font-medium mt-0.5">
                      {shopInfo?.tagline || "Fine Jewels & Diamonds"}
                    </span>
                  </div>

                  {/* Showroom Logo if uploaded, otherwise Diamond/Gem Icon */}
                  {shopInfo?.logo ? (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white border border-[#D4AF37] p-1 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
                      <img
                        src={resolveFullImageUrl(shopInfo.logo)}
                        alt={shopName}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden w-full h-full rounded-full bg-stone-900 items-center justify-center">
                        <Gem className="w-5 h-5 text-[#D4AF37]" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center shadow-md shrink-0">
                      <Gem className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
