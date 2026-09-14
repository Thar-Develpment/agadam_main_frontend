import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getBasicInfo } from "../services/api";
import { getStorefrontUrl, PLATFORM_DOMAIN } from "../services/apiClient";
import AadagamLogo from "../components/AadagamLogo";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Store,
  Phone,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export default function PlatformLandingPage() {
  const navigate = useNavigate();
  const [basicInfo, setBasicInfo] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await getBasicInfo();
        if (res && res.status === 1 && res.data) {
          setBasicInfo(res.data);
          if (res.data.title) {
            document.title = `${res.data.title} | Website for Jewellery Business`;
          }
        }
      } catch (err) {
        document.title = "Website for Jewellery Business | Aadagam";
      }
    }
    loadConfig();
  }, []);

  const rawPhone = basicInfo?.whatsapp_no || basicInfo?.phone || "919876543210";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
  const defaultMessage = "Hello Aadagam, I am interested in creating a jewellery website for my showroom. Please share the registration details.";
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`;
  const callPhone = basicInfo?.phone || "+91 9876543210";

  return (
    <div className="min-h-screen bg-white text-stone-800 font-sans selection:bg-[#783bf0] selection:text-white w-full max-w-full overflow-x-hidden">
      {/* Platform Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
            <AadagamLogo variant="horizontal" size="md" iconSrc="/logo_without_backround.png" iconClassName="w-16 h-18 sm:w-20 sm:h-20 scale-125" theme="light" />
          </Link>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-4 sm:gap-6">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-850 hover:text-[#783bf0] transition-colors"
            >
              <span>Admin Sign In</span>
            </Link>

            <span className="text-stone-300">|</span>

            <a
              href={getStorefrontUrl("demo")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#783bf0]/10 hover:bg-[#783bf0]/20 text-stone-900 border border-[#783bf0]/40 font-bold px-3.5 py-2 rounded-xl text-xs tracking-wider transition-all shadow-sm hover:shadow"
            >
              <span>View Demo Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#783bf0]" />
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#783bf0] hover:bg-[#6828e8] text-white font-bold px-4 py-2 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md shadow-[#783bf0]/20"
            >
              <MessageCircle className="w-3.5 h-3.5 text-white" />
              <span>Create Your Jewellery Website</span>
            </a>
          </div>

          {/* Mobile Nav Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/admin"
              className="text-xs font-bold text-stone-800 hover:text-[#783bf0] px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
            >
              Sign In
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#783bf0] text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs"
            >
              <span>Create Website</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-14 sm:py-24 bg-black text-white overflow-hidden border-b border-stone-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#783bf0]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#783bf0]/20 border border-[#783bf0]/50 text-purple-200 px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#783bf0]" />
              <span>Website for Jewellery Business | Aadagam</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Create a Professional Website for Your Jewellery Shop
            </h1>

            <p className="text-stone-300 text-sm sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Aadagam helps jewellery shops create and manage their own professional website, showcase jewellery, display customer reviews, share their shop details and receive customer enquiries, all from one simple platform.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 pt-4 max-w-md sm:max-w-none mx-auto">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#783bf0] hover:bg-[#6828e8] text-white font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-[#783bf0]/25 transition-all hover:scale-105"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Create Your Jewellery Website</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={getStorefrontUrl("demo")}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-[#783bf0] py-3.5 sm:py-4 px-6 sm:px-7 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all"
              >
                <span>View Demo Website</span>
                <ExternalLink className="w-4 h-4 text-[#783bf0]" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Your Customers Are Already Searching Online */}
      <section className="py-14 sm:py-20 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-stone-900">
            Your Customers Are Already Searching Online.
          </h2>

          <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
            Make it easy for them to see your jewellery collections, learn about your shop, check customer reviews, find your showroom, and get in touch with you.
          </p>

          <p className="text-stone-700 text-sm sm:text-base leading-relaxed font-normal max-w-3xl mx-auto">
            Aadagam gives your jewellery shop its own professional website, so your business can be discovered, trusted, and contacted online.
          </p>

          <div className="pt-4">
            <div className="inline-block bg-stone-50 border border-[#783bf0]/30 rounded-2xl p-4 sm:p-5 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-stone-900 tracking-wide">
                No complicated website setup. No coding. Just a simple online presence built for your jewellery business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Everything Your Jewellery Shop Needs to Grow Online */}
      <section className="py-14 sm:py-24 bg-stone-50/60 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#783bf0] bg-[#783bf0]/10 px-3 py-1 rounded-full inline-block border border-[#783bf0]/30">
              Features
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Everything Your Jewellery Shop Needs to Grow Online
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* 01 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#783bf0]/10 text-[#783bf0] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                01. Showcase Your Jewellery
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Let customers explore your latest jewellery collections online, even before they visit your showroom.
              </p>
            </div>

            {/* 02 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#783bf0]/10 text-[#783bf0] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                02. Build Customer Trust
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Display your Google Reviews and let real customer experiences speak for your business.
              </p>
            </div>

            {/* 03 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#783bf0]/10 text-[#783bf0] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                03. Tell Your Story
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Share your jewellery business's history, experience and values with potential customers.
              </p>
            </div>

            {/* 04 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#783bf0]/10 text-[#783bf0] flex items-center justify-center font-bold text-sm">
                04
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                04. Share Jewellery Price Updates
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Keep your customers updated with the latest jewellery price on your website. Download ready-made posters or videos and share them on WhatsApp Status.
              </p>
            </div>

            {/* 05 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#783bf0]/10 text-[#783bf0] flex items-center justify-center font-bold text-sm">
                05
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                05. Get Discovered Easily
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Give customers one place to find your shop, location, phone number and WhatsApp.
              </p>
            </div>

            {/* 06 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#783bf0]/10 text-[#783bf0] flex items-center justify-center font-bold text-sm">
                06
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                06. Get More Enquiries
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Make it simple for interested customers to contact your jewellery shop directly from your website.
              </p>
            </div>

            {/* 07 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#783bf0]/10 text-[#783bf0] flex items-center justify-center font-bold text-sm">
                07
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                07. Stay Connected on WhatsApp
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Give customers a quick way to move from your website to a WhatsApp conversation.
              </p>
            </div>

            {/* 08 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#783bf0]/10 text-[#783bf0] flex items-center justify-center font-bold text-sm">
                08
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                08. Manage It Yourself
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Keep your jewellery website updated from one simple dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Your Jewellery. Your Brand. Your Website. */}
      <section className="py-14 sm:py-20 bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Your Jewellery. Your Brand. Your Website.
          </h2>

          <p className="text-stone-700 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal">
            Give your jewellery shop its own professional website with a dedicated web address from Aadagam.
          </p>

          <div className="bg-stone-50 border-2 border-[#783bf0]/30 rounded-2xl p-6 max-w-md mx-auto shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
              For example:
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#783bf0] break-all block">
              srilakshmijewellers.{PLATFORM_DOMAIN}
            </span>
          </div>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
            Your shop gets its own online identity, while Aadagam takes care of the technology, hosting and website management behind the scenes.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 sm:py-24 bg-black text-white border-b border-stone-850">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#783bf0] bg-white px-4 py-1.5 rounded-full inline-block shadow-sm">
              HOW IT WORKS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Get Your Jewellery Shop Online in 4 Simple Steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left mb-12">
            {/* Step 1 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-3 shadow-md">
              <div className="text-[#783bf0] font-serif text-3xl font-bold">01</div>
              <h3 className="font-serif text-xl font-bold text-stone-900">01. Connect on WhatsApp</h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Reach out to us to get your verified showroom registration link.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-3 shadow-md">
              <div className="text-[#783bf0] font-serif text-3xl font-bold">02</div>
              <h3 className="font-serif text-xl font-bold text-stone-900">02. Add Your Collections</h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Upload your jewellery photos and organise them into collections.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-3 shadow-md">
              <div className="text-[#783bf0] font-serif text-3xl font-bold">03</div>
              <h3 className="font-serif text-xl font-bold text-stone-900">03. Add Your Business Details</h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Add your showroom location, phone number, WhatsApp helpline and live gold rate updates.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 space-y-3 shadow-md">
              <div className="text-[#783bf0] font-serif text-3xl font-bold">04</div>
              <h3 className="font-serif text-xl font-bold text-stone-900">04. Publish Your Website</h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Your jewellery shop website goes live instantly with your own Aadagam subdomain.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-stone-300 font-medium text-sm sm:text-base">
              No developers. No complicated setup.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 bg-[#783bf0] hover:bg-[#6828e8] text-white font-bold py-4 px-8 rounded-xl text-xs sm:text-sm tracking-wider uppercase shadow-xl shadow-[#783bf0]/25 transition-all hover:scale-105"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Connect on WhatsApp to Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* WHATSAPP ONBOARDING CTA SECTION */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-stone-50 to-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white border-2 border-[#783bf0]/20 rounded-3xl sm:rounded-[32px] p-8 sm:p-14 shadow-xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
              <MessageCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#783bf0] bg-[#783bf0]/10 px-3.5 py-1 rounded-full inline-block border border-[#783bf0]/30">
                Direct Onboarding
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
                Ready to Create Your Jewellery Website?
              </h2>
              <p className="text-stone-600 text-xs sm:text-base font-light max-w-lg mx-auto">
                Connect directly with our team on WhatsApp to get verified and receive your dedicated registration link to set up your showroom.
              </p>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row justify-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-8 rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-600/20 hover:scale-105"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp ({rawPhone})</span>
              </a>

              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold py-4 px-6 rounded-2xl text-xs sm:text-sm tracking-wider transition-all"
              >
                <Phone className="w-4 h-4 text-[#783bf0]" />
                <span>Call Us: {callPhone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Footer & Get In Touch */}
      <footer className="bg-stone-950 text-stone-400 border-t border-stone-850 pt-14 sm:pt-16 pb-8 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-12 border-b border-stone-900">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-6 space-y-4">
              <AadagamLogo variant="horizontal" size="lg" iconSrc="/logo_without_backround.png" iconClassName="w-16 h-18 sm:w-20 sm:h-20 scale-125" theme="dark" />
              <p className="text-stone-300 text-xs sm:text-sm font-light leading-relaxed max-w-md">
                Website for Jewellery Business | Aadagam. Take your jewellery business online with Aadagam. Build your website, showcase collections, share live gold rates and turn visitors into customer enquiries.
              </p>
            </div>

            {/* Column 2: Get In Touch */}
            <div className="lg:col-span-6 space-y-4">
              <h4 className="font-serif font-bold text-white text-lg tracking-wider uppercase">
                Get In Touch
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 font-normal">
                Mobile Number for calling | WhatsApp
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white border border-stone-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  <Phone className="w-4 h-4 text-[#783bf0]" />
                  <span className="text-white">Call: {callPhone}</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp: {rawPhone}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-light">
            <p>
              &copy; {new Date().getFullYear()} Aadagam. All Rights Reserved.
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline font-semibold"
            >
              Create Your Jewellery Website &rarr;
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
