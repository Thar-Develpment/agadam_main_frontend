import axios from "axios";

// Determine the backend API URL. Fallback to localhost:5000 if not specified in environment variables.
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Utility helper to extract the subdomain/tenant domain from the window hostname.
 * 
 * Production URL: tom.aadagam.com -> returns "tom.aadagam.com"
 * Localhost URL: localhost:5173/?shop=tom -> returns "tom.aadagam.com" (mock domain for local testing)
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
      return `${queryShop.toLowerCase()}.aadagam.com`;
    }
    // Default fallback shop name for local developer testing
    return "mycompany.aadagam.com";
  }

  // Production or external domain hosting
  // If the URL matches standard subdomain pattern like "shopname.aadagam.com"
  if (hostname.endsWith(".aadagam.com")) {
    return hostname;
  }

  // Fallback to the hostname itself if it's customized, or default.
  return hostname || "mycompany.aadagam.com";
}
