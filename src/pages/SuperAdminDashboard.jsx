import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminGetAllTenants, adminToggleTenantStatus } from "../services/api";
import {
  ShieldCheck,
  Store,
  User,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  Power,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Gem,
  Lock,
  ArrowLeft,
  Users
} from "lucide-react";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Super Admin Portal | Aadagam SaaS Platform";
  }, []);

  // Auth State (Super Admin Secret Access)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("aadagam_superadmin_session") === "active";
  });
  const [superPin, setSuperPin] = useState("");
  const [pinError, setPinError] = useState("");

  // Tenants Data State
  const [tenants, setTenants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Confirmation Modal State
  const [toggleModal, setToggleModal] = useState({
    isOpen: false,
    tenant: null,
  });

  // Toast Notification State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const triggerToast = (msg, type = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Load Tenants Data
  const loadTenants = async () => {
    setIsLoading(true);
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
          subdomain: t.domain || `${t.shopName}.aadagam.com`,
          status: t.status !== undefined ? t.status : 1,
          created_at: t.registeredAt || new Date().toISOString(),
        }));
        setTenants(mapped);
      }
    } catch (err) {
      console.error("Failed to load tenants:", err);
      triggerToast("Failed to fetch tenants list", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTenants();
    }
  }, [isAuthenticated]);

  // Handle Super Admin Login
  const handleSuperLogin = (e) => {
    e.preventDefault();
    if (superPin.trim() === "aadagam2026" || superPin.trim() === "admin123") {
      localStorage.setItem("aadagam_superadmin_session", "active");
      setIsAuthenticated(true);
      setPinError("");
    } else {
      setPinError("Invalid Super Admin Pin code. Try again.");
    }
  };

  const handleSuperLogout = () => {
    localStorage.removeItem("aadagam_superadmin_session");
    setIsAuthenticated(false);
  };

  // Handle Status Toggle
  const handleConfirmToggle = async () => {
    if (!toggleModal.tenant) return;
    const t = toggleModal.tenant;
    const newStatus = t.status === 1 ? 0 : 1;

    setIsLoading(true);
    try {
      const res = await adminToggleTenantStatus(t.id, newStatus);
      setIsLoading(false);

      if (res && res.status === 1) {
        triggerToast(
          `Tenant ${t.shop_name} set to ${newStatus === 1 ? "Active" : "Inactive"}.`
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
      setIsLoading(false);
      triggerToast("Failed to update status in database", "error");
    } finally {
      setToggleModal({ isOpen: false, tenant: null });
    }
  };

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

  // Render Super Admin Login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex items-center justify-center p-4 font-sans selection:bg-[#D4AF37] selection:text-stone-950">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-full bg-stone-900 border-2 border-[#D4AF37] flex items-center justify-center mx-auto shadow-md">
              <ShieldCheck className="w-7 h-7 text-[#D4AF37]" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 tracking-wide">
              SUPER ADMIN PORTAL
            </h1>
            <p className="text-stone-500 text-xs font-light">
              Enter Super Admin master key to manage all registered jewellery showroom accounts.
            </p>
          </div>

          <form onSubmit={handleSuperLogin} className="space-y-4">
            {pinError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{pinError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Master Security Key / Pin
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Enter pin (e.g. aadagam2026)"
                  value={superPin}
                  onChange={(e) => setSuperPin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F5] border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                  required
                />
              </div>
              <span className="text-[10px] text-stone-400 mt-1 block">Default Master Pin: <code>aadagam2026</code></span>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-[#1C1917] hover:bg-stone-900 text-white font-bold py-3.5 px-6 rounded-xl text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Access Super Admin Portal</span>
            </button>
          </form>

          <div className="pt-2 text-center border-t border-stone-100">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-[#B8860B]"
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
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col font-sans selection:bg-[#D4AF37] selection:text-stone-950">
      {/* Top Header Navbar */}
      <header className="bg-stone-950 text-white border-b border-stone-850 py-3.5 px-6 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-serif text-lg sm:text-xl font-bold tracking-wide block">
                SUPER ADMIN PORTAL
              </span>
              <span className="text-[9px] text-[#B8860B] font-bold tracking-widest uppercase block -mt-1">
                Platform Account Status Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadTenants}
              disabled={isLoading}
              className="p-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition-colors"
              title="Refresh Tenants"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#D4AF37]" : ""}`} />
            </button>

            <button
              onClick={handleSuperLogout}
              className="inline-flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wider transition-all cursor-pointer"
            >
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {/* Metric Cards Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-stone-900 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Total Registered Shops
              </span>
              <span className="font-serif text-2xl font-bold text-stone-900">
                {tenants.length}
              </span>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Active Storefronts
              </span>
              <span className="font-serif text-2xl font-bold text-emerald-700">
                {tenants.filter((t) => t.status === 1).length}
              </span>
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Power className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Inactive / Suspended Shops
              </span>
              <span className="font-serif text-2xl font-bold text-rose-700">
                {tenants.filter((t) => t.status === 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Directory Controls & Table Card */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <h2 className="font-serif text-2xl font-bold text-stone-900">
                Registered Showrooms Control Directory
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Manage user activation states for all jewellery business subdomains across the platform.
              </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Filter Tabs */}
              <div className="bg-[#FAF9F5] border border-stone-200 rounded-xl p-1 flex gap-1 text-xs">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    statusFilter === "all" ? "bg-stone-900 text-white" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  All ({tenants.length})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    statusFilter === "active" ? "bg-emerald-700 text-white" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Active ({tenants.filter((t) => t.status === 1).length})
                </button>
                <button
                  onClick={() => setStatusFilter("inactive")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    statusFilter === "inactive" ? "bg-rose-700 text-white" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  Inactive ({tenants.filter((t) => t.status === 0).length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="Search shop, email, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-[#FAF9F5] border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#D4AF37] w-48 sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Tenants Data Table */}
          {isLoading && tenants.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#D4AF37]" />
              <p className="text-xs">Loading registered tenants...</p>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="py-12 text-center text-stone-400 italic text-xs">
              No matching registered showrooms found.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-stone-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-900 text-stone-300 text-[10px] font-bold uppercase tracking-wider">
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
                      className={`hover:bg-[#FAF9F5] transition-colors ${
                        t.status === 0 ? "bg-rose-50/30" : ""
                      }`}
                    >
                      <td className="py-4 px-4 font-mono font-bold text-stone-400">
                        #{t.id}
                      </td>

                      <td className="py-4 px-4 font-bold text-stone-900">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#B8860B] shrink-0" />
                          <span>{t.shop_name}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <a
                          href={`http://${t.subdomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#B8860B] hover:underline font-mono font-semibold inline-flex items-center gap-1"
                        >
                          <span>{t.subdomain}</span>
                          <ExternalLink className="w-3 h-3 text-[#B8860B]" />
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
                              year: "numeric"
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
          )}
        </div>
      </main>

      {/* Confirmation Modal for Active / Inactive Toggle */}
      {toggleModal.isOpen && toggleModal.tenant && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setToggleModal({ isOpen: false, tenant: null })}
        >
          <div
            className="bg-white border border-stone-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  toggleModal.tenant.status === 1
                    ? "bg-rose-100 text-rose-600"
                    : "bg-emerald-100 text-emerald-600"
                }`}
              >
                <Power className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {toggleModal.tenant.status === 1
                    ? "Deactivate User Account?"
                    : "Activate User Account?"}
                </h3>
                <p className="text-xs text-stone-500 font-light">
                  {toggleModal.tenant.status === 1
                    ? "Setting this registered user to Inactive will suspend their website access."
                    : "Setting this user to Active will restore full website access."}
                </p>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 text-xs text-stone-700 space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Target Showroom:
              </span>
              <p className="font-semibold text-stone-900">
                {toggleModal.tenant.shop_name} ({toggleModal.tenant.subdomain})
              </p>
              <p className="text-[11px] text-stone-500">
                Owner: {toggleModal.tenant.owner_name} ({toggleModal.tenant.email})
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={() => setToggleModal({ isOpen: false, tenant: null })}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmToggle}
                disabled={isLoading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md disabled:opacity-50 cursor-pointer ${
                  toggleModal.tenant.status === 1
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                }`}
              >
                {isLoading ? (
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

      {/* Floating Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border flex items-center gap-2 text-xs font-semibold animate-fade-in ${
            toastType === "error"
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
