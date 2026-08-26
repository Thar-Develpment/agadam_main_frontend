import React, { useState, useEffect } from "react";
import { QrCode, Menu, X, PhoneCall, Sparkles, Gem } from "lucide-react";

export default function Header({ shopInfo, onOpenQR }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = ["home", "gallery", "about", "reviews", "contact"];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#home", id: "home" },
    { name: "Gallery", href: "#gallery", id: "gallery" },
    { name: "About Us", href: "#about", id: "about" },
    { name: "Reviews", href: "#reviews", id: "reviews" },
    { name: "Contact", href: "#contact", id: "contact" },
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      {/* Top Banner Notice */}
      <div className="bg-stone-900 text-[#D4AF37] text-xs py-2 px-4 text-center border-b border-[#D4AF37]/20 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
        <span className="font-medium tracking-wide">
          100% BIS Hallmarked 22K Gold & GIA/IGI Certified Solitaire Diamonds
        </span>
        <span className="hidden md:inline text-stone-500">|</span>
        <a 
          href={`tel:${shopInfo?.phonePrimary || '+919876543210'}`} 
          className="hidden md:inline text-stone-300 hover:text-white transition-colors"
        >
          Call Us: {shopInfo?.phonePrimary || '+91 98765 43210'}
        </a>
      </div>

      {/* Main Sticky Header */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-[#FAF9F5]/90 backdrop-blur-md shadow-lg border-b border-[#D4AF37]/20 py-3"
            : "bg-[#FAF9F5] border-b border-stone-200 py-4 sm:py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "#home")}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-stone-900 via-[#1C1917] to-[#292524] border border-[#D4AF37] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Gem className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="text-left">
              <span className="block font-serif text-xl sm:text-2xl font-bold tracking-wider text-stone-900 group-hover:text-[#B8860B] transition-colors">
                {shopInfo?.name || "AGADAM JEWELLERY"}
              </span>
              <span className="block text-[10px] tracking-widest uppercase text-[#B8860B] font-semibold -mt-1">
                Fine Jewels & Diamonds
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium tracking-wide transition-all relative py-1 ${
                  activeSection === link.id
                    ? "text-[#B8860B] font-semibold"
                    : "text-stone-700 hover:text-[#B8860B]"
                }`}
              >
                {link.name}
                {activeSection === link.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37] rounded-full animate-fade-in" />
                )}
              </a>
            ))}
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {/* QR Code Button */}
            <button
              onClick={onOpenQR}
              className="inline-flex items-center gap-2 bg-stone-100 hover:bg-[#D4AF37]/10 text-stone-800 border border-stone-300 hover:border-[#D4AF37] px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all"
              title="Scan QR Code to share store"
            >
              <QrCode className="w-4 h-4 text-[#B8860B]" />
              <span>QR Code</span>
            </button>

            {/* Quick Enquiry Button */}
            <a
              href="#enquiry"
              onClick={(e) => handleNavClick(e, "#enquiry")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-[#FAF9F5] border border-[#D4AF37]/40 px-4 py-2 rounded-lg text-xs font-semibold tracking-wider uppercase transition-all shadow-sm hover:shadow-md"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Enquire Now</span>
            </a>
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenQR}
              className="p-2 text-stone-700 hover:text-[#B8860B] bg-stone-100 rounded-lg sm:hidden"
              aria-label="QR Code"
            >
              <QrCode className="w-5 h-5 text-[#B8860B]" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-800 hover:text-[#B8860B] bg-stone-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-[#FAF9F5] shadow-2xl p-6 flex flex-col justify-between border-l border-[#D4AF37]/30">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-900 border border-[#D4AF37] flex items-center justify-center">
                    <Gem className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <span className="font-serif font-bold text-lg text-stone-900">
                    {shopInfo?.name || "AGADAM JEWELLERY"}
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-full text-stone-500 hover:bg-stone-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <nav className="mt-6 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`block px-4 py-3 rounded-xl font-medium text-base transition-colors ${
                      activeSection === link.id
                        ? "bg-[#D4AF37]/15 text-[#B8860B] font-semibold border-l-4 border-[#D4AF37]"
                        : "text-stone-800 hover:bg-stone-100"
                    }`}
                  >
                    {link.name}
                  </a>
                ))}
              </nav>
            </div>

            {/* Mobile Actions */}
            <div className="pt-6 border-t border-stone-200 space-y-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQR();
                }}
                className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 rounded-xl font-semibold text-sm transition-colors border border-stone-300"
              >
                <QrCode className="w-4 h-4 text-[#B8860B]" />
                <span>Show Website QR Code</span>
              </button>

              <a
                href="#enquiry"
                onClick={(e) => handleNavClick(e, "#enquiry")}
                className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-[#FAF9F5] py-3 rounded-xl font-semibold text-sm transition-colors shadow-md border border-[#D4AF37]/40"
              >
                <PhoneCall className="w-4 h-4 text-[#D4AF37]" />
                <span>Send Quick Enquiry</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
