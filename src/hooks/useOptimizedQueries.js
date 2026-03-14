import { useQuery } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { queryKeys } from '../config/queryClient.jsx';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

/**
 * 🚀 Hook optimisé pour charger les catégories avec cache
 * 
 * Ce hook utilise React Query pour :
 * - Mettre en cache les catégories pendant 5 minutes
 * - Éviter les re-fetches inutiles
 * - Partager les données entre tous les composants
 * 
 * @returns {Object} { categories, isLoading, error, refetch }
 */
export const useCategories = () => {
    const dispatch = useDispatch();

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.categories,
        queryFn: async () => {
            const response = await axios.get(`${API_BASE_URL}/categories`);
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes - Les catégories changent rarement
        cacheTime: 1000 * 60 * 10, // 10 minutes en cache
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Ne pas re-fetcher si déjà en cache
    });

    return {
        categories: data || [],
        isLoading,
        error,
        refetch,
    };
};

/**
 * 🚀 Hook optimisé pour charger les produits d'une sous-catégorie avec cache
 * 
 * @param {number} subId - ID de la sous-catégorie
 * @param {Object} filters - Filtres appliqués (prix, attributs, etc.)
 * @returns {Object} { products, isLoading, error, refetch }
 */
export const useProductsBySubCategory = (subId, filters = {}) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.productsBySubCategory(subId, filters),
        queryFn: async () => {
            const params = new URLSearchParams({
                ...filters,
                page: filters.page || 1,
            });

            const response = await axios.get(
                `${API_BASE_URL}/products/category/${subId}?${params}`
            );
            return response.data;
        },
        enabled: !!subId, // Ne charger que si subId existe
        staleTime: 1000 * 60 * 2, // 2 minutes
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        keepPreviousData: true, // Garder les données précédentes pendant le chargement
    });

    return {
        products: data?.products || data?.data || [],
        pagination: {
            currentPage: data?.current_page || 1,
            lastPage: data?.last_page || 1,
            total: data?.total || 0,
        },
        isLoading,
        error,
        refetch,
    };
};

/**
 * 🚀 Hook optimisé pour charger les attributs d'une catégorie
 * 
 * @param {number} categoryId - ID de la catégorie
 * @returns {Object} { attributes, isLoading, error }
 */
export const useAttributes = (categoryId) => {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.attributes(categoryId),
        queryFn: async () => {
            const response = await axios.get(
                `${API_BASE_URL}/attributes/${categoryId}`
            );
            return response.data;
        },
        enabled: !!categoryId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
    });

    return {
        attributes: data || [],
        isLoading,
        error,
    };
};

/**
 * 🚀 Hook optimisé pour charger un produit spécifique
 * 
 * @param {number} productId - ID du produit
 * @returns {Object} { product, isLoading, error }
 */
export const useProduct = (productId) => {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.product(productId),
        queryFn: async () => {
            const response = await axios.get(
                `${API_BASE_URL}/products/${productId}`
            );
            return response.data;
        },
        enabled: !!productId,
        staleTime: 1000 * 60 * 3, // 3 minutes
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
    });

    return {
        product: data,
        isLoading,
        error,
    };
};

/**
 * 🚀 Hook optimisé pour charger les produits recommandés
 * 
 * @returns {Object} { recommended, isLoading, error }
 */
export const useRecommended = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.recommended,
        queryFn: async () => {
            const response = await axios.get(
                `${API_BASE_URL}/products/recommended`
            );
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
    });

    return {
        recommended: data || [],
        isLoading,
        error,
    };
};

/**
 * 🚀 Hook optimisé pour charger les banners
 * 
 * @returns {Object} { banners, isLoading, error }
 */
export const useBanners = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: queryKeys.banners,
        queryFn: async () => {
            const response = await axios.get(
                `${API_BASE_URL}/banners`
            );
            return response.data;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes - Les banners changent rarement
        cacheTime: 1000 * 60 * 30, // 30 minutes
        refetchOnWindowFocus: false,
    });

    return {
        banners: data || [],
        isLoading,
        error,
    };
};
