import React, { useState } from "react";
import { submitEnquiry } from "../services/api";
import { Send, CheckCircle2, AlertCircle, Loader2, Phone, User, MessageSquare, Mail } from "lucide-react";

export default function EnquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const validate = () => {
    const newErrors = {};

    const name = formData.name.trim();
    if (!name) {
      newErrors.name = "Customer name is required.";
    } else if (name.length > 20) {
      newErrors.name = "Name must not exceed 20 characters (backend constraint).";
    }

    const cleanPhone = formData.phone.replace(/\D/g, "");
    if (!formData.phone.trim()) {
      newErrors.phone = "Mobile number is required.";
    } else if (cleanPhone.length < 10) {
      newErrors.phone = "Please enter a valid 10-digit mobile number.";
    }

    const email = formData.email.trim();
    if (!email) {
      newErrors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    } else if (email.length > 255) {
      newErrors.email = "Email must not exceed 255 characters.";
    }

    const message = formData.message.trim();
    if (!message) {
      newErrors.message = "Please write a brief message or request.";
    } else if (message.length > 1000) {
      newErrors.message = "Message must not exceed 1000 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitResult(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const response = await submitEnquiry(formData);
      setIsSubmitting(false);

      if (response.success) {
        setSubmitResult(response);
        setFormData({ name: "", phone: "", email: "", message: "" });
        setErrors({});
      } else {
        setErrors({ submit: response.message || "Failed to submit enquiry." });
      }
    } catch (err) {
      console.error("Enquiry submission error:", err);
      setIsSubmitting(false);
      setErrors({ submit: "An unexpected error occurred. Please try again." });
    }

  };

  return (
    <div id="enquiry" className="bg-white border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-xl text-stone-800 text-left relative">
      <div className="mb-6 space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#B8860B] bg-[#D4AF37]/15 px-3 py-1 rounded-full inline-block">
          Direct Store Enquiry
        </span>
        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Book an Appointment or Ask a Question
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 font-light">
          Fill in your details below and our jewellery consultant will respond within 2 hours.
        </p>
      </div>

      {submitResult ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-serif text-xl font-bold text-emerald-900">
              Enquiry Submitted Successfully!
            </h4>
            <p className="text-sm text-emerald-800 font-light mt-1">
              {submitResult.message}
            </p>
            {submitResult.enquiryId && (
              <span className="inline-block mt-3 bg-white px-3 py-1 rounded-md text-xs font-mono font-bold text-emerald-900 border border-emerald-300">
                Reference ID: {submitResult.enquiryId}
              </span>
            )}
          </div>
          <button
            onClick={() => setSubmitResult(null)}
            className="mt-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold py-2.5 px-6 rounded-xl transition-colors"
          >
            Submit Another Enquiry
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Submit Error */}
          {errors.submit && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                maxLength={20}
                placeholder="e.g. Priyadarshini (max 20)"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                className={`w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.name
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-stone-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                }`}
              />
            </div>
            {errors.name && (
              <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                {errors.name}
              </span>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                maxLength={15}
                placeholder="e.g. +91 98765 43210"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: null });
                }}
                className={`w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
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
                maxLength={255}
                placeholder="e.g. customer@example.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                className={`w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
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

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
              Enquiry Message <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-stone-400">
                <MessageSquare className="w-4 h-4" />
              </div>
              <textarea
                rows={4}
                maxLength={1000}
                placeholder="Specify requirements (e.g., Kundan bridal necklace pricing, 2ct diamond ring availability, store visit timing...)"
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  if (errors.message) setErrors({ ...errors, message: null });
                }}
                className={`w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border rounded-xl text-base sm:text-sm focus:outline-none focus:ring-2 transition-all ${
                  errors.message
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-stone-300 focus:border-[#D4AF37] focus:ring-[#D4AF37]/20"
                }`}
              />
            </div>
            {errors.message && (
              <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                {errors.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-950 hover:from-stone-800 hover:to-stone-900 text-[#FAF9F5] font-bold py-3.5 px-6 rounded-xl text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-xl disabled:opacity-75"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                <span>Submitting Enquiry...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-[#D4AF37]" />
                <span>Submit Enquiry</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
