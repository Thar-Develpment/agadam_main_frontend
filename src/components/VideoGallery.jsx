import React, { useState } from "react";
import { Play, X, Video, Clock, Sparkles } from "lucide-react";

export default function VideoGallery({ videos = [] }) {
  const [activeVideo, setActiveVideo] = useState(null);

  if (videos.length === 0) return null;

  const latestVideo = videos[0];
  const sideVideos = videos.slice(1);

  return (
    <section id="videos" className="py-16 bg-stone-900 text-white relative overflow-hidden border-t border-stone-800">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 border-b border-stone-800 pb-6 gap-4">
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

        {/* Video Showcase Layout */}
        <div className={sideVideos.length > 0 ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : "max-w-2xl mx-auto"}>
          {/* LATEST FEATURED VIDEO (Bigger Main Display) */}
          <div className={sideVideos.length > 0 ? "lg:col-span-7 xl:col-span-8" : "w-full"}>
            <div
              onClick={() => setActiveVideo(latestVideo)}
              className="group relative bg-stone-950 border-2 border-[#D4AF37]/40 rounded-3xl overflow-hidden shadow-2xl hover:border-[#D4AF37] transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Featured Badge */}
              <div className="absolute top-4 left-4 z-20 inline-flex items-center gap-1.5 bg-stone-950/80 backdrop-blur-md border border-[#D4AF37]/60 text-[#D4AF37] px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Latest Showcase</span>
              </div>

              {/* Large Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  src={latestVideo.thumbnail}
                  alt={latestVideo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-black/20 group-hover:via-stone-950/10 transition-colors" />

                {/* Big Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D4AF37] text-stone-950 flex items-center justify-center shadow-2xl shadow-[#D4AF37]/20 transform group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-7 h-7 sm:w-9 sm:h-9 fill-current ml-1" />
                  </div>
                </div>

                {/* Duration Tag */}
                {latestVideo.duration && (
                  <span className="absolute bottom-4 right-4 bg-stone-950/90 backdrop-blur-md text-stone-200 text-xs font-mono px-3 py-1.5 rounded-lg border border-stone-800 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {latestVideo.duration}
                  </span>
                )}
              </div>

              {/* Featured Video Info */}
              <div className="p-6 sm:p-8 space-y-3 bg-stone-950 border-t border-stone-850">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/15 px-3 py-1 rounded-full border border-[#D4AF37]/30">
                    {latestVideo.category || "Showcase"}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">Featured Reel</span>
                </div>
                <h3 className="font-serif text-xl sm:text-3xl font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {latestVideo.title}
                </h3>
                <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
                  {latestVideo.description}
                </p>
              </div>
            </div>
          </div>

          {/* OTHER VIDEOS (Smaller Side Playlist) */}
          {sideVideos.length > 0 && (
            <div className="lg:col-span-5 xl:col-span-4 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                  More Atelier Videos ({sideVideos.length})
                </span>
              </div>

              <div className="space-y-3.5 max-h-[620px] overflow-y-auto pr-1 custom-scrollbar">
                {sideVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setActiveVideo(video)}
                    className="group relative bg-stone-950 border border-stone-800 hover:border-[#D4AF37]/50 rounded-2xl p-3 transition-all duration-300 cursor-pointer flex gap-3.5 items-center shadow-md hover:bg-stone-900/60"
                  >
                    {/* Small Thumbnail */}
                    <div className="relative aspect-video w-32 sm:w-36 shrink-0 rounded-xl overflow-hidden bg-black">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-stone-950/30 group-hover:bg-stone-950/10 transition-colors" />

                      {/* Small Play Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-stone-950 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>

                      {/* Duration Badge */}
                      {video.duration && (
                        <span className="absolute bottom-1 right-1 bg-stone-950/90 text-[#D4AF37] text-[9px] font-mono px-1.5 py-0.5 rounded">
                          {video.duration}
                        </span>
                      )}
                    </div>

                    {/* Small Info */}
                    <div className="space-y-1 overflow-hidden">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-[#D4AF37] block">
                        {video.category || "Video"}
                      </span>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-stone-100 line-clamp-2 group-hover:text-[#D4AF37] transition-colors leading-snug">
                        {video.title}
                      </h4>
                      <p className="text-[11px] text-stone-400 font-light line-clamp-1">
                        {video.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIDEO MODAL PLAYER */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="bg-stone-950 border border-[#D4AF37]/40 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 bg-stone-900 border-b border-stone-800">
              <div className="truncate pr-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block">
                  {activeVideo.category || "Showcase Video"}
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold text-white truncate">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 p-2 rounded-full transition-colors shrink-0"
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
            <div className="p-4 sm:p-5 bg-stone-900 text-xs text-stone-300 font-light flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-stone-800">
              <p className="line-clamp-2 text-stone-300 font-normal">{activeVideo.description}</p>
              <span className="text-[#D4AF37] font-semibold shrink-0">Official Store Showcase Video</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
