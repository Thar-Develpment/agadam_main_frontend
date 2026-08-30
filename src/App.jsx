import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import PlatformLandingPage from "./pages/PlatformLandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import {
  getContactInfo,
  getSlides,
  getGalleryImages,
  getVideos,
  getReviews,
  getAboutContent,
  getGalleryCategories,
} from "./services/api";

import Header from "./components/Header";
import Slideshow from "./components/Slideshow";
import GallerySection from "./components/GallerySection";
import VideoGallery from "./components/VideoGallery";
import AboutSection from "./components/AboutSection";
import ReviewsSection from "./components/ReviewsSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import QRCodeModal from "./components/QRCodeModal";
import WhatsAppButton from "./components/WhatsAppButton";
import { Gem, Loader2, Store, Home } from "lucide-react";
import { getTenantSubdomain } from "./services/apiClient";


/**
 * Top Navigation Switcher Bar allows the user to easily switch
 * between Platform Landing / Registration ("/") and Client Storefront ("/shop")
 */
function NavigationSwitcherBar() {
  const location = useLocation();
  const isClientStore = location.pathname === "/shop";

  return (
    <div className="bg-stone-900 text-white text-xs py-2 px-4 border-b border-stone-800 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-2">
        <Gem className="w-4 h-4 text-[#D4AF37]" />
        <span className="font-serif font-bold text-stone-200 hidden sm:inline">Aadagam Platform Navigation:</span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          to="/"
          className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
            !isClientStore
              ? "bg-[#D4AF37] text-stone-950 font-bold"
              : "text-stone-300 hover:text-white hover:bg-stone-800"
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Platform & Registration Page</span>
        </Link>

        <span className="text-stone-600">|</span>

        <Link
          to="/shop"
          className={`px-3 py-1 rounded-full font-medium transition-all flex items-center gap-1.5 ${
            isClientStore
              ? "bg-[#D4AF37] text-stone-950 font-bold"
              : "text-stone-300 hover:text-white hover:bg-stone-800"
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Client Storefront Website</span>
        </Link>
      </div>
    </div>
  );
}

/**
 * Client Storefront Website Page ("/shop")
 */
function ClientStorefrontPage() {
  const [shopInfo, setShopInfo] = useState(null);
  const [slides, setSlides] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [aboutContent, setAboutContent] = useState(null);
  const [categories, setCategories] = useState(["All"]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetching from API service stub
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [info, slideData, videoData, reviewData, aboutData, categoryData] = await Promise.all([
          getContactInfo(),
          getSlides(),
          getVideos(),
          getReviews(),
          getAboutContent(),
          getGalleryCategories(),
        ]);

        const subdomain = getTenantSubdomain();
        const shopPrefix = subdomain.split(".")[0];

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
        const localVideo = localStorage.getItem(`aadagam_video_url_${shopPrefix}`);
        if (localVideo) {
          setVideos([
            {
              id: "v1",
              title: "Showroom Atelier Film",
              youtubeId: localVideo,
              description: "Explore our latest bespoke collections.",
            }
          ]);
        } else {
          setVideos(videoData);
        }

        // 4. About Content
        const localAbout = localStorage.getItem(`aadagam_about_content_${shopPrefix}`);
        if (localAbout) {
          const parsedAbout = JSON.parse(localAbout);
          setAboutContent({
            ...aboutData,
            title: parsedAbout.title || aboutData.title,
            historyParagraphs: parsedAbout.historyParagraphs || aboutData.historyParagraphs
          });
        } else {
          setAboutContent(aboutData);
        }

        // 5. Categories
        const localCats = localStorage.getItem(`aadagam_gallery_categories_${shopPrefix}`);
        if (localCats) {
          setCategories(JSON.parse(localCats));
        } else {
          setCategories(categoryData);
        }

        setReviews(reviewData);
      } catch (err) {
        console.error("Error loading website content:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Fetch gallery images on category filter change
  useEffect(() => {
    async function fetchGallery() {
      try {
        const subdomain = getTenantSubdomain();
        const shopPrefix = subdomain.split(".")[0];
        const localImages = localStorage.getItem(`aadagam_gallery_images_${shopPrefix}`);
        
        if (localImages) {
          const allImages = JSON.parse(localImages);
          if (selectedCategory === "All") {
            setGalleryImages(allImages);
          } else {
            setGalleryImages(allImages.filter((img) => img.categoryId === selectedCategory));
          }
        } else {
          const images = await getGalleryImages(selectedCategory);
          setGalleryImages(images);
        }
      } catch (err) {
        console.error("Error fetching gallery images:", err);
      }
    }

    fetchGallery();
  }, [selectedCategory]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col items-center justify-center text-stone-800 space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-900 border-2 border-[#D4AF37] flex items-center justify-center shadow-xl animate-pulse">
          <Gem className="w-8 h-8 text-[#D4AF37]" />
        </div>
        <div className="flex items-center gap-2 text-stone-700 font-serif font-bold text-xl">
          <Loader2 className="w-5 h-5 animate-spin text-[#B8860B]" />
          <span>Loading Aadagam Jewellery Storefront...</span>
        </div>
        <p className="text-xs text-stone-500 font-light">Crafting Timeless Elegance</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 font-sans selection:bg-[#D4AF37] selection:text-stone-950">
      {/* Client Storefront Header */}
      <Header
        shopInfo={shopInfo}
        onOpenQR={() => setIsQRModalOpen(true)}
      />

      {/* Main Section Flow */}
      <main>
        {/* 1. Hero Slideshow Carousel */}
        <Slideshow slides={slides} />

        {/* 2. Jewellery Gallery & Video Gallery */}
        <GallerySection
          categories={categories}
          images={galleryImages}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
        />
        <VideoGallery videos={videos} />

        {/* 3. About Us Article Section */}
        <AboutSection aboutContent={aboutContent} />

        {/* 5. Contact Us & Enquiry Form Section */}
        <ContactSection shopInfo={shopInfo} />
      </main>

      {/* Footer */}
      <Footer shopInfo={shopInfo} />

      {/* Floating QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        shopInfo={shopInfo}
      />

      {/* Floating WhatsApp Button */}
      <WhatsAppButton whatsappNumber={shopInfo?.whatsapp || "919876543210"} />
    </div>
  );
}

function MainLayout() {
  const location = useLocation();
  const showSwitcher = location.pathname === "/shop";

  return (
    <>
      {showSwitcher && <NavigationSwitcherBar />}
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
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
}
