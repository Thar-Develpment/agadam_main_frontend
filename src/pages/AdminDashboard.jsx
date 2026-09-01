import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Gem,
  Store,
  LogOut,
  Layers,
  Image as ImageIcon,
  BookOpen,
  Video,
  Settings,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  ExternalLink,
  Edit,
  Globe
} from "lucide-react";
import { mockSlides, mockAboutContent, mockShopInfo } from "../services/mockData";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("carousel");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Dynamic Shop settings states
  const [slides, setSlides] = useState([]);
  const [aboutUs, setAboutUs] = useState({ title: "", historyParagraphs: [""] });
  const [videoUrl, setVideoUrl] = useState("");
  const [contactInfo, setContactInfo] = useState({});
  
  // Gallery states
  const [categories, setCategories] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);

  // Form states for adding items
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    desktopImg: "",
    ctaText: "Explore Collection",
    badge: ""
  });

  const [newCategory, setNewCategory] = useState("");
  
  const [newImage, setNewImage] = useState({
    imageUrl: "",
    categoryId: ""
  });

  useEffect(() => {
    // Check if user is logged in
    const currentAdmin = localStorage.getItem("aadagam_current_admin");
    if (!currentAdmin) {
      navigate("/admin");
      return;
    }
    const user = JSON.parse(currentAdmin);
    setAdminUser(user);

    const shopPrefix = user.domain.split(".")[0];

    // Load Carousel Slides from localStorage or fallback to mockData
    const localSlides = localStorage.getItem(`aadagam_carousel_slides_${shopPrefix}`);
    if (localSlides) {
      setSlides(JSON.parse(localSlides));
    } else {
      setSlides(mockSlides);
    }

    // Load About Us content
    const localAbout = localStorage.getItem(`aadagam_about_content_${shopPrefix}`);
    if (localAbout) {
      setAboutUs(JSON.parse(localAbout));
    } else {
      setAboutUs({
        title: mockAboutContent.title,
        historyParagraphs: mockAboutContent.historyParagraphs
      });
    }

    // Load Video URL
    const localVideo = localStorage.getItem(`aadagam_video_url_${shopPrefix}`);
    if (localVideo) {
      setVideoUrl(localVideo);
    } else {
      setVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    }

    // Load Contact Info
    const localContact = localStorage.getItem(`aadagam_contact_info_${shopPrefix}`);
    if (localContact) {
      setContactInfo(JSON.parse(localContact));
    } else {
      setContactInfo({
        address: mockShopInfo.address,
        phonePrimary: mockShopInfo.phonePrimary,
        phoneSecondary: mockShopInfo.phoneSecondary,
        email: user.email, // Use registered email
        whatsapp: mockShopInfo.whatsapp,
        mapDirectionsUrl: mockShopInfo.mapDirectionsUrl
      });
    }

    // Load Categories
    const localCats = localStorage.getItem(`aadagam_gallery_categories_${shopPrefix}`);
    if (localCats) {
      setCategories(JSON.parse(localCats));
    } else {
      setCategories(["All", "Necklaces", "Earrings", "Bangles", "Rings", "Bridal Sets"]);
    }

    // Load Gallery Images
    const localImages = localStorage.getItem(`aadagam_gallery_images_${shopPrefix}`);
    if (localImages) {
      setGalleryImages(JSON.parse(localImages));
    } else {
      // Create initial local dataset mapping mockGalleryImages category string filters to match local IDs
      const mappedMockImages = [
        { id: "1", imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1000&q=80", categoryId: "Bridal Sets" },
        { id: "2", imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80", categoryId: "Necklaces" },
        { id: "3", imageUrl: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1000&q=80", categoryId: "Earrings" },
        { id: "4", imageUrl: "https://images.unsplash.com/photo-1611591475179-42f338829141?auto=format&fit=crop&w=1000&q=80", categoryId: "Bangles" }
      ];
      setGalleryImages(mappedMockImages);
    }
  }, [navigate]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleLogout = () => {
    localStorage.removeItem("aadagam_current_admin");
    navigate("/admin");
  };

  const saveToStorage = (key, data, successMsg) => {
    const shopPrefix = adminUser.domain.split(".")[0];
    localStorage.setItem(`aadagam_${key}_${shopPrefix}`, JSON.stringify(data));
    triggerToast(successMsg);
  };

  // Carousel actions
  const handleAddSlide = (e) => {
    e.preventDefault();
    if (!newSlide.title || !newSlide.desktopImg) {
      alert("Please fill in the title and image URL fields.");
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
    saveToStorage("carousel_slides", updated, "New slide added successfully!");
    setNewSlide({ title: "", subtitle: "", desktopImg: "", ctaText: "Explore Collection", badge: "" });
  };

  const handleDeleteSlide = (id) => {
    const updated = slides.filter((slide) => slide.id !== id);
    setSlides(updated);
    saveToStorage("carousel_slides", updated, "Slide deleted successfully!");
  };

  // Category Actions
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    if (categories.includes(newCategory.trim())) {
      alert("Category already exists.");
      return;
    }
    const updated = [...categories, newCategory.trim()];
    setCategories(updated);
    saveToStorage("gallery_categories", updated, "Category added successfully!");
    setNewCategory("");
  };

  const handleDeleteCategory = (cat) => {
    if (cat === "All") {
      alert("Cannot delete standard filter tab 'All'.");
      return;
    }
    const updated = categories.filter((c) => c !== cat);
    setCategories(updated);
    saveToStorage("gallery_categories", updated, "Category deleted successfully!");
  };

  // Gallery Image Actions
  const handleAddImage = (e) => {
    e.preventDefault();
    if (!newImage.imageUrl || !newImage.categoryId) {
      alert("Please enter image URL and choose category.");
      return;
    }
    const updated = [
      ...galleryImages,
      {
        id: Date.now().toString(),
        imageUrl: newImage.imageUrl,
        categoryId: newImage.categoryId
      }
    ];
    setGalleryImages(updated);
    saveToStorage("gallery_images", updated, "Gallery item added successfully!");
    setNewImage({ imageUrl: "", categoryId: "" });
  };

  const handleDeleteImage = (id) => {
    const updated = galleryImages.filter((img) => img.id !== id);
    setGalleryImages(updated);
    saveToStorage("gallery_images", updated, "Image deleted successfully!");
  };

  // About and Video actions
  const handleSaveAboutVideo = (e) => {
    e.preventDefault();
    const shopPrefix = adminUser.domain.split(".")[0];
    localStorage.setItem(`aadagam_about_content_${shopPrefix}`, JSON.stringify(aboutUs));
    localStorage.setItem(`aadagam_video_url_${shopPrefix}`, videoUrl);
    triggerToast("About story & video URL updated successfully!");
  };

  // Contact settings actions
  const handleSaveContactInfo = (e) => {
    e.preventDefault();
    saveToStorage("contact_info", contactInfo, "Showroom contact profile saved successfully!");
  };

  if (!adminUser) return null;

  const shopPrefix = adminUser.domain.split(".")[0];
  const publicStorefrontUrl = `/shop?shop=${shopPrefix}`;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-stone-950">
      {/* Top Header Dashboard Navbar */}
      <header className="bg-stone-950 text-white border-b border-stone-850 py-4 px-6 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center">
              <Gem className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wide block">
                Aadagam Control Center
              </span>
              <span className="text-[9px] text-[#B8860B] font-bold tracking-widest uppercase block -mt-1">
                Hi, {adminUser.ownerName}!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View storefront */}
            <a
              href={publicStorefrontUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B8860B] text-stone-950 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:scale-[1.02]"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Launch Website</span>
              <ExternalLink className="w-3 h-3 text-stone-950" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Panel Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav (Tabs switcher) */}
        <aside className="md:w-64 shrink-0 flex flex-col justify-between text-left">
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest px-3 mb-2">Showroom Sections</p>
            {[
              { id: "carousel", label: "Hero Carousel", icon: Layers },
              { id: "categories", label: "Gallery Categories", icon: Settings },
              { id: "gallery", label: "Gallery Images", icon: ImageIcon },
              { id: "about", label: "Story & Video", icon: BookOpen },
              { id: "contact", label: "Contact Profile", icon: Store }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all ${
                    isActive
                      ? "bg-[#1C1917] text-[#D4AF37] border border-[#D4AF37]/35 shadow-md shadow-stone-900/10"
                      : "bg-white hover:bg-stone-50 text-stone-600 border border-stone-200"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : "text-stone-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Logout Button */}
          <div className="pt-6 border-t border-stone-200 mt-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200/60 transition-all"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Panel View Area */}
        <main className="flex-1 bg-white border border-stone-200 rounded-[32px] p-6 sm:p-8 shadow-sm">
          {/* TAB 1: HERO CAROUSEL */}
          {activeTab === "carousel" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Hero Carousel Slides</h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">Manage the full-screen sliding banners displayed on your storefront homepage.</p>
              </div>

              {/* Add slide form */}
              <form onSubmit={handleAddSlide} className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8860B] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add New Banner Slide
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Banner Headline Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Royal Antique Haar Collection"
                      value={newSlide.title}
                      onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Slide Badge (Accent text)</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure 22K Kundan"
                      value={newSlide.badge}
                      onChange={(e) => setNewSlide({ ...newSlide, badge: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Sub-headline Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Ornate necklaces crafted by master goldsmiths for wedding moments."
                      value={newSlide.subtitle}
                      onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Image URL (High-definition)</label>
                    <input
                      type="url"
                      placeholder="e.g. https://images.unsplash.com/photo-1515562141207-7a88fb7ce338"
                      value={newSlide.desktopImg}
                      onChange={(e) => setNewSlide({ ...newSlide, desktopImg: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-[#FAF9F5] border border-stone-850 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Add Banner Slide
                </button>
              </form>

              {/* Slides lists */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Banners ({slides.length})</h4>
                <div className="space-y-3">
                  {slides.map((slide) => (
                    <div
                      key={slide.id}
                      className="flex items-center gap-4 bg-white border border-stone-200 rounded-2xl p-4 hover:border-stone-300 transition-colors shadow-sm justify-between"
                    >
                      <div className="flex items-center gap-4 overflow-hidden">
                        <img
                          src={slide.desktopImg}
                          alt="thumbnail"
                          className="w-16 h-10 object-cover rounded-md bg-stone-100 border border-stone-250 shrink-0"
                        />
                        <div className="truncate text-left">
                          <span className="block text-[9px] uppercase font-bold text-[#B8860B]">{slide.badge || "Slide Banner"}</span>
                          <span className="block font-serif text-sm font-bold text-stone-800 truncate">{slide.title}</span>
                          <span className="block text-[11px] text-stone-500 truncate font-light">{slide.subtitle}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-2 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GALLERY CATEGORIES */}
          {activeTab === "categories" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Catalogue Categories</h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">Define categories to filter your jewellery collections (e.g. Chokers, Rings, Bangles).</p>
              </div>

              {/* Add category form */}
              <form onSubmit={handleAddCategory} className="flex gap-3 bg-stone-50 border border-stone-100 rounded-2xl p-4">
                <input
                  type="text"
                  placeholder="e.g. Diamond Chokers"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-[#FAF9F5] px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0"
                >
                  Add Category
                </button>
              </form>

              {/* Category lists */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="inline-flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl py-1.5 pl-3 pr-2 text-xs font-medium text-stone-700"
                    >
                      <span>{cat}</span>
                      {cat !== "All" && (
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="text-stone-400 hover:text-rose-500 rounded p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GALLERY IMAGES */}
          {activeTab === "gallery" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Jewellery Gallery Catalogue</h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">Upload and assign showroom photos to your dynamic filters.</p>
              </div>

              {/* Add Image Form */}
              <form onSubmit={handleAddImage} className="bg-stone-50 border border-stone-100 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#B8860B] flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Gallery Image
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Assigned Category Filter</label>
                    <select
                      value={newImage.categoryId}
                      onChange={(e) => setNewImage({ ...newImage, categoryId: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="">-- Choose Category --</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Image URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f"
                      value={newImage.imageUrl}
                      onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-[#FAF9F5] border border-stone-850 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Add Catalogue Image
                </button>
              </form>

              {/* Gallery Images List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Catalogue Images ({galleryImages.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryImages.map((img) => (
                    <div
                      key={img.id}
                      className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm flex flex-col justify-between"
                    >
                      <div className="aspect-4/3 w-full bg-stone-50 overflow-hidden relative">
                        <img
                          src={img.imageUrl}
                          alt="catalog"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-stone-950/80 backdrop-blur-md text-[#F3E5AB] text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {img.categoryId}
                        </span>
                      </div>
                      <div className="p-3 bg-stone-50 flex items-center justify-end border-t border-stone-200">
                        <button
                          onClick={() => handleDeleteImage(img.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT US & VIDEOS */}
          {activeTab === "about" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Showroom Story & Video URL</h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">Customize your brand story text and YouTube video URL displayed on the storefront.</p>
              </div>

              <form onSubmit={handleSaveAboutVideo} className="space-y-5">
                {/* About Story Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-600 uppercase">Story Title Headline</label>
                  <input
                    type="text"
                    value={aboutUs.title}
                    onChange={(e) => setAboutUs({ ...aboutUs, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>

                {/* About Text Body */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-600 uppercase">Heritage Story Content Paragraph</label>
                  <textarea
                    rows={6}
                    value={aboutUs.historyParagraphs[0]}
                    onChange={(e) => setAboutUs({ ...aboutUs, historyParagraphs: [e.target.value] })}
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                    placeholder="Tell your showroom history, purity guarantees, and crafting traditions..."
                  />
                </div>

                {/* YouTube Link */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-600 uppercase">Atelier YouTube Video URL</label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-[#FAF9F5] border border-stone-850 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-[#D4AF37]" />
                  <span>Save Story & Video</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: CONTACT PROFILE SETTINGS */}
          {activeTab === "contact" && (
            <div className="space-y-6 text-left">
              <div>
                <h3 className="font-serif text-2xl font-bold text-stone-900">Showroom Contact Profile</h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">Provide detailed contact links, address summaries, and phone parameters for your showroom.</p>
              </div>

              <form onSubmit={handleSaveContactInfo} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone Primary */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Primary Phone Number</label>
                    <input
                      type="text"
                      value={contactInfo.phonePrimary || ""}
                      onChange={(e) => setContactInfo({ ...contactInfo, phonePrimary: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                    />
                  </div>

                  {/* Phone Secondary */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Secondary Phone Number</label>
                    <input
                      type="text"
                      value={contactInfo.phoneSecondary || ""}
                      onChange={(e) => setContactInfo({ ...contactInfo, phoneSecondary: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Contact Email</label>
                    <input
                      type="email"
                      value={contactInfo.email || ""}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                    />
                  </div>

                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">WhatsApp API Number (no spaces, include country code)</label>
                    <input
                      type="text"
                      value={contactInfo.whatsapp || ""}
                      onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                      placeholder="e.g. 919876543210"
                      className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                    />
                  </div>

                  {/* Map Directions URL */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Google Maps Navigation Share Link</label>
                    <input
                      type="url"
                      value={contactInfo.mapDirectionsUrl || ""}
                      onChange={(e) => setContactInfo({ ...contactInfo, mapDirectionsUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                    />
                  </div>

                  {/* Address Summary */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold text-stone-600 uppercase">Boutique Address Details</label>
                    <textarea
                      rows={3}
                      value={contactInfo.address || ""}
                      onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-stone-50/50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-stone-900 hover:bg-stone-800 text-[#FAF9F5] border border-stone-850 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-[#D4AF37]" />
                  <span>Save Showroom Profile</span>
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Floating Success Toast Popup Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 border border-[#D4AF37]/50 text-white rounded-2xl py-3 px-5 shadow-2xl flex items-center gap-2 animate-fade-in text-sm font-semibold">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-50" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
