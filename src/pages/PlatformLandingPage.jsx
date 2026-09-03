import React, { useState } from "react";
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
  TrendingUp,
  Video,
  Download,
  Layers,
  MessageCircle,
} from "lucide-react";

export default function PlatformLandingPage() {
  const navigate = useNavigate();

  const [regData, setRegData] = useState({
    shopName: "",
    ownerName: "",
    phone: "",
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

    const cleanPhone = regData.phone.replace(/\D/g, "");
    if (!regData.phone.trim()) {
      newErrors.phone = "Mobile phone number is required.";
    } else if (cleanPhone.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
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
              <span className="font-serif text-base sm:text-2xl font-bold text-stone-900 tracking-wider block">
                AADAGAM PLATFORM
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#B8860B] font-semibold uppercase tracking-widest block -mt-1">
                Jewellery Business Platform
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
              <span>Register Shop</span>
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
              <span>Register</span>
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
              <span>SaaS Platform for Single-Tenant Jewellery Shops</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Launch Your Luxury Jewellery Digital Store in Minutes
            </h1>

            <p className="text-stone-300 text-sm sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Empower your physical jewellery showroom with an elegant, mobile-responsive online website featuring high-definition product galleries, live gold rates, YouTube video showcases, daily WhatsApp status cards, and direct customer enquiries.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center items-stretch sm:items-center gap-3 sm:gap-4 pt-4 max-w-md sm:max-w-none mx-auto">
              <a
                href="#register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C5A059] text-stone-950 font-bold py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl text-xs sm:text-sm tracking-wider uppercase shadow-xl transition-all hover:scale-105"
              >
                <span>Register Your Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                to="/shop"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-[#D4AF37] py-3.5 sm:py-4 px-6 sm:px-7 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all"
              >
                <span>Preview Live Client Storefront</span>
                <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-14 sm:py-24 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B8860B] bg-[#D4AF37]/15 px-3 py-1 rounded-full inline-block border border-[#D4AF37]/30">
              Complete Storefront Modules
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Everything Your Jewellery Shop Needs
            </h2>
            <p className="text-stone-600 text-xs sm:text-base font-light">
              Designed specifically for gold, diamond, polki, and antique jewellery retailers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 text-left">
            {/* Feature 1 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Hero Banner Carousel
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Auto-rotating hero banners with distinct high-res desktop (1920x700) and mobile (1024x600) image support, dot navigation, and CTA overlays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                <Gem className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Interactive Lightbox Gallery
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Filterable categories (Necklaces, Earrings, Bangles, Rings, Bridal Sets) with interactive full-screen Lightbox modal preview & keyboard controls.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                YouTube Video Showcase
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Embed videos of your atelier, artisan craftsmanship, diamond purity guides, and bridal fashion shows with built-in modal player.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Direct Customer Enquiries
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Integrated enquiry forms and per-product links allowing buyers to inquire about specific jewellery pieces directly from the website.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Live Gold & Silver Rates
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Real-time bullion rates ticker displaying daily 24K pure gold, 22K standard hallmarked gold, 18K diamond gold, and 999 fine silver.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                WhatsApp Status Downloads
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Allow customers to download daily high-resolution jewellery cards and short video stories directly to share on their WhatsApp status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP OWNER REGISTRATION SECTION */}
      <section id="register" className="py-14 sm:py-24 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-10 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B8860B] bg-[#D4AF37]/15 px-3.5 py-1 rounded-full inline-block border border-[#D4AF37]/30">
              Instant Onboarding
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Register Your Jewellery Business
            </h2>
            <p className="text-stone-600 text-xs sm:text-base font-light">
              Fill in your shop details below to register your business and launch your storefront.
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

                  {/* Mobile Phone */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                      Mobile Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        maxLength={15}
                        placeholder="e.g. +91 98765 43210"
                        value={regData.phone}
                        onChange={(e) => {
                          setRegData({ ...regData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: null });
                        }}
                        className={`w-full pl-11 pr-4 py-3.5 bg-stone-50/50 border rounded-2xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.phone
                            ? "border-rose-400 focus:ring-rose-200 focus:bg-white"
                            : "border-stone-200 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20 focus:bg-white"
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                        {errors.phone}
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

                  {/* City / Location */}
                  <div className="sm:col-span-2">
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
                      <span>Complete Registration</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Platform Footer */}
      <footer className="bg-stone-950 text-stone-400 border-t border-stone-850 pt-14 sm:pt-16 pb-8 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 pb-12 border-b border-stone-900">
            {/* Column 1: Brand Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center">
                  <Gem className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <span className="font-serif text-2xl font-bold text-white tracking-wider">
                  AADAGAM PLATFORM
                </span>
              </div>
              <p className="text-stone-400 text-xs sm:text-sm font-light leading-relaxed max-w-sm">
                Empowering independent jewellery showrooms and boutique goldsmiths to build premium digital catalogues, display artisan craftsmanship, and receive client enquiries directly.
              </p>
            </div>

            {/* Column 2: Platform Features */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="font-serif font-bold text-white text-base tracking-wider uppercase">
                Platform Features
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm font-light text-stone-400">
                <li className="hover:text-[#D4AF37] transition-colors">Instant Tenant Onboarding</li>
                <li className="hover:text-[#D4AF37] transition-colors">Dynamic Image Catalogue</li>
                <li className="hover:text-[#D4AF37] transition-colors">Live Bullion Rates Tracker</li>
                <li className="hover:text-[#D4AF37] transition-colors">YouTube Atelier Showcase</li>
                <li className="hover:text-[#D4AF37] transition-colors">WhatsApp Status Downloads</li>
              </ul>
            </div>

            {/* Column 3: Contact & Support */}
            <div className="lg:col-span-4 space-y-3">
              <h4 className="font-serif font-bold text-white text-base tracking-wider uppercase">
                Contact & Support
              </h4>
              <p className="text-xs sm:text-sm text-stone-400 font-light leading-relaxed">
                Have questions about single-tenant plans, hosting custom subdomains, or technical integrations?
              </p>
              <div className="pt-2 text-xs text-stone-500 font-mono space-y-1">
                <p>Support: <a href="mailto:support@aadagam.com" className="hover:text-[#D4AF37]">support@aadagam.com</a></p>
                <p>Partnerships: <a href="mailto:partner@aadagam.com" className="hover:text-[#D4AF37]">partner@aadagam.com</a></p>
                <p className="text-[#D4AF37] font-sans text-[11px] font-semibold mt-1">Available 24/7 for technical assistance</p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-light">
            <p>
              &copy; {new Date().getFullYear()} Aadagam SaaS Platform. All Rights Reserved.
            </p>
            <div className="flex items-center gap-1 text-stone-400">
              <span>Crafted for luxury retail showrooms</span>
            </div>
            <a
              href="#register"
              className="text-[#D4AF37] hover:underline font-semibold"
            >
              Start Your Showroom &rarr;
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
