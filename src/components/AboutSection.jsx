import React from "react";
import {
  Sparkles,
  ShieldCheck,
  Award,
  Eye,
  CheckCircle,
  Quote,
} from "lucide-react";

export default function AboutSection({ aboutContent }) {
  if (!aboutContent) return null;

  const valueIcons = {
    ShieldCheck: ShieldCheck,
    Award: Award,
    Eye: Eye,
    Sparkles: Sparkles,
  };

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
          <p className="text-stone-600 text-sm sm:text-base font-light italic">
            "{aboutContent.subtitle}"
          </p>
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
              {aboutContent.historyParagraphs?.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Specializations List */}
            <div className="pt-4 border-t border-stone-200">
              <h4 className="font-serif font-bold text-stone-900 text-lg mb-3">
                Our Master Specializations:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm font-medium text-stone-800">
                {aboutContent.specialization?.map((spec, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#B8860B] shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Founder Card */}
          <div className="lg:col-span-5">
            <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-[#D4AF37]/30">
              <div className="absolute top-6 right-6 text-[#D4AF37]/20">
                <Quote className="w-16 h-16" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="aspect-4/3 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40">
                  <img
                    src={aboutContent.founder?.image}
                    alt={aboutContent.founder?.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <blockquote className="font-serif italic text-base sm:text-lg text-stone-200 leading-relaxed">
                  "{aboutContent.founder?.quote}"
                </blockquote>

                <div className="pt-2 border-t border-stone-800">
                  <h4 className="font-serif font-bold text-[#D4AF37] text-lg">
                    {aboutContent.founder?.name}
                  </h4>
                  <p className="text-xs uppercase tracking-wider text-stone-400 font-semibold">
                    {aboutContent.founder?.role}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Embedded Featured Article Video */}
        {aboutContent.featuredVideoId && (
          <div className="bg-stone-900 rounded-3xl p-6 sm:p-10 border border-[#D4AF37]/30 text-white">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#D4AF37]">
                {aboutContent.featuredVideoTitle || "Explore Our Heritage Studio"}
              </h3>
              <p className="text-stone-400 text-xs sm:text-sm font-light">
                Take a 3-minute video tour inside our crafting lab where 24K gold and diamonds are transformed into magnificent heritage pieces.
              </p>
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-stone-800 mt-6">
                <iframe
                  src={`https://www.youtube.com/embed/${aboutContent.featuredVideoId}`}
                  title="Aadagam Heritage Video"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
