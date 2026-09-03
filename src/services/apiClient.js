import axios from "axios";

// Determine the backend API URL. Fallback to localhost:5000 if not specified in environment variables.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
 * Extract clean shop prefix identifier from a subdomain string
 * e.g. "myjewels.aadagam.com" -> "myjewels"
 */
export function getShopPrefix(subdomain = "") {
  if (!subdomain) return "mycompany";
  return subdomain.split(".")[0].toLowerCase().trim();
}

/**
 * Utility helper to extract the subdomain/tenant domain from the window hostname.
 * 
 * Production URL: tom.aadagam.com -> returns "tom.aadagam.com"
 * Localhost URL: localhost:5173/?shop=tom -> returns "tom.aadagam.com"
 * Fallback URL: localhost:5173 -> returns "mycompany.aadagam.com"
 * 
 * @returns {string} The fully qualified subdomain string for backend API payload.
 */
export function getTenantSubdomain() {
  const hostname = window.location.hostname;
  
  // If running locally (localhost or 127.0.0.1)
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("192.168.")) {
    const params = new URLSearchParams(window.location.search);
    const queryShop = params.get("shop");
    if (queryShop) {
      return `${queryShop.toLowerCase().trim()}.aadagam.com`;
    }
    return "mycompany.aadagam.com";
  }

  // Production or external domain hosting
  if (hostname.endsWith(".aadagam.com")) {
    return hostname.toLowerCase().trim();
  }

  // Fallback to the hostname itself if customized, or default.
  return hostname.toLowerCase().trim() || "mycompany.aadagam.com";
}
