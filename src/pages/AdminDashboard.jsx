import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gem,
  Store,
  LogOut,
  Layers,
  Image as ImageIcon,
  Tag,
  BookOpen,
  Video,
  Settings,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ExternalLink,
  Globe,
  MessageSquare,
  Loader2,
  AlertCircle,
  Eye,
  RefreshCw,
  Clock,
  TrendingUp,
  Coins,
  Scale,
  ShieldCheck
} from "lucide-react";
import {
  adminAddCategory,
  adminGetAllCategories,
  adminUpdateCategory,
  adminAddGallery,
  adminGetAllGallery,
  adminUpdateGallery,
  adminAddVideo,
  adminGetAllVideo,
  adminUpdateVideo,
  adminGetAllAskedQuestions,
  adminGetSingleAskedQuestion,
  adminUpdateAskedQuestionStatus,
  adminAddOurStory,
  adminGetAllOurStory,
  adminUpdateOurStory,
  adminGetDashboardStats,
  adminUpdatePrice,
  getSiteInfo,
  extractYoutubeId
} from "../services/api";
import { mockSlides, mockShopInfo } from "../services/mockData";
import { getShopPrefix } from "../services/apiClient";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("rates");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);

  // 0. Dashboard Stats & Live Metal Rates State
  const [dashboardStats, setDashboardStats] = useState({ register_count: 0, priceData: [] });
  const [priceForm, setPriceForm] = useState({
    material: "gold",
    purity: "22k",
    price: "",
  });

  // 1. Categories State
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryPage, setCategoryPage] = useState(0);

  // 2. Gallery Images State
  const [galleryImages, setGalleryImages] = useState([]);
  const [newImage, setNewImage] = useState({ categoryId: "", imageUrl: "" });
  const [galleryPage, setGalleryPage] = useState(0);

  // 3. Videos State
  const [videos, setVideos] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [videoPage, setVideoPage] = useState(0);

  // 4. Enquiries State
  const [enquiries, setEnquiries] = useState([]);
  const [enquiryPage, setEnquiryPage] = useState(0);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isLoadingEnquiryDetail, setIsLoadingEnquiryDetail] = useState(false);

  // 5. Our Story State
  const [stories, setStories] = useState([]);
  const [storyContent, setStoryContent] = useState("");
  const [storyPage, setStoryPage] = useState(0);

  // 6. Slideshow Carousel
  const [slides, setSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    desktopImg: "",
    ctaText: "Explore Collection",
    badge: ""
  });

  // 7. Contact Profile
  const [contactInfo, setContactInfo] = useState({});

  const triggerToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Auth Guard & Session Load
  useEffect(() => {
    const currentAdmin = localStorage.getItem("aadagam_current_admin");
    if (!currentAdmin) {
      navigate("/admin");
      return;
    }
    try {
      const user = JSON.parse(currentAdmin);
      setAdminUser(user);
    } catch (e) {
      navigate("/admin");
    }
  }, [navigate]);

  // Initial Data Fetching from Backend APIs
  useEffect(() => {
    if (!adminUser) return;
    const shopPrefix = getShopPrefix(adminUser.domain);

    // LocalStorage Fallbacks
    const localSlides = localStorage.getItem(`aadagam_carousel_slides_${shopPrefix}`);
    setSlides(localSlides ? JSON.parse(localSlides) : mockSlides);

    const localContact = localStorage.getItem(`aadagam_contact_info_${shopPrefix}`);
    setContactInfo(localContact ? JSON.parse(localContact) : {
      address: mockShopInfo.address,
      phonePrimary: mockShopInfo.phonePrimary,
      phoneSecondary: mockShopInfo.phoneSecondary,
      email: adminUser.email,
      whatsapp: mockShopInfo.whatsapp,
      mapDirectionsUrl: mockShopInfo.mapDirectionsUrl
    });

    // Backend APIs
    loadDashboardStats();
    loadCategories(0);
    loadGallery(0);
    loadVideos(0);
    loadEnquiries(0);
    loadStories(0);
  }, [adminUser]);

  /* ==========================================================================
   * 0. DASHBOARD STATS & PRICE UPDATE HANDLERS
   * ========================================================================== */
  const loadDashboardStats = async () => {
    try {
      const res = await adminGetDashboardStats();
      if (res && res.success === 1) {
        setDashboardStats({
          register_count: res.register_count || 0,
          priceData: res.priceData || [],
        });
      } else {
        // Fallback to public site info if dash_board returns empty
        const siteRes = await getSiteInfo();
        if (siteRes && siteRes.success === 1) {
          setDashboardStats((prev) => ({
            ...prev,
            priceData: siteRes.priceData || [],
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load dashboard stats:", e);
    }
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    if (!priceForm.price || isNaN(Number(priceForm.price))) {
      triggerToast("Please enter a valid price amount.", "error");
      return;
    }

    setIsLoading(true);
    const res = await adminUpdatePrice({
      material: priceForm.material,
      purity: priceForm.purity,
      price: priceForm.price.trim(),
    });
    setIsLoading(false);

    if (res.status === 1) {
      triggerToast(`Updated ${priceForm.purity.toUpperCase()} ${priceForm.material.toUpperCase()} to ₹${priceForm.price}/gm`);
      setPriceForm({ ...priceForm, price: "" });
      loadDashboardStats();
    } else {
      triggerToast(res.message || "Failed to update price", "error");
    }
  };

  /* ==========================================================================
   * 1. CATEGORY CRUD HANDLERS
   * ========================================================================== */
  const loadCategories = async (page = 0) => {
    try {
      const res = await adminGetAllCategories(page, 20);
      if (res && res.status === 1 && Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsLoading(true);
    const res = await adminAddCategory(newCategoryName.trim());
    setIsLoading(false);

    if (res.status === 1) {
      triggerToast(res.message || "Category added successfully!");
      setNewCategoryName("");
      loadCategories(categoryPage);
    } else {
      triggerToast(res.message || "Failed to add category", "error");
    }
  };

  const handleToggleCategoryStatus = async (cat) => {
    const nextStatus = cat.status === 1 ? 0 : 1;
    const res = await adminUpdateCategory(cat.id, cat.category_name, nextStatus);
    if (res.status === 1) {
      triggerToast(`Category ${nextStatus === 1 ? "Activated" : "Deactivated"}`);
      loadCategories(categoryPage);
    } else {
      triggerToast(res.message || "Status update failed", "error");
    }
  };

  /* ==========================================================================
   * 2. GALLERY CRUD HANDLERS
   * ========================================================================== */
  const loadGallery = async (page = 0) => {
    try {
      const res = await adminGetAllGallery(page, 20);
      if (res && res.status === 1 && Array.isArray(res.data)) {
        setGalleryImages(res.data);
      } else {
        setGalleryImages([]);
      }
    } catch (e) {
      console.error("Failed to load gallery:", e);
    }
  };

  const handleAddGalleryImage = async (e) => {
    e.preventDefault();
    if (!newImage.categoryId || !newImage.imageUrl.trim()) {
      triggerToast("Please select a category and enter image URL.", "error");
      return;
    }

    setIsLoading(true);
    const res = await adminAddGallery(newImage.categoryId, newImage.imageUrl.trim());
    setIsLoading(false);

    if (res.status === 1) {
      triggerToast(res.message || "Image added to catalogue!");
      setNewImage({ categoryId: "", imageUrl: "" });
      loadGallery(galleryPage);
    } else {
      triggerToast(res.message || "Failed to add gallery image", "error");
    }
  };

  const handleToggleGalleryStatus = async (img) => {
    const nextStatus = img.status === 1 ? 0 : 1;
    const res = await adminUpdateGallery(img.id, img.category_id, img.image_url, nextStatus);
    if (res.status === 1) {
      triggerToast(`Gallery item ${nextStatus === 1 ? "Activated" : "Deactivated"}`);
      loadGallery(galleryPage);
    } else {
      triggerToast(res.message || "Update failed", "error");
    }
  };

  /* ==========================================================================
   * 3. VIDEO CRUD HANDLERS
   * ========================================================================== */
  const loadVideos = async (page = 0) => {
    try {
      const res = await adminGetAllVideo(page, 20);
      if (res && res.status === 1 && Array.isArray(res.data)) {
        setVideos(res.data);
      } else {
        setVideos([]);
      }
    } catch (e) {
      console.error("Failed to load videos:", e);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    setIsLoading(true);
    const res = await adminAddVideo(newVideoUrl.trim());
    setIsLoading(false);

    if (res.status === 1) {
      triggerToast(res.message || "Video added successfully!");
      setNewVideoUrl("");
      loadVideos(videoPage);
    } else {
      triggerToast(res.message || "Failed to add video", "error");
    }
  };

  const handleToggleVideoStatus = async (v) => {
    const nextStatus = v.status === 1 ? 0 : 1;
    const res = await adminUpdateVideo(v.id, v.video_url, nextStatus);
    if (res.status === 1) {
      triggerToast(`Video ${nextStatus === 1 ? "Activated" : "Deactivated"}`);
      loadVideos(videoPage);
    } else {
      triggerToast(res.message || "Status update failed", "error");
    }
  };

  /* ==========================================================================
   * 4. CUSTOMER ENQUIRIES HANDLERS
   * ========================================================================== */
  const loadEnquiries = async (page = 0) => {
    try {
      const res = await adminGetAllAskedQuestions(page, 20);
      if (res && res.status === 1 && Array.isArray(res.data)) {
        setEnquiries(res.data);
      } else {
        setEnquiries([]);
      }
    } catch (e) {
      console.error("Failed to load enquiries:", e);
    }
  };

  const handleViewEnquiryDetail = async (id) => {
    setIsLoadingEnquiryDetail(true);
    const res = await adminGetSingleAskedQuestion(id);
    setIsLoadingEnquiryDetail(false);
    if (res && res.status === 1 && res.data) {
      setSelectedEnquiry(res.data);
    } else {
      triggerToast("Failed to fetch enquiry detail", "error");
    }
  };

  const handleToggleEnquiryStatus = async (enquiry) => {
    const nextStatus = enquiry.status === 1 ? 0 : 1;
    const res = await adminUpdateAskedQuestionStatus(enquiry.id, nextStatus);
    if (res.status === 1) {
      triggerToast(`Enquiry marked as ${nextStatus === 1 ? "Resolved" : "Pending"}`);
      loadEnquiries(enquiryPage);
      if (selectedEnquiry && selectedEnquiry.id === enquiry.id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: nextStatus });
      }
    } else {
      triggerToast(res.message || "Failed to update enquiry status", "error");
    }
  };

  /* ==========================================================================
   * 5. OUR STORY HANDLERS
   * ========================================================================== */
  const loadStories = async (page = 0) => {
    try {
      const res = await adminGetAllOurStory(page, 10);
      if (res && res.status === 1 && Array.isArray(res.data)) {
        setStories(res.data);
        if (res.data.length > 0 && !storyContent) {
          setStoryContent(res.data[0].content || "");
        }
      } else {
        setStories([]);
      }
    } catch (e) {
      console.error("Failed to load stories:", e);
    }
  };

  const handleSaveStory = async (e) => {
    e.preventDefault();
    if (!storyContent.trim()) return;

    setIsLoading(true);
    let res;
    if (stories.length > 0) {
      res = await adminUpdateOurStory(stories[0].id, storyContent.trim());
    } else {
      res = await adminAddOurStory(storyContent.trim());
    }
    setIsLoading(false);

    if (res.status === 1) {
      triggerToast(res.message || "Our Story updated successfully!");
      loadStories(storyPage);
    } else {
      triggerToast(res.message || "Failed to update story", "error");
    }
  };

  /* ==========================================================================
   * 6. CAROUSEL & CONTACT ACTIONS
   * ========================================================================== */
  const handleAddSlide = (e) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.desktopImg) {
      triggerToast("Please provide title and image URL", "error");
      return;
    }
    const updated = [
      ...slides,
      {
        id: Date.now(),
        ...newSlide,
        mobileImg: newSlide.desktopImg,
        ctaLink: "#gallery"
      }
    ];
    setSlides(updated);
    const shopPrefix = getShopPrefix(adminUser.domain);
    localStorage.setItem(`aadagam_carousel_slides_${shopPrefix}`, JSON.stringify(updated));
    triggerToast("New hero slide added!");
    setNewSlide({ title: "", subtitle: "", desktopImg: "", ctaText: "Explore Collection", badge: "" });
  };

  const handleDeleteSlide = (id) => {
    const updated = slides.filter((s) => s.id !== id);
    setSlides(updated);
    const shopPrefix = getShopPrefix(adminUser.domain);
    localStorage.setItem(`aadagam_carousel_slides_${shopPrefix}`, JSON.stringify(updated));
    triggerToast("Slide removed");
  };

  const handleSaveContactInfo = (e) => {
    e.preventDefault();
    const shopPrefix = getShopPrefix(adminUser.domain);
    localStorage.setItem(`aadagam_contact_info_${shopPrefix}`, JSON.stringify(contactInfo));
    triggerToast("Showroom contact profile saved!");
  };

  const handleLogout = () => {
    localStorage.removeItem("aadagam_current_admin");
    localStorage.removeItem("aadagam_auth_token");
    navigate("/admin");
  };

  if (!adminUser) return null;

  const shopPrefix = getShopPrefix(adminUser.domain);
  const publicStorefrontUrl = `/shop?shop=${shopPrefix}`;

  const getCategoryName = (catId) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.category_name : `Category #${catId}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-stone-950">
      {/* Top Header Dashboard Navbar */}
      <header className="bg-stone-950 text-white border-b border-stone-850 py-3.5 px-6 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center">
              <Gem className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wide block">
                AADAGAM CONTROL CENTER
              </span>
              <span className="text-[9px] text-[#B8860B] font-bold tracking-widest uppercase block -mt-1">
                Showroom Management & APIs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {dashboardStats.register_count > 0 && (
              <div className="hidden md:flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1.5 rounded-xl text-xs text-stone-300 font-mono">
                <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Tenants: {dashboardStats.register_count}</span>
              </div>
            )}

            <a
              href={publicStorefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F3E5AB] border border-[#D4AF37]/40 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Live Storefront:</span>
              <span className="font-mono text-[#D4AF37] underline">{adminUser.domain}</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Menu */}
        <aside className="lg:col-span-3 bg-white border border-stone-200 rounded-3xl p-4 shadow-sm space-y-1.5 sticky top-24">
          <div className="px-4 py-3 mb-2 bg-[#FAF9F5] border border-stone-200 rounded-2xl">
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
              Active Showroom
            </span>
            <span className="font-serif font-bold text-stone-900 text-sm truncate block mt-0.5">
              {adminUser.shopName || shopPrefix.toUpperCase()}
            </span>
            <span className="text-[11px] text-stone-500 font-mono truncate block">
              {adminUser.email}
            </span>
          </div>

          {[
            { id: "rates", label: "Daily Metal Rates", icon: Coins, count: dashboardStats.priceData.length },
            { id: "categories", label: "Categories", icon: Tag, count: categories.length },
            { id: "gallery", label: "Jewellery Gallery", icon: ImageIcon, count: galleryImages.length },
            { id: "videos", label: "Showcase Videos", icon: Video, count: videos.length },
            { id: "enquiries", label: "Customer Enquiries", icon: MessageSquare, count: enquiries.length },
            { id: "story", label: "Our Story Narrative", icon: BookOpen },
            { id: "carousel", label: "Hero Slideshow", icon: Layers, count: slides.length },
            { id: "contact", label: "Showroom Contact", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold tracking-wider uppercase transition-all ${isActive
                  ? "bg-[#1C1917] text-[#FAF9F5] shadow-md shadow-stone-950/10"
                  : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : "text-stone-400"}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isActive ? "bg-[#D4AF37] text-stone-950 font-bold" : "bg-stone-100 text-stone-500"
                      }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-4 border-t border-stone-100 mt-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors uppercase tracking-wider"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Right Main Content Pane */}
        <main className="lg:col-span-9 space-y-6 text-left">
          {/* ===================================================================
           * TAB 0: DAILY METAL RATES MANAGER (POST /opxXxolN7m6CU/price_update)
           * =================================================================== */}
          {activeTab === "rates" && (
            <div className="space-y-6 animate-fade-in">
              {/* Price Update Form */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900">
                      Daily Bullion Rates Manager
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Manually update live showroom prices for 24K, 22K, 18K gold and 999 fine silver.
                    </p>
                  </div>
                  <button
                    onClick={loadDashboardStats}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                    title="Refresh price data"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleUpdatePrice} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Material
                    </label>
                    <select
                      value={priceForm.material}
                      onChange={(e) => {
                        const mat = e.target.value;
                        setPriceForm({
                          ...priceForm,
                          material: mat,
                          purity: mat === "silver" ? "18k" : "22k",
                        });
                      }}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Purity Standard
                    </label>
                    <select
                      value={priceForm.purity}
                      onChange={(e) => setPriceForm({ ...priceForm, purity: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    >
                      {priceForm.material === "gold" ? (
                        <>
                          <option value="22k">22K Gold</option>
                          <option value="24k">24K Gold</option>
                          <option value="18k">18K Gold</option>
                        </>
                      ) : (
                        <>
                          <option value="22k">22K Silver</option>
                          <option value="24k">24K Silver</option>
                          <option value="18k">18K Silver</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Price (₹ per gram)
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 7195"
                      value={priceForm.price}
                      onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <TrendingUp className="w-4 h-4 text-[#D4AF37]" />}
                      <span>Update</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Active Metal Rates Cards */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                  Current Live Showroom Rates
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardStats.priceData.length > 0 ? (
                    dashboardStats.priceData.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="bg-[#FAF9F5] border border-[#D4AF37]/30 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#B8860B]">
                            {p.purity?.toUpperCase()} {p.material?.toUpperCase()}
                          </span>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                            Rate Per Gram
                          </span>
                          <span className="font-serif text-3xl font-bold text-stone-900 tracking-tight block mt-0.5">
                            ₹{Number(p.price).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-stone-200 text-[11px] font-mono text-stone-500 flex items-center justify-between">
                          <span>8g (1 Pavan): ₹{(Number(p.price) * 8).toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="sm:col-span-3 text-center py-6 text-stone-400 text-xs italic">
                      No custom price data set yet. Showing default showroom benchmarks.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
           * TAB 1: CATEGORIES MANAGEMENT
           * =================================================================== */}
          {activeTab === "categories" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900">
                      Category Management
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Organize your showroom catalogue into categories (e.g., Necklaces, Earrings, Rings, Bridal Sets).
                    </p>
                  </div>
                  <button
                    onClick={() => loadCategories(categoryPage)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    maxLength={30}
                    placeholder="Enter category name (max 30 chars)"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !newCategoryName.trim()}
                    className="inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
                    <span>Add Category</span>
                  </button>
                </form>
              </div>

              {/* Categories Table */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                  Active Categories ({categories.length})
                </span>

                {categories.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4">No categories found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <span className="text-[10px] font-mono text-stone-400">ID #{cat.id}</span>
                          <h4 className="font-semibold text-sm text-stone-900 mt-0.5">
                            {cat.category_name}
                          </h4>
                        </div>
                        <button
                          onClick={() => handleToggleCategoryStatus(cat)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${cat.status === 1
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                            }`}
                        >
                          {cat.status === 1 ? "Active" : "Inactive"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
           * TAB 2: GALLERY IMAGES MANAGEMENT
           * =================================================================== */}
          {activeTab === "gallery" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900">
                      Jewellery Catalogue Gallery
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Upload and map high-definition catalogue images to categories.
                    </p>
                  </div>
                  <button
                    onClick={() => loadGallery(galleryPage)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddGalleryImage} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                      Select Category
                    </label>
                    <select
                      value={newImage.categoryId}
                      onChange={(e) => setNewImage({ ...newImage, categoryId: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                      required
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name} (ID #{c.id})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                      Image URL (HTTPS)
                    </label>
                    <input
                      type="url"
                      maxLength={100}
                      placeholder="https://images.unsplash.com/..."
                      value={newImage.imageUrl}
                      onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
                      <span>Add</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Gallery Grid */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                  Catalogue Items ({galleryImages.length})
                </span>

                {galleryImages.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4">No gallery items registered yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryImages.map((img) => (
                      <div
                        key={img.id}
                        className="bg-[#FAF9F5] border border-stone-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div className="aspect-square w-full overflow-hidden bg-stone-100 relative">
                          <img
                            src={img.image_url}
                            alt="Catalogue Item"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=400&q=80";
                            }}
                          />
                          <span className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-sm text-[#D4AF37] text-[10px] font-mono px-2 py-0.5 rounded-md">
                            {getCategoryName(img.category_id)}
                          </span>
                        </div>

                        <div className="p-3 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-stone-400">ID #{img.id}</span>
                          <button
                            onClick={() => handleToggleGalleryStatus(img)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${img.status === 1 ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                              }`}
                          >
                            {img.status === 1 ? "Active" : "Inactive"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
           * TAB 3: SHOWCASE VIDEOS MANAGEMENT
           * =================================================================== */}
          {activeTab === "videos" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900">
                      Showcase Videos
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Add YouTube videos of your atelier, artisan craftsmanship, and bridal campaigns.
                    </p>
                  </div>
                  <button
                    onClick={() => loadVideos(videoPage)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddVideo} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="url"
                    maxLength={100}
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    className="flex-1 px-4 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !newVideoUrl.trim()}
                    className="inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
                    <span>Add Video</span>
                  </button>
                </form>
              </div>

              {/* Videos List */}
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                  Showcase Videos ({videos.length})
                </span>

                {videos.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4">No videos found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videos.map((v) => {
                      const ytId = extractYoutubeId(v.video_url);
                      return (
                        <div
                          key={v.id}
                          className="bg-[#FAF9F5] border border-stone-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                        >
                          <div className="aspect-video w-full bg-black relative">
                            {ytId ? (
                              <img
                                src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-stone-500 text-xs font-mono">
                                Video #{v.id}
                              </div>
                            )}
                          </div>

                          <div className="p-4 space-y-2">
                            <span className="text-[10px] font-mono text-stone-400 block truncate">
                              {v.video_url}
                            </span>
                            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                              <span className="text-[10px] font-mono text-stone-500">ID #{v.id}</span>
                              <button
                                onClick={() => handleToggleVideoStatus(v)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${v.status === 1 ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                                  }`}
                              >
                                {v.status === 1 ? "Active" : "Inactive"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
           * TAB 4: CUSTOMER ENQUIRIES INBOX
           * =================================================================== */}
          {activeTab === "enquiries" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900">
                      Customer Enquiries Inbox
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Direct inquiries submitted by buyers through your storefront contact form.
                    </p>
                  </div>
                  <button
                    onClick={() => loadEnquiries(enquiryPage)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {enquiries.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-6 text-center">
                    No customer enquiries received yet.
                  </p>
                ) : (
                  <div className="divide-y divide-stone-100 border-t border-stone-100 pt-2">
                    {enquiries.map((enq) => (
                      <div
                        key={enq.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 rounded-2xl px-3 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-stone-900 text-sm">
                              {enq.customer_name}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {enq.created_at ? new Date(enq.created_at).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 font-mono">
                            <span>{enq.email}</span>
                          </div>
                          <p className="text-xs text-stone-700 line-clamp-2 max-w-xl font-light">
                            {enq.query}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleViewEnquiryDetail(enq.id)}
                            className="inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#B8860B]" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleToggleEnquiryStatus(enq)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${enq.status === 1
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              }`}
                          >
                            {enq.status === 1 ? "Resolved" : "Mark Resolved"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
           * TAB 5: OUR STORY NARRATIVE MANAGEMENT
           * =================================================================== */}
          {activeTab === "story" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900">
                      Our Story & Heritage Narrative
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Publish your showroom's founding history and artisan craftsmanship philosophy.
                    </p>
                  </div>
                  <button
                    onClick={() => loadStories(storyPage)}
                    className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveStory} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                      Brand Story Narrative (Public Storefront Display)
                    </label>
                    <textarea
                      rows={8}
                      value={storyContent}
                      onChange={(e) => setStoryContent(e.target.value)}
                      placeholder="Founded in 1988, our showroom has been crafting authentic heirloom gold and diamond treasures..."
                      className="w-full p-4 bg-[#FAF9F5] border border-stone-300 rounded-2xl text-sm focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !storyContent.trim()}
                    className="inline-flex items-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-8 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
                    <span>Save Story Narrative</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ===================================================================
           * TAB 6: HERO CAROUSEL SLIDESHOW
           * =================================================================== */}
          {activeTab === "carousel" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Hero Banner Slideshow
                </h3>
                <p className="text-xs text-stone-500">
                  Configure top rotating luxury promotional slides on your storefront.
                </p>

                <form onSubmit={handleAddSlide} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Banner Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Bridal Heritage 2026"
                      value={newSlide.title}
                      onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Subtitle Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ornate 22K Kundan & Polki Necklaces"
                      value={newSlide.subtitle}
                      onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      High-Resolution Image URL (Desktop 1920x700 / Mobile 1024x600)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={newSlide.desktopImg}
                      onChange={(e) => setNewSlide({ ...newSlide, desktopImg: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-[#D4AF37]" />
                      <span>Add Hero Slide</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Slides Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slides.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="aspect-21/9 w-full bg-stone-900 relative">
                      <img src={s.desktopImg} alt={s.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-stone-900 text-sm">{s.title}</h4>
                        <p className="text-[11px] text-stone-500 font-light truncate max-w-xs">{s.subtitle}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSlide(s.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Delete slide"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ===================================================================
           * TAB 7: SHOWROOM CONTACT PROFILE
           * =================================================================== */}
          {activeTab === "contact" && (
            <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">
                  Showroom Contact & Hours Profile
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Manage primary contact numbers, physical showroom address, and map directions.
                </p>
              </div>

              <form onSubmit={handleSaveContactInfo} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Showroom Physical Address
                  </label>
                  <input
                    type="text"
                    value={contactInfo.address || ""}
                    onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                    className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Primary Phone
                  </label>
                  <input
                    type="text"
                    value={contactInfo.phonePrimary || ""}
                    onChange={(e) => setContactInfo({ ...contactInfo, phonePrimary: e.target.value })}
                    className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                    Secondary Phone
                  </label>
                  <input
                    type="text"
                    value={contactInfo.phoneSecondary || ""}
                    onChange={(e) => setContactInfo({ ...contactInfo, phoneSecondary: e.target.value })}
                    className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="sm:col-span-2 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-8 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all"
                  >
                    <Save className="w-4 h-4 text-[#D4AF37]" />
                    <span>Save Contact Profile</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* SINGLE ENQUIRY DETAIL MODAL */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="bg-white border border-[#D4AF37]/30 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 relative shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-mono text-stone-400">Enquiry #{selectedEnquiry.id}</span>
                <h3 className="font-serif text-2xl font-bold text-stone-900 mt-0.5">
                  {selectedEnquiry.customer_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-stone-600">
                <Mail className="w-4 h-4 text-[#B8860B]" />
                <span className="font-mono">{selectedEnquiry.email}</span>
              </div>
              <div className="flex items-center gap-2 text-stone-500">
                <Clock className="w-4 h-4 text-[#B8860B]" />
                <span>Submitted on: {selectedEnquiry.created_at ? new Date(selectedEnquiry.created_at).toLocaleString() : "Recent"}</span>
              </div>

              <div className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-4 mt-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1">
                  Customer Message / Query:
                </span>
                <p className="text-stone-800 font-light leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.query}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => handleToggleEnquiryStatus(selectedEnquiry)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${selectedEnquiry.status === 1
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
              >
                Status: {selectedEnquiry.status === 1 ? "Resolved" : "Mark as Resolved"}
              </button>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-semibold animate-fade-in ${toastType === "error"
            ? "bg-rose-900 text-white border-rose-700"
            : "bg-stone-950 text-[#F3E5AB] border-[#D4AF37]/50"
            }`}
        >
          {toastType === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-300" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
