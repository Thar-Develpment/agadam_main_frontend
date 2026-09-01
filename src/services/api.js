import { apiClient, getTenantSubdomain } from "./apiClient";
import {
  mockShopInfo,
  mockSlides,
  mockReviews,
  mockAboutContent,
} from "./mockData";

/**
 * Utility helper to extract YouTube ID from standard video URLs
 * Supports: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, etc.
 */
function extractYoutubeId(url) {
  if (!url) return "";
  // Check if it's already just an ID (no slashes)
  if (!url.includes("/") && !url.includes("?")) {
    return url;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : url;
}

/**
 * Fetch hero carousel slides (No backend API, fallback to mock slides)
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
      const names = res.data.data.map(cat => cat.category_name);
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
 * Hits the backend `/user/gallery_categories` and `/user/galler_details` (preserving backend typo)
 * @param {string} categoryName Optional category name filter ('All' or specific category)
 * @returns {Promise<Array>} Array of gallery image items
 */
export async function getGalleryImages(categoryName = "All") {
  try {
    const subdomain = getTenantSubdomain();
    
    // 1. Fetch categories to build an ID-to-Name map
    let categoriesMap = new Map();
    try {
      const catRes = await apiClient.post("/user/gallery_categories", { subdomain });
      if (catRes.data && catRes.data.status === 1 && Array.isArray(catRes.data.data)) {
        catRes.data.data.forEach((cat) => {
          categoriesMap.set(cat.id, cat.category_name);
        });
      }
    } catch (catErr) {
      console.warn("Failed to fetch gallery categories from backend:", catErr);
    }

    // 2. Fetch the gallery details
    const res = await apiClient.post("/user/galler_details", { subdomain });
    if (res.data && res.data.status === 1 && Array.isArray(res.data.data)) {
      // Map backend database format to frontend card format
      const mappedImages = res.data.data.map((item) => {
        const mappedCategory = categoriesMap.get(item.category_id) || "General";
        return {
          id: item.id.toString(),
          title: `${mappedCategory} Collection`, // Fallback title based on category
          category: mappedCategory,
          purity: "22K BIS Hallmarked", // Standard default
          imageUrl: item.image_url,
          description: "Exquisite handcrafted design.", // Placeholder description
          code: `AG-ITM-${item.id}`, // Generated fallback code
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
          id: item.id.toString(),
          title: "Featured Video Showcase", // Placeholder title
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
 * Fetch customer reviews (No backend API, fallback to mock reviews)
 * @returns {Promise<Array>} Array of review objects
 */
export async function getReviews() {
  return mockReviews;
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
      // Find the first active story or the latest one
      const activeStory = res.data.data.find(story => story.status === 1) || res.data.data[0];
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
 * Fetch shop contact info (No backend API, fallback to mock with dynamic shop name if URL available)
 * @returns {Promise<Object>} Shop info object
 */
export async function getContactInfo() {
  const subdomain = getTenantSubdomain();
  // Extract clean name prefix for branding purposes
  const shopNamePrefix = subdomain.split(".")[0].toUpperCase();
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
    // Prepend customer phone number into query text since am_asked_questions table stores (subdomain, customer_name, email, query)
    const cleanPhone = formData.phone ? formData.phone.trim() : "";
    const queryText = cleanPhone
      ? `[Phone: ${cleanPhone}]\n${formData.message.trim()}`
      : formData.message.trim();

    const payload = {
      subdomain,
      customer_name: formData.name.trim().slice(0, 20), // Enforce 20 chars
      email: formData.email.trim().slice(0, 255),
      query: queryText.slice(0, 1000), // Enforce 1000 chars
    };

    const res = await apiClient.post("/user/ask_question", payload);
    
    if (res.data && res.data.status === 1) {
      return {
        success: true,
        message: res.data.message || "Submitted successfully!",
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
      shop_name: regData.shopName.trim().slice(0, 10), // Max 10 chars
      owner_name: regData.ownerName.trim().slice(0, 150),
      email: regData.email.trim().slice(0, 255),
      password: regData.password,
      city: regData.city.trim().slice(0, 12), // Max 12 chars
    };

    const res = await apiClient.post("/auth/register", payload);
    
    if (res.data && res.data.success === 1) {
      return {
        success: true,
        message: res.data.message || "Registered successfully!",
        domain: res.data.data?.domain || `${regData.shopName.toLowerCase()}.aadagam.com`,
        shopName: res.data.data?.shop_name || regData.shopName,
        shopId: res.data.data?.id || `SHOP-${Math.floor(1000 + Math.random() * 9000)}`,
        registeredAt: new Date().toISOString(),
      };
    } else {
      return {
        success: false,
        message: res.data.message || "Registration failed.",
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

/**
 * ============================================================================
 * ADMIN APIs (`/opxXxolN7m6CU`) with JWT Authentication
 * ============================================================================
 */

/**
 * Add a new gallery category for the authenticated tenant
 * @param {string} categoryName Category name (Max 30 chars)
 * @param {string} token Optional JWT token
 */
export async function adminAddCategory(categoryName, token = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await apiClient.post(
      "/opxXxolN7m6CU/add_category",
      { category_name: categoryName.slice(0, 30) },
      { headers }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminAddCategory:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to add category." };
  }
}

/**
 * Fetch paginated categories for the authenticated tenant
 * @param {number} pageNo Page index (starts at 0)
 * @param {number} pageSize Items per page
 * @param {string} token Optional JWT token
 */
export async function adminGetAllCategories(pageNo = 0, pageSize = 10, token = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_all_category",
      { pageNo, pageSize },
      { headers }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetAllCategories:", err);
    return { status: 0, totalRecords: 0, data: [] };
  }
}

/**
 * Fetch a single category by ID
 * @param {number} id Category ID
 * @param {string} token Optional JWT token
 */
export async function adminGetSingleCategory(id, token = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await apiClient.post(
      "/opxXxolN7m6CU/get_single_category",
      { id },
      { headers }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminGetSingleCategory:", err);
    return { status: 0, message: "Category not found" };
  }
}

/**
 * Update an existing category
 * @param {number} id Category ID
 * @param {string} categoryName New Category Name
 * @param {number} status 1 for Active, 0 for Inactive
 * @param {string} token Optional JWT token
 */
export async function adminUpdateCategory(id, categoryName, status = 1, token = null) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await apiClient.post(
      "/opxXxolN7m6CU/update_category",
      { id, category_name: categoryName.slice(0, 30), status },
      { headers }
    );
    return res.data;
  } catch (err) {
    console.error("Error in adminUpdateCategory:", err);
    return { status: 0, message: err.response?.data?.message || "Failed to update category." };
  }
}
