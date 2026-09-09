import axios from "axios";

// Determine the backend API URL. Fallback to localhost:5000 if not specified in environment variables.
const API_BASE_URL = "https://agadammainbackend-production.up.railway.app";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

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
export const PLATFORM_DOMAIN = import.meta.env.VITE_PLATFORM_DOMAIN || "aadagam.com";

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
