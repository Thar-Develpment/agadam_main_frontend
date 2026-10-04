import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  adminGetAllTenants,
  adminToggleTenantStatus,
  adminActivateSubdomain,
  superAdminLogin,
  adminGetDashboardStats,
  adminUpdatePrice,
  getSiteInfo,
  adminAddBasicAsset,
  adminGetAllBasicAssets,
  adminUpdateBasicAsset,
  adminUploadImages,
} from "../services/api";
import { getStorefrontUrl, PLATFORM_DOMAIN, resolveFullImageUrl } from "../services/apiClient";
import AadagamLogo from "../components/AadagamLogo";
import {
  ShieldCheck,
  Store,
  User,
  Mail,
  MapPin,
  ExternalLink,
  Power,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft,
  Users,
  Eye,
  EyeOff,
  Coins,
  TrendingUp,
  Scale,
  Sparkles,
  Info,
  Image as ImageIcon,
  Video,
  Upload,
  Trash2,
  Plus,
  PartyPopper,
  Film,
  Calendar,
  Check,
  Download,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Super Admin Portal | Aadagam SaaS Platform";
  }, []);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const session = localStorage.getItem("aadagam_superadmin_session");
    return !!session && session !== "";
  });
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Active Navigation Tab: "tenants" | "rates" | "media"
  const [activeTab, setActiveTab] = useState("tenants");

  // Tenants Data State
  const [tenants, setTenants] = useState([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Bullion Rates Data State
  const [priceData, setPriceData] = useState([]);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [isUpdatingRate, setIsUpdatingRate] = useState(null); // '22k' | '925' | null
  const [lastRateSync, setLastRateSync] = useState(null);

  // Rate Form Inputs (22K Gold and 925 Silver only)
  const [gold22Input, setGold22Input] = useState("");
  const [silverInput, setSilverInput] = useState("");

  // Special Festival Images State
  const [specialAssets, setSpecialAssets] = useState([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isUploadingAsset, setIsUploadingAsset] = useState(false);
  const [selectedAssetFile, setSelectedAssetFile] = useState(null);
  const [assetFilePreview, setAssetFilePreview] = useState("");

  // Confirmation Modal State
  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    tenant: null,
  });

  // Delete Asset Confirmation Modal State
  const [deleteAssetModal, setDeleteAssetModal] = useState({
    isOpen: false,
    asset: null,
  });

  // Toast Notification State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const triggerToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Load Tenants Data
  const loadTenants = async () => {
    setIsLoadingTenants(true);
    try {
      const res = await adminGetAllTenants();
      if (res && res.status === 1 && Array.isArray(res.data) && res.data.length > 0) {
        setTenants(res.data);
      } else {
        // Local Fallback if DB returns empty
        const localTenants = JSON.parse(
          localStorage.getItem("aadagam_registered_tenants") || "[]"
        );
        const mapped = localTenants.map((t, idx) => ({
          id: t.id || idx + 1,
          shop_name: t.shopName || t.shop_name || "Shop " + (idx + 1),
          owner_name: t.ownerName || t.owner_name || "Owner",
          email: t.email || "owner@example.com",
          city: t.city || "Mumbai",
          subdomain: t.domain || `${t.shopName}.${PLATFORM_DOMAIN}`,
          status: t.status !== undefined ? t.status : 1,
          created_at: t.registeredAt || new Date().toISOString(),
        }));
        setTenants(mapped);
      }
    } catch (err) {
      console.error("Failed to load tenants:", err);
      triggerToast("Failed to fetch tenants list", "error");
    } finally {
      setIsLoadingTenants(false);
    }
  };

  // Load Platform Benchmark Metal Rates
  const loadPlatformRates = async () => {
    setIsLoadingRates(true);
    try {
      // 1. Query default site info to retrieve master rate list
      const siteInfo = await getSiteInfo("default");
      if (siteInfo && Array.isArray(siteInfo.priceData) && siteInfo.priceData.length > 0) {
        setPriceData(siteInfo.priceData);
        setLastRateSync(new Date());
        return;
      }

      // 2. Fallback to admin dashboard stats
      const res = await adminGetDashboardStats();
      if (res && res.status === 1 && Array.isArray(res.priceData) && res.priceData.length > 0) {
        setPriceData(res.priceData);
        setLastRateSync(new Date());
      }
    } catch (err) {
      console.error("Failed to load platform benchmark rates:", err);
    } finally {
      setIsLoadingRates(false);
    }
  };

  // Load Special Marketing Assets
  const loadSpecialAssets = async () => {
    setIsLoadingAssets(true);
    try {
      const res = await adminGetAllBasicAssets(0, 100);
      if (res && res.status === 1 && Array.isArray(res.data)) {
        setSpecialAssets(res.data);
      } else {
        // Local cache fallback
        const local = JSON.parse(localStorage.getItem("aadagam_special_assets") || "[]");
        setSpecialAssets(local);
      }
    } catch (err) {
      console.error("Failed to load special basic assets:", err);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Synchronize all data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      loadTenants();
      loadPlatformRates();
      loadSpecialAssets();
    }
  }, [isAuthenticated]);

  // Handle Super Admin Login (POST /opxXxolN7m6CU/login with type: 'super')
  const handleSuperLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!emailInput.trim() || !passwordInput) {
      setLoginError("Please enter both email and password.");
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await superAdminLogin(emailInput.trim(), passwordInput);
      setIsLoggingIn(false);

      if (res && (res.status === 1 || res.success === 1)) {
        setIsAuthenticated(true);
        triggerToast("Welcome back, Super Admin!");
        loadTenants();
        loadPlatformRates();
        loadSpecialAssets();
      } else {
        setLoginError(res?.message || "Invalid email address or password.");
      }
    } catch (err) {
      setIsLoggingIn(false);
      setLoginError("Failed to connect to authentication server.");
    }
  };

  const handleSuperLogout = () => {
    localStorage.removeItem("aadagam_superadmin_session");
    localStorage.removeItem("aadagam_auth_token");
    setIsAuthenticated(false);
    setEmailInput("");
    setPasswordInput("");
  };

  // Handle Status Toggle (POST /opxXxolN7m6CU/activate_subdomain)
  const handleConfirmToggle = async () => {
    if (!toggleModal.tenant) return;
    const t = toggleModal.tenant;
    const newStatus = t.status === 1 ? 0 : 1;

    setIsLoadingTenants(true);
    try {
      const res = await adminActivateSubdomain(t.id, newStatus);
      setIsLoadingTenants(false);

      if (res && res.status === 1) {
        triggerToast(
          `Showroom ${t.shop_name} set to ${newStatus === 1 ? "Active" : "Inactive"}.`
        );
        // Local state update ONLY on database success
        setTenants((prev) =>
          prev.map((item) =>
            item.id === t.id ? { ...item, status: newStatus } : item
          )
        );
      } else {
        triggerToast(
          res?.message || `Failed to update ${t.shop_name} status in database.`,
          "error"
        );
      }
    } catch (err) {
      console.error("Toggle error:", err);
      setIsLoadingTenants(false);
      triggerToast("Failed to update status in database", "error");
    } finally {
      setToggleModal({ isOpen: false, tenant: null });
    }
  };

  // Handle Update 22K Gold Benchmark Rate (POST /opxXxolN7m6CU/price_update)
  const handleUpdateGoldRate = async (e) => {
    if (e) e.preventDefault();
    const numPrice = parseFloat(gold22Input);
    if (isNaN(numPrice) || numPrice <= 0) {
      triggerToast("Please enter a valid 22K Gold price per gram.", "error");
      return;
    }

    setIsUpdatingRate("22k");
    try {
      const res = await adminUpdatePrice({
        material: "gold",
        purity: "22k",
        price: numPrice,
      });

      if (res && (res.status === 1 || res.success === 1)) {
        triggerToast(`Platform 22K Gold benchmark updated to ₹${numPrice.toLocaleString("en-IN")}/g!`);
        setGold22Input("");

        // Optimistically update local price data so UI updates instantly
        setPriceData((prev) => {
          const list = Array.isArray(prev) ? [...prev] : [];
          const idx = list.findIndex(
            (p) =>
              (p.material || "").toLowerCase() === "gold" &&
              ((p.purity || "").toLowerCase().includes("22") ||
                (p.purity || "").toLowerCase().includes("916"))
          );
          if (idx >= 0) {
            list[idx] = { ...list[idx], price: numPrice };
          } else {
            const anyGoldIdx = list.findIndex(
              (p) => (p.material || "").toLowerCase() === "gold"
            );
            if (anyGoldIdx >= 0) {
              list[anyGoldIdx] = { ...list[anyGoldIdx], price: numPrice };
            } else {
              list.unshift({
                id: Date.now(),
                material: "gold",
                purity: "22K (91.6% Pure)",
                price: numPrice,
              });
            }
          }
          return list;
        });
        setLastRateSync(new Date());

        // Refresh from default site info backend
        await loadPlatformRates();
      } else {
        triggerToast(res?.message || "Failed to update 22K Gold price.", "error");
      }
    } catch (err) {
      console.error("Error updating 22K Gold rate:", err);
      triggerToast("Failed to update 22K Gold price.", "error");
    } finally {
      setIsUpdatingRate(null);
    }
  };

  // Handle Update 925 Silver Benchmark Rate (POST /opxXxolN7m6CU/price_update)
  const handleUpdateSilverRate = async (e) => {
    if (e) e.preventDefault();
    const numPrice = parseFloat(silverInput);
    if (isNaN(numPrice) || numPrice <= 0) {
      triggerToast("Please enter a valid 925 Silver price per gram.", "error");
      return;
    }

    setIsUpdatingRate("925");
    try {
      const res = await adminUpdatePrice({
        material: "silver",
        purity: "925",
        price: numPrice,
      });

      if (res && (res.status === 1 || res.success === 1)) {
        triggerToast(`Platform Pure 925 Silver benchmark updated to ₹${numPrice.toLocaleString("en-IN")}/g!`);
        setSilverInput("");

        // Optimistically update local price data so UI updates instantly
        setPriceData((prev) => {
          const list = Array.isArray(prev) ? [...prev] : [];
          const idx = list.findIndex(
            (p) => (p.material || "").toLowerCase() === "silver"
          );
          if (idx >= 0) {
            list[idx] = { ...list[idx], price: numPrice };
          } else {
            list.push({
              id: Date.now(),
              material: "silver",
              purity: "Pure 925 Fine Silver",
              price: numPrice,
            });
          }
          return list;
        });
        setLastRateSync(new Date());

        // Refresh from default site info backend
        await loadPlatformRates();
      } else {
        triggerToast(res?.message || "Failed to update 925 Silver price.", "error");
      }
    } catch (err) {
      console.error("Error updating 925 Silver rate:", err);
      triggerToast("Failed to update 925 Silver price.", "error");
    } finally {
      setIsUpdatingRate(null);
    }
  };

  // Handle File Upload & Add Festival Image (POST /opxXxolN7m6CU/upload -> POST /opxXxolN7m6CU/add_basic_asset)
  const handleAddSpecialAsset = async (e) => {
    e.preventDefault();

    if (!selectedAssetFile) {
      triggerToast("Please select a festival image file to upload.", "error");
      return;
    }

    setIsUploadingAsset(true);

    try {
      // 1. Upload to S3 cloud storage
      const uploadRes = await adminUploadImages([selectedAssetFile]);
      let targetUrl = "";
      if (uploadRes && (uploadRes.success || uploadRes.status === 1)) {
        if (Array.isArray(uploadRes.images) && uploadRes.images.length > 0) {
          const imgItem = uploadRes.images[0];
          targetUrl = typeof imgItem === "string" ? imgItem : (imgItem.url || imgItem.fileName || "");
        } else if (uploadRes.url) {
          targetUrl = uploadRes.url;
        }
      }

      if (!targetUrl) {
        triggerToast(uploadRes?.message || "Failed to upload image to cloud storage.", "error");
        setIsUploadingAsset(false);
        return;
      }

      // 2. Add to am_basic_assets via POST /opxXxolN7m6CU/add_basic_asset with type: "special_image"
      const addRes = await adminAddBasicAsset({
        type: "special_image",
        url: targetUrl,
      });

      if (addRes && (addRes.status === 1 || addRes.success === 1)) {
        triggerToast("Festival image uploaded and added successfully!");
        setSelectedAssetFile(null);
        setAssetFilePreview("");
        const fileInput = document.getElementById("superadmin-festival-file");
        if (fileInput) fileInput.value = "";
        loadSpecialAssets();
      } else {
        triggerToast(addRes?.message || "Failed to save festival image.", "error");
      }
    } catch (err) {
      console.error("Asset upload exception:", err);
      triggerToast("Failed to upload festival image.", "error");
    } finally {
      setIsUploadingAsset(false);
    }
  };

  // Handle Toggle Special Asset Status (Active vs Disabled)
  const handleToggleAssetStatus = async (asset) => {
    const newStatus = asset.status === 1 ? 0 : 1;
    try {
      const res = await adminUpdateBasicAsset({
        id: asset.id,
        type: asset.type,
        url: asset.url,
        status: newStatus,
      });

      if (res && res.status === 1) {
        triggerToast(`Asset #${asset.id} set to ${newStatus === 1 ? "Active" : "Disabled"}.`);
        setSpecialAssets((prev) =>
          prev.map((item) => (item.id === asset.id ? { ...item, status: newStatus } : item))
        );
      } else {
        triggerToast(res?.message || "Failed to update asset status.", "error");
      }
    } catch (err) {
      console.error("Toggle asset error:", err);
      triggerToast("Failed to update asset status.", "error");
    }
  };

  // Handle Soft-Delete Special Asset
  const handleConfirmDeleteAsset = async () => {
    if (!deleteAssetModal.asset) return;
    const asset = deleteAssetModal.asset;
    try {
      const res = await adminUpdateBasicAsset({
        id: asset.id,
        type: asset.type,
        url: asset.url,
        status: 0,
      });

      if (res && res.status === 1) {
        triggerToast(`Special asset #${asset.id} removed successfully.`);
        setSpecialAssets((prev) => prev.filter((item) => item.id !== asset.id));
      } else {
        triggerToast(res?.message || "Failed to remove asset.", "error");
      }
    } catch (err) {
      console.error("Delete asset error:", err);
      triggerToast("Failed to remove asset.", "error");
    } finally {
      setDeleteAssetModal({ isOpen: false, asset: null });
    }
  };

  // Price selectors for 22K Gold and 925 Silver
  const gold22Item = priceData.find(
    (p) =>
      (p.material || "").toLowerCase() === "gold" &&
      ((p.purity || "").toLowerCase().includes("22") || (p.purity || "").toLowerCase().includes("916"))
  ) || priceData.find((p) => (p.material || "").toLowerCase() === "gold");

  const silverItem = priceData.find(
    (p) =>
      (p.material || "").toLowerCase() === "silver" &&
      ((p.purity || "").toLowerCase().includes("925") ||
        (p.purity || "").toLowerCase().includes("999") ||
        (p.purity || "").toLowerCase().includes("silver"))
  ) || priceData.find((p) => (p.material || "").toLowerCase() === "silver");

  const gold22Price = gold22Item ? Number(gold22Item.price) : 0;
  const silverPrice = silverItem ? Number(silverItem.price) : 0;

  // Filtered Tenants
  const filteredTenants = tenants.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      (t.shop_name || "").toLowerCase().includes(q) ||
      (t.owner_name || "").toLowerCase().includes(q) ||
      (t.email || "").toLowerCase().includes(q) ||
      (t.subdomain || "").toLowerCase().includes(q) ||
      (t.city || "").toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && t.status === 1) ||
      (statusFilter === "inactive" && t.status === 0);

    return matchSearch && matchStatus;
  });

  // Filtered Special Assets
  const filteredAssets = specialAssets.filter((a) => {
    if (assetMediaFilter === "image") {
      return a.type === "special_image" || a.type === "image";
    }
    if (assetMediaFilter === "video") {
      return a.type === "special_video" || a.type === "video";
    }
    return true;
  });

  // Render Super Admin Login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white text-stone-900 flex items-center justify-center p-4 font-sans selection:bg-[#783bf0] selection:text-white relative">
        {/* Back to Home Button */}
        <Link
          to="/"
          className="absolute top-6 left-6 inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#783bf0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>

        <div className="max-w-md w-full bg-white border border-stone-200/90 rounded-[28px] p-6 sm:p-8 shadow-2xl shadow-stone-900/5 space-y-5">
          <div className="text-center space-y-2 flex flex-col items-center">
            <AadagamLogo variant="stacked" size="md" iconClassName="w-16 h-16 sm:w-20 sm:h-20" theme="light" className="mb-1" />
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#783bf0]/10 text-[#783bf0] border border-[#783bf0]/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#783bf0]" />
                <span>Super Admin Access</span>
              </div>
              <h1 className="font-serif text-2xl font-black text-black tracking-wide">
                Super Admin Sign In
              </h1>
              <p className="text-stone-500 text-xs font-normal mt-1">
                Enter master credentials to manage tenant showrooms, platform rates, and festival marketing media.
              </p>
            </div>
          </div>

          <form onSubmit={handleSuperLogin} className="space-y-4 pt-1">
            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Email Address */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                Super Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="superadmin@aadagam.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-stone-50/60 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-[#783bf0] focus:ring-2 focus:ring-[#783bf0]/20 focus:bg-white transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Master Password */}
            <div className="space-y-1.5 text-left">
              <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter master password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-stone-50/60 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:border-[#783bf0] focus:ring-2 focus:ring-[#783bf0]/20 focus:bg-white transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 focus:outline-none cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-2 bg-[#783bf0] hover:bg-[#6828e8] text-white font-bold py-3.5 px-6 rounded-2xl text-xs tracking-wider uppercase transition-all shadow-md shadow-[#783bf0]/25 hover:shadow-lg hover:shadow-[#783bf0]/35 disabled:opacity-60 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Access Super Admin Portal</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-stone-100">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-stone-500 hover:text-[#783bf0] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Platform Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-[#783bf0] selection:text-white">
      {/* Top Header Navbar */}
      <header className="bg-black text-white border-b border-stone-850 py-3 px-4 sm:px-6 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-4">
            <AadagamLogo variant="horizontal" size="sm" iconClassName="w-8 h-8 sm:w-10 sm:h-10" theme="dark" />
            <span className="hidden sm:inline-block text-stone-700">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] sm:text-[11px] text-[#783bf0] font-bold tracking-widest uppercase truncate max-w-[120px] sm:max-w-none">
                Super Admin
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#783bf0]/20 text-[#783bf0] border border-[#783bf0]/40 text-[8px] sm:text-[9px] font-bold uppercase">
                Master
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Navigation Tabs (Hidden on mobile, shown in sub-nav below on mobile) */}
            <div className="hidden md:flex bg-stone-900/90 border border-stone-800 rounded-xl p-1 gap-1 text-xs">
              <button
                onClick={() => setActiveTab("tenants")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  activeTab === "tenants"
                    ? "bg-[#783bf0] text-white shadow-xs"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Showrooms ({tenants.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("rates")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  activeTab === "rates"
                    ? "bg-[#D4AF37] text-stone-950 shadow-xs"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Bullion Rates</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </button>

              <button
                onClick={() => setActiveTab("media")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                  activeTab === "media"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-xs"
                    : "text-stone-400 hover:text-white"
                }`}
              >
                <PartyPopper className="w-3.5 h-3.5" />
                <span>Festival Media</span>
                {specialAssets.length > 0 && (
                  <span className="px-1.5 py-0.2 bg-black/40 text-stone-200 text-[10px] rounded-full font-mono">
                    {specialAssets.length}
                  </span>
                )}
              </button>
            </div>

            {/* Sync Refresh Button */}
            <button
              onClick={() => {
                loadTenants();
                loadPlatformRates();
                loadSpecialAssets();
                triggerToast("All data synchronized");
              }}
              disabled={isLoadingTenants || isLoadingRates || isLoadingAssets}
              className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-[#783bf0] transition-colors cursor-pointer"
              title="Refresh All Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoadingTenants || isLoadingRates || isLoadingAssets ? "animate-spin text-[#783bf0]" : ""}`} />
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleSuperLogout}
              className="inline-flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tab Bar (< md screens) */}
        <div className="md:hidden mt-2.5 pt-2 border-t border-stone-850 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("tenants")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "tenants"
                ? "bg-[#783bf0] text-white shadow-xs"
                : "bg-stone-900 text-stone-400 hover:text-white"
            }`}
          >
            <Users className="w-3 h-3" />
            <span>Showrooms ({tenants.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("rates")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "rates"
                ? "bg-[#D4AF37] text-stone-950 shadow-xs"
                : "bg-stone-900 text-stone-400 hover:text-white"
            }`}
          >
            <Coins className="w-3 h-3" />
            <span>Rates</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold text-[11px] inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "media"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-xs"
                : "bg-stone-900 text-stone-400 hover:text-white"
            }`}
          >
            <PartyPopper className="w-3 h-3" />
            <span>Festival Media</span>
            {specialAssets.length > 0 && (
              <span className="px-1 py-0.2 bg-black/40 text-stone-200 text-[9px] rounded-full font-mono">
                {specialAssets.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full flex-1 space-y-5 sm:space-y-6">
        {/* Metric Cards Summary Grid (2x2 on Mobile, 4x1 on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* 1. Total Registered */}
          <div
            onClick={() => setActiveTab("tenants")}
            className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 cursor-pointer hover:border-[#783bf0]/60 transition-all group"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#783bf0]/10 text-[#783bf0] flex items-center justify-center shrink-0">
              <Users className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Total Showrooms
              </span>
              <span className="font-serif text-lg sm:text-2xl font-black text-black group-hover:text-[#783bf0] transition-colors">
                {tenants.length}
              </span>
            </div>
          </div>

          {/* 2. Active Showrooms */}
          <div
            onClick={() => setActiveTab("tenants")}
            className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 cursor-pointer hover:border-emerald-300 transition-all group"
          >
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Active Stores
              </span>
              <span className="font-serif text-lg sm:text-2xl font-bold text-emerald-700">
                {tenants.filter((t) => t.status === 1).length}
              </span>
            </div>
          </div>

          {/* 3. Master 22K Gold Benchmark */}
          <div
            onClick={() => setActiveTab("rates")}
            className="bg-white border border-amber-200/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 cursor-pointer hover:border-amber-400 transition-all group"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Coins className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-[#D4AF37]" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    22K Gold
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="font-serif text-lg sm:text-2xl font-black text-stone-900 group-hover:text-[#B8860B] transition-colors">
                  {gold22Price > 0 ? `₹${gold22Price.toLocaleString("en-IN")}` : "₹7,200"}
                  <span className="text-[10px] sm:text-xs font-normal text-stone-400 font-sans ml-0.5">/g</span>
                </span>
              </div>
            </div>
          </div>

          {/* 4. Special Festival Media Assets */}
          <div
            onClick={() => setActiveTab("media")}
            className="bg-white border border-yellow-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 cursor-pointer hover:border-yellow-400 transition-all group"
          >
            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-yellow-50 text-amber-700 flex items-center justify-center shrink-0">
                <PartyPopper className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-amber-600" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] sm:text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Festival Assets
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="font-serif text-lg sm:text-2xl font-black text-stone-900 group-hover:text-amber-600 transition-colors">
                  {specialAssets.length}
                  <span className="text-[10px] sm:text-xs font-normal text-stone-400 ml-0.5">files</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================================
         * TAB 1: SHOWROOMS DIRECTORY & USER CONTROL
         * =================================================================== */}
        {activeTab === "tenants" && (
          <div className="bg-white border border-stone-200/90 rounded-3xl p-4 sm:p-8 shadow-sm space-y-5 sm:space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-4 sm:pb-5">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl font-black text-black">
                  Registered Showrooms Control Directory
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Manage user activation states for all jewellery business subdomains across the platform.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
                {/* Filter Tabs */}
                <div className="bg-stone-100/70 border border-stone-200 rounded-xl p-1 flex gap-1 text-xs overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                      statusFilter === "all" ? "bg-[#783bf0] text-white shadow-xs" : "text-stone-600 hover:text-black"
                    }`}
                  >
                    All ({tenants.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("active")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                      statusFilter === "active" ? "bg-emerald-700 text-white shadow-xs" : "text-stone-600 hover:text-black"
                    }`}
                  >
                    Active ({tenants.filter((t) => t.status === 1).length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("inactive")}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer shrink-0 ${
                      statusFilter === "inactive" ? "bg-rose-700 text-white shadow-xs" : "text-stone-600 hover:text-black"
                    }`}
                  >
                    Inactive ({tenants.filter((t) => t.status === 0).length})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search shop, email, city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-stone-50/60 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#783bf0] focus:ring-2 focus:ring-[#783bf0]/20 focus:bg-white transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Tenants Data Display */}
            {isLoadingTenants && tenants.length === 0 ? (
              <div className="py-16 text-center text-stone-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#783bf0]" />
                <p className="text-xs">Loading registered tenants...</p>
              </div>
            ) : filteredTenants.length === 0 ? (
              <div className="py-12 text-center text-stone-400 italic text-xs">
                No matching registered showrooms found.
              </div>
            ) : (
              <>
                {/* 1. Mobile Cards View (< sm screens) */}
                <div className="sm:hidden space-y-3">
                  {filteredTenants.map((t) => (
                    <div
                      key={t.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        t.status === 0
                          ? "bg-rose-50/40 border-rose-200"
                          : "bg-white border-stone-200 shadow-xs hover:border-[#783bf0]/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Store className="w-4 h-4 text-[#783bf0] shrink-0" />
                            <h3 className="font-bold text-sm text-stone-900 line-clamp-1">{t.shop_name}</h3>
                          </div>
                          <a
                            href={getStorefrontUrl(t.subdomain)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#783bf0] font-mono text-xs font-bold inline-flex items-center gap-1"
                          >
                            <span>{t.subdomain}</span>
                            <ExternalLink className="w-3 h-3 text-[#783bf0]" />
                          </a>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                          #{t.id}
                        </span>
                      </div>

                      <div className="py-2.5 space-y-1.5 text-xs text-stone-600">
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400 flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            <span>Owner:</span>
                          </span>
                          <span className="font-medium text-stone-800">{t.owner_name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            <span>Email:</span>
                          </span>
                          <span className="font-mono text-[11px] text-stone-700 truncate max-w-[170px]">{t.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>City:</span>
                          </span>
                          <span className="font-medium text-stone-800">{t.city}</span>
                        </div>
                      </div>

                      <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-stone-400 font-mono">
                          {t.created_at
                            ? new Date(t.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "Registered"}
                        </span>

                        <button
                          onClick={() => setToggleModal({ isOpen: true, tenant: t })}
                          className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold uppercase transition-all shadow-xs cursor-pointer ${
                            t.status === 1
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300 active:scale-95"
                              : "bg-rose-100 text-rose-800 border border-rose-300 active:scale-95"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{t.status === 1 ? "Active" : "Inactive"}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Desktop Table View (>= sm screens) */}
                <div className="hidden sm:block overflow-x-auto rounded-2xl border border-stone-200">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-black text-stone-200 text-[10px] font-bold uppercase tracking-wider">
                        <th className="py-3.5 px-4">ID</th>
                        <th className="py-3.5 px-4">Jewellery Shop Name</th>
                        <th className="py-3.5 px-4">Subdomain URL</th>
                        <th className="py-3.5 px-4">Owner / Contact</th>
                        <th className="py-3.5 px-4">Email Address</th>
                        <th className="py-3.5 px-4">Showroom City</th>
                        <th className="py-3.5 px-4">Registered On</th>
                        <th className="py-3.5 px-4 text-center">User Control Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-xs">
                      {filteredTenants.map((t) => (
                        <tr
                          key={t.id}
                          className={`hover:bg-purple-50/30 transition-colors ${
                            t.status === 0 ? "bg-rose-50/30" : ""
                          }`}
                        >
                          <td className="py-4 px-4 font-mono font-bold text-stone-400">
                            #{t.id}
                          </td>

                          <td className="py-4 px-4 font-bold text-black">
                            <div className="flex items-center gap-2">
                              <Store className="w-4 h-4 text-[#783bf0] shrink-0" />
                              <span>{t.shop_name}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <a
                              href={getStorefrontUrl(t.subdomain)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#783bf0] hover:underline font-mono font-bold inline-flex items-center gap-1"
                            >
                              <span>{t.subdomain}</span>
                              <ExternalLink className="w-3 h-3 text-[#783bf0]" />
                            </a>
                          </td>

                          <td className="py-4 px-4 text-stone-700">
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{t.owner_name}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-stone-600 font-mono text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{t.email}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-stone-700">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                              <span>{t.city}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-stone-500 font-mono text-[11px]">
                            {t.created_at
                              ? new Date(t.created_at).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "N/A"}
                          </td>

                          {/* Sole Control: Active / Inactive Status Toggle */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => setToggleModal({ isOpen: true, tenant: t })}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all shadow-xs cursor-pointer ${
                                t.status === 1
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                  : "bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300"
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              <span>{t.status === 1 ? "Active" : "Inactive"}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ===================================================================
         * TAB 2: PLATFORM MASTER BULLION RATES MANAGER (22K Gold & 925 Silver)
         * =================================================================== */}
        {activeTab === "rates" && (
          <div className="space-y-6 animate-fade-in">
            {/* Rates Header Banner */}
            <div className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  Daily Bullion Rates Manager
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Update platform benchmark rates for 22K Standard Gold and 925 Fine Silver. These rates reflect on all subdomain storefronts.
                </p>
              </div>
              <button
                onClick={loadPlatformRates}
                disabled={isLoadingRates}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                title="Refresh price data"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingRates ? "animate-spin text-[#783bf0]" : ""}`} />
                <span>Refresh Rates</span>
              </button>
            </div>

            {/* 2 Dedicated Metal Rate Cards (22K Gold and 925 Silver) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. 22K Standard Gold Card */}
              <div className="bg-white border-2 border-[#D4AF37]/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                        <Coins className="w-5 h-5 text-[#B8860B]" />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-base text-stone-900 block">
                          22 Karat Standard Gold
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#B8860B] tracking-wider block">
                          Hallmark Bullion (BIS 916 / 22K)
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="p-4 bg-[#FAF9F5] border border-stone-200 rounded-2xl">
                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                      Current Live Benchmark Rate (Per Gram)
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-serif text-3xl font-bold text-stone-900">
                        {gold22Price > 0 ? `₹${gold22Price.toLocaleString("en-IN")}` : "₹7,200"}
                      </span>
                      <span className="text-xs font-mono text-stone-500">
                        8g (1 Pavan): <strong className="text-stone-800 font-bold">₹{((gold22Price || 7200) * 8).toLocaleString("en-IN")}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Update Form */}
                <form
                  onSubmit={handleUpdateGoldRate}
                  className="space-y-3 pt-2 border-t border-stone-100"
                >
                  <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                    Set New 22K Gold Price (₹ per gram)
                  </label>
                  <div className="flex gap-2.5">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 font-serif font-bold text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder={gold22Price > 0 ? String(gold22Price) : "e.g. 7200"}
                        value={gold22Input}
                        onChange={(e) => setGold22Input(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] font-mono font-semibold"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdatingRate === "22k" || !gold22Input}
                      className="inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 min-h-[44px] shrink-0 cursor-pointer"
                    >
                      {isUpdatingRate === "22k" ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                      )}
                      <span>Update Gold</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. 925 Fine Silver Card */}
              <div className="bg-white border-2 border-slate-300/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-5 relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-300 text-slate-700 flex items-center justify-center shrink-0">
                        <Scale className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-base text-stone-900 block">
                          Pure 925 Fine Silver
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                          Sterling Silver Bullion (92.5% / 925)
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </span>
                  </div>

                  <div className="p-4 bg-[#FAF9F5] border border-stone-200 rounded-2xl">
                    <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider block">
                      Current Live Benchmark Rate (Per Gram)
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="font-serif text-3xl font-bold text-stone-900">
                        {silverPrice > 0 ? `₹${silverPrice.toLocaleString("en-IN")}` : "₹98"}
                      </span>
                      <span className="text-xs font-mono text-stone-500">
                        1 Kg: <strong className="text-stone-800 font-bold">₹{((silverPrice || 98) * 1000).toLocaleString("en-IN")}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Update Form */}
                <form
                  onSubmit={handleUpdateSilverRate}
                  className="space-y-3 pt-2 border-t border-stone-100"
                >
                  <label className="block text-[10px] font-bold text-stone-600 uppercase tracking-wider">
                    Set New 925 Silver Price (₹ per gram)
                  </label>
                  <div className="flex gap-2.5">
                    <div className="relative flex-1">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400 font-serif font-bold text-sm">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder={silverPrice > 0 ? String(silverPrice) : "e.g. 98"}
                        value={silverInput}
                        onChange={(e) => setSilverInput(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-slate-500 font-mono font-semibold"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdatingRate === "925" || !silverInput}
                      className="inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 min-h-[44px] shrink-0 cursor-pointer"
                    >
                      {isUpdatingRate === "925" ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Update Silver</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
         * TAB 3: FESTIVAL IMAGES UPLOAD SECTION
         * =================================================================== */}
        {activeTab === "media" && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Banner */}
            <div className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-7 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                  Festival Images Upload
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Upload festival poster images. Subdomain websites display these in the Festival Posters section branded with their logo for download.
                </p>
              </div>
              <button
                onClick={loadSpecialAssets}
                disabled={isLoadingAssets}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingAssets ? "animate-spin text-[#783bf0]" : ""}`} />
                <span>Refresh Images</span>
              </button>
            </div>

            {/* Upload Festival Image Form Card */}
            <div className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 border-b border-stone-100 pb-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-stone-900">
                    Upload Festival Image
                  </h4>
                  <p className="text-xs text-stone-500">
                    Select a festival poster image (PNG, JPG, WEBP) to upload.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddSpecialAsset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-stone-700 uppercase tracking-wider">
                    Select Image File
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="superadmin-festival-file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedAssetFile(file);
                        setAssetFilePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="w-full text-xs text-stone-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1C1917] file:text-white hover:file:bg-stone-800 file:cursor-pointer border border-stone-200 rounded-xl bg-[#FAF9F5] p-2"
                  />
                </div>

                {/* Selected Image Preview */}
                {assetFilePreview && (
                  <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-stone-200 flex items-center gap-3">
                    <img
                      src={assetFilePreview}
                      alt="Selected Preview"
                      className="w-16 h-16 object-cover rounded-xl border border-stone-300 shrink-0"
                    />
                    <div className="text-xs truncate">
                      <span className="font-bold text-stone-900 block truncate">{selectedAssetFile?.name}</span>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {(selectedAssetFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isUploadingAsset || !selectedAssetFile}
                  className="inline-flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
                >
                  {isUploadingAsset ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                      <span>Uploading Image...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 text-[#D4AF37]" />
                      <span>Upload Festival Image</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Uploaded Festival Images Gallery */}
            <div className="bg-white border border-stone-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-sm space-y-5">
              <div className="border-b border-stone-100 pb-3.5">
                <h4 className="font-serif text-base font-bold text-stone-900">
                  Uploaded Festival Images
                </h4>
                <p className="text-xs text-stone-500">
                  {specialAssets.length} image{specialAssets.length === 1 ? "" : "s"} uploaded.
                </p>
              </div>

              {isLoadingAssets && specialAssets.length === 0 ? (
                <div className="py-12 text-center text-stone-400 space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D4AF37]" />
                  <p className="text-xs">Loading festival images...</p>
                </div>
              ) : specialAssets.length === 0 ? (
                <div className="py-12 text-center text-stone-400 italic text-xs">
                  No festival images uploaded yet. Upload your first festival image above!
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {specialAssets.map((asset) => {
                    const fullUrl = resolveFullImageUrl(asset.url);
                    return (
                      <div
                        key={asset.id}
                        className="bg-[#FAF9F5] border border-stone-200 rounded-2xl overflow-hidden flex flex-col justify-between group hover:shadow-md transition-shadow"
                      >
                        <div className="relative aspect-[9/12] bg-stone-900 overflow-hidden">
                          <img
                            src={fullUrl}
                            alt={`Festival image ${asset.id}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80";
                            }}
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/70 text-white backdrop-blur-xs">
                            #{asset.id}
                          </span>
                        </div>

                        <div className="p-3 flex items-center justify-between gap-2 bg-white">
                          <span className="text-[10px] text-stone-500 font-mono truncate">
                            {asset.created_at
                              ? new Date(asset.created_at).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                })
                              : "Uploaded"}
                          </span>
                          <button
                            onClick={() => setDeleteAssetModal({ isOpen: true, asset })}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer shrink-0"
                            title="Delete Image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modal for Active / Inactive Tenant Toggle */}
      {toggleModal.isOpen && toggleModal.tenant && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setToggleModal({ isOpen: false, tenant: null })}
        >
          <div
            className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  toggleModal.tenant.status === 1
                    ? "bg-rose-100 text-rose-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-black text-black">
                  {toggleModal.tenant.status === 1
                    ? "Deactivate User Account?"
                    : "Activate User Account?"}
                </h3>
                <p className="text-xs text-stone-500 font-normal">
                  {toggleModal.tenant.status === 1
                    ? "Setting this registered user to Inactive will suspend their website access."
                    : "Setting this user to Active will restore full website access."}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 sm:p-4 text-xs text-stone-700 space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Target Showroom:
              </span>
              <p className="font-bold text-black">
                {toggleModal.tenant.shop_name} ({toggleModal.tenant.subdomain})
              </p>
              <p className="text-[11px] text-stone-500">
                Owner: {toggleModal.tenant.owner_name} ({toggleModal.tenant.email})
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={() => setToggleModal({ isOpen: false, tenant: null })}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggle}
                disabled={isLoadingTenants}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md disabled:opacity-50 cursor-pointer ${
                  toggleModal.tenant.status === 1
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                }`}
              >
                {isLoadingTenants ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Power className="w-4 h-4 text-white" />
                )}
                <span>
                  {toggleModal.tenant.status === 1
                    ? "Confirm Inactive"
                    : "Confirm Active"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Asset Confirmation Modal */}
      {deleteAssetModal.isOpen && deleteAssetModal.asset && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setDeleteAssetModal({ isOpen: false, asset: null })}
        >
          <div
            className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 sm:space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  Remove Special Asset #{deleteAssetModal.asset.id}?
                </h3>
                <p className="text-xs text-stone-500">
                  This creative will be disabled and removed from subdomain storefront festival poster downloads.
                </p>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-xs font-mono break-all text-stone-700">
              {deleteAssetModal.asset.url}
            </div>

            <div className="flex items-center justify-end gap-2.5 sm:gap-3">
              <button
                onClick={() => setDeleteAssetModal({ isOpen: false, asset: null })}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteAsset}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-semibold animate-fade-in max-w-[calc(100%-2rem)] ${
            toastType === "error"
              ? "bg-rose-900 text-white border-rose-700"
              : "bg-black text-white border-[#783bf0]/60"
          }`}
        >
          {toastType === "error" ? (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-[#783bf0] shrink-0" />
          )}
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
