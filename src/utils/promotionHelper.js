/**
 * Promotion Helper Utility
 * Gère automatiquement les promotions pour tous les produits
 * Garantit que les prix avec promotion sont toujours appliqués correctement
 */

import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from '../services/api';

// Cache pour les promotions (évite les appels API répétés)
let promotionsCache = {
  data: null,
  timestamp: null,
  clientId: null
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Récupère le token d'authentification
 */
const getAuthToken = () => {
  try {
    return localStorage.getItem("token") || null;
  } catch (error) {
    return null;
  }
};

/**
 * Récupère les promotions actives pour un client
 * Utilise un cache pour éviter les appels API répétés
 */
export const fetchClientPromotions = async (clientId) => {
  try {
    // Vérifier le cache
    const now = Date.now();
    if (
      promotionsCache.data &&
      promotionsCache.clientId === clientId &&
      promotionsCache.timestamp &&
      (now - promotionsCache.timestamp) < CACHE_DURATION
    ) {
      return promotionsCache.data;
    }

    // Récupérer les promotions depuis l'API
    const token = getAuthToken();
    if (!token || !clientId) {
      return [];
    }

    const response = await axios.get(
      API_ENDPOINTS.PROMOTIONS.BY_CLIENT(clientId),
      {
        headers: getAuthHeaders(token),
        timeout: 10000
      }
    );

    const promotions = response.data?.data || response.data?.promotions || [];
    
    // Mettre à jour le cache
    promotionsCache = {
      data: promotions,
      timestamp: now,
      clientId: clientId
    };

    return promotions;
  } catch (error) {
    console.error("Erreur lors de la récupération des promotions:", error);
    return [];
  }
};

/**
 * Vérifie si un produit a une promotion active
 * Retourne les détails de la promotion si elle existe
 */
export const checkProductPromotion = async (productId, clientId) => {
  try {
    const promotions = await fetchClientPromotions(clientId);
    
    if (!promotions || promotions.length === 0) {
      return null;
    }

    // Parcourir toutes les promotions pour trouver le produit
    for (const promo of promotions) {
      if (!promo.articles || !Array.isArray(promo.articles)) {
        continue;
      }

      const productInPromo = promo.articles.find(
        article => parseInt(article.id) === parseInt(productId)
      );

      if (productInPromo) {
        return {
          hasPromotion: true,
          promo_id: promo.id,
          promo_name: promo.name,
          promo_discount: promo.discount_value,
          promo_start: promo.start_date,
          promo_end: promo.end_date,
          pivot: productInPromo.pivot,
          original_price: parseFloat(productInPromo.pivot?.original_price || productInPromo.price),
          promo_price: parseFloat(productInPromo.pivot?.promo_price || productInPromo.price),
          discount_percent: parseFloat(productInPromo.pivot?.discount_percent || 0)
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de la vérification de la promotion:", error);
    return null;
  }
};

/**
 * Enrichit les données d'un produit avec ses informations de promotion
 * Si le produit a une promotion active, ajoute les données de promotion
 */
export const enrichProductWithPromotion = async (product, clientId) => {
  try {
    if (!product || !product.id) {
      return product;
    }

    const promotionData = await checkProductPromotion(product.id, clientId);

    if (promotionData && promotionData.hasPromotion) {
      return {
        ...product,
        isPromotion: true,
        promo_id: promotionData.promo_id,
        promo_name: promotionData.promo_name,
        promo_discount: promotionData.promo_discount,
        promo_start: promotionData.promo_start,
        promo_end: promotionData.promo_end,
        pivot: {
          original_price: promotionData.original_price,
          promo_price: promotionData.promo_price,
          discount_percent: promotionData.discount_percent
        }
      };
    }

    return {
      ...product,
      isPromotion: false
    };
  } catch (error) {
    console.error("Erreur lors de l'enrichissement du produit:", error);
    return product;
  }
};

/**
 * Calcule le prix correct d'un produit (avec promotion si applicable)
 * Retourne { price, isPromotion, savings, promotionInfo }
 */
export const calculateProductPrice = async (product, clientId) => {
  try {
    const enrichedProduct = await enrichProductWithPromotion(product, clientId);

    if (enrichedProduct.isPromotion && enrichedProduct.pivot) {
      const originalPrice = parseFloat(enrichedProduct.pivot.original_price);
      const promoPrice = parseFloat(enrichedProduct.pivot.promo_price);
      
      return {
        price: promoPrice,
        originalPrice: originalPrice,
        isPromotion: true,
        savings: originalPrice - promoPrice,
        discountPercent: enrichedProduct.pivot.discount_percent,
        promotionInfo: {
          promo_id: enrichedProduct.promo_id,
          promo_name: enrichedProduct.promo_name,
          pivot: enrichedProduct.pivot
        }
      };
    }

    const basePrice = parseFloat(product.price || 0);
    return {
      price: basePrice,
      originalPrice: basePrice,
      isPromotion: false,
      savings: 0,
      discountPercent: 0,
      promotionInfo: null
    };
  } catch (error) {
    console.error("Erreur lors du calcul du prix:", error);
    const basePrice = parseFloat(product.price || 0);
    return {
      price: basePrice,
      originalPrice: basePrice,
      isPromotion: false,
      savings: 0,
      discountPercent: 0,
      promotionInfo: null
    };
  }
};

/**
 * Prépare les données d'un produit pour l'ajout au panier
 * Applique automatiquement les promotions si disponibles
 */
export const prepareProductForCart = async (product, quantity, clientId) => {
  try {
    const priceData = await calculateProductPrice(product, clientId);

    const cartItem = {
      id: product.id,
      name: product.name,
      img: product.img || product.picture,
      Initialprice: priceData.originalPrice.toFixed(3),
      price: priceData.price.toFixed(3),
      total: (priceData.price * quantity).toFixed(3),
      quantity: quantity,
      isPromotion: priceData.isPromotion,
      promo_name: priceData.isPromotion ? priceData.promotionInfo.promo_name : null,
      promo_id: priceData.isPromotion ? priceData.promotionInfo.promo_id : null
    };

    return {
      cartItem,
      priceData
    };
  } catch (error) {
    console.error("Erreur lors de la préparation du produit pour le panier:", error);
    
    // Fallback: retourner le produit sans promotion
    const basePrice = parseFloat(product.price || 0);
    return {
      cartItem: {
        id: product.id,
        name: product.name,
        img: product.img || product.picture,
        Initialprice: basePrice.toFixed(3),
        price: basePrice.toFixed(3),
        total: (basePrice * quantity).toFixed(3),
        quantity: quantity,
        isPromotion: false,
        promo_name: null,
        promo_id: null
      },
      priceData: {
        price: basePrice,
        originalPrice: basePrice,
        isPromotion: false,
        savings: 0,
        discountPercent: 0,
        promotionInfo: null
      }
    };
  }
};

/**
 * Invalide le cache des promotions
 * À appeler quand on sait que les promotions ont changé
 */
export const clearPromotionsCache = () => {
  promotionsCache = {
    data: null,
    timestamp: null,
    clientId: null
  };
};

/**
 * Enrichit une liste de produits avec leurs promotions
 * Utile pour les pages de liste de produits
 */
export const enrichProductListWithPromotions = async (products, clientId) => {
  try {
    if (!products || products.length === 0) {
      return [];
    }

    const promotions = await fetchClientPromotions(clientId);
    
    if (!promotions || promotions.length === 0) {
      return products.map(p => ({ ...p, isPromotion: false }));
    }

    // Créer un map des produits en promotion pour un accès rapide
    const promotionMap = new Map();
    
    promotions.forEach(promo => {
      if (promo.articles && Array.isArray(promo.articles)) {
        promo.articles.forEach(article => {
          promotionMap.set(parseInt(article.id), {
            promo_id: promo.id,
            promo_name: promo.name,
            promo_discount: promo.discount_value,
            promo_start: promo.start_date,
            promo_end: promo.end_date,
            pivot: article.pivot,
            original_price: parseFloat(article.pivot?.original_price || article.price),
            promo_price: parseFloat(article.pivot?.promo_price || article.price),
            discount_percent: parseFloat(article.pivot?.discount_percent || 0)
          });
        });
      }
    });

    // Enrichir chaque produit
    return products.map(product => {
      const promoData = promotionMap.get(parseInt(product.id));
      
      if (promoData) {
        return {
          ...product,
          isPromotion: true,
          promo_id: promoData.promo_id,
          promo_name: promoData.promo_name,
          promo_discount: promoData.promo_discount,
          promo_start: promoData.promo_start,
          promo_end: promoData.promo_end,
          pivot: {
            original_price: promoData.original_price,
            promo_price: promoData.promo_price,
            discount_percent: promoData.discount_percent
          }
        };
      }

      return {
        ...product,
        isPromotion: false
      };
    });
  } catch (error) {
    console.error("Erreur lors de l'enrichissement de la liste:", error);
    return products.map(p => ({ ...p, isPromotion: false }));
  }
};

export default {
  fetchClientPromotions,
  checkProductPromotion,
  enrichProductWithPromotion,
  calculateProductPrice,
  prepareProductForCart,
  clearPromotionsCache,
  enrichProductListWithPromotions
};