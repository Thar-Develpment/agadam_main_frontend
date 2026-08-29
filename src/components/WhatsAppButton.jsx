import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ whatsappNumber = "919876543210" }) {
  const cleanNumber = whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    "Hello Aadagam Jewellery, I would like to inquire about your jewellery collections and book a private viewing."
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center group">
      {/* Tooltip Popup on Desktop */}
      <div className="hidden sm:block mr-3 bg-stone-900 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xl border border-[#D4AF37]/40 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap">
        <span>Chat with Jewellery Expert</span>
      </div>

      {/* Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 whatsapp-pulse border-2 border-white"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>
    </div>
  );
}
