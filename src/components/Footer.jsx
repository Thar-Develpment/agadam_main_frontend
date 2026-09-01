import React from "react";
import { Gem, ArrowUp } from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./SocialIcons";


export default function Footer({ shopInfo }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const socials = shopInfo?.socials || {};

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800 pt-16 pb-8 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center">
                <Gem className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-wider">
                {shopInfo?.name || "JEWELLERY BOUTIQUE"}
              </span>
            </div>
            <p className="text-stone-400 text-xs sm:text-sm font-light leading-relaxed max-w-sm">
              {shopInfo?.subTagline || "Crafting exquisite gold, diamond, & antique polki treasures since 1988."} 100% BIS Hallmarked Purity & GIA Certified Solitaires.
            </p>
            <div className="pt-2 flex items-center gap-3">
              {socials.facebook && (
                <a
                  href={socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 hover:border-[#D4AF37] text-stone-400 hover:text-[#D4AF37] flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {socials.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 hover:border-[#D4AF37] text-stone-400 hover:text-[#D4AF37] flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {socials.youtube && (
                <a
                  href={socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-stone-900 border border-stone-800 hover:border-[#D4AF37] text-stone-400 hover:text-[#D4AF37] flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
              )}
            </div>

          </div>

          {/* Quick Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-white text-base tracking-wider uppercase">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-light text-stone-400">
              <li>
                <a href="#home" className="hover:text-[#D4AF37] transition-colors">
                  Home & Hero Slideshow
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-[#D4AF37] transition-colors">
                  Jewellery Gallery & Categories
                </a>
              </li>
              <li>
                <a href="#rates" className="hover:text-[#D4AF37] transition-colors">
                  Live Gold & Silver Rates
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#D4AF37] transition-colors">
                  Our Heritage & Story
                </a>
              </li>
              <li>
                <a href="#status" className="hover:text-[#D4AF37] transition-colors">
                  WhatsApp Daily Status
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-[#D4AF37] transition-colors">
                  Showroom Directions & Enquiry
                </a>
              </li>
            </ul>
          </div>

          {/* Address Summary & Timings */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif font-bold text-white text-base tracking-wider uppercase">
              Flagship Boutique
            </h4>
            <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
              {shopInfo?.address || (shopInfo?.city ? `Main Commercial Avenue, ${shopInfo.city}` : "Flagship Boutique, Jewellery Quarter")}
            </p>
            <div className="pt-2 text-xs text-stone-500 font-mono space-y-1">
              <p>Primary: {shopInfo?.phonePrimary || "+91 98765 43210"}</p>
              <p>Email: {shopInfo?.email || "contact@jewellerystore.com"}</p>
              <p className="text-[#D4AF37]">Hours: Mon-Sun 10:30 AM – 8:30 PM</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-light">
          <p>
            &copy; {new Date().getFullYear()} {shopInfo?.name || "Jewellery Boutique"}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-1 text-stone-400">
            <span>Powered by</span>
            <span className="font-bold text-[#D4AF37]">Aadagam Platform</span>
          </div>
          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1 text-[#D4AF37] hover:underline"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
