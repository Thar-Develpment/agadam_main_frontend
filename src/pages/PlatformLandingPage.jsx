import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerShop } from "../services/api";
import { getShopPrefix } from "../services/apiClient";
import {
  Gem,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  Lock,
  Loader2,
  AlertCircle,
  ExternalLink,
  MessageCircle,
  Star,
  BookOpen,
  TrendingUp,
  LayoutDashboard,
  Smartphone,
} from "lucide-react";

export default function PlatformLandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Website for Jewellery Business | Aadagam";
  }, []);

  const [regData, setRegData] = useState({
    shopName: "",
    ownerName: "",
    email: "",
    city: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const pwd = regData.password || "";
  const checks = {
    length: pwd.length === 8,
    uppercase: /[A-Z]/.test(pwd),
    lowercase: /[a-z]/.test(pwd),
    number: /[0-9]/.test(pwd),
  };

  const validate = () => {
    const newErrors = {};

    const shopName = regData.shopName.trim();
    if (!shopName) {
      newErrors.shopName = "Jewellery shop name is required.";
    } else if (shopName.length > 10) {
      newErrors.shopName = "Shop name must not exceed 10 characters (backend constraint).";
    }

    const ownerName = regData.ownerName.trim();
    if (!ownerName) {
      newErrors.ownerName = "Owner / Contact person name is required.";
    } else if (ownerName.length > 150) {
      newErrors.ownerName = "Owner name must not exceed 150 characters.";
    }

    const email = regData.email.trim();
    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    } else if (email.length > 255) {
      newErrors.email = "Email must not exceed 255 characters.";
    }

    const city = regData.city.trim();
    if (!city) {
      newErrors.city = "City is required.";
    } else if (city.length > 12) {
      newErrors.city = "City name must not exceed 12 characters (backend constraint).";
    }

    if (pwd.length !== 8) {
      newErrors.password = "Password must be exactly 8 characters long.";
    } else if (!/[A-Z]/.test(pwd)) {
      newErrors.password = "Password must contain at least one uppercase letter.";
    } else if (!/[a-z]/.test(pwd)) {
      newErrors.password = "Password must contain at least one lowercase letter.";
    } else if (!/[0-9]/.test(pwd)) {
      newErrors.password = "Password must contain at least one number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegistrationResult(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await registerShop(regData);
      setIsSubmitting(false);

      if (response.success) {
        const existingTenants = JSON.parse(
          localStorage.getItem("aadagam_registered_tenants") || "[]"
        );
        existingTenants.push({
          ...regData,
          domain: response.domain,
          registeredAt: response.registeredAt,
        });
        localStorage.setItem("aadagam_registered_tenants", JSON.stringify(existingTenants));

        setRegistrationResult(response);
      } else {
        setErrors({ submit: response.message || "Registration failed." });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setIsSubmitting(false);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 font-sans selection:bg-[#D4AF37] selection:text-stone-950 w-full max-w-full overflow-x-hidden">
      {/* Platform Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-900 border border-[#D4AF37] flex items-center justify-center shadow-md shrink-0">
              <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-2xl font-bold text-stone-900 tracking-wider block">
                AADAGAM
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#B8860B] font-semibold uppercase tracking-widest block -mt-1">
                Website for Jewellery Business
              </span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-4 sm:gap-6">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-850 hover:text-[#B8860B] transition-colors"
            >
              <span>Admin Sign In</span>
            </Link>

            <span className="text-stone-300">|</span>

            <Link
              to="/shop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-stone-900 border border-[#D4AF37]/50 font-bold px-3.5 py-2 rounded-xl text-xs tracking-wider transition-all shadow-sm hover:shadow"
            >
              <span>View Demo Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B8860B]" />
            </Link>

            <a
              href="#register"
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2 rounded-xl text-xs tracking-wider uppercase transition-all shadow-sm border border-[#D4AF37]/40"
            >
              <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Create Your Jewellery Website</span>
            </a>
          </div>

          {/* Mobile Nav Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/admin"
              className="text-xs font-bold text-stone-800 hover:text-[#B8860B] px-3 py-1.5 rounded-lg border border-stone-300 bg-white"
            >
              Sign In
            </Link>
            <a
              href="#register"
              className="bg-stone-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 flex items-center gap-1 shadow-xs"
            >
              <span>Create Website</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-14 sm:py-24 bg-stone-950 text-white overflow-hidden border-b border-stone-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] px-3.5 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
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
                href="#register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C5A059] text-stone-950 font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl text-xs sm:text-sm tracking-wider uppercase shadow-xl transition-all hover:scale-105"
              >
                <span>Create Your Jewellery Website</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                to="/shop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-[#D4AF37] py-3.5 sm:py-4 px-6 sm:px-7 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all"
              >
                <span>View Demo Website</span>
                <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
              </Link>
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
            <div className="inline-block bg-[#FAF9F5] border border-[#D4AF37]/40 rounded-2xl p-4 sm:p-5 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-stone-900 tracking-wide">
                No complicated website setup. No coding. Just a simple online presence built for your jewellery business.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Everything Your Jewellery Shop Needs to Grow Online */}
      <section className="py-14 sm:py-24 bg-[#FAF9F5] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B8860B] bg-[#D4AF37]/15 px-3 py-1 rounded-full inline-block border border-[#D4AF37]/30">
              Features
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Everything Your Jewellery Shop Needs to Grow Online
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {/* 01 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center font-bold text-sm">
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
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center font-bold text-sm">
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
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center font-bold text-sm">
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
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center font-bold text-sm">
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
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center font-bold text-sm">
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
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center font-bold text-sm">
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
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center font-bold text-sm">
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
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center font-bold text-sm">
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

          <div className="bg-[#FAF9F5] border-2 border-[#D4AF37]/30 rounded-2xl p-6 max-w-md mx-auto shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
              For example:
            </span>
            <span className="font-mono text-base sm:text-lg font-bold text-[#B8860B] break-all block">
              srilakshmijewellers.aadagam.in
            </span>
          </div>

          <p className="text-stone-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-light">
            Your shop gets its own online identity, while Aadagam takes care of the technology, hosting and website management behind the scenes.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-14 sm:py-24 bg-stone-950 text-white border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/20 px-3.5 py-1 rounded-full inline-block border border-[#D4AF37]/40">
              HOW IT WORKS
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white">
              Get Your Jewellery Shop Online in 4 Simple Steps.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-left mb-12">
            {/* Step 1 */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3">
              <div className="text-[#D4AF37] font-serif text-3xl font-bold">01</div>
              <h3 className="font-serif text-xl font-bold text-white">01. Create Your Account</h3>
              <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
                Enter your jewellery shop details and get started.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3">
              <div className="text-[#D4AF37] font-serif text-3xl font-bold">02</div>
              <h3 className="font-serif text-xl font-bold text-white">02. Add Your Collections</h3>
              <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
                Upload your jewellery photos and organise them into collections.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3">
              <div className="text-[#D4AF37] font-serif text-3xl font-bold">03</div>
              <h3 className="font-serif text-xl font-bold text-white">03. Add Your Business Details</h3>
              <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
                Add your shop location, phone number, WhatsApp number, opening hours and other important information.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3">
              <div className="text-[#D4AF37] font-serif text-3xl font-bold">04</div>
              <h3 className="font-serif text-xl font-bold text-white">04. Publish Your Website</h3>
              <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
                Your jewellery shop website goes live with your own Aadagam subdomain.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-stone-300 font-medium text-sm sm:text-base">
              No developers. No complicated setup.
            </p>

            <a
              href="#register"
              className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C5A059] text-stone-950 font-bold py-4 px-8 rounded-xl text-xs sm:text-sm tracking-wider uppercase shadow-xl transition-all hover:scale-105"
            >
              <span>Create Your Jewellery Website</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* SHOP OWNER REGISTRATION SECTION */}
      <section id="register" className="py-14 sm:py-24 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-10 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B8860B] bg-[#D4AF37]/15 px-3.5 py-1 rounded-full inline-block border border-[#D4AF37]/30">
              Get Started
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Create Your Jewellery Website
            </h2>
            <p className="text-stone-600 text-xs sm:text-base font-light">
              Enter your jewellery shop details below to get started.
            </p>
          </div>

          {/* Registration Result Screen or Form */}
          {registrationResult ? (
            <div className="bg-[#FAF9F5] border-2 border-[#D4AF37]/40 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-6 animate-fade-in text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>

              <div className="space-y-2">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Account Created
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {registrationResult.shopName}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm font-light">
                  {registrationResult.message}
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-5 max-w-sm mx-auto font-mono text-xs text-stone-700 space-y-2 text-left">
                <div>Shop ID: <strong className="text-stone-900">{registrationResult.shopId}</strong></div>
                <div>Registered: {new Date(registrationResult.registeredAt).toLocaleDateString()}</div>
                <div className="border-t border-stone-100 pt-2 mt-2">
                  <span className="block text-[10px] text-stone-400 font-sans uppercase font-bold tracking-wider mb-1">Your Store URL:</span>
                  <a
                    href={`http://${registrationResult.domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#B8860B] hover:underline font-bold text-sm break-all"
                  >
                    {registrationResult.domain}
                  </a>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                <a
                  href={`/shop?shop=${getShopPrefix(registrationResult.domain)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-[#FAF9F5] font-bold py-3.5 px-8 rounded-xl text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg"
                >
                  <Store className="w-4 h-4 text-[#D4AF37]" />
                  <span>Launch Live Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
                </a>

                <button
                  onClick={() => navigate("/admin")}
                  className="bg-stone-900 hover:bg-stone-850 text-white border border-stone-800 font-semibold py-3.5 px-6 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Admin Sign In
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#D4AF37]/20 rounded-3xl sm:rounded-[32px] p-6 sm:p-12 shadow-2xl shadow-stone-900/5 text-left transition-all">
              <form onSubmit={handleRegister} className="space-y-6">
                {errors.submit && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-4 rounded-2xl flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500" />
                    <span>{errors.submit}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                  {/* Shop Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Jewellery Shop Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <Store className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="e.g. royaljewel (max 10)"
                        value={regData.shopName}
                        onChange={(e) => {
                          setRegData({ ...regData, shopName: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") });
                          if (errors.shopName) setErrors({ ...errors, shopName: null });
                        }}
                        className={`w-full pl-11 pr-4 py-3.5 bg-stone-50/50 border rounded-2xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.shopName
                            ? "border-rose-400 focus:ring-rose-200 focus:bg-white"
                            : "border-stone-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 focus:bg-white"
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 mt-1 block">Subdomain: {regData.shopName || "yourshop"}.aadagam.com (max 10 chars)</span>
                    {errors.shopName && (
                      <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                        {errors.shopName}
                      </span>
                    )}
                  </div>

                  {/* Owner / Manager Name */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Owner / Manager Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={150}
                        placeholder="e.g. Rajesh Kumar"
                        value={regData.ownerName}
                        onChange={(e) => {
                          setRegData({ ...regData, ownerName: e.target.value });
                          if (errors.ownerName) setErrors({ ...errors, ownerName: null });
                        }}
                        className={`w-full pl-11 pr-4 py-3.5 bg-stone-50/50 border rounded-2xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.ownerName
                            ? "border-rose-400 focus:ring-rose-200 focus:bg-white"
                            : "border-stone-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 focus:bg-white"
                        }`}
                      />
                    </div>
                    {errors.ownerName && (
                      <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                        {errors.ownerName}
                      </span>
                    )}
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        maxLength={255}
                        placeholder="e.g. owner@example.com"
                        value={regData.email}
                        onChange={(e) => {
                          setRegData({ ...regData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: null });
                        }}
                        className={`w-full pl-11 pr-4 py-3.5 bg-stone-50/50 border rounded-2xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? "border-rose-400 focus:ring-rose-200 focus:bg-white"
                            : "border-stone-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 focus:bg-white"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  {/* Showroom City */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Showroom City <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="e.g. Mumbai (max 12 chars)"
                        value={regData.city}
                        onChange={(e) => {
                          setRegData({ ...regData, city: e.target.value });
                          if (errors.city) setErrors({ ...errors, city: null });
                        }}
                        className={`w-full pl-11 pr-4 py-3.5 bg-stone-50/50 border rounded-2xl text-base sm:text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                          errors.city
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-stone-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                        }`}
                      />
                    </div>
                    {errors.city && (
                      <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                        {errors.city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                    Account Secret Pin / Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      maxLength={8}
                      placeholder="Enter exactly 8 characters"
                      value={regData.password}
                      onChange={(e) => {
                        setRegData({ ...regData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      className={`w-full pl-11 pr-4 py-3.5 bg-stone-50/50 border rounded-2xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? "border-rose-400 focus:ring-rose-200 focus:bg-white"
                          : "border-stone-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 focus:bg-white"
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                      {errors.password}
                    </span>
                  )}

                  {/* Password Checklist Signal Display */}
                  <div className="mt-3.5 space-y-2 bg-stone-50 border border-stone-100 rounded-2xl p-4 text-xs text-stone-600 shadow-inner">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                      <div className={`flex items-center gap-2 transition-colors duration-250 ${checks.length ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                        <CheckCircle2 className={`w-4 h-4 transition-all ${checks.length ? "text-emerald-500 fill-emerald-50" : "text-stone-300"}`} />
                        <span>Exactly 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-colors duration-250 ${checks.uppercase ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                        <CheckCircle2 className={`w-4 h-4 transition-all ${checks.uppercase ? "text-emerald-500 fill-emerald-50" : "text-stone-300"}`} />
                        <span>At least 1 uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-colors duration-250 ${checks.lowercase ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                        <CheckCircle2 className={`w-4 h-4 transition-all ${checks.lowercase ? "text-emerald-500 fill-emerald-50" : "text-stone-300"}`} />
                        <span>At least 1 lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 transition-colors duration-250 ${checks.number ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                        <CheckCircle2 className={`w-4 h-4 transition-all ${checks.number ? "text-emerald-500 fill-emerald-50" : "text-stone-300"}`} />
                        <span>At least 1 number</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-[#FAF9F5] border border-[#D4AF37]/30 hover:border-[#D4AF37] font-bold py-4 px-6 rounded-2xl text-sm tracking-wider uppercase transition-all shadow-md shadow-stone-950/10 hover:shadow-xl hover:shadow-[#D4AF37]/5 hover:-translate-y-0.5 disabled:opacity-75 disabled:hover:translate-y-0 disabled:hover:shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                      <span>Registering Business...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                      <span>Create Your Jewellery Website</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Platform Footer & Get In Touch */}
      <footer className="bg-stone-950 text-stone-400 border-t border-stone-850 pt-14 sm:pt-16 pb-8 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-12 border-b border-stone-900">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center">
                  <Gem className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <span className="font-serif text-2xl font-bold text-white tracking-wider">
                  AADAGAM
                </span>
              </div>
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
                  href="tel:+919876543210"
                  className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-[#D4AF37] border border-stone-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  <Phone className="w-4 h-4 text-[#D4AF37]" />
                  <span>Call Mobile Number</span>
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
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
              href="#register"
              className="text-[#D4AF37] hover:underline font-semibold"
            >
              Create Your Jewellery Website &rarr;
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
