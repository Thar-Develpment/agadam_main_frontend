import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerShop } from "../services/api";
import { getShopPrefix, getStorefrontUrl, PLATFORM_DOMAIN } from "../services/apiClient";
import AadagamLogo from "../components/AadagamLogo";
import {
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
  Eye,
  EyeOff,
  Building2,
  ArrowLeft,
} from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Showroom Registration | Aadagam";
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
  const [showPassword, setShowPassword] = useState(false);

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
    } else if (shopName.length > 50) {
      newErrors.shopName = "Shop name must not exceed 50 characters (backend constraint).";
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
    } else if (/\s/.test(pwd)) {
      newErrors.password = "Password must not contain spaces.";
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
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 font-sans selection:bg-[#783bf0] selection:text-white flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-200 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
            <AadagamLogo variant="horizontal" size="md" iconSrc="/logo_without_backround.png" iconClassName="w-16 h-18 sm:w-20 sm:h-20 scale-125" theme="light" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-[#783bf0] transition-colors px-3 py-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold px-4 py-2 rounded-xl text-xs tracking-wider transition-all shadow-sm"
            >
              <span>Admin Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Registration Container */}
      <main className="flex-1 py-10 sm:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-xl w-full">
          {registrationResult ? (
            /* ============================================================
             * SUCCESSFUL REGISTRATION SCREEN
             * ============================================================ */
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Registration Successful!
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Welcome to Aadagam Platform
                </h2>
                <p className="text-xs sm:text-sm text-stone-600 font-light max-w-sm mx-auto">
                  Your jewellery showroom website has been registered and initialized in the database.
                </p>
              </div>

              {/* Showroom Credentials Card */}
              <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-5 text-left space-y-3.5">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Your Showroom Subdomain Website:
                  </span>
                  <a
                    href={getStorefrontUrl(regData.shopName.toLowerCase())}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-base font-bold text-[#783bf0] hover:underline flex items-center gap-1.5 mt-0.5 break-all"
                  >
                    <span>{registrationResult.domain || `${regData.shopName.toLowerCase()}.${PLATFORM_DOMAIN}`}</span>
                    <ExternalLink className="w-4 h-4 shrink-0" />
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">Shop Name</span>
                    <span className="font-semibold text-stone-800">{regData.shopName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">City</span>
                    <span className="font-semibold text-stone-800">{regData.city}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">Admin Email</span>
                    <span className="font-semibold text-stone-800 break-all">{regData.email}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 uppercase block">Password / PIN</span>
                    <span className="font-mono text-stone-800">••••••••</span>
                  </div>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={getStorefrontUrl(regData.shopName.toLowerCase())}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#783bf0] hover:bg-[#6828e8] text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all"
                >
                  <span>Open Your Website</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <Link
                  to="/admin"
                  className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all"
                >
                  <span>Sign In as Admin</span>
                </Link>
              </div>
            </div>
          ) : (
            /* ============================================================
             * REGISTRATION FORM
             * ============================================================ */
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 md:p-10 shadow-xl space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-[#783bf0]/10 text-[#783bf0] border border-[#783bf0]/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Showroom Onboarding</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Register Your Jewellery Business
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 font-light max-w-md mx-auto">
                  Fill in your showroom details to activate your custom website subdomain and catalogue portal.
                </p>
              </div>

              {errors.submit && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{errors.submit}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4 text-left">
                {/* Jewellery Shop Name */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                      Jewellery Shop Name <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {regData.shopName.trim().length}/50 chars max
                    </span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                      <Store className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="e.g. Srilakshmi (max 50 chars)"
                      value={regData.shopName}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                        setRegData({ ...regData, shopName: cleanVal });
                        if (errors.shopName) setErrors({ ...errors, shopName: null });
                      }}
                      className={`w-full pl-11 pr-4 py-3 bg-[#FAF9F5] border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.shopName
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-stone-300 focus:border-[#783bf0] focus:ring-[#783bf0]/20"
                      }`}
                    />
                  </div>
                  {regData.shopName && (
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      Subdomain: <strong className="text-[#783bf0]">{regData.shopName.toLowerCase()}.aadagam.com</strong>
                    </span>
                  )}
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
                      className={`w-full pl-11 pr-4 py-3 bg-[#FAF9F5] border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.ownerName
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-stone-300 focus:border-[#783bf0] focus:ring-[#783bf0]/20"
                      }`}
                    />
                  </div>
                  {errors.ownerName && (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                      {errors.ownerName}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                        placeholder="owner@example.com"
                        value={regData.email}
                        onChange={(e) => {
                          setRegData({ ...regData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: null });
                        }}
                        className={`w-full pl-11 pr-4 py-3 bg-[#FAF9F5] border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-stone-300 focus:border-[#783bf0] focus:ring-[#783bf0]/20"
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {regData.city.trim().length}/12 max
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={12}
                        placeholder="e.g. Mumbai"
                        value={regData.city}
                        onChange={(e) => {
                          setRegData({ ...regData, city: e.target.value });
                          if (errors.city) setErrors({ ...errors, city: null });
                        }}
                        className={`w-full pl-11 pr-4 py-3 bg-[#FAF9F5] border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.city
                            ? "border-rose-400 focus:ring-rose-200"
                            : "border-stone-300 focus:border-[#783bf0] focus:ring-[#783bf0]/20"
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
                    Account Password / PIN <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      maxLength={8}
                      placeholder="Enter exactly 8 characters"
                      value={regData.password}
                      onKeyDown={(e) => {
                        if (e.key === " ") e.preventDefault();
                      }}
                      onChange={(e) => {
                        const cleanPassword = e.target.value.replace(/\s/g, "");
                        setRegData({ ...regData, password: cleanPassword });
                        if (errors.password) setErrors({ ...errors, password: null });
                      }}
                      className={`w-full pl-11 pr-11 py-3 bg-[#FAF9F5] border rounded-2xl text-sm focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? "border-rose-400 focus:ring-rose-200"
                          : "border-stone-300 focus:border-[#783bf0] focus:ring-[#783bf0]/20"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-700 focus:outline-none cursor-pointer"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                      {errors.password}
                    </span>
                  )}

                  {/* Password Checklist Signal Display */}
                  <div className="mt-3 space-y-1.5 bg-stone-50 border border-stone-200 rounded-2xl p-3.5 text-xs text-stone-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                      <div className={`flex items-center gap-2 ${checks.length ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${checks.length ? "text-emerald-500" : "text-stone-300"}`} />
                        <span>Exactly 8 characters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${checks.uppercase ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${checks.uppercase ? "text-emerald-500" : "text-stone-300"}`} />
                        <span>At least 1 uppercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 ${checks.lowercase ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${checks.lowercase ? "text-emerald-500" : "text-stone-300"}`} />
                        <span>At least 1 lowercase letter</span>
                      </div>
                      <div className={`flex items-center gap-2 ${checks.number ? "text-emerald-700 font-medium" : "text-stone-400"}`}>
                        <CheckCircle2 className={`w-3.5 h-3.5 ${checks.number ? "text-emerald-500" : "text-stone-300"}`} />
                        <span>At least 1 number</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Register Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-[#783bf0] hover:bg-[#6828e8] text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md shadow-[#783bf0]/20 hover:shadow-xl hover:shadow-[#783bf0]/30 disabled:opacity-75 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Registering Showroom...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-white" />
                      <span>Create Your Jewellery Website</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6 text-center text-xs text-stone-500">
        <p>&copy; {new Date().getFullYear()} Aadagam Platform. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
