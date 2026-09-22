import { apiClient, getTenantSubdomain, getShopPrefix, parseJwt, resolveFullImageUrl } from "./apiClient";
import {
  mockShopInfo,
  mockSlides,
  mockAboutContent,
} from "./mockData";

export const DEFAULT_GOLD_THUMBNAIL = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80";

/**
 * Robust helper to extract YouTube ID from standard, Shorts, or shortened video URLs
 * Supports: youtube.com/watch?v=ID, youtube.com/shorts/ID, youtu.be/ID, youtube.com/embed/ID, etc.
 * @param {string} url 
 * @returns {string} Clean 11-char YouTube ID or empty string
 */
export function extractYoutubeId(url = "") {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();

  // If already an 11-char alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /(?:youtube\.com\/(?:watch\?.*v=|embed\/|v\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  const fallback = /(?:[?&]v=|(?:\/|%2F)shorts(?:\/|%2F)|youtu\.be(?:\/|%2F))([a-zA-Z0-9_-]{11})/i;
  const fbMatch = trimmed.match(fallback);
  if (fbMatch && fbMatch[1]) {
    return fbMatch[1];
  }

  return "";
}

/* ==========================================================================
 * 1. PUBLIC STOREFRONT & SYSTEM MODULE (`/user` & `/auth`)
 * ========================================================================== */

/**
 * Fetch hero carousel slides (Checks backend hero slides, basic assets fallback, or mock slides)
 * @returns {Promise<Array>} Array of slide objects
 */
export async function getSlides() {
  try {
    const subdomain = getTenantSubdomain();
    const shopPrefix = getShopPrefix(subdomain);

    // 1. Query backend hero slides API
    const res = await adminGetAllHeroSlide(0, 10);
    if (res && res.status === 1 && Array.isArray(res.data) && res.data.length > 0) {
      const activeSlides = res.data
        .filter((s) => s.status === 1 || s.status === undefined)
        .map((s) => ({
          id: s.id,
          title: s.title || "Royal Bridal Heritage",
          subtitle: s.description || "Discover timeless handcrafted bridal jewels",
          description: s.description || "Discover timeless handcrafted bridal jewels",
          desktopImg: s.image,
          mobileImg: s.image,
          image: s.image,
          ctaLink: "#gallery",
          ctaText: "Explore Collection",
        }));

      if (activeSlides.length > 0) {
        localStorage.setItem(`aadagam_carousel_slides_${shopPrefix}`, JSON.stringify(activeSlides));
        return activeSlides;
      }
    }

    // 2. Try local storage cache fallback
    const localSlides = localStorage.getItem(`aadagam_carousel_slides_${shopPrefix}`);
    if (localSlides) {
      const parsed = JSON.parse(localSlides);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }

    // 3. Fallback to basic assets
    const basicRes = await getBasicAssets();
    if (basicRes && basicRes.status === 1 && basicRes.image?.data?.length > 0) {
      const basicSlides = basicRes.image.data.slice(0, 4).map((url, idx) => ({
        id: idx + 1,
        title: idx === 0 ? "Exquisite Bridal Diamond Collection" : "Royal Heritage Gold Collection",
        subtitle: idx === 0 ? "Discover timeless handcrafted bridal jewels" : "Handcrafted pure 22K gold ornaments",
        description: idx === 0 ? "Discover timeless handcrafted bridal jewels" : "Handcrafted pure 22K gold ornaments",
        desktopImg: url,
        mobileImg: url,
        image: url,
        ctaLink: "#gallery",
        ctaText: "Explore Collection",
      }));
      return basicSlides;
    }

    return mockSlides;
  } catch (err) {
    console.warn("Could not load backend hero slides, using defaults:", err);
    return mockSlides;
  }
}

/**
 * Check if current tenant showroom is active or suspended
 * @returns {Promise<Object>} { suspended: boolean, message?: string }
 */
export async function checkTenantStatus() {
  try {
    const subdomain = getTenantSubdomain();
    if (!subdomain) return { suspended: false };

    const token = localStorage.getItem("aadagam_auth_token");
    if (!token) return { suspended: false };

    const tenantsRes = await adminGetAllTenants(token);
    if (tenantsRes && Array.isArray(tenantsRes.data) && tenantsRes.data.length > 0) {
      const shopPrefix = getShopPrefix(subdomain).toLowerCase();
      const match = tenantsRes.data.find(
        (t) =>
          (t.subdomain && t.subdomain.toLowerCase() === subdomain.toLowerCase()) ||
          (t.subdomain && t.subdomain.toLowerCase().includes(shopPrefix)) ||
          (t.shop_name && t.shop_name.toLowerCase() === shopPrefix)
      );

      if (match && match.status === 0) {
        return {
          suspended: true,
          message: `The showroom "${match.shop_name || shopPrefix.toUpperCase()}" is currently suspended by the platform administrator.`,
        };
      }
    }
    return { suspended: false };
  } catch (err) {
    return { suspended: false };
  }
}

/**
 * Fetch list of category names from backend `/user/gallery_categories`
 * @returns {Promise<Array>} Array of category names (e.g., ["All", "Necklaces", "Earrings"])
 */
export async function getGalleryCategories() {
  try {
    const subdomain = getTenantSubdomain();
    const shop_name = getShopPrefix(subdomain);
    const res = await apiClient.post("/user/gallery_categories", { shop_name, subdomain });
    if (res.data && res.data.status === 1 && Array.isArray(res.data.data)) {
      const names = res.data.data
        .map((cat) => cat.category_name?.trim())
        .filter(Boolean);
      return ["All", ...names];
    }
    return ["All"];
  } catch (err) {
    console.error("Error in getGalleryCategories:", err);
    return ["All"];
  }
}

/**
 * Fetch gallery images filtered optionally by category name
 * Hits the backend `/user/gallery_categories` and `/user/galler_details`
 * @param {string} categoryName Optional category name filter ('All' or specific category)
 * @returns {Promise<Array>} Array of gallery image items
 */
export async function getGalleryImages(categoryName = "All") {
  try {
    const subdomain = getTenantSubdomain();
    const shop_name = getShopPrefix(subdomain);

    // 1. Fetch categories to build an ID-to-Name map
    const categoriesMap = new Map();
    try {
      const catRes = await apiClient.post("/user/gallery_categories", { shop_name, subdomain });
      if (catRes.data && catRes.data.status === 1 && Array.isArray(catRes.data.data)) {
        catRes.data.data.forEach((cat) => {
          if (cat?.id && cat?.category_name) {
            categoriesMap.set(cat.id, cat.category_name.trim());
          }
        });
      }
    } catch (catErr) {
      console.warn("Failed to fetch gallery categories map:", catErr);
    }

    // 2. Fetch the gallery details (using backend typo route /user/galler_details)
    const res = await apiClient.post("/user/galler_details", { shop_name, subdomain });
    if (res.data && res.data.status === 1 && Array.isArray(res.data.data)) {
      const mappedImages = res.data.data.map((item) => {
        const mappedCategory = categoriesMap.get(item.category_id) || "Exclusive";
        return {
          id: item.id?.toString() || Math.random().toString(),
          title: `${mappedCategory} Collection`,
          category: mappedCategory,
          purity: "22K BIS Hallmarked",
          imageUrl: item.image_url,
          description: "Exquisite handcrafted design.",
          code: `AG-ITM-${item.id}`,
        };
      });

      if (!categoryName || categoryName === "All") {
        return mappedImages;
      }
      return mappedImages.filter(
        (img) => img.category.toLowerCase() === categoryName.toLowerCase()
      );
    }
    return [];
  } catch (err) {
    console.error("Error in getGalleryImages:", err);
    return [];
  }
}

/**
 * Fetch embedded YouTube videos list from backend `/user/videos_details`
 * @returns {Promise<Array>} Array of video objects
 */
export async function getVideos() {
  try {
    const subdomain = getTenantSubdomain();
    const shop_name = getShopPrefix(subdomain);
    const res = await apiClient.post("/user/videos_details", { shop_name, subdomain });

    if (res.data && res.data.status === 1 && Array.isArray(res.data.data)) {
      return res.data.data.map((item) => {
        const rawUrl = item.video_url || "";
        const youtubeId = extractYoutubeId(rawUrl);
        const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(rawUrl) || (!youtubeId && rawUrl.startsWith("http"));
        return {
          id: item.id?.toString() || Math.random().toString(),
          title: "Featured Showroom Showcase",
          videoUrl: rawUrl,
          youtubeId: !isDirectVideo ? youtubeId : "",
          isDirectVideo: isDirectVideo,
          thumbnail: youtubeId
            ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`
            : "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
          category: "Showcase",
          duration: "Video",
          description: "Watch our exclusive collections and craftsmanship story.",
        };
      });
    }
    return [];
  } catch (err) {
    console.error("Error in getVideos:", err);
    return [];
  }
}

/**
 * Safely unpacks story content and image from raw API responses
 * Handles: plain text, single JSON, double-stringified JSON, escaped quote strings
 */
export function parseStoryContent(rawContent, rawImage = null) {
  let storyText = rawContent || "";
  let headingText = null;
  let imageUrl = rawImage || null;

  let current = storyText;
  for (let i = 0; i < 4; i++) {
    if (typeof current === "string") {
      let trimmed = current.trim();
      // Remove surrounding quotes if it is a quoted string that wraps JSON
      if (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length > 2) {
        try {
          trimmed = JSON.parse(trimmed);
        } catch (e) {
          if (trimmed.startsWith('"{') || trimmed.startsWith('"[')) {
            trimmed = trimmed.slice(1, -1).replace(/\\"/g, '"');
          }
        }
      }

      if (typeof trimmed === "string" && (trimmed.startsWith("{") || trimmed.startsWith("["))) {
        try {
          current = JSON.parse(trimmed);
        } catch (e) {
          try {
            current = JSON.parse(trimmed.replace(/\\"/g, '"'));
          } catch (e2) {
            break;
          }
        }
      } else if (typeof trimmed === "object" && trimmed !== null) {
        current = trimmed;
      } else {
        current = trimmed;
        break;
      }
    } else {
      break;
    }
  }

  if (typeof current === "object" && current !== null && !Array.isArray(current)) {
    storyText = current.body !== undefined ? current.body : (current.content !== undefined ? current.content : (current.text || current.story || ""));
    headingText = current.heading || current.title || null;
    if (!imageUrl) {
      imageUrl = current.image_url || current.image || current.imageUrl || null;
    }
  } else if (typeof current === "string") {
    storyText = current;
  }

  return {
    storyText: typeof storyText === "string" ? storyText.trim() : "",
    headingText,
    imageUrl: imageUrl ? resolveFullImageUrl(imageUrl) : null,
  };
}

/**
 * Fetch About Us story & content from backend `/user/our_stories`
 * @returns {Promise<Object>} About content object
 */
export async function getAboutContent() {
  try {
    const subdomain = getTenantSubdomain();
    const shop_name = getShopPrefix(subdomain);
    const res = await apiClient.post("/user/our_stories", { shop_name, subdomain });

    if (res.data && res.data.status === 1 && Array.isArray(res.data.data) && res.data.data.length > 0) {
      const activeStory = res.data.data.find((story) => story.status === 1) || res.data.data[0];
      const { storyText, headingText, imageUrl } = parseStoryContent(
        activeStory.content || activeStory.strContent || "",
        activeStory.image || activeStory.image_url || activeStory.imageUrl || null
      );

      // If user provided custom content, split into paragraphs if multiple lines
      const userParagraphs = typeof storyText === "string" && storyText.trim()
        ? storyText.split(/\r?\n\r?\n/).map((s) => s.trim()).filter(Boolean)
        : [];

      return {
        title: headingText || "Our Heritage & Passion for Perfection",
        historyParagraphs: userParagraphs.length > 0 ? userParagraphs : (mockAboutContent.historyParagraphs || [""]),
        image: imageUrl || null,
        imageUrl: imageUrl || null,
      };
    }
    return mockAboutContent;
  } catch (err) {
    console.error("Error in getAboutContent:", err);
    return mockAboutContent;
  }
}

const DEFAULT_PRICE_DATA = [
  { id: 1, material: "gold", purity: "24K (99.9% Pure)", price: 7850 },
  { id: 2, material: "gold", purity: "22K (91.6% Pure)", price: 7195 },
  { id: 3, material: "gold", purity: "18K (75.0% Pure)", price: 5890 },
  { id: 4, material: "silver", purity: "999 Fine Silver", price: 92 },
];

/**
 * Fetch live metal/bullion prices and showroom contact info from backend `POST /user/site_info`
 * @param {string} [shopName] Optional shop name filter
 * @returns {Promise<Object>} { success: number, priceData: Array<{ id, material, purity, price }>, siteInfoData: Object|null, paymentPending?: boolean }
 */
export async function getSiteInfo(shopName = "") {
  const subdomain = getTenantSubdomain();
  const targetShop = shopName || getShopPrefix(subdomain);
  const payload = {
    shop_name: targetShop,
    subdomain: subdomain,
  };

  try {
    const res = await apiClient.post("/user/site_info", payload);

    if (res.data) {
      // 1. Explicit Payment Pending check from backend checkPayment middleware
      if (res.data.message === "Payment pending") {
        return {
          success: 0,
          paymentPending: true,
          priceData: DEFAULT_PRICE_DATA,
          siteInfoData: null,
          message: res.data.message,
        };
      }

      // 2. Successful response from registered shop
      if (res.data.success === 1 || res.data.status === 1) {
        const priceData = (Array.isArray(res.data.priceData) && res.data.priceData.length > 0)
          ? res.data.priceData
          : (Array.isArray(res.data.data) && res.data.data.length > 0)
            ? res.data.data
            : DEFAULT_PRICE_DATA;

        const siteInfoData = res.data.siteInfoData || null;

        if (siteInfoData && typeof siteInfoData === "object") {
          try {
            localStorage.setItem(`aadagam_site_info_${targetShop}`, JSON.stringify(siteInfoData));
          } catch (e) {}
        }

        return {
          success: 1,
          paymentPending: false,
          priceData: priceData,
          siteInfoData: siteInfoData,
          message: res.data.message || "Site info fetched successfully",
        };
      }
    }
  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    if (errMsg === "Payment pending") {
      return {
        success: 0,
        paymentPending: true,
        priceData: DEFAULT_PRICE_DATA,
        siteInfoData: null,
        message: errMsg,
      };
    }
  }

  // 3. Fallback for unregistered shops, localhost, or network issues: return fallback site info
  let basicData = null;
  try {
    const basicRes = await apiClient.get("/basic/get_basic_info");
    if (basicRes.data && basicRes.data.status === 1 && basicRes.data.data) {
      basicData = basicRes.data.data;
    }
  } catch (e) {}

  let cachedSiteInfo = null;
  try {
    const local = localStorage.getItem(`aadagam_site_info_${targetShop}`);
    if (local) {
      cachedSiteInfo = JSON.parse(local);
    }
  } catch (e) {}

  const mergedSiteInfo = {
    shop_name: cachedSiteInfo?.shop_name || basicData?.shop_name || targetShop,
    logo: cachedSiteInfo?.logo || "",
    city: cachedSiteInfo?.city || basicData?.city || "",
    address: cachedSiteInfo?.address || basicData?.address || "",
    phone: cachedSiteInfo?.phone || basicData?.phone || "",
    contact_us: cachedSiteInfo?.contact_us || basicData?.email || "",
    whatsapp_no: cachedSiteInfo?.whatsapp_no || cachedSiteInfo?.phone || basicData?.phone || "",
    ...cachedSiteInfo,
  };

  return {
    success: 1,
    paymentPending: false,
    priceData: DEFAULT_PRICE_DATA,
    siteInfoData: mergedSiteInfo,
    message: "Site info loaded via fallback",
  };
}

/**
 * Fetch general platform configuration from backend `GET /basic/get_basic_info`
 * @returns {Promise<Object>} { status: number, data: Object|null }
 */
export async function getBasicInfo() {
  try {
    const res = await apiClient.get("/basic/get_basic_info");
    if (res.data && res.data.status === 1 && res.data.data) {
      return {
        status: 1,
        data: res.data.data,
      };
    }
    return { status: 0, data: null, message: res.data?.message || "No basic info found" };
  } catch (err) {
    console.error("Error in getBasicInfo:", err);
    return { status: 0, data: null, message: err.message };
  }
}

/**
 * Fetch default platform assets (images & videos) from backend `GET /basic/get_basic_assets`
 * Used for WhatsApp status templates, video reels, and platform banners
 * @returns {Promise<Object>} { status: number, image: { data: string[], count: number }, video: { data: string[], count: number } }
 */
export async function getBasicAssets() {
  try {
    const res = await apiClient.get("/basic/get_basic_assets");
    if (res.data && res.data.status === 1) {
      return {
        status: 1,
        image: res.data.image || { data: [], count: 0 },
        video: res.data.video || { data: [], count: 0 },
      };
    }
    return { status: 0, image: { data: [], count: 0 }, video: { data: [], count: 0 } };
  } catch (err) {
    console.error("Error in getBasicAssets:", err);
    return { status: 0, image: { data: [], count: 0 }, video: { data: [], count: 0 } };
  }
}

/**
 * Fetch shop contact info with tenant branding fallback
 * @returns {Promise<Object>} Shop info object
 */
export async function getContactInfo() {
  const subdomain = getTenantSubdomain();
  const shopNamePrefix = getShopPrefix(subdomain).toUpperCase();
  return {
    ...mockShopInfo,
    name: shopNamePrefix !== "MYCOMPANY" ? shopNamePrefix : mockShopInfo.name,
  };
}

/**
 * Submit an enquiry form to backend `/user/ask_question`
 * @param {Object} formData { name: string, phone: string, email: string, message: string }
 * @returns {Promise<Object>} Response object { success: boolean, message: string }
 */
export async function submitEnquiry(formData) {
  try {
    const subdomain = getTenantSubdomain();
    const cleanPhone = (formData.phone || "").trim();
    const queryText = cleanPhone
      ? `[Phone: ${cleanPhone}]\n${(formData.message || "").trim()}`
      : (formData.message || "").trim();

    const payload = {
      subdomain,
      customer_name: (formData.name || "").trim().slice(0, 20),
      email: (formData.email || "").trim().slice(0, 255),
      query: queryText.slice(0, 1000),
    };

    const res = await apiClient.post("/user/ask_question", payload);

    if (res.data && res.data.status === 1) {
      return {
        success: true,
        message: res.data.message || "Enquiry submitted successfully!",
      };
    } else {
      return {
        success: false,
        message: res.data?.message || "Failed to submit enquiry. Please try again.",
      };
    }
  } catch (err) {
    console.error("Error in submitEnquiry:", err);
    let errorMsg = "An unexpected error occurred.";
    if (err.response?.data?.errors) {
      const errs = err.response.data.errors;
      if (typeof errs === "object") {
        errorMsg = Object.values(errs)
          .map((e) => e.message || e)
          .join(" ");
      } else if (Array.isArray(errs)) {
        errorMsg = errs.join(" ");
      }
    } else if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    }
    return {
      success: false,
      message: errorMsg,
    };
  }
}

/**
 * Register a new jewellery shop on the platform via backend `/auth/register`
 * @param {Object} regData { shopName, ownerName, email, password, city }
 * @returns {Promise<Object>} Response object { success: boolean, message: string, domain: string }
 */
export async function registerShop(regData) {
  try {
    const cleanShopName = (regData.shopName || "").replace(/\s+/g, "").toLowerCase().slice(0, 50);
    const payload = {
      shop_name: cleanShopName,
      owner_name: (regData.ownerName || "").trim().slice(0, 150),
      email: (regData.email || "").trim().slice(0, 255),
      password: regData.password,
      city: (regData.city || "").trim().slice(0, 12),
    };

    const res = await apiClient.post("/auth/register", payload);

    if (res.data && res.data.success === 1) {
      const returnedDomain = res.data.data?.domain || `${payload.shop_name.toLowerCase()}.aadagam.com`;
      return {
        success: true,
        message: res.data.message || "Registered successfully!",
        domain: returnedDomain,
        shopName: res.data.data?.shop_name || payload.shop_name,
        shopId: res.data.data?.id || `SHOP-${Math.floor(1000 + Math.random() * 9000)}`,
        registeredAt: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        message: res.data?.message || "Registration failed.",
      };
    }
  } catch (err) {
    console.error("Error in registerShop:", err);
    let errorMsg = "Registration failed.";

    if (err.response?.status === 409) {
      errorMsg = "This shop name is already taken. Please choose a different shop name.";
    } else if (err.response?.data) {
      const body = err.response.data;
      if (body.errors) {
        if (Array.isArray(body.errors)) {
          errorMsg = body.errors.join("\n");
        } else if (typeof body.errors === "object") {
          errorMsg = Object.values(body.errors)
            .map((e) => e.message || e)
            .join("\n");
        }
      } else if (body.message) {
        errorMsg = body.message;
      }
    }
    return {
      success: false,
      message: errorMsg,
    };
  }
}

/* ==========================================================================
 * 2. ADMIN AUTHENTICATION & OVERVIEW MODULE (`/opxXxolN7m6CU`)
 * ========================================================================== */

// Helper to construct Authorization header if token provided explicitly or stored in localStorage
function getAuthHeader(token = null) {
  const authToken = token || localStorage.getItem("aadagam_auth_token");
  if (authToken) return { Authorization: `Bearer ${authToken}` };
  return {};
}

/**
 * Authenticate Showroom Admin via `POST /opxXxolN7m6CU/login`
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} { status: number, authTkn: string, message: string, user: object }
 */
export async function adminLogin(email, password) {
  try {
    const cleanEmail = (email || "").trim();

    const res = await apiClient.post("/opxXxolN7m6CU/login", {
      email: cleanEmail,
      password: password || "",
    });

    if (res.data && res.data.status === 1 && res.data.authTkn) {
      const token = res.data.authTkn;
      const decoded = parseJwt(token) || {};

      const userSession = {
        token,
        authTkn: token,
        id: decoded.id || null,
        email: decoded.email || email,
        domain: decoded.subdomain || `${getShopPrefix(email)}.aadagam.com`,
        shopName: (decoded.subdomain ? getShopPrefix(decoded.subdomain) : "Showroom").toUpperCase(),
      };

      // Store in LocalStorage for persistence across requests
      localStorage.setItem("aadagam_current_admin", JSON.stringify(userSession));
      localStorage.setItem("aadagam_auth_token", token);

      return {
        status: 1,
        authTkn: token,
        message: res.data.message || "Login successful",
        user: userSession,
      };
    }

    return {
      status: 0,
      message: res.data?.message || "Invalid email or password. Please check your showroom credentials.",
    };
  } catch (err) {
    console.error("Error in adminLogin:", err);
    let errMsg = "Invalid email or password. Please check your credentials.";
    if (err.response?.data?.message) {
      errMsg = err.response.data.message;
    } else if (err.response?.data?.errors) {
      if (Array.isArray(err.response.data.errors)) {
        errMsg = err.response.data.errors.join("\n");
      } else if (typeof err.response.data.errors === "object") {
        errMsg = Object.values(err.response.data.errors)
          .map((e) => (typeof e === "object" ? e.message || JSON.stringify(e) : e))
          .join("\n");
      }
    } else if (err.message) {
      errMsg = err.message;
    }
    return {
      status: 0,
      message: errMsg,
    };
  }
}

/**
 * Send 6-digit numeric OTP to registered admin email via `POST /opxXxolN7m6CU/send_otp`
 * @param {string} email
 * @returns {Promise<Object>} { status: number, message: string }
 */
export async function adminSendOtp(email) {
  try {
    const cleanEmail = (email || "").trim();
    const res = await apiClient.post("/opxXxolN7m6CU/send_otp", { email: cleanEmail });
    return res.data || { status: 1, message: "OTP sent successfully" };
  } catch (err) {
    console.error("Error in adminSendOtp:", err);
    return {
      status: 0,
      message: err.response?.data?.message || err.message || "Failed to send OTP.",
    };
  }
}

/**
 * Resend fresh 6-digit OTP via `POST /opxXxolN7m6CU/resend_otp`
 * @param {string} email
 * @returns {Promise<Object>} { status: number, message: string, resendCount?: number, remainingResends?: number }
 */
export async function adminResendOtp(email) {
  try {
    const cleanEmail = (email || "").trim();
    const res = await apiClient.post("/opxXxolN7m6CU/resend_otp", { email: cleanEmail });
    return res.data || { status: 1, message: "OTP resent successfully" };
  } catch (err) {
    console.error("Error in adminResendOtp:", err);
    return {
      status: 0,
      message: err.response?.data?.message || err.message || "Failed to resend OTP.",
    };
  }
}

/**
 * Verify 6-digit OTP and set new password via `POST /opxXxolN7m6CU/reset_password`
 * @param {string} email
 * @param {string|number} otp
 * @param {string} newPassword
 * @returns {Promise<Object>} { status: number, message: string }
 */
export async function adminResetPassword(email, otp, newPassword) {
  try {
    const cleanEmail = (email || "").trim();
    const cleanOtp = String(otp || "").trim();
    const cleanPassword = (newPassword || "").trim();

    const res = await apiClient.post("/opxXxolN7m6CU/reset_password", {
      email: cleanEmail,
      otp: cleanOtp,
      newPassword: cleanPassword,
    });
    return res.data || { status: 1, message: "Password reset successfully" };
  } catch (err) {
    console.error("Error in adminResetPassword:", err);
    return {
      status: 0,
      message: err.response?.data?.message || err.message || "Failed to reset password.",
    };
  }
}

/**
 * Fetch Admin Dashboard overview statistics from `GET /opxXxolN7m6CU/dash_board`
 * @param {string} token Optional JWT token
 * @returns {Promise<Object>} { status: number, success: number, category_count: number, gallery_count: number, videos_count: number, asked_question: number }
 */
export async function adminGetDashboardStats(token = null) {
  try {
    const res = await apiClient.get("/opxXxolN7m6CU/dash_board", {
      headers: getAuthHeader(token),
    });
    if (res.data && (res.data.status === 1 || res.data.success === 1)) {
      return {
        status: 1,
        success: 1,
        category_count: res.data.category_count ?? 0,
        gallery_count: res.data.gallery_count ?? 0,
        videos_count: res.data.videos_count ?? 0,
        asked_question: res.data.asked_question ?? 0,
        priceData: res.data.priceData || [],
        message: res.data.message || "success",
      };
    }
    return { status: 0, success: 0, category_count: 0, gallery_count: 0, videos_count: 0, asked_question: 0, priceData: [] };
  } catch (err) {
    console.error("Error in adminGetDashboardStats:", err);
    return { status: 0, success: 0, category_count: 0, gallery_count: 0, videos_count: 0, asked_question: 0, priceData: [] };
  }
}

/**
 * Update daily gold/silver metal price from `POST /opxXxolN7m6CU/price_update`
 * @param {Object} param0 { material: 'gold'|'silver', purity: '22k'|'24k'|'18k', price: string|number }
 * @param {string} token Optional JWT token
 * @returns {Promise<Object>} { status: number, message: string }
 */
export async function adminUpdatePrice({ material, purity, price }, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/price_update",
      {
        material: (material || "gold").toLowerCase(),
        purity: (purity || "22k").toLowerCase(),
        price: String(price).trim(),
      },
      { headers: getAuthHeader(token) }
    );
    return res.data || { status: 1, message: "Price updated successfully" };
  } catch (err) {
    console.error("Error in adminUpdatePrice:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update price." };
  }
}

/* ==========================================================================
 * 3. ADMIN CRUD MODULES (`/opxXxolN7m6CU`)
 * ========================================================================== */

/* ------------------ A. CATEGORIES ------------------ */

export async function adminAddCategory(categoryName, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/add_category",
      { category_name: (categoryName || "").trim().slice(0, 30) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminAddCategory:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to add category." };
  }
}

export async function adminGetAllCategories(pageNo = 0, pageSize = 10, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_all_category",
      { pageNo: Math.max(0, pageNo), pageSize: Math.max(1, pageSize) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetAllCategories:", err);
    return { status: 0, totalRecords: 0, data: [] };
  }
}

export async function adminGetSingleCategory(id, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_single_category",
      { id: Number(id) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetSingleCategory:", err);
    return { status: 0, message: "Category not found" };
  }
}

export async function adminUpdateCategory(id, categoryName, status = 1, token = null) {
  try {
    const payload = {
      id: Number(id),
      category_name: String(categoryName || "").trim().slice(0, 30),
      status: Number(status),
    };
    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_category",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateCategory:", err);
    const errData = err.response?.data;
    const msg = Array.isArray(errData?.errors)
      ? errData.errors.map((e) => (typeof e === "string" ? e : e.message || JSON.stringify(e))).join(", ")
      : (errData?.message || errData?.error || "Failed to update category.");
    return { status: 0, message: msg };
  }
}

/* ------------------ B. GALLERY IMAGES ------------------ */

export async function adminAddGallery(categoryId, imageUrl, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/add_gallery",
      {
        category_id: Number(categoryId),
        image_url: (imageUrl || "").trim().slice(0, 500),
      },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminAddGallery:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to add gallery image." };
  }
}

export async function adminGetAllGallery(pageNo = 0, pageSize = 10, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_all_gallery",
      { pageNo: Math.max(0, pageNo), pageSize: Math.max(1, pageSize) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetAllGallery:", err);
    return { status: 0, totalRecords: 0, data: [] };
  }
}

export async function adminGetSingleGallery(id, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_single_gallery",
      { id: Number(id) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetSingleGallery:", err);
    return { status: 0, message: "Gallery image not found" };
  }
}

export async function adminUpdateGallery(id, categoryId, imageUrl, status = 1, token = null) {
  try {
    const payload = {
      id: Number(id),
      category_id: Number(categoryId),
      image_url: String(imageUrl || "").trim().slice(0, 500),
      status: Number(status),
    };
    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_gallery",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateGallery:", err);
    const errData = err.response?.data;
    const msg = Array.isArray(errData?.errors)
      ? errData.errors.map((e) => (typeof e === "string" ? e : e.message || JSON.stringify(e))).join(", ")
      : (errData?.message || errData?.error || "Failed to update gallery image.");
    return { status: 0, message: msg };
  }
}

/* ------------------ C. SHOWCASE VIDEOS ------------------ */

export async function adminAddVideo(videoUrl, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/add_video",
      { video_url: (videoUrl || "").trim().slice(0, 500) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminAddVideo:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to add video." };
  }
}

export async function adminGetAllVideo(pageNo = 0, pageSize = 10, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_all_video",
      { pageNo: Math.max(0, pageNo), pageSize: Math.max(1, pageSize) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetAllVideo:", err);
    return { status: 0, totalRecords: 0, data: [] };
  }
}

export async function adminGetSingleVideo(id, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_single_video",
      { id: Number(id) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetSingleVideo:", err);
    return { status: 0, message: "Video not found" };
  }
}

export async function adminUpdateVideo(id, videoUrl, status = 1, token = null) {
  try {
    const payload = {
      id: Number(id),
      video_url: String(videoUrl || "").trim().slice(0, 500),
      status: Number(status),
    };
    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_video",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateVideo:", err);
    const errData = err.response?.data;
    const msg = Array.isArray(errData?.errors)
      ? errData.errors.map((e) => (typeof e === "string" ? e : e.message || JSON.stringify(e))).join(", ")
      : (errData?.message || errData?.error || "Failed to update video.");
    return { status: 0, message: msg };
  }
}

/* ------------------ D. CUSTOMER ENQUIRIES (ASKED QUESTIONS) ------------------ */

export async function adminGetAllAskedQuestions(pageNo = 0, pageSize = 10, status = null, token = null) {
  try {
    const payload = { pageNo: Math.max(0, pageNo), pageSize: Math.max(1, pageSize) };
    if (status !== null && status !== undefined) {
      payload.status = status;
    }
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_all_asked_questions",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetAllAskedQuestions:", err);
    return { status: 0, totalRecords: 0, data: [] };
  }
}

export async function adminGetSingleAskedQuestion(id, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_single_asked_questions",
      { id: Number(id) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetSingleAskedQuestion:", err);
    return { status: 0, message: "Enquiry not found" };
  }
}

export async function adminUpdateAskedQuestionStatus(id, status = 1, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_asked_questions",
      { id: Number(id), status },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateAskedQuestionStatus:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update enquiry status." };
  }
}

/* ------------------ E. OUR STORY NARRATIVE ------------------ */

export async function adminAddOurStory(content, image = "", token = null) {
  try {
    const rawText = typeof content === "string" ? content.trim() : "";
    const imageUrl = (image || "").trim();

    const payload = {
      content: rawText,
      image: imageUrl
    };

    const res = await apiClient.post(
      "/opxXxolN7m6CU/add_our_story",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminAddOurStory:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to add story." };
  }
}

export async function adminGetAllOurStory(pageNo = 0, pageSize = 10, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_all_our_story",
      { pageNo: Math.max(0, pageNo), pageSize: Math.max(1, pageSize) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetAllOurStory:", err);
    return { status: 0, totalRecords: 0, data: [] };
  }
}

export async function adminGetSingleOurStory(id, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_single_our_story",
      { id: Number(id) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetSingleOurStory:", err);
    return { status: 0, message: "Story not found" };
  }
}

export async function adminUpdateOurStory(id, content, status = 1, image = "", token = null) {
  try {
    const rawText = typeof content === "string" ? content.trim() : "";
    const imageUrl = (image || "").trim();

    const payload = {
      id: Number(id),
      content: rawText,
      status: Number(status),
      image: imageUrl
    };

    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_our_story",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateOurStory:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update story." };
  }
}

/* ------------------ F. SUPER ADMIN TENANTS MANAGEMENT ------------------ */

export async function adminGetAllTenants(token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_all_tenants",
      {},
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetAllTenants:", err);
    return { status: 0, totalRecords: 0, data: [] };
  }
}

export async function adminToggleTenantStatus(id, status, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/toggle_tenant_status",
      { id: Number(id), status: Number(status) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminToggleTenantStatus:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update tenant status." };
  }
}

/**
 * Activate / Deactivate showroom subdomain and update payment/subscription status via `POST /opxXxolN7m6CU/activate_subdomain`
 * @param {number|string} id Tenant Showroom ID (unique database ID)
 * @param {number} [status] 1 = activate, 0 = deactivate
 * @param {string} [token] Optional JWT token override
 * @returns {Promise<Object>} Response object { status: number, message: string }
 */
export async function adminActivateSubdomain(id, status = null, token = null) {
  try {
    const payload = { id: Number(id) };
    if (status !== null && status !== undefined) {
      payload.status = Number(status);
    }
    const res = await apiClient.post(
      "/opxXxolN7m6CU/activate_subdomain",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminActivateSubdomain:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update subdomain activation status" };
  }
}

/* ------------------ G. SITE INFO & S3 MULTI-IMAGE UPLOAD ------------------ */

/**
 * Update showroom contact, physical address info, logo, and social media links via `POST /opxXxolN7m6CU/update_site_info`
 * @param {Object} siteInfo { logo, city, address, phone, contact_us, whatsapp_no, facebook, instagram, whatsapp, twitter, youtube, telegram }
 * @param {string} [token] Optional JWT token override
 * @returns {Promise<Object>} Response object { status: number, message: string, errors?: Object }
 */
export async function adminUpdateSiteInfo(
  {
    logo,
    city,
    address,
    phone,
    contact_us,
    whatsapp_no,
    facebook,
    instagram,
    whatsapp,
    twitter,
    youtube,
    telegram,
  },
  token = null
) {
  try {
    const payload = {
      logo: (logo || "").trim().slice(0, 250),
      city: (city || "").trim().slice(0, 30),
      address: (address || "").trim().slice(0, 1500),
      phone: (phone || "").trim().slice(0, 15),
      contact_us: (contact_us || "").trim().slice(0, 30),
      whatsapp_no: (whatsapp_no || "").trim().slice(0, 15),
    };

    if (facebook !== undefined) payload.facebook = (facebook || "").trim();
    if (instagram !== undefined) payload.instagram = (instagram || "").trim();
    if (whatsapp !== undefined) payload.whatsapp = (whatsapp || "").trim();
    if (twitter !== undefined) payload.twitter = (twitter || "").trim();
    if (youtube !== undefined) payload.youtube = (youtube || "").trim();
    if (telegram !== undefined) payload.telegram = (telegram || "").trim();

    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_site_info",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateSiteInfo:", err);
    const errData = err.response?.data;
    return {
      status: 0,
      success: false,
      message: errData?.message || err.message || "Failed to update site info.",
      errors: errData?.errors || null,
    };
  }
}

/**
 * Upload multiple images directly to Cloudflare R2 / AWS S3 via `POST /opxXxolN7m6CU/upload`
 * @param {File[]|FileList} files Array or FileList of up to 10 image files (max 5MB each)
 * @param {string} [token] Optional JWT token override
 * @returns {Promise<Object>} Response object { success: boolean, message: string, urls?: string[] }
 */
export async function adminUploadImages(files, token = null) {
  try {
    const formData = new FormData();
    const fileArray = Array.isArray(files) ? files : Array.from(files);

    if (fileArray.length === 0) {
      return { success: false, message: "Please select at least one image to upload." };
    }

    if (fileArray.length > 10) {
      return { success: false, message: "You can upload a maximum of 10 images at once." };
    }

    fileArray.forEach((file) => {
      formData.append("images", file);
    });

    const res = await apiClient.post(
      "/opxXxolN7m6CU/upload",
      formData,
      {
        headers: {
          ...getAuthHeader(token),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUploadImages:", err);
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Image upload failed.",
    };
  }
}

/* ------------------ G. HERO SLIDESHOW CAROUSEL ------------------ */

/**
 * Add / Create Hero Slide (POST /opxXxolN7m6CU/add_hero_slide)
 * @param {Object} slideData { title, description, image }
 * @param {string} [token]
 */
export async function adminAddHeroSlide({ title, description, image }, token = null) {
  try {
    const payload = {
      title: (title || "").trim().slice(0, 255),
      description: (description || "").trim().slice(0, 1000),
      image: (image || "").trim().slice(0, 255)
    };

    const res = await apiClient.post(
      "/opxXxolN7m6CU/add_hero_slide",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminAddHeroSlide:", err);
    return {
      status: 0,
      success: false,
      message: err.response?.data?.message || "Failed to add hero slide.",
      errors: err.response?.data?.errors || null
    };
  }
}

/**
 * List all hero slides for current subdomain (POST /opxXxolN7m6CU/get_all_hero_slide)
 * @param {number} [pageNo]
 * @param {number} [pageSize]
 * @param {string} [token]
 */
export async function adminGetAllHeroSlide(pageNo = 0, pageSize = 10, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_all_hero_slide",
      { pageNo: Math.max(0, pageNo), pageSize: Math.max(1, pageSize) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetAllHeroSlide:", err);
    return { status: 0, totalRecords: 0, data: [] };
  }
}

/**
 * Get single hero slide by ID (POST /opxXxolN7m6CU/get_single_hero_slide)
 * @param {number|string} id
 * @param {string} [token]
 */
export async function adminGetSingleHeroSlide(id, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_single_hero_slide",
      { id: Number(id) },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetSingleHeroSlide:", err);
    return { status: 0, message: "Hero slide not found" };
  }
}

/**
 * Update or soft-delete a hero slide (POST /opxXxolN7m6CU/update_hero_slide)
 * @param {number|string} id
 * @param {string} title
 * @param {string} description
 * @param {string} image
 * @param {number} [status] 1 for active, 0 for soft-delete
 * @param {string} [token]
 */
export async function adminUpdateHeroSlide(id, title, description, image, status = 1, token = null) {
  try {
    const payload = {
      id: Number(id),
      title: (title || "").trim().slice(0, 255),
      description: (description || "").trim().slice(0, 1000),
      image: (image || "").trim().slice(0, 255),
      status: Number(status)
    };

    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_hero_slide",
      payload,
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateHeroSlide:", err);
    return {
      status: 0,
      success: false,
      message: err.response?.data?.message || "Failed to update hero slide.",
      errors: err.response?.data?.errors || null
    };
  }
}


