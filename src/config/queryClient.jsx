import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * 🚀 Configuration React Query pour optimiser les performances
 * 
 * Ce QueryClient configure le cache global pour l'application :
 * - Cache de 5 minutes pour les catégories (rarement modifiées)
 * - Cache de 2 minutes pour les produits
 * - Cache de 30 secondes pour les données utilisateur
 * - Retry automatique en cas d'échec
 */

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // ⚡ Performance: Cache les données pour éviter les re-fetches inutiles
            staleTime: 1000 * 60 * 2, // 2 minutes - Les données sont considérées "fraîches" pendant 2 min
            cacheTime: 1000 * 60 * 5, // 5 minutes - Les données restent en cache pendant 5 min

            // 🔄 Retry: Réessayer automatiquement en cas d'échec
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // 🎯 Refetch: Ne pas re-fetcher automatiquement
            refetchOnWindowFocus: false, // Ne pas re-fetcher quand la fenêtre reprend le focus
            refetchOnReconnect: true, // Re-fetcher quand la connexion est rétablie
            refetchOnMount: false, // Ne pas re-fetcher au montage si les données sont en cache

            // 📊 Suspense: Désactivé par défaut
            suspense: false,
        },
        mutations: {
            // 🔄 Retry pour les mutations (POST, PUT, DELETE)
            retry: 1,
        },
    },
});

/**
 * 🎨 Provider Component
 * Wrapper pour l'application avec React Query
 */
export const QueryProvider = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {/* DevTools uniquement en développement */}
            {process.env.NODE_ENV === 'development' && (
                <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
            )}
        </QueryClientProvider>
    );
};

/**
 * 🔑 Query Keys
 * Clés standardisées pour le cache
 */
export const queryKeys = {
    // Catégories
    categories: ['categories'],
    category: (id) => ['category', id],
    categoryProducts: (id) => ['category', id, 'products'],

    // Produits
    products: ['products'],
    product: (id) => ['product', id],
    productsBySubCategory: (subId, filters) => ['products', 'subcategory', subId, filters],

    // Attributs
    attributes: (categoryId) => ['attributes', categoryId],

    // Promotions
    promotions: ['promotions'],
    promotion: (id) => ['promotion', id],

    // Deals
    deals: ['deals'],

    // Cadeaux
    gifts: ['gifts'],
    gift: (id) => ['gift', id],

    // Codes Promo
    promoCodes: ['promo-codes'],
    promoCode: (id) => ['promo-code', id],

    // Produits Gratuits
    freeProducts: ['free-products'],
    freeProduct: (id) => ['free-product', id],

    // Recettes
    recipes: ['recipes'],
    recipe: (id) => ['recipe', id],

    // Utilisateur
    user: ['user'],
    userProfile: ['user', 'profile'],
    userOrders: ['user', 'orders'],
    userFavorites: ['user', 'favorites'],

    // Banners
    banners: ['banners'],

    // Recommandations
    recommended: ['recommended'],
};

/**
 * 🎯 Cache Helpers
 * Fonctions utilitaires pour gérer le cache
 */
export const cacheHelpers = {
    /**
     * Invalider le cache pour une clé spécifique
     */
    invalidate: (queryKey) => {
        return queryClient.invalidateQueries({ queryKey });
    },

    /**
     * Précharger des données dans le cache
     */
    prefetch: async (queryKey, queryFn, options = {}) => {
        return queryClient.prefetchQuery({
            queryKey,
            queryFn,
            ...options,
        });
    },

    /**
     * Définir manuellement des données dans le cache
     */
    setData: (queryKey, data) => {
        queryClient.setQueryData(queryKey, data);
    },

    /**
     * Récupérer des données du cache
     */
    getData: (queryKey) => {
        return queryClient.getQueryData(queryKey);
    },

    /**
     * Effacer tout le cache
     */
    clearAll: () => {
        queryClient.clear();
    },

    /**
     * Effacer le cache pour un pattern spécifique
     */
    removeQueries: (queryKey) => {
        queryClient.removeQueries({ queryKey });
    },
};

export default queryClient;
