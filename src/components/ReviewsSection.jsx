import React from "react";
import { Star, ExternalLink, ShieldCheck } from "lucide-react";


export default function ReviewsSection({ reviews = [] }) {
  if (reviews.length === 0) return null;

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-white text-stone-800 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Rating Summary */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-stone-100 pb-8">
          <div className="space-y-3 text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Google Reviews</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Loved by Generations of Clients
            </h2>
            <p className="text-stone-600 text-sm font-light">
              Read real feedback from patrons who trusted us with their weddings and celebrations.
            </p>
          </div>

          {/* Google Badge Box */}
          <div className="bg-[#FAF9F5] border border-[#D4AF37]/40 rounded-2xl p-5 flex items-center gap-4 shrink-0 shadow-sm">
            <div className="flex flex-col items-center">
              <span className="font-serif text-4xl font-bold text-stone-900">4.9</span>
              <div className="flex text-amber-500 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current text-[#D4AF37]" />
                ))}
              </div>
            </div>
            <div className="text-left border-l border-stone-200 pl-4">
              <span className="block font-bold text-stone-900 text-sm">Google Rating</span>
              <span className="block text-xs text-stone-500 font-light">Based on 250+ Client Reviews</span>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#B8860B] font-semibold hover:underline mt-1"
              >
                <span>Write a Review</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
            >
              <div className="space-y-3">
                {/* Stars & Date */}
                <div className="flex items-center justify-between">
                  <div className="flex text-amber-500">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-[#D4AF37]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">{rev.date}</span>
                </div>

                {/* Review Text */}
                <p className="text-stone-700 text-xs sm:text-sm font-light leading-relaxed italic">
                  "{rev.review}"
                </p>
              </div>

              {/* User Profile */}
              <div className="pt-4 border-t border-stone-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-stone-900 text-sm">{rev.name}</h4>
                    {rev.purchasedItem && (
                      <span className="block text-[10px] text-[#B8860B] font-medium">
                        Purchased: {rev.purchasedItem}
                      </span>
                    )}
                  </div>
                </div>

                {rev.verified && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* View All Reviews CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-3.5 px-8 rounded-xl text-sm transition-all shadow-md hover:scale-105"
          >
            <span>View All Reviews on Google</span>
            <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
          </a>
        </div>
      </div>
    </section>
  );
}
