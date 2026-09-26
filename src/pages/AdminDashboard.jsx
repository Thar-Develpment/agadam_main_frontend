import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
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
  ShieldCheck,
  Upload,
  MessageCircle,
  MapPin,
  Phone,
  Mail,
  Building2,
  X,
  Sparkles,
  Send,
  Share2,
} from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  WhatsappIcon,
  TwitterIcon,
  YoutubeIcon,
  TelegramIcon,
} from "../components/SocialIcons";
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
  parseStoryContent,
  adminAddHeroSlide,
  adminGetAllHeroSlide,
  adminGetSingleHeroSlide,
  adminUpdateHeroSlide,
  adminGetDashboardStats,
  adminUpdatePrice,
  getSiteInfo,
  adminUpdateSiteInfo,
  adminUploadImages,
  adminActivateSubdomain,
  extractYoutubeId,
  DEFAULT_GOLD_THUMBNAIL
} from "../services/api";
import { mockSlides, mockShopInfo } from "../services/mockData";
import { getShopPrefix, getStorefrontUrl } from "../services/apiClient";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState("carousel");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // 0. Dashboard Stats & Live Metal Rates State
  const [dashboardStats, setDashboardStats] = useState({
    category_count: 0,
    gallery_count: 0,
    videos_count: 0,
    asked_question: 0,
    priceData: [],
  });
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
  const [storyImage, setStoryImage] = useState("");
  const [storyPage, setStoryPage] = useState(0);

  // 6. Slideshow Carousel
  const [slides, setSlides] = useState([]);
  const [slidePage, setSlidePage] = useState(0);
  const [newSlide, setNewSlide] = useState({
    title: "",
    subtitle: "",
    desktopImg: "",
    ctaText: "Explore Collection",
    badge: ""
  });

  // 7. Contact Profile & Site Info
  const [contactInfo, setContactInfo] = useState({
    logo: "",
    city: "",
    address: "",
    phone: "",
    phonePrimary: "",
    contact_us: "",
    email: "",
    whatsapp_no: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    telegram: "",
  });

  // 8. Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: "", // 'slide' | 'category' | 'gallery' | 'video'
    item: null
  });

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
    const parsedContact = localContact ? JSON.parse(localContact) : {};
    let parsedSocials = parsedContact.social_urls || {};
    if (typeof parsedSocials === "string") {
      try { parsedSocials = JSON.parse(parsedSocials); } catch (e) {}
    }
    setContactInfo({
      logo: parsedContact.logo || "",
      city: parsedContact.city || "",
      address: parsedContact.address || mockShopInfo.address,
      phone: parsedContact.phone || parsedContact.phonePrimary || mockShopInfo.phonePrimary,
      phonePrimary: parsedContact.phonePrimary || mockShopInfo.phonePrimary,
      contact_us: parsedContact.contact_us || adminUser.email,
      email: parsedContact.email || adminUser.email,
      whatsapp_no: parsedContact.whatsapp_no || parsedContact.whatsapp || mockShopInfo.whatsapp,
      whatsapp: parsedContact.whatsapp || mockShopInfo.whatsapp,
      facebook: parsedContact.facebook || parsedSocials.facebook || "",
      instagram: parsedContact.instagram || parsedSocials.instagram || "",
      twitter: parsedContact.twitter || parsedSocials.twitter || "",
      youtube: parsedContact.youtube || parsedSocials.youtube || "",
      telegram: parsedContact.telegram || parsedSocials.telegram || "",
    });

    // Backend APIs
    loadDashboardStats();
    loadCategories(0);
    loadGallery(0);
    loadVideos(0);
    loadEnquiries(0);
    loadStories(0);
    loadSlides(0);
    loadShowroomSiteInfo();
  }, [adminUser]);

  const loadShowroomSiteInfo = async () => {
    try {
      if (!adminUser) return;
      const shopPrefix = getShopPrefix(adminUser.domain);
      const res = await getSiteInfo(shopPrefix);
      if (res && res.siteInfoData) {
        const d = res.siteInfoData;
        let socialLinks = {};
        if (d.social_urls) {
          try {
            socialLinks = typeof d.social_urls === "string" ? JSON.parse(d.social_urls) : d.social_urls;
          } catch (e) {}
        }
        setContactInfo((prev) => ({
          ...prev,
          logo: d.logo || prev.logo || "",
          city: d.city || prev.city || "",
          address: d.address || prev.address || "",
          phone: d.phone || prev.phone || prev.phonePrimary || "",
          phonePrimary: d.phone || prev.phonePrimary || "",
          contact_us: d.contact_us || prev.contact_us || prev.email || "",
          email: d.contact_us || prev.email || "",
          whatsapp_no: d.whatsapp_no || prev.whatsapp_no || prev.whatsapp || "",
          whatsapp: d.whatsapp_no || prev.whatsapp || "",
          facebook: socialLinks?.facebook || d.facebook || prev.facebook || "",
          instagram: socialLinks?.instagram || d.instagram || prev.instagram || "",
          twitter: socialLinks?.twitter || d.twitter || prev.twitter || "",
          youtube: socialLinks?.youtube || d.youtube || prev.youtube || "",
          telegram: socialLinks?.telegram || d.telegram || prev.telegram || "",
        }));
      }
    } catch (err) {
      console.warn("Could not load backend site info:", err);
    }
  };

  // Direct multi-image/video upload handler (POST /opxXxolN7m6CU/upload)
  const handleDirectImageUpload = async (e, target = "gallery") => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 10) {
      triggerToast("You can upload a maximum of 10 files at once.", "error");
      if (e.target) e.target.value = "";
      return;
    }

    // Verify sizes (max 50MB each for videos / images)
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 50 * 1024 * 1024) {
        triggerToast(`File "${files[i].name}" exceeds the 50MB size limit.`, "error");
        if (e.target) e.target.value = "";
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(`Uploading ${files.length} file(s) to cloud storage...`);

    try {
      const res = await adminUploadImages(files);
      setIsUploading(false);
      setUploadProgress("");
      if (e.target) e.target.value = "";

      // Backend returns images array of { originalName, fileName, url } or urls array
      const uploadedList = res.images && Array.isArray(res.images)
        ? res.images.map((img) => img.url).filter(Boolean)
        : (res.urls || (res.data ? (Array.isArray(res.data) ? res.data : [res.data]) : []));

      if ((res.success || res.status === 1) && uploadedList.length > 0) {
        triggerToast(`Successfully uploaded ${uploadedList.length} file(s)!`);

        if (target === "gallery") {
          if (uploadedList.length === 1) {
            setNewImage((prev) => ({ ...prev, imageUrl: uploadedList[0] }));
          } else if (newImage.categoryId) {
            for (const url of uploadedList) {
              await adminAddGallery(newImage.categoryId, url);
            }
            loadGallery(galleryPage);
            loadDashboardStats();
            triggerToast(`Added ${uploadedList.length} images to category!`);
          } else {
            setNewImage((prev) => ({ ...prev, imageUrl: uploadedList[0] }));
          }
        } else if (target === "video") {
          setNewVideoUrl(uploadedList[0]);
          await adminAddVideo(uploadedList[0]);
          loadVideos(videoPage);
          loadDashboardStats();
          triggerToast("Video uploaded and added to showcase!");
        } else if (target === "story") {
          setStoryImage(uploadedList[0]);
          triggerToast("Story image uploaded! Click 'Save Story Narrative & Image' to apply.");
        } else if (target === "slideshow") {
          setNewSlide((prev) => ({ ...prev, desktopImg: uploadedList[0] }));
        } else if (target === "logo") {
          setContactInfo((prev) => ({ ...prev, logo: uploadedList[0] }));
          triggerToast("Showroom logo uploaded! Click 'Save Showroom Site Info' to apply changes.");
        }
      } else {
        triggerToast(res?.message || "Upload completed with no file URLs returned.", "error");
      }
    } catch (err) {
      console.error("Direct upload failed:", err);
      setIsUploading(false);
      setUploadProgress("");
      if (e.target) e.target.value = "";
      triggerToast("File upload failed.", "error");
    }
  };

  /* ==========================================================================
   * 0. DASHBOARD STATS & PRICE UPDATE HANDLERS
   * ========================================================================== */
  const loadDashboardStats = async () => {
    try {
      const [res, siteRes] = await Promise.all([
        adminGetDashboardStats(),
        getSiteInfo(),
      ]);

      setDashboardStats({
        category_count: res?.category_count ?? 0,
        gallery_count: res?.gallery_count ?? 0,
        videos_count: res?.videos_count ?? 0,
        asked_question: res?.asked_question ?? 0,
        priceData: siteRes?.priceData || res?.priceData || [],
      });
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
    const categoryId = img.category_id ?? img.categoryId ?? 1;
    const imageUrl = img.image_url || img.imageUrl || img.url || "";
    const res = await adminUpdateGallery(img.id, categoryId, imageUrl, nextStatus);
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
    const videoUrl = v.video_url || v.videoUrl || v.url || "";
    const res = await adminUpdateVideo(v.id, videoUrl, nextStatus);
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
        if (res.data.length > 0) {
          const story = res.data[0];
          const { storyText, imageUrl } = parseStoryContent(
            story.content || story.strContent || "",
            story.image || story.image_url || ""
          );
          setStoryContent(storyText || "");
          setStoryImage(imageUrl || "");
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
      res = await adminUpdateOurStory(stories[0].id, storyContent.trim(), 1, storyImage);
    } else {
      res = await adminAddOurStory(storyContent.trim(), storyImage);
    }
    setIsLoading(false);

    if (res.status === 1) {
      triggerToast(res.message || "Our Story and Image updated successfully!");
      loadStories(storyPage);
    } else {
      triggerToast(res.message || "Failed to update story", "error");
    }
  };

  /* ==========================================================================
   * 6. CAROUSEL & SLIDESHOW CRUD HANDLERS
   * ========================================================================== */
  const loadSlides = async (page = 0) => {
    try {
      if (!adminUser) return;
      const res = await adminGetAllHeroSlide(page, 20);
      if (res && res.status === 1 && Array.isArray(res.data)) {
        const mapped = res.data.map((s) => ({
          id: s.id,
          title: s.title || "",
          subtitle: s.description || "",
          description: s.description || "",
          desktopImg: s.image || "",
          mobileImg: s.image || "",
          image: s.image || "",
          status: s.status !== undefined ? Number(s.status) : 1,
          created_at: s.created_at,
          ctaLink: "#gallery",
          ctaText: "Explore Collection",
        }));
        setSlides(mapped);
        const shopPrefix = getShopPrefix(adminUser.domain);
        localStorage.setItem(`aadagam_carousel_slides_${shopPrefix}`, JSON.stringify(mapped));
      } else {
        const shopPrefix = getShopPrefix(adminUser.domain);
        const localSlides = localStorage.getItem(`aadagam_carousel_slides_${shopPrefix}`);
        if (localSlides) {
          setSlides(JSON.parse(localSlides));
        } else {
          setSlides(mockSlides);
        }
      }
    } catch (e) {
      console.error("Failed to load hero slides:", e);
    }
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    if (!newSlide.title.trim()) {
      triggerToast("Please provide a banner headline.", "error");
      return;
    }
    if (!newSlide.desktopImg) {
      triggerToast("Please upload a banner image file.", "error");
      return;
    }

    setIsLoading(true);
    const res = await adminAddHeroSlide({
      title: newSlide.title.trim(),
      description: (newSlide.subtitle || "").trim(),
      image: newSlide.desktopImg.trim(),
    });
    setIsLoading(false);

    if (res.status === 1 || res.success) {
      triggerToast(res.message || "New hero slide added successfully!");
      setNewSlide({ title: "", subtitle: "", desktopImg: "", ctaText: "Explore Collection", badge: "" });
      loadSlides(slidePage);
    } else {
      triggerToast(res.message || "Failed to add hero slide.", "error");
    }
  };

  const handleToggleSlideStatus = async (slide) => {
    const nextStatus = slide.status === 1 ? 0 : 1;
    setIsLoading(true);
    const res = await adminUpdateHeroSlide(
      slide.id,
      slide.title,
      slide.description || slide.subtitle || "",
      slide.image || slide.desktopImg || "",
      nextStatus
    );
    setIsLoading(false);
    if (res.status === 1 || res.success) {
      triggerToast(`Hero slide ${nextStatus === 1 ? "Activated" : "Deactivated"}`);
      loadSlides(slidePage);
    } else {
      triggerToast(res.message || "Status update failed", "error");
    }
  };

  const openDeleteModal = (type, item) => {
    setDeleteModal({
      isOpen: true,
      type,
      item,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.item) return;
    const { type, item } = deleteModal;

    if (type === "slide") {
      setIsLoading(true);
      const res = await adminUpdateHeroSlide(
        item.id,
        item.title || "",
        item.description || item.subtitle || "",
        item.image || item.desktopImg || "",
        0
      );
      setIsLoading(false);
      if (res.status === 1 || res.success) {
        triggerToast("Hero slide deleted successfully.");
        loadSlides(slidePage);
      } else {
        triggerToast(res.message || "Failed to delete hero slide.", "error");
      }
    } else if (type === "category") {
      setIsLoading(true);
      const categoryName = item.category_name || item.categoryName || item.name || "";
      const res = await adminUpdateCategory(item.id, categoryName, 0);
      setIsLoading(false);
      if (res.status === 1) {
        triggerToast("Category deleted successfully.");
        loadCategories(categoryPage);
      } else {
        triggerToast(res.message || "Failed to delete category.", "error");
      }
    } else if (type === "gallery") {
      setIsLoading(true);
      const categoryId = item.category_id ?? item.categoryId ?? 1;
      const imageUrl = item.image_url || item.imageUrl || item.url || "";
      const res = await adminUpdateGallery(item.id, categoryId, imageUrl, 0);
      setIsLoading(false);
      if (res.status === 1) {
        triggerToast("Gallery image deleted successfully.");
        loadGallery(galleryPage);
      } else {
        triggerToast(res.message || "Failed to delete image.", "error");
      }
    } else if (type === "video") {
      setIsLoading(true);
      const videoUrl = item.video_url || item.videoUrl || item.url || "";
      const res = await adminUpdateVideo(item.id, videoUrl, 0);
      setIsLoading(false);
      if (res.status === 1) {
        triggerToast("Showcase video deleted successfully.");
        loadVideos(videoPage);
      } else {
        triggerToast(res.message || "Failed to delete video.", "error");
      }
    }

    setDeleteModal({ isOpen: false, type: "", item: null });
  };

  const handleSaveContactInfo = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const logo = (contactInfo.logo || "").trim().slice(0, 250);
    const city = (contactInfo.city || "").trim().slice(0, 250);
    const address = (contactInfo.address || "").trim().slice(0, 1500);
    const phone = (contactInfo.phone || contactInfo.phonePrimary || "").trim().slice(0, 15);
    const contact_us = (contactInfo.contact_us || contactInfo.email || "").trim().slice(0, 30);
    const whatsapp_no = (contactInfo.whatsapp_no || contactInfo.whatsapp || phone).trim().slice(0, 15);

    const facebook = (contactInfo.facebook || "").trim();
    const instagram = (contactInfo.instagram || "").trim();
    const twitter = (contactInfo.twitter || "").trim();
    const youtube = (contactInfo.youtube || "").trim();
    const telegram = (contactInfo.telegram || "").trim();
    const whatsapp = (contactInfo.whatsapp || contactInfo.whatsapp_no || phone || "").trim();

    try {
      const res = await adminUpdateSiteInfo({
        logo: logo || "https://s3.in-west3.purestore.io/aadagam/images/logo.png",
        city,
        address,
        phone,
        contact_us,
        whatsapp_no,
        facebook,
        instagram,
        whatsapp: whatsapp ? (whatsapp.startsWith("http") || whatsapp.startsWith("wa.me") ? whatsapp : `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`) : "",
        twitter,
        youtube,
        telegram,
      });

      setIsLoading(false);

      if (res && (res.status === 1 || res.success === 1 || res.success === true)) {
        const shopPrefix = getShopPrefix(adminUser.domain);
        const social_urls = { facebook, instagram, whatsapp, twitter, youtube, telegram };
        localStorage.setItem(
          `aadagam_contact_info_${shopPrefix}`,
          JSON.stringify({ ...contactInfo, logo, social_urls, facebook, instagram, twitter, youtube, telegram })
        );
        triggerToast(res.message || "Showroom contact and site info updated successfully!");
        loadShowroomSiteInfo();
      } else {
        triggerToast(res?.message || "Failed to update showroom site info.", "error");
      }
    } catch (err) {
      console.error("Error saving site info:", err);
      setIsLoading(false);
      triggerToast("Failed to update showroom site info.", "error");
    }
  };

  const handleActivateSite = async () => {
    if (!adminUser?.id) {
      triggerToast("Showroom account ID not detected.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await adminActivateSubdomain(adminUser.id);
      setIsLoading(false);
      if (res && res.status === 1) {
        triggerToast("Showroom site activated successfully!");
      } else {
        triggerToast(res?.message || "Site activation failed.", "error");
      }
    } catch (err) {
      setIsLoading(false);
      triggerToast("Failed to activate showroom site.", "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("aadagam_current_admin");
    localStorage.removeItem("aadagam_auth_token");
    navigate("/admin");
  };

  if (!adminUser) return null;

  const shopPrefix = getShopPrefix(adminUser.domain);
  const publicStorefrontUrl = getStorefrontUrl(shopPrefix);

  const getCategoryName = (catId) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.category_name : `Category #${catId}`;
  };

  const navTabs = [
    { id: "carousel", label: "Hero Slideshow", shortLabel: "Slideshow", icon: Layers, count: slides.length },
    { id: "categories", label: "Categories", shortLabel: "Categories", icon: Tag, count: categories.length },
    { id: "gallery", label: "Jewellery Gallery", shortLabel: "Gallery", icon: ImageIcon, count: galleryImages.length },
    { id: "rates", label: "Daily Metal Rates", shortLabel: "Metal Rates", icon: Coins, count: dashboardStats.priceData.length },
    { id: "story", label: "Our Story Narrative", shortLabel: "Our Story", icon: BookOpen },
    { id: "videos", label: "Showcase Videos", shortLabel: "Videos", icon: Video, count: videos.length },
    { id: "enquiries", label: "Customer Enquiries", shortLabel: "Enquiries", icon: MessageSquare, count: enquiries.length },
    { id: "contact", label: "Showroom Contact", shortLabel: "Contact", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-stone-950">
      {/* Top Header Dashboard Navbar */}
      <header className="bg-stone-950 text-white border-b border-stone-850 py-3 px-4 sm:px-6 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Mobile Drawer Trigger & Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-colors shrink-0 cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#D4AF37]" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center shrink-0">
              <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4AF37]" />
            </div>
            <div className="min-w-0">
              <span className="font-serif text-sm sm:text-lg font-bold tracking-wide block truncate">
                AADAGAM CONTROL CENTER
              </span>
              <span className="text-[9px] text-[#B8860B] font-bold tracking-widest uppercase block -mt-1 truncate">
                Showroom Management & APIs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
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
              className="inline-flex items-center gap-1.5 bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#F3E5AB] border border-[#D4AF37]/40 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold tracking-wider transition-all"
            >
              <Globe className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="hidden sm:inline">Live Storefront:</span>
              <span className="font-mono text-[#D4AF37] underline truncate max-w-[110px] sm:max-w-none">{adminUser.domain}</span>
              <ExternalLink className="w-3 h-3 ml-0.5 shrink-0" />
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Quick-Navigation Bar (Sticky underneath header on mobile) */}
      <div className="lg:hidden bg-white/95 backdrop-blur-md border-b border-stone-200 px-3 py-2 sticky top-[57px] z-30 overflow-x-auto shadow-xs">
        <div className="flex items-center gap-1.5 min-w-max">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap uppercase tracking-wider ${
                  isActive
                    ? "bg-[#1C1917] text-[#FAF9F5] shadow-xs"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#D4AF37]" : "text-stone-500"}`} />
                <span>{tab.shortLabel}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? "bg-[#D4AF37] text-stone-950 font-bold" : "bg-white text-stone-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation Drawer / Slide-Over Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-[85%] max-w-xs bg-white shadow-2xl p-5 flex flex-col justify-between overflow-y-auto z-50 animate-fade-in">
            <div className="space-y-4">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-stone-950 flex items-center justify-center">
                    <Gem className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <span className="font-serif font-bold text-stone-900 text-sm">Navigation Menu</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Showroom Profile Summary Card */}
              <div className="p-3 bg-[#FAF9F5] border border-stone-200 rounded-2xl flex items-center gap-3">
                {contactInfo.logo ? (
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#D4AF37]/50 p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                    <img
                      src={contactInfo.logo}
                      alt="Showroom Logo"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <div className="hidden w-full h-full rounded-xl bg-stone-900 items-center justify-center">
                      <Store className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-[#B8860B]" />
                  </div>
                )}
                <div className="overflow-hidden flex-1">
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">
                    Active Showroom
                  </span>
                  <span className="font-serif font-bold text-stone-900 text-xs truncate block -mt-0.5">
                    {adminUser.shopName || shopPrefix.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono truncate block">
                    {adminUser.email}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs List */}
              <div className="space-y-1 pt-1">
                {navTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
                        isActive
                          ? "bg-[#1C1917] text-[#FAF9F5] shadow-xs"
                          : "text-stone-600 hover:bg-stone-100/70 hover:text-stone-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#D4AF37]" : "text-stone-400"}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.count !== undefined && (
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isActive ? "bg-[#D4AF37] text-stone-950 font-bold" : "bg-stone-100 text-stone-500"
                          }`}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-4 border-t border-stone-100 space-y-2 mt-4">
              <a
                href={publicStorefrontUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 bg-[#FAF9F5] border border-stone-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-stone-700 hover:text-[#B8860B]"
              >
                <Globe className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>Open Live Storefront</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 uppercase tracking-wider transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Sidebar Menu (Desktop Only) */}
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-stone-200 rounded-3xl p-4 shadow-sm space-y-1.5 sticky top-24">
          <div className="px-4 py-3 mb-2 bg-[#FAF9F5] border border-stone-200 rounded-2xl flex items-center gap-3">
            {contactInfo.logo ? (
              <div className="w-10 h-10 rounded-xl bg-white border border-[#D4AF37]/50 p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                <img
                  src={contactInfo.logo}
                  alt="Showroom Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="hidden w-full h-full rounded-xl bg-stone-900 items-center justify-center">
                  <Store className="w-4 h-4 text-[#D4AF37]" />
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-[#B8860B]" />
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider block">
                Active Showroom
              </span>
              <span className="font-serif font-bold text-stone-900 text-sm truncate block -mt-0.5">
                {adminUser.shopName || shopPrefix.toUpperCase()}
              </span>
              <span className="text-[10px] text-stone-500 font-mono truncate block">
                {adminUser.email}
              </span>
            </div>
          </div>

          {navTabs.map((tab) => {
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
        <main className="lg:col-span-9 w-full min-w-0 space-y-6 text-left">
          {/* Live Overview Stats Counter Bar (GET /opxXxolN7m6CU/dash_board) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Categories</span>
                <span className="font-serif text-xl font-bold text-stone-900">{dashboardStats.category_count || categories.length}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center shrink-0">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Catalogue</span>
                <span className="font-serif text-xl font-bold text-stone-900">{dashboardStats.gallery_count || galleryImages.length}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Videos</span>
                <span className="font-serif text-xl font-bold text-stone-900">{dashboardStats.videos_count || videos.length}</span>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Enquiries</span>
                <span className="font-serif text-xl font-bold text-stone-900">{dashboardStats.asked_question || enquiries.length}</span>
              </div>
            </div>
          </div>
          {/* ===================================================================
           * TAB 0: DAILY METAL RATES MANAGER (POST /opxXxolN7m6CU/price_update)
           * =================================================================== */}
          {activeTab === "rates" && (
            <div className="space-y-6 animate-fade-in">
              {/* Price Update Form */}
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Daily Bullion Rates Manager
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Manually update live showroom prices for 24K, 22K, 18K gold and 999 fine silver.
                    </p>
                  </div>
                  <button
                    onClick={loadDashboardStats}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0"
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
                        </>
                      ) : (
                        <>
                          <option value="925">925 Silver</option>
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
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 min-h-[44px]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <TrendingUp className="w-4 h-4 text-[#D4AF37]" />}
                      <span>Update</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Current Active Metal Rates Cards */}
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                  Current Live Showroom Rates
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {dashboardStats.priceData.length > 0 ? (
                    dashboardStats.priceData.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="bg-[#FAF9F5] border border-[#D4AF37]/30 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-3"
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
                          <span className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight block mt-0.5">
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
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Category Management
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Organize your showroom catalogue into categories (e.g., Necklaces, Earrings, Rings, Bridal Sets).
                    </p>
                  </div>
                  <button
                    onClick={() => loadCategories(categoryPage)}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0"
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
                    className="inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
                    <span>Add Category</span>
                  </button>
                </form>
              </div>

              {/* Categories Table */}
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-4">
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
                        className="bg-[#FAF9F5] border border-stone-200 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-mono text-stone-400">ID #{cat.id}</span>
                          <h4 className="font-semibold text-sm text-stone-900 mt-0.5 truncate">
                            {cat.category_name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleToggleCategoryStatus(cat)}
                            className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${cat.status === 1
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-stone-200 text-stone-600 hover:bg-stone-300"
                              }`}
                          >
                            {cat.status === 1 ? "Active" : "Inactive"}
                          </button>
                          <button
                            onClick={() => openDeleteModal("category", cat)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
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
           * TAB 2: GALLERY IMAGES MANAGEMENT
           * =================================================================== */}
          {activeTab === "gallery" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Jewellery Catalogue Gallery
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Upload directly to Cloud Storage (up to 10 images, 5MB each) or enter image URLs.
                    </p>
                  </div>
                  <button
                    onClick={() => loadGallery(galleryPage)}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Direct Cloudflare R2 / AWS S3 Multi-Image Uploader Dropzone */}
                <div className="bg-stone-50/80 border-2 border-dashed border-[#D4AF37]/40 rounded-2xl p-4 sm:p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 text-[#B8860B] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-900">
                      Upload Images Directly to Cloud Storage
                    </h4>
                    <p className="text-[11px] text-stone-500 max-w-sm mx-auto mt-0.5">
                      Select up to 10 image files (JPEG, PNG, WebP — max 5MB each).
                    </p>
                  </div>

                  <div className="pt-1">
                    <label
                      htmlFor="gallery-file-upload"
                      className={`inline-flex items-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-[#D4AF37] font-bold px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm min-h-[44px] ${
                        isUploading ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                          <span>{uploadProgress || "Uploading..."}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Select Files & Upload</span>
                        </>
                      )}
                    </label>
                    <input
                      id="gallery-file-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleDirectImageUpload(e, "gallery")}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>
                </div>

                {/* Manual Add Item Form */}
                <form onSubmit={handleAddGalleryImage} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                  <div className="sm:col-span-4">
                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                      Select Category <span className="text-rose-500">*</span>
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
                      Image URL (Uploaded URL or HTTPS Link) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      maxLength={100}
                      placeholder="https://..."
                      value={newImage.imageUrl}
                      onChange={(e) => setNewImage({ ...newImage, imageUrl: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="submit"
                      disabled={isLoading || isUploading}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 min-h-[44px]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
                      <span>Add</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Gallery Grid */}
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                  Catalogue Items ({galleryImages.length})
                </span>

                {galleryImages.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4">No gallery items registered yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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

                        <div className="p-3 flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono text-stone-400 shrink-0">ID #{img.id}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleGalleryStatus(img)}
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${img.status === 1 ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                                }`}
                            >
                              {img.status === 1 ? "Active" : "Inactive"}
                            </button>
                            <button
                              onClick={() => openDeleteModal("gallery", img)}
                              className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                              title="Delete image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
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
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Showcase Videos
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Add YouTube videos of your atelier, artisan craftsmanship, and bridal campaigns.
                    </p>
                  </div>
                  <button
                    onClick={() => loadVideos(videoPage)}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddVideo} className="space-y-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1.5">
                      YouTube Video URL <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="url"
                        maxLength={500}
                        placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="flex-1 px-4 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !newVideoUrl.trim()}
                        className="inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 min-h-[44px]"
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
                        <span>Add Video</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Videos List */}
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
                  Showcase Videos ({videos.length})
                </span>

                {videos.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4">No videos found.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {videos.map((v) => {
                      const ytId = extractYoutubeId(v.video_url);
                      const initialThumb = ytId
                        ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
                        : DEFAULT_GOLD_THUMBNAIL;

                      return (
                        <div
                          key={v.id}
                          className="bg-[#FAF9F5] border border-stone-200 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
                        >
                          <div className="aspect-video w-full bg-stone-900 relative overflow-hidden group">
                            <img
                              src={initialThumb}
                              alt="Video thumbnail"
                              onError={(e) => {
                                if (e.currentTarget.src !== DEFAULT_GOLD_THUMBNAIL) {
                                  e.currentTarget.src = DEFAULT_GOLD_THUMBNAIL;
                                }
                              }}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-stone-950/20 flex items-center justify-center pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-stone-900/80 backdrop-blur-xs text-[#D4AF37] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg">
                                <Video className="w-5 h-5 ml-0.5" />
                              </div>
                            </div>
                          </div>

                          <div className="p-4 space-y-2">
                            <span className="text-[10px] font-mono text-stone-400 block truncate">
                              {v.video_url}
                            </span>
                            <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                              <span className="text-[10px] font-mono text-stone-500">ID #{v.id}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleToggleVideoStatus(v)}
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${v.status === 1 ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"
                                    }`}
                                >
                                  {v.status === 1 ? "Active" : "Inactive"}
                                </button>
                                <button
                                  onClick={() => openDeleteModal("video", v)}
                                  className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                                  title="Delete video"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Customer Enquiries Inbox
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Direct inquiries submitted by buyers through your storefront contact form.
                    </p>
                  </div>
                  <button
                    onClick={() => loadEnquiries(enquiryPage)}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0"
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
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-stone-50/60 rounded-2xl px-3 transition-colors"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-stone-900 text-sm">
                              {enq.customer_name}
                            </span>
                            <span className="text-[10px] font-mono text-stone-400">
                              {enq.created_at ? new Date(enq.created_at).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <div className="text-xs text-stone-500 font-mono truncate">
                            <span>{enq.email}</span>
                          </div>
                          <p className="text-xs text-stone-700 line-clamp-2 max-w-xl font-light">
                            {enq.query}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                          <button
                            onClick={() => handleViewEnquiryDetail(enq.id)}
                            className="inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors min-h-[36px]"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#B8860B]" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleToggleEnquiryStatus(enq)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors min-h-[36px] ${enq.status === 1
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
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Our Story & Heritage Narrative
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                      Publish your showroom's founding history, artisan craftsmanship philosophy, and feature showcase image.
                    </p>
                  </div>
                  <button
                    onClick={() => loadStories(storyPage)}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0"
                    title="Reload Story"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleSaveStory} className="space-y-5 pt-1">
                  {/* Brand Story Narrative Textarea */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                        Brand Story Narrative (Public Storefront Display) <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {storyContent.length} chars
                      </span>
                    </div>
                    <textarea
                      rows={7}
                      value={storyContent}
                      onChange={(e) => setStoryContent(e.target.value)}
                      placeholder="Founded in 1988, our showroom has been crafting authentic heirloom gold and diamond treasures..."
                      className="w-full p-4 bg-[#FAF9F5] border border-stone-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                      required
                    />
                  </div>

                  {/* Story Feature Image Upload Section (Direct File Upload Only) */}
                  <div className="p-4 sm:p-5 bg-[#FAF9F5] border border-stone-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#D4AF37]" />
                          <span>Our Story Feature Image</span>
                        </h4>
                        <p className="text-xs text-stone-500 mt-0.5">
                          Upload a showroom or craftsmanship photo displayed in the "Our Story" section on your storefront.
                        </p>
                      </div>
                      {storyImage && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                          Image Ready
                        </span>
                      )}
                    </div>

                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#D4AF37] bg-white rounded-2xl p-6 sm:p-8 text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-stone-800">
                            Uploading story image to cloud storage...
                          </p>
                          <p className="text-[11px] text-stone-500 font-light">
                            Please wait while your high-resolution image is processed.
                          </p>
                        </div>
                      </div>
                    ) : storyImage ? (
                      /* Preview of Uploaded Story Image */
                      <div className="border border-stone-200 rounded-2xl p-3 sm:p-4 bg-white space-y-3">
                        <div className="relative aspect-16/9 sm:aspect-21/9 max-h-64 w-full bg-stone-900 rounded-xl overflow-hidden shadow-inner group">
                          <img
                            src={storyImage}
                            alt="Story Feature Image Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              Ready for Storefront
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <label
                              htmlFor="story-file-upload"
                              className="inline-flex items-center gap-1.5 bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg backdrop-blur-md cursor-pointer transition-all shadow"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                              Change
                            </label>
                            <button
                              type="button"
                              onClick={() => setStoryImage("")}
                              className="inline-flex items-center gap-1 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg backdrop-blur-md transition-all shadow"
                              title="Remove story image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 font-mono truncate px-1">
                          File URL: {storyImage}
                        </p>
                      </div>
                    ) : (
                      /* Upload Dropzone Box */
                      <label
                        htmlFor="story-file-upload"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-[#D4AF37] hover:bg-white rounded-2xl p-6 sm:p-8 cursor-pointer transition-all group text-center space-y-3 bg-white"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#B8860B] transition-colors">
                          <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-stone-800 group-hover:text-[#B8860B] transition-colors">
                            Click or Drag & Drop to Upload Story Image
                          </p>
                          <p className="text-[11px] text-stone-500 font-light">
                            Supports PNG, JPG, WEBP (Max 50MB • Recommended 4:3 or 16:9 ratio)
                          </p>
                        </div>
                      </label>
                    )}

                    <input
                      id="story-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleDirectImageUpload(e, "story")}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || isUploading || !storyContent.trim()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
                    <span>Save Story Narrative & Image</span>
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
              <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                      Hero Banner Slideshow
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Configure top rotating luxury promotional slides on your storefront.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => loadSlides(slidePage)}
                    className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition-colors min-h-[36px]"
                    title="Refresh slides from server"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>

                <form onSubmit={handleAddSlide} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                      Banner Headline <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={255}
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
                      maxLength={1000}
                      placeholder="e.g. Discover timeless handcrafted bridal jewels"
                      value={newSlide.subtitle}
                      onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })}
                      className="w-full px-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  {/* Banner Image Upload Area - Direct File Upload Only */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                      Banner Image File <span className="text-rose-500">*</span>
                    </label>

                    {isUploading ? (
                      <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#D4AF37] bg-[#FAF9F5] rounded-2xl p-6 sm:p-8 text-center space-y-3">
                        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-stone-800">
                            Uploading image to cloud storage...
                          </p>
                          <p className="text-[11px] text-stone-500 font-light">
                            Please wait while your high-resolution banner is processed.
                          </p>
                        </div>
                      </div>
                    ) : newSlide.desktopImg ? (
                      /* Preview of Uploaded Banner Image */
                      <div className="border border-stone-200 rounded-2xl p-3 sm:p-4 bg-[#FAF9F5] space-y-3">
                        <div className="relative aspect-21/9 w-full bg-stone-900 rounded-xl overflow-hidden shadow-inner group">
                          <img
                            src={newSlide.desktopImg}
                            alt="Uploaded Hero Banner Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-3 left-3">
                            <span className="inline-flex items-center gap-1.5 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 sm:px-3 py-1 rounded-full shadow">
                              <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              Ready
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 flex items-center gap-2">
                            <label
                              htmlFor="slideshow-file-upload"
                              className="inline-flex items-center gap-1.5 bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg backdrop-blur-md cursor-pointer transition-all shadow"
                            >
                              <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
                              Change
                            </label>
                            <button
                              type="button"
                              onClick={() => setNewSlide((prev) => ({ ...prev, desktopImg: "" }))}
                              className="inline-flex items-center gap-1 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg backdrop-blur-md transition-all shadow"
                              title="Remove banner image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-500 font-mono truncate px-1">
                          File: {newSlide.desktopImg}
                        </p>
                      </div>
                    ) : (
                      /* Upload Dropzone Box */
                      <label
                        htmlFor="slideshow-file-upload"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-[#D4AF37] hover:bg-[#FAF9F5] rounded-2xl p-6 sm:p-8 cursor-pointer transition-all group text-center space-y-3"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 group-hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 flex items-center justify-center text-[#B8860B] transition-colors">
                          <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs sm:text-sm font-bold text-stone-800 group-hover:text-[#B8860B] transition-colors">
                            Click or Drag & Drop to Upload Banner Image
                          </p>
                          <p className="text-[11px] text-stone-500 font-light">
                            Supports PNG, JPG, WEBP (Recommended size: 1920×800px, Max 50MB)
                          </p>
                        </div>
                      </label>
                    )}

                    <input
                      id="slideshow-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleDirectImageUpload(e, "slideshow")}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={isLoading || isUploading || !newSlide.desktopImg}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3.5 px-7 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
                      <span>Add Hero Slide</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Slides Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                    Active Slides ({slides.filter((s) => s.status !== 0).length})
                  </span>
                </div>

                {slides.length === 0 ? (
                  <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-stone-400 text-xs italic">
                    No hero banner slides configured yet. Add your first promotional banner above!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {slides.map((s) => (
                      <div
                        key={s.id}
                        className={`bg-white border rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                          s.status === 0 ? "opacity-60 border-stone-300 bg-stone-50" : "border-stone-200"
                        }`}
                      >
                        <div className="aspect-21/9 w-full bg-stone-900 relative group overflow-hidden">
                          <img
                            src={s.desktopImg || s.image}
                            alt={s.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80";
                            }}
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md ${
                                s.status !== 0
                                  ? "bg-emerald-600/90 text-white shadow"
                                  : "bg-rose-600/90 text-white shadow"
                              }`}
                            >
                              {s.status !== 0 ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif font-bold text-stone-900 text-sm truncate">{s.title}</h4>
                            <p className="text-[11px] text-stone-500 font-light truncate max-w-xs">{s.subtitle || s.description}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {typeof s.id === "number" && s.id < 10000000000 && (
                              <button
                                onClick={() => handleToggleSlideStatus(s)}
                                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                                  s.status !== 0
                                    ? "text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200"
                                    : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                                }`}
                                title={s.status !== 0 ? "Deactivate Slide" : "Activate Slide"}
                              >
                                {s.status !== 0 ? "Disable" : "Enable"}
                              </button>
                            )}
                            <button
                              onClick={() => openDeleteModal("slide", s)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                              title="Delete slide"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
           * TAB 7: SHOWROOM CONTACT & SITE INFO (POST /opxXxolN7m6CU/update_site_info)
           * =================================================================== */}
          {activeTab === "contact" && (
            <div className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                    Showroom Contact & Site Info Profile
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Updates showroom address, contact numbers, email, and WhatsApp helpline in database.
                  </p>
                </div>
                <button
                  onClick={loadShowroomSiteInfo}
                  className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0"
                  title="Reload Site Info from backend"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveContactInfo} className="space-y-5">
                {/* Showroom Brand Logo Upload Section */}
                <div className="p-4 sm:p-5 bg-[#FAF9F5] border border-stone-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                        <span>Showroom Brand Logo</span>
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Upload your official showroom logo image. Displayed across your storefront header, footer, and brand profile.
                      </p>
                    </div>
                    {contactInfo.logo && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                        Logo Active
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 pt-2">
                    {/* Current Logo Preview */}
                    <div className="relative group shrink-0">
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-2 border-dashed border-stone-300 p-2 flex items-center justify-center shadow-inner overflow-hidden">
                        {contactInfo.logo ? (
                          <img
                            src={contactInfo.logo}
                            alt="Showroom Logo Preview"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/logo_without_backround.png";
                            }}
                          />
                        ) : (
                          <div className="text-center p-2 text-stone-400">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50 text-stone-400" />
                            <span className="text-[10px] block leading-tight">No logo uploaded</span>
                          </div>
                        )}
                      </div>
                      {contactInfo.logo && (
                        <button
                          type="button"
                          onClick={() => setContactInfo((prev) => ({ ...prev, logo: "" }))}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer"
                          title="Remove Logo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* File Dropzone / Upload button */}
                    <div className="flex-1 w-full">
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-[#D4AF37] rounded-2xl p-4 sm:p-6 bg-white hover:bg-amber-50/20 cursor-pointer transition-all text-center group">
                        <Upload className="w-6 h-6 text-[#D4AF37] mb-1.5 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-stone-800">
                          {isUploading ? "Uploading Logo..." : "Click to select or drop showroom logo image"}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-1">
                          PNG, JPG, SVG, WebP (Max 5MB • Recommended transparent PNG)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={(e) => handleDirectImageUpload(e, "logo")}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* City */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                        City <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {(contactInfo.city || "").length}/250 max
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={250}
                        placeholder="e.g. Chennai"
                        value={contactInfo.city || ""}
                        onChange={(e) => setContactInfo({ ...contactInfo, city: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        required
                      />
                    </div>
                  </div>

                  {/* Primary Phone */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                        Showroom Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {(contactInfo.phone || contactInfo.phonePrimary || "").length}/15 max
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        maxLength={15}
                        placeholder="e.g. +91 9952054493"
                        value={contactInfo.phone || contactInfo.phonePrimary || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9+ \-]/g, "");
                          setContactInfo({ ...contactInfo, phone: val, phonePrimary: val });
                        }}
                        className="w-full pl-10 pr-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        required
                      />
                    </div>
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                        WhatsApp Helpline Number <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {(contactInfo.whatsapp_no || contactInfo.whatsapp || "").length}/15 max
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        maxLength={15}
                        placeholder="e.g. +91 9952054493"
                        value={contactInfo.whatsapp_no || contactInfo.whatsapp || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9+ \-]/g, "");
                          setContactInfo({ ...contactInfo, whatsapp_no: val, whatsapp: val });
                        }}
                        className="w-full pl-10 pr-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Us (Email / Info) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                        Contact Us / Support Email <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {(contactInfo.contact_us || contactInfo.email || "").length}/30 max
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        maxLength={30}
                        placeholder="e.g. info@showroom.com"
                        value={contactInfo.contact_us || contactInfo.email || ""}
                        onChange={(e) => setContactInfo({ ...contactInfo, contact_us: e.target.value, email: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Showroom Physical Address */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                      Showroom Physical Address <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {(contactInfo.address || "").length}/1500 max
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      rows={3}
                      maxLength={1500}
                      value={contactInfo.address || ""}
                      onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                      placeholder="124, Gold Souk Street, Opp. Diamond Plaza, T. Nagar, Chennai - 600017"
                      className="w-full p-3.5 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] leading-relaxed"
                      required
                    />
                  </div>
                </div>

                {/* Showroom Social Media Channels Section */}
                <div className="p-4 sm:p-5 bg-[#FAF9F5] border border-stone-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-[#D4AF37]" />
                        <span>Showroom Social Media Channels</span>
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Configure official social media URLs for your showroom. Active links will display as clickable icons in your storefront website footer. Leave blank to hide.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                    {/* Instagram */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        Instagram Profile URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-pink-500">
                          <InstagramIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="https://instagram.com/aadagamjewels"
                          value={contactInfo.instagram || ""}
                          onChange={(e) => setContactInfo({ ...contactInfo, instagram: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {/* Facebook */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        Facebook Page URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-blue-600">
                          <FacebookIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="https://facebook.com/aadagamjewels"
                          value={contactInfo.facebook || ""}
                          onChange={(e) => setContactInfo({ ...contactInfo, facebook: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {/* WhatsApp */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        WhatsApp Link / Chat URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                          <WhatsappIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          placeholder="https://wa.me/919876543210"
                          value={contactInfo.whatsapp || (contactInfo.whatsapp_no ? (contactInfo.whatsapp_no.startsWith("http") ? contactInfo.whatsapp_no : `https://wa.me/${contactInfo.whatsapp_no.replace(/[^0-9]/g, "")}`) : "")}
                          onChange={(e) => setContactInfo({ ...contactInfo, whatsapp: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {/* YouTube */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        YouTube Channel URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-600">
                          <YoutubeIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="https://youtube.com/@aadagamjewels"
                          value={contactInfo.youtube || ""}
                          onChange={(e) => setContactInfo({ ...contactInfo, youtube: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {/* Twitter / X */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        Twitter / X Profile URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-800">
                          <TwitterIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="https://x.com/aadagamjewels"
                          value={contactInfo.twitter || ""}
                          onChange={(e) => setContactInfo({ ...contactInfo, twitter: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>

                    {/* Telegram */}
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                        Telegram Channel / Username URL
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sky-500">
                          <TelegramIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="url"
                          placeholder="https://t.me/aadagamjewels"
                          value={contactInfo.telegram || ""}
                          onChange={(e) => setContactInfo({ ...contactInfo, telegram: e.target.value })}
                          className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3.5 px-8 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" /> : <Save className="w-4 h-4 text-[#D4AF37]" />}
                    <span>Save Showroom Site Info</span>
                  </button>
                </div>
              </form>

              {/* Showroom Subdomain Activation Card (POST /opxXxolN7m6CU/activate_subdomain) */}
              <div className="bg-[#FAF9F5] border-2 border-[#D4AF37]/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-[#B8860B] text-xs font-semibold uppercase tracking-wider mb-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Subdomain & Subscription Status</span>
                    </div>
                    <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                      Showroom Activation
                    </h4>
                    <p className="text-xs text-stone-600 font-light mt-0.5">
                      Subdomain: <span className="font-mono font-bold text-[#B8860B]">{adminUser.domain}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleActivateSite}
                    disabled={isLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-50 min-h-[44px]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Activate Showroom Site</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SINGLE ENQUIRY DETAIL MODAL */}
      {selectedEnquiry && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            className="bg-white border border-[#D4AF37]/30 rounded-2xl sm:rounded-3xl max-w-lg w-full p-5 sm:p-8 space-y-5 sm:space-y-6 relative shadow-2xl text-left max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-stone-100 pb-4">
              <div>
                <span className="text-[10px] font-mono text-stone-400">Enquiry #{selectedEnquiry.id}</span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
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

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                onClick={() => handleToggleEnquiryStatus(selectedEnquiry)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${selectedEnquiry.status === 1
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                  }`}
              >
                Status: {selectedEnquiry.status === 1 ? "Resolved" : "Mark as Resolved"}
              </button>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="bg-stone-900 hover:bg-stone-800 text-white px-5 py-2.5 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Alert Modal */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
          onClick={() => setDeleteModal({ isOpen: false, type: "", item: null })}
        >
          <div
            className="bg-white border border-stone-200 rounded-2xl sm:rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Delete {
                    deleteModal.type === "slide" ? "Slide" :
                    deleteModal.type === "category" ? "Category" :
                    deleteModal.type === "gallery" ? "Image" : "Video"
                  }
                </h3>
                <p className="text-xs text-stone-500 font-light mt-0.5">
                  Are you sure you want to delete this {
                    deleteModal.type === "slide" ? "hero slide" :
                    deleteModal.type === "category" ? "category" :
                    deleteModal.type === "gallery" ? "gallery image" : "showcase video"
                  }?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, type: "", item: null })}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors min-h-[40px]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer min-h-[40px]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Trash2 className="w-4 h-4 text-white" />
                )}
                <span>Yes, Delete</span>
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
