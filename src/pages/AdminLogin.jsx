import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowLeft, Gem, Loader2, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!formData.email.trim() || !formData.password) {
      setErrors({ submit: "Please enter both email and password." });
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);

      // Retrieve registered shops from localStorage
      const tenants = JSON.parse(localStorage.getItem("aadagam_registered_tenants") || "[]");
      
      // Look for a matching tenant
      const matchingTenant = tenants.find(
        (t) => t.email.toLowerCase() === formData.email.toLowerCase() && t.password === formData.password
      );

      if (matchingTenant) {
        // Store current logged-in session details
        localStorage.setItem("aadagam_current_admin", JSON.stringify(matchingTenant));
        navigate("/admin/dashboard");
      } else {
        setErrors({
          submit: "Invalid email or password. If you haven't registered your showroom yet, please register on the homepage.",
        });
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center items-center px-4 py-12 text-stone-800 selection:bg-[#D4AF37] selection:text-stone-950">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-[#B8860B] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Homepage</span>
      </Link>

      <div className="max-w-md w-full space-y-8 bg-white border border-[#D4AF37]/20 rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-stone-900/5 relative">
        {/* Brand Icon and Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-stone-950 border border-[#D4AF37] text-[#D4AF37] mb-4 shadow-lg">
            <Gem className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-stone-900 tracking-wide">
            Admin Sign In
          </h2>
          <p className="text-xs text-stone-500 mt-1.5 max-w-xs mx-auto">
            Log in to manage your showroom's dynamic catalogues, slideshows, and contact settings.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5 pt-2">
          {errors.submit && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 text-xs p-4 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 text-rose-500 mt-0.5" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="e.g. manager@yourbrand.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-11 pr-4 py-3.5 bg-stone-50/50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-[#FAF9F5] border border-[#D4AF37]/30 hover:border-[#D4AF37] font-bold py-4 px-6 rounded-2xl text-sm tracking-wider uppercase transition-all shadow-md shadow-stone-950/10 hover:shadow-xl hover:shadow-[#D4AF37]/5 hover:-translate-y-0.5 disabled:opacity-75 disabled:hover:translate-y-0 disabled:hover:shadow-md mt-4"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer Link to Registration */}
        <div className="text-center text-xs text-stone-500 pt-4 border-t border-stone-100 mt-6">
          <span>Don't have a storefront yet? </span>
          <a href="/#register" className="text-[#B8860B] hover:underline font-semibold">
            Register your showroom now
          </a>
        </div>
      </div>
    </div>
  );
}
