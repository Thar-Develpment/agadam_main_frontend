import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PlatformLandingPage from "./pages/PlatformLandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import {
  getContactInfo,
  getSlides,
  getGalleryImages,
  getVideos,
  getAboutContent,
  getGalleryCategories,
} from "./services/api";

import Header from "./components/Header";
import Slideshow from "./components/Slideshow";
import GallerySection from "./components/GallerySection";
import GoldRateSection from "./components/GoldRateSection";
import AboutSection from "./components/AboutSection";
import WhatsAppStatusSection from "./components/WhatsAppStatusSection";
import VideoGallery from "./components/VideoGallery";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import { Gem, Loader2, Sparkles } from "lucide-react";
import { getTenantSubdomain, getShopPrefix } from "./services/apiClient";

/**
 * Client Storefront Website Page ("/shop")
 */
function ClientStorefrontPage() {
  const [shopInfo, setShopInfo] = useState(null);
  const [slides, setSlides] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [aboutContent, setAboutContent] = useState(null);
  const [categories, setCategories] = useState(["All"]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetching from API service stub
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [info, slideData, videoData, aboutData, categoryData] = await Promise.all([
          getContactInfo(),
          getSlides(),
          getVideos(),
          getAboutContent(),
          getGalleryCategories(),
        ]);

        const subdomain = getTenantSubdomain();
        const shopPrefix = getShopPrefix(subdomain);

        // 1. Contact Settings
        const localContact = localStorage.getItem(`aadagam_contact_info_${shopPrefix}`);
        if (localContact) {
          setShopInfo(JSON.parse(localContact));
        } else {
          setShopInfo({
            ...info,
            name: shopPrefix.toUpperCase() + " JEWELLERY",
            email: `contact@${shopPrefix}jewellery.com`,
          });
        }

        // 2. Slides
        const localSlides = localStorage.getItem(`aadagam_carousel_slides_${shopPrefix}`);
        if (localSlides) {
          setSlides(JSON.parse(localSlides));
        } else {
          setSlides(slideData);
        }

        // 3. Videos
        setVideos(videoData);

        // 4. About Us
        setAboutContent(aboutData);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center p-6 text-center select-none animate-fade-in">
        {/* Animated Luxury Gemstone Badge */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-stone-950 via-stone-900 to-stone-950 border-2 border-[#D4AF37] flex items-center justify-center shadow-2xl shadow-stone-950/20">
            <Gem className="w-9 h-9 text-[#D4AF37] animate-pulse" />
          </div>
          <div className="absolute -inset-2 rounded-full border border-[#D4AF37]/30 animate-ping pointer-events-none" />
        </div>

        {/* Meaningful & Attractive Luxury Loading Message */}
        <div className="max-w-md space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#D4AF37]/15 text-[#B8860B] border border-[#D4AF37]/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curating Fine Masterpieces</span>
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

        {/* 3. Live Gold & Silver Market Rates */}
        <GoldRateSection shopInfo={shopInfo} />

        {/* 4. About Us / Our Story Section */}
        <AboutSection aboutContent={aboutContent} />

        {/* 5. WhatsApp Status & Video Downloads */}
        <WhatsAppStatusSection shopInfo={shopInfo} />

        {/* 6. Showcase Videos Section */}
        <VideoGallery videos={videos} />

        {/* 7. Contact Us & Enquiry Form Section */}
        <ContactSection shopInfo={shopInfo} />
      </main>

      {/* Footer */}
      <Footer shopInfo={shopInfo} />
    </div>
  );
}

function MainLayout() {
  return (
    <Routes>
      {/* Page 1: Platform Landing Page with Shop Registration */}
      <Route path="/" element={<PlatformLandingPage />} />

      {/* Page 2: Client Site Storefront Page */}
      <Route path="/shop" element={<ClientStorefrontPage />} />

      {/* Page 3: Admin Sign In */}
      <Route path="/admin" element={<AdminLogin />} />

      {/* Page 4: Admin Management Dashboard */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Fallback route */}
      <Route path="*" element={<PlatformLandingPage />} />
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
