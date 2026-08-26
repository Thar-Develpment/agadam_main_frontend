import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerShop } from "../services/api";
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
  QrCode,
  Video,
  Star,
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
    specialization: "22K Gold & Diamonds",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const validate = () => {
    const newErrors = {};

    if (!regData.shopName.trim()) {
      newErrors.shopName = "Jewellery shop name is required.";
    }

    if (!regData.ownerName.trim()) {
      newErrors.ownerName = "Owner / Contact person name is required.";
    }

    const cleanPhone = regData.phone.replace(/\D/g, "");
    if (!regData.phone.trim()) {
      newErrors.phone = "Mobile phone number is required.";
    } else if (cleanPhone.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }

    if (!regData.email.trim()) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(regData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!regData.password || regData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long.";
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
        setRegistrationResult(response);
        setErrors({});
      } else {
        setErrors({ submit: response.message || "Registration failed." });
      }
    } catch (err) {
      console.error("Shop registration error:", err);
      setIsSubmitting(false);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 font-sans selection:bg-[#D4AF37] selection:text-stone-950">
      {/* Platform Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-stone-900 border border-[#D4AF37] flex items-center justify-center shadow-md">
              <Gem className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-wider block">
                AGADAM PLATFORM
              </span>
              <span className="text-[10px] text-[#B8860B] font-semibold uppercase tracking-widest block -mt-1">
                Jewellery Business Platform
              </span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#B8860B] transition-colors"
            >
              <span>View Client Storefront Demo</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <a
              href="#register"
              className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2 rounded-xl text-xs tracking-wider uppercase transition-all shadow-sm border border-[#D4AF37]/40"
            >
              <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Register Shop</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 bg-stone-950 text-white overflow-hidden border-b border-stone-800">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F3E5AB] px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>SaaS Platform for Single-Tenant Jewellery Shops</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white leading-tight">
              Launch Your Luxury Jewellery Digital Store in Minutes
            </h1>

            <p className="text-stone-300 text-base sm:text-lg font-light leading-relaxed max-w-2xl mx-auto">
              Empower your physical jewellery showroom with an elegant, mobile-responsive online website featuring high-definition product galleries, YouTube video showcases, direct WhatsApp enquiries, and QR code counter sharing.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <a
                href="#register"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#C5A059] via-[#D4AF37] to-[#B8860B] hover:from-[#D4AF37] hover:to-[#C5A059] text-stone-950 font-bold py-4 px-8 rounded-xl text-sm tracking-wider uppercase shadow-xl transition-all hover:scale-105"
              >
                <span>Register Your Shop Now</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 hover:border-[#D4AF37] py-4 px-7 rounded-xl text-sm font-semibold tracking-wider transition-all"
              >
                <span>Preview Live Client Storefront</span>
                <ExternalLink className="w-4 h-4 text-[#D4AF37]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 sm:py-24 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B8860B] bg-[#D4AF37]/15 px-3 py-1 rounded-full inline-block border border-[#D4AF37]/30">
              Complete Storefront Modules
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Everything Your Jewellery Shop Needs
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-light">
              Designed specifically for gold, diamond, polki, and antique jewellery retailers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
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
                Direct WhatsApp Enquiries
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Fixed floating WhatsApp button and per-product WhatsApp links allowing buyers to enquire about specific items instantly.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Storefront QR Code Display
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Counter-top QR code modal and download feature enabling walk-in customers to save your digital website to their mobile devices.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Google Reviews & Social Trust
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed">
                Highlight your 5-star Google ratings, verified customer feedback, showroom address map embed, and social media handles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SHOP OWNER REGISTRATION SECTION */}
      <section id="register" className="py-16 sm:py-24 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-10 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#B8860B] bg-[#D4AF37]/15 px-3.5 py-1 rounded-full inline-block border border-[#D4AF37]/30">
              Instant Onboarding
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
              Register Your Jewellery Business
            </h2>
            <p className="text-stone-600 text-sm sm:text-base font-light">
              Fill in your shop details below to register your business and launch your storefront.
            </p>
          </div>

          {/* Registration Result Screen or Form */}
          {registrationResult ? (
            <div className="bg-[#FAF9F5] border-2 border-[#D4AF37]/40 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-6 animate-fade-in text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                  Account Created
                </span>
                <h3 className="font-serif text-3xl font-bold text-stone-900">
                  {registrationResult.shopName}
                </h3>
                <p className="text-stone-600 text-sm font-light">
                  {registrationResult.message}
                </p>
              </div>

              <div className="bg-white border border-stone-200 rounded-2xl p-4 max-w-sm mx-auto font-mono text-xs text-stone-700 space-y-1">
                <div>Shop ID: <strong className="text-stone-900">{registrationResult.shopId}</strong></div>
                <div>Registered: {new Date(registrationResult.registeredAt).toLocaleDateString()}</div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => navigate("/shop")}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-stone-900 to-stone-800 hover:from-stone-800 hover:to-stone-700 text-[#FAF9F5] font-bold py-3.5 px-8 rounded-xl text-sm tracking-wider uppercase transition-all shadow-lg"
                >
                  <Store className="w-4 h-4 text-[#D4AF37]" />
                  <span>Launch Live Client Storefront</span>
                </button>

                <button
                  onClick={() => setRegistrationResult(null)}
                  className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold py-3.5 px-6 rounded-xl text-sm transition-colors"
                >
                  Register Another Shop
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF9F5] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-10 shadow-xl text-left">
              <form onSubmit={handleRegister} className="space-y-6">
                {errors.submit && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errors.submit}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Shop Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Jewellery Shop Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Store className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Agadam Jewellery & Gems"
                        value={regData.shopName}
                        onChange={(e) => {
                          setRegData({ ...regData, shopName: e.target.value });
                          if (errors.shopName) setErrors({ ...errors, shopName: null });
                        }}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.shopName
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-stone-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                        }`}
                      />
                    </div>
                    {errors.shopName && (
                      <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                        {errors.shopName}
                      </span>
                    )}
                  </div>

                  {/* Owner / Manager Name */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Owner / Manager Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Rajeshwar Agadam"
                        value={regData.ownerName}
                        onChange={(e) => {
                          setRegData({ ...regData, ownerName: e.target.value });
                          if (errors.ownerName) setErrors({ ...errors, ownerName: null });
                        }}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.ownerName
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-stone-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
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
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Mobile Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={regData.phone}
                        onChange={(e) => {
                          setRegData({ ...regData, phone: e.target.value });
                          if (errors.phone) setErrors({ ...errors, phone: null });
                        }}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.phone
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-stone-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
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
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        placeholder="e.g. owner@agadamjewellery.com"
                        value={regData.email}
                        onChange={(e) => {
                          setRegData({ ...regData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: null });
                        }}
                        className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-stone-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
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
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Showroom City / City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Mumbai, Maharashtra"
                        value={regData.city}
                        onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                      Primary Specialization
                    </label>
                    <select
                      value={regData.specialization}
                      onChange={(e) => setRegData({ ...regData, specialization: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
                    >
                      <option value="22K Gold & Diamonds">22K Gold & Solitaire Diamonds</option>
                      <option value="Antique Kundan & Polki">Antique Kundan & Polki Bridal</option>
                      <option value="Temple Nakshi Gold">Temple Nakshi Gold</option>
                      <option value="Silver & Lightweight Fashion">Silver & Lightweight Fashion</option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                    Account Secret Pin / Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={regData.password}
                      onChange={(e) => {
                        setRegData({ ...regData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-stone-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                      {errors.password}
                    </span>
                  )}
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 hover:from-stone-800 hover:to-stone-900 text-[#FAF9F5] font-bold py-4 px-6 rounded-xl text-sm tracking-wider uppercase transition-all shadow-lg disabled:opacity-75"
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
      <footer className="bg-stone-950 text-stone-400 text-xs py-8 border-t border-stone-800 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2">
            <Gem className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-serif font-bold text-stone-200 text-base">AGADAM PLATFORM</span>
          </div>
          <p>© {new Date().getFullYear()} Agadam SaaS Platform. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
