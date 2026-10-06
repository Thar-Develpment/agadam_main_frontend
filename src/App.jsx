import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlatformLandingPage from "./pages/PlatformLandingPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NotFoundPage from "./pages/NotFoundPage";
import {
  getContactInfo,
  getSiteInfo,
  getSlides,
  getGalleryImages,
  getAboutContent,
  getGalleryCategories,
  checkTenantStatus,
} from "./services/api";
import { mockShopInfo, mockSlides } from "./services/mockData";

import Header from "./components/Header";
import Slideshow from "./components/Slideshow";
import GallerySection from "./components/GallerySection";
import GoldRateSection from "./components/GoldRateSection";
import AboutSection from "./components/AboutSection";
import WhatsAppStatusSection from "./components/WhatsAppStatusSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import { Gem, Loader2, Sparkles, Lock, AlertCircle } from "lucide-react";
import { getTenantSubdomain, getShopPrefix, isTenantSubdomainHost, resolveFullImageUrl } from "./services/apiClient";

/**
 * Client Storefront Website Page ("/shop")
 */
function ClientStorefrontPage() {
  const [shopInfo, setShopInfo] = useState(null);
  const [slides, setSlides] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [aboutContent, setAboutContent] = useState(null);
  const [categories, setCategories] = useState(["All"]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [isSuspended, setIsSuspended] = useState(false);
  const [suspendedMessage, setSuspendedMessage] = useState("");

  // Initial Data Fetching from API service stub
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);

        // Check if current tenant showroom is active or suspended
        const statusCheck = await checkTenantStatus();
        if (statusCheck && statusCheck.suspended) {
          setIsSuspended(true);
          setSuspendedMessage(statusCheck.message);
          setIsLoading(false);
          return;
        }

        const subdomain = getTenantSubdomain();
        const shopPrefix = getShopPrefix(subdomain);

        // 1. Guard Check: Verify site existence (status: 2) and payment status (status: 3) via site_info first
        const siteInfoRes = await getSiteInfo(shopPrefix);

        const isDemoShowroom = ["demo", "sample", "test", "mycompany"].includes(shopPrefix) || !isTenantSubdomainHost();

        // 1.1 Status 2: Shop Not Found / Inactive Subdomain
        if (siteInfoRes && (siteInfoRes.status === 2 || siteInfoRes.notFound)) {
          if (isTenantSubdomainHost() && !isDemoShowroom) {
            window.location.href = `/404?domain=${encodeURIComponent(shopPrefix || subdomain)}`;
            return;
          }
          if (!isDemoShowroom) {
            setIsSuspended(true);
            setSuspendedMessage("Showroom not found or deactivated.");
            setIsLoading(false);
            return;
          }
        }

        // 1.2 Status 3: Payment Pending / Trial Expired
        if (siteInfoRes && (siteInfoRes.status === 3 || siteInfoRes.paymentPending)) {
          setIsSuspended(true);
          setSuspendedMessage(
            siteInfoRes.message === "Payment pending"
              ? "Your showroom subscription payment is pending. Please contact platform support to activate your showroom."
              : (siteInfoRes.message || "Showroom subscription payment is pending.")
          );
          setIsLoading(false);
          return;
        }

        // 2. Load remaining storefront APIs only if payment status is valid
        const [info, slideData, aboutData, categoryData] = await Promise.all([
          getContactInfo(),
          getSlides(),
          getAboutContent(),
          getGalleryCategories(),
        ]);

        // 1. Contact Settings & Site Info
        const localContact = localStorage.getItem(`aadagam_contact_info_${shopPrefix}`);
        const baseContact = localContact ? JSON.parse(localContact) : info;
        const liveSiteData = siteInfoRes?.siteInfoData || {};

        let socialLinks = {};
        if (liveSiteData.social_urls) {
          try {
            socialLinks = typeof liveSiteData.social_urls === "string"
              ? JSON.parse(liveSiteData.social_urls)
              : liveSiteData.social_urls;
          } catch (e) {
            console.warn("Could not parse social_urls:", e);
          }
        }
        if (!socialLinks || typeof socialLinks !== "object" || Object.keys(socialLinks).length === 0) {
          socialLinks = baseContact.social_urls || {
            facebook: baseContact.facebook || "",
            instagram: baseContact.instagram || "",
            whatsapp: baseContact.whatsapp || "",
            twitter: baseContact.twitter || "",
            youtube: baseContact.youtube || "",
            telegram: baseContact.telegram || "",
          };
        }

        const showroomPhone = (liveSiteData.phone || baseContact.phone || baseContact.phonePrimary || "").trim();
        const showroomWhatsApp = (
          liveSiteData.whatsapp_no ||
          liveSiteData.whatsapp ||
          socialLinks?.whatsapp ||
          baseContact.whatsapp_no ||
          baseContact.whatsapp ||
          showroomPhone ||
          ""
        ).trim();

        const rawDisplayName = (liveSiteData.tamil_shop_name || baseContact.tamil_shop_name || "").trim();
        const displayName = isDemoShowroom ? (rawDisplayName || mockShopInfo.name || "AADAGAM JEWELLERY") : rawDisplayName;

        setShopInfo({
          ...baseContact,
          name: displayName,
          tamil_shop_name: isDemoShowroom ? (rawDisplayName || displayName) : rawDisplayName,
          shop_name: displayName,
          logo: resolveFullImageUrl(liveSiteData.logo || baseContact.logo || ""),
          email: liveSiteData.contact_us || baseContact.email || `contact@${shopPrefix}jewellery.com`,
          contact_us: liveSiteData.contact_us || baseContact.email || `contact@${shopPrefix}jewellery.com`,
          city: liveSiteData.city || baseContact.city || "",
          address: liveSiteData.address || baseContact.address || "",
          phone: showroomPhone || "+91 98765 43210",
          phonePrimary: showroomPhone || "+91 98765 43210",
          whatsapp_no: showroomWhatsApp,
          whatsapp: showroomWhatsApp,
          social_urls: socialLinks,
          facebook: socialLinks?.facebook || liveSiteData.facebook || baseContact.facebook || "",
          instagram: socialLinks?.instagram || liveSiteData.instagram || baseContact.instagram || "",
          twitter: socialLinks?.twitter || liveSiteData.twitter || baseContact.twitter || "",
          youtube: socialLinks?.youtube || liveSiteData.youtube || baseContact.youtube || "",
          telegram: socialLinks?.telegram || liveSiteData.telegram || baseContact.telegram || "",
        });

        // 2. Slides
        setSlides(slideData && Array.isArray(slideData) && slideData.length > 0 ? slideData : mockSlides);

        // 3. About Us
        const localStory = localStorage.getItem(`aadagam_story_${shopPrefix}`);
        if (localStory) {
          try {
            const parsedLocalStory = JSON.parse(localStory);
            if (aboutData) {
              setAboutContent({
                ...aboutData,
                image: aboutData.image || parsedLocalStory.imageUrl || parsedLocalStory.image || null,
                imageUrl: aboutData.imageUrl || parsedLocalStory.imageUrl || parsedLocalStory.image || null,
                historyParagraphs:
                  aboutData.historyParagraphs && aboutData.historyParagraphs.length > 0 && aboutData.historyParagraphs[0] !== ""
                    ? aboutData.historyParagraphs
                    : (parsedLocalStory.storyText ? parsedLocalStory.storyText.split(/\r?\n\r?\n/).map((s) => s.trim()).filter(Boolean) : aboutData.historyParagraphs),
              });
            } else {
              setAboutContent({
                title: "Our Heritage & Passion for Perfection",
                historyParagraphs: parsedLocalStory.storyText ? parsedLocalStory.storyText.split(/\r?\n\r?\n/).map((s) => s.trim()).filter(Boolean) : [""],
                image: parsedLocalStory.imageUrl || parsedLocalStory.image || null,
                imageUrl: parsedLocalStory.imageUrl || parsedLocalStory.image || null,
              });
            }
          } catch (e) {
            setAboutContent(aboutData);
          }
        } else {
          setAboutContent(aboutData);
        }

        // 5. Categories
        setCategories(categoryData);

        // 6. Gallery Items
        const images = await getGalleryImages("All");
        setGalleryImages(images);
      } catch (err) {
        console.error("Failed to load storefront data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Handle Dynamic Category Switching
  useEffect(() => {
    async function filterImages() {
      try {
        const filtered = await getGalleryImages(selectedCategory);
        setGalleryImages(filtered);
      } catch (err) {
        console.error("Failed to filter gallery items:", err);
      }
    }

    if (!isLoading) {
      filterImages();
    }
  }, [selectedCategory, isLoading]);

  // Render Suspended Account Screen if tenant account is marked Inactive (status = 0)
  if (isSuspended) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-center items-center px-4 py-12 text-stone-800 selection:bg-[#D4AF37] selection:text-stone-950">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-rose-200/80 rounded-[32px] p-8 sm:p-10 shadow-2xl shadow-stone-900/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mb-2 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-wide">
              Showroom Account Suspended
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed max-w-sm mx-auto">
              {suspendedMessage || "This showroom website has been suspended by the platform administrator. Access to online catalogues and live gold rates is currently restricted."}
            </p>
          </div>
          <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
            <a
              href="/"
              className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-stone-950 text-[#D4AF37] font-semibold text-xs rounded-2xl hover:bg-stone-800 transition-colors shadow-lg shadow-stone-950/10"
            >
              Return to Platform Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render Luxury Loading State while fetching components
  if (isLoading) {
    const subdomain = getTenantSubdomain();
    const shopPrefix = getShopPrefix(subdomain);
    const cachedContact = typeof window !== "undefined"
      ? (() => {
          try {
            return JSON.parse(localStorage.getItem(`aadagam_contact_info_${shopPrefix}`) || "{}");
          } catch (e) {
            return {};
          }
        })()
      : {};
    const activeLogo = shopInfo?.logo || cachedContact?.logo || "";

    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
        {/* Animated Luxury Brand Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          {activeLogo ? (
            <div className="flex items-center justify-center">
              <img
                src={activeLogo}
                alt="Showroom Logo"
                className="h-16 sm:h-20 w-auto max-w-[200px] max-h-20 object-contain animate-pulse"
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                }}
              />
              <div className="hidden w-16 h-16 rounded-2xl bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-950 items-center justify-center shadow-2xl shadow-stone-950/20 border border-[#D4AF37]">
                <Gem className="w-8 h-8 text-[#D4AF37] animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-950 border-2 border-[#D4AF37] flex items-center justify-center shadow-2xl shadow-stone-950/20">
              <Gem className="w-8 h-8 sm:w-10 sm:h-10 text-[#D4AF37] animate-pulse" />
            </div>
          )}
        </div>

        {/* Meaningful & Attractive Luxury Loading Message */}
        <div className="max-w-md space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 text-[#B8860B] border border-[#D4AF37]/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{shopInfo?.name || "Curating Fine Masterpieces"}</span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-wide">
            Crafting Bespoke Jewellery Creations
          </h2>

          <p className="text-xs sm:text-sm text-stone-600 font-light leading-relaxed max-w-sm mx-auto">
            Polishing 22K gold ornaments, certified solitaires, and antique bridal collections for your boutique experience.
          </p>

          {/* Shimmer progress indicator */}
          <div className="pt-4 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#B8860B]" />
            <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
              Illuminating Showcase...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 font-sans selection:bg-[#D4AF37] selection:text-stone-950 w-full max-w-full overflow-x-hidden">
      {/* Client Storefront Header */}
      <Header shopInfo={shopInfo} />

      {/* Main Section Flow */}
      <main className="w-full max-w-full overflow-x-hidden">
        {/* 1. Hero Slideshow Carousel */}
        <Slideshow slides={slides} />

        {/* 2. Jewellery Gallery */}
        <GallerySection
          categories={categories}
          images={galleryImages}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          shopInfo={shopInfo}
        />

        {/* 3. WhatsApp Status & Video Downloads */}
        <WhatsAppStatusSection shopInfo={shopInfo} />

        {/* 4. Live Gold & Silver Market Rates */}
        <GoldRateSection shopInfo={shopInfo} />

        {/* 5. About Us / Our Story Section */}
        <AboutSection aboutContent={aboutContent} galleryImages={galleryImages} shopInfo={shopInfo} />

        {/* 6. Contact Us & Enquiry Form Section */}
        <ContactSection shopInfo={shopInfo} />
      </main>

      {/* Footer */}
      <Footer shopInfo={shopInfo} />
    </div>
  );
}

function MainLayout() {
  const isSubdomain = isTenantSubdomainHost();

  // If visiting via a wildcard tenant subdomain host (e.g. srilakshmi.localhost:5173 or srilakshmi.aadagam.com)
  if (isSubdomain) {
    return (
      <Routes>
        {/* Wildcard Subdomain Storefront directly at root "/" */}
        <Route path="/" element={<ClientStorefrontPage />} />

        {/* Storefront Admin Login & Dashboard */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Forgot Password & Password Reset */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />

        {/* Standalone Onboarding Registration */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Dedicated 404 Route */}
        <Route path="/404" element={<NotFoundPage />} />

        {/* 404 Fallback for subdomain routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    );
  }

  // Main SaaS Platform Domain Layout (localhost:5173 or aadagam.com)
  return (
    <Routes>
      {/* Page 1: Platform Landing Page */}
      <Route path="/" element={<PlatformLandingPage />} />

      {/* Page 2: Platform Registration Page (Shared by owner via WhatsApp) */}
      <Route path="/register" element={<RegisterPage />} />

      {/* Page 3: Platform Demo Storefront Route */}
      <Route path="/demo" element={<ClientStorefrontPage />} />

      {/* Page 4: Admin Sign In */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* Page 4.1: Forgot Password & Password Reset */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />

      {/* Page 5: Admin Management Dashboard */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Page 6: Super Admin Portal */}
      <Route path="/superadmin" element={<SuperAdminDashboard />} />

      {/* Dedicated 404 Route */}
      <Route path="/404" element={<NotFoundPage />} />

      {/* 404 Fallback route for main domain */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
