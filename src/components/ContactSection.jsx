import React from "react";
import EnquiryForm from "./EnquiryForm";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { FacebookIcon, InstagramIcon, YoutubeIcon } from "./SocialIcons";


export default function ContactSection({ shopInfo }) {
  const address =
    shopInfo?.address ||
    (shopInfo?.city ? `Main Commercial Avenue, ${shopInfo.city}` : "Flagship Boutique, Jewellery Quarter");
  const phonePrimary = shopInfo?.phonePrimary || "+91 98765 43210";
  const phoneSecondary = shopInfo?.phoneSecondary || "+91 98765 43211";
  const email = shopInfo?.email || "contact@jewellerystore.com";
  const whatsapp = shopInfo?.whatsapp || "919876543210";
  const socials = shopInfo?.socials || {};

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
            Visit our flagship boutique in the Jewellery Quarter or reach out for custom orders, purity testing, and appointments.
          </p>
        </div>

        {/* Grid Layout: Contact Info & Map (Left) + Enquiry Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Contact Cards & Interactive Map Placeholder */}
          <div className="lg:col-span-6 space-y-8 text-left">
            {/* Info Box */}
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-2xl font-bold text-stone-900 border-b border-stone-100 pb-4">
                Boutique Address & Info
              </h3>

              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-xs uppercase text-stone-400 tracking-wider">
                    Flagship Store
                  </span>
                  <p className="text-sm text-stone-800 font-medium leading-relaxed mt-0.5">
                    {address}
                  </p>
                  <a
                    href={shopInfo?.mapDirectionsUrl || "https://maps.google.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#B8860B] font-semibold hover:underline mt-1"
                  >
                    <span>Get Directions on Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Phone Numbers */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 text-[#B8860B] flex items-center justify-center shrink-0 mt-1">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-bold text-xs uppercase text-stone-400 tracking-wider">
                    Phone Numbers
                  </span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-stone-900 mt-0.5">
                    <a
                      href={`tel:${phonePrimary.replace(/\s+/g, "")}`}
                      className="hover:text-[#B8860B] transition-colors"
                    >
                      {phonePrimary}
                    </a>
                    <span>•</span>
                    <a
                      href={`tel:${phoneSecondary.replace(/\s+/g, "")}`}
                      className="hover:text-[#B8860B] transition-colors"
                    >
                      {phoneSecondary}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 bg-[#FAF9F5] p-3 rounded-xl border border-stone-200">
                  <Mail className="w-5 h-5 text-[#B8860B]" />
                  <div className="overflow-hidden">
                    <span className="block text-[10px] uppercase text-stone-400 font-bold">Email Us</span>
                    <a
                      href={`mailto:${email}`}
                      className="text-xs font-semibold text-stone-800 hover:text-[#B8860B] truncate block"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="block text-[10px] uppercase text-emerald-700 font-bold">WhatsApp</span>
                    <a
                      href={`https://wa.me/${whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-emerald-900 hover:underline block"
                    >
                      Chat on WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-center gap-3 text-xs text-stone-600 border-t border-stone-100 pt-4">
                <Clock className="w-4 h-4 text-[#B8860B]" />
                <span>Open Mon – Sun: 10:30 AM to 8:30 PM (Weekly Off: Tuesday)</span>
              </div>

              {/* Social Media Links */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Follow Our Collections
                </span>
                <div className="flex items-center gap-3">
                  {socials.facebook && (
                    <a
                      href={socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-stone-100 hover:bg-[#D4AF37] text-stone-700 hover:text-white flex items-center justify-center transition-colors"
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
                      className="w-9 h-9 rounded-full bg-stone-100 hover:bg-[#D4AF37] text-stone-700 hover:text-white flex items-center justify-center transition-colors"
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
                      className="w-9 h-9 rounded-full bg-stone-100 hover:bg-[#D4AF37] text-stone-700 hover:text-white flex items-center justify-center transition-colors"
                      aria-label="YouTube"
                    >
                      <YoutubeIcon className="w-4 h-4" />
                    </a>
                  )}

                </div>
              </div>
            </div>

            {/* Styled Interactive Map Embed Box */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-lg relative min-h-[260px] flex flex-col justify-between p-6 text-white">
              <div className="relative z-10">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#D4AF37] bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 rounded-full">
                  Interactive Map Location
                </span>
                <h4 className="font-serif text-xl font-bold text-white mt-2">
                  Jewellery Quarter Flagship Boutique
                </h4>
                <p className="text-xs text-stone-400 mt-1 max-w-sm">
                  Located in the heart of Mumbai's premier Jewellery Quarter with valet parking available for clients.
                </p>
              </div>

              {/* Map visual background representation */}
              <div className="my-4 aspect-21/9 rounded-xl overflow-hidden border border-stone-700 relative bg-stone-950">
                <iframe
                  title="Store Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.7431267825595!2d72.8258!3d18.9401!2m3!1f0!0f0!0f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDU2JzI0LjQiTiA3MsKwNDknMzIuOSJF!5e0!3m2!1sen!2sin!4v1625000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0 opacity-80 hover:opacity-100 transition-opacity"
                  loading="lazy"
                />
              </div>

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-xs text-stone-400">Valet Parking Available</span>
                <a
                  href={shopInfo?.mapDirectionsUrl || "https://maps.google.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8860B] text-stone-950 font-bold text-xs py-2 px-4 rounded-lg transition-colors"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-6">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
