import axios from "axios";

// Determine the backend API URL.
function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

  // If in local development and envUrl is provided (e.g. VITE_API_URL=http://localhost:5000 in .env)
  if (import.meta.env.DEV && envUrl) {
    let clean = envUrl.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `http://${clean}`;
    }
    return clean.replace(/\/+$/, "");
  }

  // If envUrl is provided in production and is NOT the deprecated railway domain
  if (envUrl && typeof envUrl === "string" && !envUrl.includes("railway.app")) {
    let clean = envUrl.trim();
    if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
      clean = `https://${clean}`;
    }
    return clean.replace(/\/+$/, "");
  }

  // Production default
  return "https://aadagamback.in";
}

const API_BASE_URL = resolveApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Resolves a full image URL given a relative or absolute path from backend.
 * E.g., "/opxXxolN7m6CU/upload/file.png" -> "https://aadagamback.in/opxXxolN7m6CU/upload/file.png"
 * "opxXxolN7m6CU/upload" -> "https://aadagamback.in/opxXxolN7m6CU/upload"
 * @param {string} url 
 * @returns {string}
 */
export function resolveFullImageUrl(url) {
  if (!url || typeof url !== "string") return "";
  const clean = url.trim();
  if (!clean) return "";

  if (clean.startsWith("http://") || clean.startsWith("https://") || clean.startsWith("data:") || clean.startsWith("blob:")) {
    return clean;
  }

  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  if (clean.startsWith("/")) {
    return `${baseUrl}${clean}`;
  }

  return `${baseUrl}/${clean}`;
}

// Request Interceptor: Automatically attach JWT token if available in storage
apiClient.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("aadagam_auth_token");
    if (!token) {
      const adminSession = localStorage.getItem("aadagam_current_admin");
      if (adminSession) {
        try {
          const user = JSON.parse(adminSession);
          token = user?.token || user?.authTkn;
        } catch (e) {
          // Silent catch
        }
      }
    }
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("API Session unauthorized (401)");
    }
    return Promise.reject(error);
  }
);

/**
 * Safely decodes a JSON Web Token (JWT) payload on the client side
 * @param {string} token 
 * @returns {object|null} Decoded JWT payload
 */
export function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.warn("Failed to decode JWT payload:", e);
    return null;
  }
}

/**
 * SINGLE SOURCE OF TRUTH FOR PLATFORM DOMAIN
 * Change this ONE constant (or set VITE_PLATFORM_DOMAIN in your .env / environment)
 * to update the platform domain across the entire application!
 */
export const PLATFORM_DOMAIN = import.meta.env.VITE_PLATFORM_DOMAIN || import.meta.env.VITE_PRIMARY_DOMAIN || "aadagam.com";
export const PRIMARY_DOMAIN = PLATFORM_DOMAIN;

/**
 * Extract clean shop prefix identifier from a subdomain or domain string
 * e.g. "srilakshmi.aadagam.com" -> "srilakshmi", "srilakshmi.localhost" -> "srilakshmi"
 */
export function getShopPrefix(subdomain = "") {
  if (!subdomain) return "mycompany";
  const clean = subdomain.trim().toLowerCase();
  return clean.split(".")[0];
}

/**
 * Checks if the current window location is a tenant wildcard subdomain host
 * e.g. "srilakshmi.localhost" -> true
 * e.g. "srilakshmi.aadagam.com" -> true
 * e.g. "localhost", "127.0.0.1", "aadagam.com", "www.aadagam.com" -> false
 */
export function isTenantSubdomainHost() {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname.toLowerCase().trim();

  // 1. Wildcard Localhost: e.g. "srilakshmi.localhost"
  if (hostname.endsWith(".localhost") && hostname !== "localhost") {
    return true;
  }

  // 2. Production wildcard subdomain (e.g. "srilakshmi.aadagam.com")
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const prefix = parts[0];
    const isIgnoredPrefix = ["www", "app", "admin", "api"].includes(prefix);
    if (!isIgnoredPrefix) {
      return true;
    }
  }

  return false;
}

/**
 * Utility helper to extract the subdomain/tenant domain for backend API payloads.
 * 
 * Localhost Wildcard: srilakshmi.localhost:5173 -> returns "srilakshmi.aadagam.com"
 * Production Wildcard: srilakshmi.aadagam.com -> returns "srilakshmi.aadagam.com"
 * 
 * @returns {string} The fully qualified subdomain string for backend API payload.
 */
export function getTenantSubdomain() {
  if (typeof window === "undefined") return `mycompany.${PLATFORM_DOMAIN}`;
  const hostname = window.location.hostname.toLowerCase().trim();

  // Wildcard Localhost (e.g. "srilakshmi.localhost")
  if (hostname.endsWith(".localhost") && hostname !== "localhost") {
    const prefix = hostname.split(".")[0];
    return `${prefix}.${PLATFORM_DOMAIN}`;
  }

  // Production wildcard subdomain
  const parts = hostname.split(".");
  if (parts.length >= 3) {
    const prefix = parts[0];
    if (!["www", "app", "admin", "api"].includes(prefix)) {
      return hostname;
    }
  }

  // Fallback default
  return `mycompany.${PLATFORM_DOMAIN}`;
}

/**
 * Generates a clean wildcard URL for a shop storefront.
 * 
 * Localhost Dev: "srilakshmi" -> "http://srilakshmi.localhost:5173/"
 * Production: "srilakshmi" -> "https://srilakshmi.aadagam.com/"
 * 
 * @param {string} subdomainOrPrefix 
 * @returns {string} Fully formatted URL for the shop storefront
 */
export function getStorefrontUrl(subdomainOrPrefix = "") {
  const prefix = getShopPrefix(subdomainOrPrefix) || "mycompany";
  if (typeof window === "undefined") return `http://${prefix}.localhost:5173/`;

  const hostname = window.location.hostname.toLowerCase().trim();
  const port = window.location.port ? `:${window.location.port}` : "";
  const protocol = window.location.protocol;

  // Local development environments
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".localhost") || hostname.startsWith("192.168.")) {
    return `${protocol}//${prefix}.localhost${port}/`;
  }

  // Production environment using central PLATFORM_DOMAIN (or active base domain)
  const parts = hostname.split(".");
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join(".") : PLATFORM_DOMAIN;
  return `${protocol}//${prefix}.${baseDomain}/`;
}

/**
 * Formats a phone or WhatsApp number to standard Indian format with country code prefix (+91).
 * E.g., "919952054493" -> "+91 9952054493", "9952054493" -> "+91 9952054493", "+919952054493" -> "+91 9952054493"
 * 
 * @param {string|number} phone 
 * @param {string} fallback 
 * @returns {string}
 */
export function formatIndianPhoneNumber(phone, fallback = "+91 9952054493") {
  if (!phone) return fallback;
  const str = String(phone).trim();
  if (!str) return fallback;

  const digits = str.replace(/\D/g, "");

  // If 12 digits starting with 91 (e.g. 919952054493)
  if (digits.length === 12 && digits.startsWith("91")) {
    const mainNum = digits.slice(2);
    return `+91 ${mainNum}`;
  }

  // If 10 digits (e.g. 9952054493)
  if (digits.length === 10) {
    return `+91 ${digits}`;
  }

  // If already starts with +91
  if (str.startsWith("+91")) {
    const rest = str.replace(/^\+91[\s-]*/, "");
    return `+91 ${rest}`;
  }

  // If starts with another international country code (+1, etc.)
  if (str.startsWith("+")) {
    return str;
  }

  // Default if digits exist
  if (digits.length > 0) {
    return `+91 ${digits}`;
  }

  return str || fallback;
}

/**
 * Returns a clean numeric string suitable for WhatsApp direct URLs (wa.me/...).
 * E.g. "9952054493" -> "919952054493", "+91 9952054493" -> "919952054493"
 * 
 * @param {string|number} phone 
 * @param {string} fallback 
 * @returns {string}
 */
export function getCleanWhatsAppNumber(phone, fallback = "") {
  if (!phone) return fallback;
  const raw = String(phone).trim();
  if (raw.includes("wa.me/")) {
    const afterWa = raw.split("wa.me/")[1].split("?")[0].replace(/\D/g, "");
    if (afterWa) return afterWa;
  }
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  return digits || fallback;
}
