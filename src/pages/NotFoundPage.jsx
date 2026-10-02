import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Gem,
  ArrowLeft,
  Store,
  Sparkles,
  PhoneCall,
  Compass,
  Layers,
  HelpCircle,
  MessageCircle,
} from "lucide-react";
import {
  isTenantSubdomainHost,
  getTenantSubdomain,
  getShopPrefix,
  resolveFullImageUrl,
  getCleanWhatsAppNumber,
} from "../services/apiClient";
import { getBasicInfo } from "../services/api";
import AadagamLogo from "../components/AadagamLogo";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const isSubdomain = isTenantSubdomainHost();
  const subdomain = getTenantSubdomain();
  const shopPrefix = getShopPrefix(subdomain);

  const [basicInfo, setBasicInfo] = useState(null);

  useEffect(() => {
    if (!isSubdomain) {
      getBasicInfo()
        .then((res) => {
          if (res && res.status === 1 && res.data) {
            setBasicInfo(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isSubdomain]);

  // Cached showroom info for subdomains
  const cachedContact = typeof window !== "undefined"
    ? (() => {
        try {
          return JSON.parse(localStorage.getItem(`aadagam_contact_info_${shopPrefix}`) || "{}");
        } catch (e) {
          return {};
        }
      })()
    : {};

  const showroomName = cachedContact.tamil_shop_name || cachedContact.name || (shopPrefix && shopPrefix !== "mycompany" ? shopPrefix.toUpperCase() : "Jewellery Boutique");
  const showroomLogo = cachedContact.logo ? resolveFullImageUrl(cachedContact.logo) : "";

  // Platform WhatsApp link
  const rawWhatsApp = basicInfo?.whatsapp_no || basicInfo?.phone || "919952054493";
  const cleanWhatsApp = getCleanWhatsAppNumber(rawWhatsApp);
  const platformMessage = "Hello Aadagam, I am interested in creating a jewellery website for my showroom. Please share the registration details.";
  const platformWhatsAppUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(platformMessage)}`;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col justify-between font-sans selection:bg-[#D4AF37] selection:text-stone-950 relative overflow-hidden">
      {/* Background Decorative Ambient Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex items-center justify-between relative z-10">
        {isSubdomain ? (
          <Link to="/" className="flex items-center gap-3 group">
            {showroomLogo ? (
              <img
                src={showroomLogo}
                alt={showroomName}
                className="h-10 sm:h-11 w-auto max-w-[140px] max-h-11 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div className={`w-9 h-9 rounded-xl bg-stone-900 border border-[#D4AF37] flex items-center justify-center shadow-md ${showroomLogo ? "hidden" : "flex"}`}>
              <Gem className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <span className="font-serif font-bold text-lg sm:text-xl text-stone-900 group-hover:text-[#B8860B] transition-colors">
              {showroomName}
            </span>
          </Link>
        ) : (
          <Link to="/" className="flex items-center gap-2">
            <AadagamLogo variant="horizontal" size="sm" iconSrc="/logo_without_backround.png" theme="light" />
          </Link>
        )}

        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 hover:text-stone-950 hover:bg-stone-100 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Go Back</span>
        </button>
      </header>

      {/* Main 404 Hero Container */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="max-w-xl w-full text-center space-y-6">
          {/* Badge & Prominent 404 Number (Cleanly stacked, not overlapping) */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-white border border-[#D4AF37]/40 shadow-xs px-4 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="font-serif font-bold text-xs sm:text-sm text-stone-900 uppercase tracking-wider">
                {isSubdomain ? "Piece Not Found" : "Page Not Found"}
              </span>
            </div>

            <div className="flex items-center justify-center pt-2">
              <span className="font-serif text-6xl sm:text-8xl font-black tracking-tight bg-gradient-to-r from-stone-900 via-[#B8860B] to-stone-900 bg-clip-text text-transparent select-none drop-shadow-xs">
                404
              </span>
            </div>
          </div>

          {/* Heading & Contextual Description */}
          <div className="space-y-2.5">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-wide">
              {isSubdomain ? "This Page is No Longer Available" : "Lost in the Diamond Vault?"}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed max-w-md mx-auto">
              {isSubdomain
                ? `The link or collection you are trying to visit at ${showroomName} does not exist or has been moved.`
                : "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
            </p>
          </div>

          {/* Action Button Grid */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            {isSubdomain ? (
              <>
                <Link
                  to="/"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-stone-950/15 transition-all min-h-[46px]"
                >
                  <Home className="w-4 h-4 text-[#D4AF37]" />
                  <span>Storefront Home</span>
                </Link>
                <a
                  href="/#gallery"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-xs transition-all min-h-[46px]"
                >
                  <Compass className="w-4 h-4 text-[#B8860B]" />
                  <span>Browse Gallery</span>
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-stone-950/15 transition-all min-h-[46px]"
                >
                  <Home className="w-4 h-4 text-[#D4AF37]" />
                  <span>Platform Home</span>
                </Link>
                <a
                  href={platformWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b8952b] text-stone-950 font-bold py-3.5 px-5 rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all min-h-[46px]"
                >
                  <MessageCircle className="w-4 h-4 text-stone-950 shrink-0" />
                  <span>Create Your Jewellery Website</span>
                </a>
              </>
            )}
          </div>

          {/* Quick Helpful Links Card */}
          <div className="pt-4">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-xs text-left grid grid-cols-1 sm:grid-cols-2 gap-3">
              {isSubdomain ? (
                <>
                  <a
                    href="/#rates"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF9F5] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-stone-900 block group-hover:text-[#B8860B] transition-colors">
                        Live Metal Rates
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        Today's 22K Gold & Silver rates
                      </span>
                    </div>
                  </a>
                  <a
                    href="/#enquiry"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF9F5] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-stone-900 block group-hover:text-emerald-700 transition-colors">
                        Contact Showroom
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        Direct enquiry & WhatsApp
                      </span>
                    </div>
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF9F5] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-stone-900 block group-hover:text-[#B8860B] transition-colors">
                        Showroom Admin Login
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        Manage your digital store
                      </span>
                    </div>
                  </Link>
                  <Link
                    to="/forgot-password"
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#FAF9F5] transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-stone-900 block group-hover:text-blue-700 transition-colors">
                        Account Recovery
                      </span>
                      <span className="text-[10px] text-stone-400 block">
                        Reset admin Password
                      </span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 sm:p-6 text-center text-xs text-stone-400 font-light border-t border-stone-200 relative z-10">
        <p>
          © {new Date().getFullYear()} {isSubdomain ? showroomName : "AaDaGaM"}. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
