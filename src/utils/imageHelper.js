/**
 * Centralized Image URL Helper
 * Handles full URLs, relative paths, and fallbacks for all image types in the app.
 */

const BASE_API_URL = 'https://tn360-back-office-122923924979.europe-west1.run.app';
const GCP_STORAGE_URL = 'https://storage.googleapis.com/tn360-asset/articles';

export const getImageUrl = (item, type = 'product') => {
    // 1. Try to get the image string from various possible fields
    let imageString = '';

    if (typeof item === 'string') {
        imageString = item;
    } else if (item) {
        // Prefer image_url if provided by API (often for categories)
        if (item.image_url) imageString = item.image_url;

        // Product images
        if (item.img) imageString = item.img;
        // Category/Banner images
        else if (item.picture) imageString = item.picture;
        else if (item.image_path) imageString = item.image_path;
    }

    if (!imageString) {
        switch (type) {
            case 'category':
                return 'https://placehold.co/300x200?text=Categorie';
            case 'banner':
                return 'https://placehold.co/1200x400?text=Banner';
            case 'recipe':
                return 'https://storage.googleapis.com/tn360-asset/recipes/' + (imageString || 'default.png');
            default:
                return 'https://placehold.co/300x200?text=Produit';
        }
    }

    // 2. If it's already a full URL, return it
    if (imageString.startsWith('http')) {
        return imageString;
    }

    // 3. Handle relative paths
    // If it starts with 'images/', it's likely in GCP storage
    if (imageString.startsWith('images/')) {
        return `${GCP_STORAGE_URL}/${imageString}`;
    }

    // 4. Default fallback: use the current back-office storage/uploads path
    // We try /uploads/ first as it's common in this project's history
    return `${BASE_API_URL}/uploads/${imageString}`;
};

export const handleImageError = (e, type = 'product') => {
    const fallback = type === 'category'
        ? 'https://placehold.co/300x200?text=Categorie'
        : 'https://placehold.co/300x200?text=Image';

    if (e.target.src !== fallback) {
        e.target.src = fallback;
    }
};
