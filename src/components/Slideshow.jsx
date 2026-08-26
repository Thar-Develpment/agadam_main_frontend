import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

export default function Slideshow({ slides = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides === 0 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalSlides, isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  if (totalSlides === 0) return null;

  return (
    <section 
      id="home"
      className="relative w-full overflow-hidden bg-stone-950 text-white group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Viewport */}
      <div className="relative min-h-[520px] sm:min-h-[600px] lg:h-[700px] w-full flex items-center">
        {slides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={slide.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Responsive Image Setup */}
              <picture className="block w-full h-full">
                {/* Mobile image source (max-width: 768px) */}
                <source media="(max-width: 768px)" srcSet={slide.mobileImg} />
                {/* Desktop default image source */}
                <img
                  src={slide.desktopImg}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-10000"
                />
              </picture>

              {/* Gradient Dark Overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-black/30" />
              <div className="absolute inset-0 bg-radial from-transparent via-stone-950/20 to-stone-950/80" />

              {/* Slide Text Content Container */}
              <div className="absolute inset-0 flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-left">
                  <div className="max-w-2xl space-y-4 sm:space-y-6 animate-fade-in">
                    {/* Badge */}
                    {slide.badge && (
                      <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/60 text-[#F3E5AB] px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest backdrop-blur-md">
                        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>{slide.badge}</span>
                      </div>
                    )}

                    {/* Title */}
                    <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-md">
                      {slide.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-stone-300 text-sm sm:text-lg font-light leading-relaxed max-w-xl">
                      {slide.subtitle}
                    </p>

                    {/* CTA Action */}
                    <div className="pt-2 sm:pt-4 flex flex-wrap gap-4">
                      <a
                        href={slide.ctaLink || "#gallery"}
                        className="inline-flex items-center gap-3 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C5A059] text-stone-950 font-bold py-3.5 px-7 rounded-xl text-sm tracking-wider uppercase shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                      >
                        <span>{slide.ctaText || "Explore Collection"}</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>

                      <a
                        href="#enquiry"
                        className="inline-flex items-center gap-2 bg-stone-900/80 hover:bg-stone-900 text-stone-200 border border-stone-600 hover:border-[#D4AF37] py-3.5 px-6 rounded-xl text-sm font-semibold tracking-wider transition-all backdrop-blur-sm"
                      >
                        Book Appointment
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-stone-900/60 hover:bg-[#D4AF37] text-white hover:text-stone-950 border border-stone-700 hover:border-[#D4AF37] flex items-center justify-center transition-all backdrop-blur-md opacity-80 hover:opacity-100 hover:scale-110"
        aria-label="Previous Slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-stone-900/60 hover:bg-[#D4AF37] text-white hover:text-stone-950 border border-stone-700 hover:border-[#D4AF37] flex items-center justify-center transition-all backdrop-blur-md opacity-80 hover:opacity-100 hover:scale-110"
        aria-label="Next Slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator Bar */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center items-center gap-2.5">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleDotClick(idx)}
            className={`transition-all duration-300 rounded-full ${
              idx === currentIndex
                ? "w-8 h-2.5 bg-[#D4AF37]"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
