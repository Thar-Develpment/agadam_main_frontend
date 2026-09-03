import { apiClient, getTenantSubdomain, getShopPrefix, parseJwt } from "./apiClient";
import {
  mockShopInfo,
  mockSlides,
  mockAboutContent,
} from "./mockData";

/**
 * Robust helper to extract YouTube ID from standard or shortened video URLs
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, etc.
 * @param {string} url 
 * @returns {string} Clean 11-char YouTube ID or sanitized string
 */
export function extractYoutubeId(url = "") {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  
  // If already an 11-char alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  return match ? match[1] : trimmed;
}

/* ==========================================================================
 * 1. PUBLIC STOREFRONT & SYSTEM MODULE (`/user` & `/auth`)
 * ========================================================================== */

/**
 * Fetch hero carousel slides (Fallback to showroom slides)
 * @returns {Promise<Array>} Array of slide objects
 */
export async function getSlides() {
  return mockSlides;
}

/**
 * Fetch list of category names from backend `/user/gallery_categories`
 * @returns {Promise<Array>} Array of category names (e.g., ["All", "Necklaces", "Earrings"])
 */
export async function getGalleryCategories() {
  try {
    const subdomain = getTenantSubdomain();
    const res = await apiClient.post("/user/gallery_categories", { subdomain });
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
    
    // 1. Fetch categories to build an ID-to-Name map
    const categoriesMap = new Map();
    try {
      const catRes = await apiClient.post("/user/gallery_categories", { subdomain });
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
    const res = await apiClient.post("/user/galler_details", { subdomain });
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
    const res = await apiClient.post("/user/videos_details", { subdomain });
    
    if (res.data && res.data.status === 1 && Array.isArray(res.data.data)) {
      return res.data.data.map((item) => {
        const youtubeId = extractYoutubeId(item.video_url);
        return {
          id: item.id?.toString() || Math.random().toString(),
          title: "Featured Showroom Showcase",
          youtubeId: youtubeId,
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
 * Fetch About Us story & content from backend `/user/our_stories`
 * @returns {Promise<Object>} About content object
 */
export async function getAboutContent() {
  try {
    const subdomain = getTenantSubdomain();
    const res = await apiClient.post("/user/our_stories", { subdomain });
    
    if (res.data && res.data.status === 1 && Array.isArray(res.data.data) && res.data.data.length > 0) {
      const activeStory = res.data.data.find((story) => story.status === 1) || res.data.data[0];
      return {
        ...mockAboutContent,
        historyParagraphs: [activeStory.content],
      };
    }
    return mockAboutContent;
  } catch (err) {
    console.error("Error in getAboutContent:", err);
    return mockAboutContent;
  }
}

/**
 * Fetch live metal/bullion prices and site info from backend `GET /user/site_info`
 * @returns {Promise<Object>} { success: number, priceData: Array<{ material, purity, price }> }
 */
export async function getSiteInfo() {
  try {
    const res = await apiClient.get("/user/site_info");
    if (res.data && (res.data.success === 1 || res.data.status === 1)) {
      return {
        success: 1,
        priceData: res.data.priceData || res.data.data || [],
        message: res.data.message || "Prices fetched successfully",
      };
    }
    return { success: 0, priceData: [], message: "No price data found" };
  } catch (err) {
    console.error("Error in getSiteInfo:", err);
    return { success: 0, priceData: [], message: err.message };
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
    const payload = {
      shop_name: (regData.shopName || "").trim().slice(0, 10),
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

// Helper to construct Authorization header if token provided explicitly
function getAuthHeader(token = null) {
  if (token) return { Authorization: `Bearer ${token}` };
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
    const res = await apiClient.post("/opxXxolN7m6CU/login", {
      email: (email || "").trim(),
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
        message: res.data.message || "Login success",
        user: userSession,
      };
    }

    return {
      status: 0,
      message: res.data?.message || "Invalid credentials",
    };
  } catch (err) {
    console.error("Error in adminLogin:", err);
    return {
      status: 0,
      message: err.response?.data?.message || err.message || "Login failed",
    };
  }
}

/**
 * Fetch Admin Dashboard overview statistics from `GET /opxXxolN7m6CU/dash_board`
 * @param {string} token Optional JWT token
 * @returns {Promise<Object>} { success: number, register_count: number, priceData: Array }
 */
export async function adminGetDashboardStats(token = null) {
  try {
    const res = await apiClient.get("/opxXxolN7m6CU/dash_board", {
      headers: getAuthHeader(token),
    });
    if (res.data && (res.data.success === 1 || res.data.status === 1)) {
      return {
        success: 1,
        register_count: res.data.register_count || 0,
        priceData: res.data.priceData || [],
        message: res.data.message || "success",
      };
    }
    return { success: 0, register_count: 0, priceData: [] };
  } catch (err) {
    console.error("Error in adminGetDashboardStats:", err);
    return { success: 0, register_count: 0, priceData: [] };
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
    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_category",
      { id: Number(id), category_name: (categoryName || "").trim().slice(0, 30), status },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateCategory:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update category." };
  }
}

/* ------------------ B. GALLERY IMAGES ------------------ */

export async function adminAddGallery(categoryId, imageUrl, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/add_gallery",
      {
        category_id: Number(categoryId),
        image_url: (imageUrl || "").trim().slice(0, 100),
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
    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_gallery",
      {
        id: Number(id),
        category_id: Number(categoryId),
        image_url: (imageUrl || "").trim().slice(0, 100),
        status,
      },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateGallery:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update gallery image." };
  }
}

/* ------------------ C. SHOWCASE VIDEOS ------------------ */

export async function adminAddVideo(videoUrl, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/add_video",
      { video_url: (videoUrl || "").trim().slice(0, 100) },
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
    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_video",
      { id: Number(id), video_url: (videoUrl || "").trim().slice(0, 100), status },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateVideo:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update video." };
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

export async function adminAddOurStory(content, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/add_our_story",
      { content: (content || "").trim() },
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

export async function adminUpdateOurStory(id, content, token = null) {
  try {
    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_our_story",
      { id: Number(id), content: (content || "").trim() },
      { headers: getAuthHeader(token) }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateOurStory:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update story." };
  }
}
