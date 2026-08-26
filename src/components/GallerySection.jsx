import React, { useState, useEffect } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Sparkles,
  Tag,
  PhoneCall,
  CheckCircle,
} from "lucide-react";

export default function GallerySection({
  categories = [],
  images = [],
  onSelectCategory,
  selectedCategory = "All",
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const currentImage = lightboxIndex !== null ? images[lightboxIndex] : null;

  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrevImage = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e) => {
    if (e) e.stopPropagation();
    setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  // Listen to keyboard arrow keys for Lightbox navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") setLightboxIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      if (e.key === "ArrowRight") setLightboxIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, images.length]);


  return (
    <section id="gallery" className="py-16 sm:py-24 bg-[#FAF9F5] text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 text-[#B8860B] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-[#D4AF37]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Exquisite Catalogue</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
            Our Fine Jewellery Gallery
          </h2>
          <p className="text-stone-600 text-sm sm:text-base font-light">
            Discover timeless 22K gold, certified solitaires, and antique Kundan masterpieces handcrafted by master artisans.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all ${
                  isActive
                    ? "bg-stone-900 text-[#D4AF37] border border-[#D4AF37] shadow-md scale-105"
                    : "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Gallery Image Grid */}
        {images.length === 0 ? (
          <div className="py-16 text-stone-500 font-light">
            No items found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-left">
            {images.map((item, index) => (
              <div
                key={item.id || index}
                onClick={() => handleOpenLightbox(index)}
                className="group relative bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1.5"
              >
                {/* Image Container */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-[#FAF9F5] text-stone-900 flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <ZoomIn className="w-6 h-6 text-[#B8860B]" />
                    </div>
                  </div>

                  {/* Purity Badge */}
                  {item.purity && (
                    <span className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md text-[#F3E5AB] border border-[#D4AF37]/40 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {item.purity}
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B8860B]">
                      {item.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-stone-900 line-clamp-1 group-hover:text-[#B8860B] transition-colors mt-0.5">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2 font-light">
                    {item.description}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-stone-100 text-xs text-stone-500 font-mono">
                    <span>Code: {item.code || "AG-JEWEL"}</span>
                    <span className="text-[#B8860B] font-sans font-semibold group-hover:underline flex items-center gap-1">
                      View Details &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && currentImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={handleCloseLightbox}
        >
          <div 
            className="bg-[#FAF9F5] border border-[#D4AF37]/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative grid grid-cols-1 md:grid-cols-2 text-stone-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleCloseLightbox}
              className="absolute top-4 right-4 z-20 text-stone-400 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 p-2.5 rounded-full transition-colors"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Left Column: Image View */}
            <div className="relative bg-stone-900 flex items-center justify-center p-4 min-h-[300px] md:min-h-[450px]">
              <img
                src={currentImage.imageUrl}
                alt={currentImage.title}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />

              {/* Prev Arrow */}
              <button
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-stone-900/80 hover:bg-[#D4AF37] text-white hover:text-stone-950 p-2.5 rounded-full backdrop-blur-sm transition-all"
                aria-label="Previous Image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Next Arrow */}
              <button
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-stone-900/80 hover:bg-[#D4AF37] text-white hover:text-stone-950 p-2.5 rounded-full backdrop-blur-sm transition-all"
                aria-label="Next Image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-3 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-mono">
                {lightboxIndex + 1} / {images.length}
              </div>
            </div>

            {/* Right Column: Details & Actions */}
            <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-[#D4AF37]/15 text-[#B8860B] border border-[#D4AF37]/30 text-xs font-semibold px-3 py-1 rounded-full uppercase">
                    {currentImage.category}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    Ref: {currentImage.code}
                  </span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {currentImage.title}
                </h3>

                {currentImage.purity && (
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-stone-100 p-3 rounded-lg border border-stone-200">
                    <CheckCircle className="w-4 h-4 text-[#B8860B]" />
                    <span>Purity & Gems: {currentImage.purity}</span>
                  </div>
                )}

                <p className="text-stone-600 text-sm font-light leading-relaxed">
                  {currentImage.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-stone-200">
                <a
                  href={`https://wa.me/919876543210?text=Hello%20Agadam%20Jewellery%2C%20I%20am%20interested%20in%20item%20${encodeURIComponent(currentImage.title)}%20(Code%3A%20${currentImage.code}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors shadow-md"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Enquire via WhatsApp</span>
                </a>

                <a
                  href="#enquiry"
                  onClick={() => {
                    handleCloseLightbox();
                    const el = document.getElementById("enquiry");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-colors"
                >
                  <Tag className="w-4 h-4 text-[#D4AF37]" />
                  <span>Send Store Enquiry Form</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
