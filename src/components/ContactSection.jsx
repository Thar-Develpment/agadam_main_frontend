import React from "react";
import EnquiryForm from "./EnquiryForm";
import {
  MapPin,
  Phone,
  Mail,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

export default function ContactSection({ shopInfo }) {
  const address =
    shopInfo?.address ||
    (shopInfo?.city ? `Main Commercial Avenue, ${shopInfo.city}` : "Flagship Boutique, Jewellery Quarter");
  const phonePrimary = shopInfo?.phone || shopInfo?.phonePrimary || "+91 98765 43210";
  const phoneSecondary = shopInfo?.phoneSecondary || "";
  const email = shopInfo?.contact_us || shopInfo?.email || "contact@jewellerystore.com";
  const rawWhatsApp = shopInfo?.whatsapp_no || shopInfo?.whatsapp || phonePrimary;
  const cleanWhatsApp = rawWhatsApp.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `Hello ${shopInfo?.name || "Showroom"}, I visited your website and would like to enquire about jewellery collections.`
  )}`;

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[#FAF9F5] text-stone-800 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 text-[#B8860B] px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-widest border border-[#D4AF37]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Visit Our Showroom</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
            Connect With Our Jewellery Experts
          </h2>
          <p className="text-stone-600 text-sm sm:text-base font-light">
            Visit our boutique or reach out for custom orders, bullion rate inquiries, and private appointments.
          </p>
        </div>

        {/* Grid Layout: Contact Info (Left) + Enquiry Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left Column: Boutique Address & Info Card */}
          <div className="lg:col-span-5 flex flex-col justify-between text-left">
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-7 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900 border-b border-stone-100 pb-4">
                  Boutique Address & Info
                </h3>

                <div className="space-y-6 pt-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B8860B] flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs uppercase text-stone-400 tracking-wider">
                        Flagship Store {shopInfo?.city ? `• ${shopInfo.city}` : ""}
                      </span>
                      <p className="text-sm text-stone-800 font-medium leading-relaxed mt-1 whitespace-pre-line">
                        {address}
                      </p>
                      <a
                        href={shopInfo?.mapDirectionsUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[#B8860B] font-semibold hover:underline mt-2"
                      >
                        <span>Get Directions on Google Maps</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Phone Numbers */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B8860B] flex items-center justify-center shrink-0 mt-0.5">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block font-bold text-xs uppercase text-stone-400 tracking-wider">
                        Phone & Helpline
                      </span>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-stone-900 mt-1">
                        <a
                          href={`tel:${phonePrimary.replace(/[^0-9+]/g, "")}`}
                          className="hover:text-[#B8860B] transition-colors"
                        >
                          {phonePrimary}
                        </a>
                        {phoneSecondary && (
                          <>
                            <span className="text-stone-300">•</span>
                            <a
                              href={`tel:${phoneSecondary.replace(/[^0-9+]/g, "")}`}
                              className="hover:text-[#B8860B] transition-colors"
                            >
                              {phoneSecondary}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Helpline */}
                  {cleanWhatsApp && (
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-xs uppercase text-stone-400 tracking-wider">
                          WhatsApp Helpline
                        </span>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline mt-1"
                        >
                          <span>Chat on WhatsApp ({rawWhatsApp})</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#B8860B] flex items-center justify-center shrink-0 mt-0.5">
                      <Mail className="w-5 h-5 text-[#B8860B]" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="block font-bold text-xs uppercase text-stone-400 tracking-wider">
                        Email & Support
                      </span>
                      <a
                        href={`mailto:${email}`}
                        className="text-sm font-semibold text-stone-800 hover:text-[#B8860B] truncate block mt-1 transition-colors"
                      >
                        {email}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-7">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
