
/**
 * Base URL configuration
 * Update this if your backend URL changes
 */
const CONFIG = {
  API_BASE_URL: "https://tn360-back-office-122923924979.europe-west1.run.app",
  STORAGE_BASE_URL: "https://storage.googleapis.com/tn360-asset",
};

/**
 * Fallback image configurations
 */
export const FALLBACK_IMAGES = {
  product: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='48'%3E📦%3C/text%3E%3C/svg%3E",
  recipe: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23fef3c7' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23f59e0b' font-size='48'%3E🍽️%3C/text%3E%3C/svg%3E",
  user: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23dbeafe' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%233b82f6' font-size='48'%3E👤%3C/text%3E%3C/svg%3E",
};

/**
 * Normalizes an image URL to ensure it's an absolute URL
 * 
 * @param {string|null|undefined} imageUrl - The image URL from API (absolute or relative)
 * @param {string} baseUrl - Base URL for relative paths (defaults to API_BASE_URL)
 * @returns {string|null} - Normalized absolute URL or null if no URL provided
 * 
 * @example
 * // Absolute URL (unchanged)
 * normalizeImageUrl("https://storage.googleapis.com/...") 
 * // => "https://storage.googleapis.com/..."
 * 
 * // Relative path (converted to absolute)
 * normalizeImageUrl("images/product.jpg") 
 * // => "https://tn360-back-office-122923924979.europe-west1.run.app/images/product.jpg"
 * 
 * // Path with leading slash
 * normalizeImageUrl("/uploads/product.jpg")
 * // => "https://tn360-back-office-122923924979.europe-west1.run.app/uploads/product.jpg"
 */
export const normalizeImageUrl = (imageUrl, baseUrl = CONFIG.API_BASE_URL) => {
  // Return null if no URL provided
  if (!imageUrl || typeof imageUrl !== 'string') {
    return null;
  }

  // Trim whitespace
  const trimmedUrl = imageUrl.trim();

  // If it's already a complete URL (starts with http:// or https://)
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
    return trimmedUrl;
  }

  // If it's a data URL (base64 encoded image)
  if (trimmedUrl.startsWith('data:')) {
    return trimmedUrl;
  }

  // If it's a relative path, prepend the base URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = trimmedUrl.startsWith('/') ? trimmedUrl.slice(1) : trimmedUrl;
  return `${baseUrl}/${cleanPath}`;
};

/**
 * Gets the appropriate image URL with fallback
 * 
 * @param {string|null|undefined} imageUrl - The image URL to normalize
 * @param {string} fallbackType - Type of fallback image ('product', 'recipe', 'user')
 * @returns {string} - Normalized URL or fallback image
 * 
 * @example
 * getImageUrl(product.img, 'product')
 */
export const getImageUrl = (imageUrl, fallbackType = 'product') => {
  const normalizedUrl = normalizeImageUrl(imageUrl);
  return normalizedUrl || FALLBACK_IMAGES[fallbackType] || FALLBACK_IMAGES.product;
};

/**
 * Creates a universal image error handler
 * Sets fallback image and optionally logs error
 * 
 * @param {Event} event - The error event
 * @param {string} itemName - Name of the item for logging
 * @param {string} fallbackType - Type of fallback image
 * @param {boolean} logError - Whether to log the error (default: true)
 * 
 * @example
 * <img 
 *   src={imageUrl} 
 *   onError={(e) => handleImageError(e, product.name, 'product')} 
 * />
 */
export const handleImageError = (
  event, 
  itemName, 
  fallbackType = 'product', 
  logError = true
) => {
  if (logError) {
    console.warn(`Failed to load image for ${itemName}`, {
      attempted: event.target.src,
      timestamp: new Date().toISOString()
    });
  }
  
  event.target.src = FALLBACK_IMAGES[fallbackType] || FALLBACK_IMAGES.product;
};

/**
 * Preloads an image to check if it's accessible
 * Useful for validating image URLs before rendering
 * 
 * @param {string} url - The image URL to preload
 * @returns {Promise<boolean>} - Resolves to true if image loads, false otherwise
 * 
 * @example
 * const isValid = await preloadImage(imageUrl);
 * if (!isValid) {
 *   // Use fallback
 * }
 */
export const preloadImage = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Validates if a string is a valid image URL
 * 
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL format
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // Check if it's a data URL
    if (url.startsWith('data:image/')) return true;
    
    // Try to parse as URL
    const urlObj = new URL(url, window.location.origin);
    
    // Check if it has common image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const hasImageExtension = imageExtensions.some(ext => 
      urlObj.pathname.toLowerCase().endsWith(ext)
    );
    
    return hasImageExtension || urlObj.pathname.includes('image');
  } catch {
    return false;
  }
};

/**
 * Converts an article/product image path to full URL
 * Specifically handles the uploads directory structure
 * 
 * @param {string} imagePath - The image path from article object
 * @returns {string} - Full image URL
 * 
 * @example
 * getArticleImageUrl("68b6952c680da_SAUCE TOMATE.jpg")
 * // => "https://storage.googleapis.com/tn360-asset/articles/68b6952c680da_SAUCE TOMATE.jpg"
 */
export const getArticleImageUrl = (imagePath) => {
  if (!imagePath) return FALLBACK_IMAGES.product;
  
  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's in the storage bucket format
  if (imagePath.includes('storage.googleapis.com')) {
    return imagePath;
  }
  
  // If it starts with "images/" or "uploads/", construct the full URL
  if (imagePath.startsWith('images/') || imagePath.startsWith('uploads/')) {
    return `${CONFIG.API_BASE_URL}/${imagePath}`;
  }
  
  // Otherwise, assume it's in the articles folder of the storage bucket
  return `${CONFIG.STORAGE_BASE_URL}/articles/${imagePath}`;
};

/**
 * Batch normalize multiple image URLs
 * Useful for processing arrays of products/recipes
 * 
 * @param {Array} items - Array of items with image properties
 * @param {string} imageKey - Key name for the image property (default: 'img')
 * @returns {Array} - Items with normalized image URLs
 * 
 * @example
 * const normalizedProducts = normalizeImageUrls(products, 'img');
 */
export const normalizeImageUrls = (items, imageKey = 'img') => {
  if (!Array.isArray(items)) return items;
  
  return items.map(item => ({
    ...item,
    [imageKey]: normalizeImageUrl(item[imageKey])
  }));
};

export default {
  normalizeImageUrl,
  getImageUrl,
  handleImageError,
  preloadImage,
  isValidImageUrl,
  getArticleImageUrl,
  normalizeImageUrls,
  FALLBACK_IMAGES,
  CONFIG
};
