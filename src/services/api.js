import {
  mockShopInfo,
  mockSlides,
  mockGalleryImages,
  mockVideos,
  mockAboutContent,
  mockReviews,
} from "./mockData";

// Helper helper to simulate network delay
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch hero carousel slides
 * @returns {Promise<Array>} Array of slide objects
 */
export async function getSlides() {
  await delay(300);
  return mockSlides;
}

/**
 * Fetch gallery images filtered optionally by category
 * @param {string} category Optional category name filter ('All' or specific category)
 * @returns {Promise<Array>} Array of gallery image items
 */
export async function getGalleryImages(category = "All") {
  await delay(350);
  if (!category || category === "All") {
    return mockGalleryImages;
  }
  return mockGalleryImages.filter(
    (item) => item.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Fetch embedded YouTube videos list
 * @returns {Promise<Array>} Array of video objects
 */
export async function getVideos() {
  await delay(300);
  return mockVideos;
}

/**
 * Fetch customer reviews
 * @returns {Promise<Array>} Array of review objects
 */
export async function getReviews() {
  await delay(300);
  return mockReviews;
}

/**
 * Fetch About Us story & content
 * @returns {Promise<Object>} About content object
 */
export async function getAboutContent() {
  await delay(300);
  return mockAboutContent;
}

/**
 * Fetch shop contact info, address, socials, and QR code info
 * @returns {Promise<Object>} Shop info object
 */
export async function getContactInfo() {
  await delay(250);
  return mockShopInfo;
}

/**
 * Submit an enquiry form
 * @param {Object} formData { name: string, phone: string, message: string }
 * @returns {Promise<Object>} Response object { success: boolean, message: string, enquiryId: string }
 */
export async function submitEnquiry(formData) {
  await delay(700);

  // Simple runtime validation safeguard
  if (!formData.name || !formData.phone || !formData.message) {
    return {
      success: false,
      message: "Please complete all required fields.",
    };
  }

  // Return simulated successful response
  return {
    success: true,
    message: "Thank you for reaching out! Our jewellery expert will contact you shortly.",
    enquiryId: `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
    submittedAt: new Date().toISOString(),
  };
}

/**
 * Register a new jewellery shop on the platform
 * @param {Object} regData { shopName, ownerName, phone, email, city, specialization, password }
 * @returns {Promise<Object>} Response object { success: boolean, shopId: string, message: string }
 */
export async function registerShop(regData) {
  await delay(600);

  if (!regData.shopName || !regData.ownerName || !regData.phone || !regData.email) {
    return {
      success: false,
      message: "Please fill in all required registration fields.",
    };
  }

  const shopId = `SHOP-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    success: true,
    shopId,
    shopName: regData.shopName,
    message: `Congratulations! ${regData.shopName} has been registered successfully on Agadam Platform.`,
    registeredAt: new Date().toISOString(),
  };
}

