import React, { useState } from "react";
import { Play, X, Video, Clock } from "lucide-react";

export default function VideoGallery({ videos = [] }) {
  const [activeVideo, setActiveVideo] = useState(null);

  if (videos.length === 0) return null;

  return (
    <section className="py-16 bg-stone-900 text-white relative overflow-hidden border-t border-stone-800">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b border-stone-800 pb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[#D4AF37] text-xs font-semibold uppercase tracking-widest mb-2">
              <Video className="w-4 h-4" />
              <span>Video Showcase</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Atelier & Craftsmanship Videos
            </h2>
          </div>
          <p className="text-stone-400 text-xs sm:text-sm font-light max-w-md">
            Watch our master artisans at work and take a guided tour of our bridal, gold, and solitaire collections.
          </p>
        </div>

        {/* Video Thumbnails Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              onClick={() => setActiveVideo(video)}
              className="group relative bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-lg hover:border-[#D4AF37]/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-stone-950/40 group-hover:bg-stone-950/20 transition-colors" />

                {/* Big Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#D4AF37] text-stone-950 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>

                {/* Duration Tag */}
                {video.duration && (
                  <span className="absolute bottom-3 right-3 bg-stone-950/80 backdrop-blur-sm text-stone-300 text-[10px] font-mono px-2 py-1 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D4AF37]" />
                    {video.duration}
                  </span>
                )}
              </div>

              {/* Video Info */}
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37]">
                  {video.category}
                </span>
                <h3 className="font-serif text-base font-bold text-stone-100 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                  {video.title}
                </h3>
                <p className="text-xs text-stone-400 font-light line-clamp-2">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VIDEO MODAL PLAYER */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-stone-950 border border-[#D4AF37]/30 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Header */}
            <div className="flex items-center justify-between p-4 bg-stone-900 border-b border-stone-800">
              <h3 className="font-serif text-lg font-bold text-[#D4AF37] truncate pr-4">
                {activeVideo.title}
              </h3>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-stone-400 hover:text-white bg-stone-800 p-2 rounded-full transition-colors"
                aria-label="Close Video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Embed Video Iframe */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Video Description Footer */}
            <div className="p-4 bg-stone-900 text-xs text-stone-300 font-light flex items-center justify-between">
              <span>Category: {activeVideo.category}</span>
              <span className="text-[#D4AF37]">Official Aadagam Jewellery YouTube Channel</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
