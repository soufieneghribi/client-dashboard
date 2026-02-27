import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

// ===================================
// ASYNC THUNKS
// ===================================

/**
 * Get all wishlist items
 */
export const fetchWishlist = createAsyncThunk(
    "wishlist/fetchWishlist",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                API_ENDPOINTS.WISHLIST.ALL,
                {
                    headers: getAuthHeaders(),
                }
            );


            // Extract data from API response
            let wishlistData = response.data.data || response.data.wishlist || response.data || [];

            // Map API fields to expected product structure
            const mappedData = Array.isArray(wishlistData) ? wishlistData.map(item => ({
                id: item.product_id || item.id,
                wishlist_id: item.id, // Keep original wishlist item ID for removal
                name: item.product_name || item.name,
                img: item.product_image || item.img,
                price: item.product_price || item.price,
                discount_price: item.discount_price,
                category_name: item.category_name,
                is_available: item.is_available !== undefined ? item.is_available : true,
                created_at: item.created_at,
                updated_at: item.updated_at,
            })) : [];


            return mappedData;
        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message || "Échec du chargement des favoris"
            );
        }
    }
);

/**
 * Add item to wishlist
 */
export const addToWishlist = createAsyncThunk(
    "wishlist/addToWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.WISHLIST.ADD,
                { product_id: productId },
                {
                    headers: getAuthHeaders(),
                }
            );

            // 
            return response.data;
        } catch (error) {

            // 
            return rejectWithValue(
                error.response?.data?.message || "Échec de l'ajout aux favoris"
            );
        }
    }
);

/**
 * Remove item from wishlist
 */
export const removeFromWishlist = createAsyncThunk(
    "wishlist/removeFromWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.WISHLIST.REMOVE,
                { product_id: productId },
                {
                    headers: getAuthHeaders(),
                }
            );

            // 
            return productId;
        } catch (error) {

            // 
            return rejectWithValue(
                error.response?.data?.message || "Échec de la suppression"
            );
        }
    }
);

/**
 * Toggle wishlist item
 */
export const toggleWishlist = createAsyncThunk(
    "wishlist/toggleWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.WISHLIST.TOGGLE,
                { product_id: productId },
                {
                    headers: getAuthHeaders(),
                }
            );



            const isAdded = response.data.action === 'added';
            // 

            return {
                productId,
                isAdded,
                wishlist: response.data.wishlist || response.data.data || []
            };
        } catch (error) {

            // 
            return rejectWithValue(
                error.response?.data?.message || "Erreur lors de la modification"
            );
        }
    }
);

/**
 * Check if product is in wishlist
 */
export const checkWishlist = createAsyncThunk(
    "wishlist/checkWishlist",
    async (productId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                API_ENDPOINTS.WISHLIST.CHECK(productId),
                {
                    headers: getAuthHeaders(),
                }
            );
            return {
                productId,
                isInWishlist: response.data.in_wishlist || false
            };
        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message || "Échec de la vérification"
            );
        }
    }
);

/**
 * Batch check multiple products
 */
export const batchCheckWishlist = createAsyncThunk(
    "wishlist/batchCheckWishlist",
    async (productIds, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.WISHLIST.BATCH_CHECK,
                { product_ids: productIds },
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data.results || {};
        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message || "Échec de la vérification"
            );
        }
    }
);

/**
 * Clear all wishlist items
 */
export const clearWishlist = createAsyncThunk(
    "wishlist/clearWishlist",
    async (_, { rejectWithValue }) => {
        try {
            await axios.post(
                API_ENDPOINTS.WISHLIST.CLEAR,
                {},
                {
                    headers: getAuthHeaders(),
                }
            );
            // 
            return [];
        } catch (error) {

            // 
            return rejectWithValue(
                error.response?.data?.message || "Échec du vidage des favoris"
            );
        }
    }
);

/**
 * Get wishlist count
 */
export const getWishlistCount = createAsyncThunk(
    "wishlist/getWishlistCount",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                API_ENDPOINTS.WISHLIST.COUNT,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data.count || 0;
        } catch (error) {

            return rejectWithValue(
                error.response?.data?.message || "Échec du comptage"
            );
        }
    }
);

// ===================================
// SLICE CONFIGURATION
// ===================================

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        items: [],
        loading: false,
        error: null,
        count: 0,
        checkedProducts: {}, // { productId: boolean }
    },
    reducers: {
        clearWishlistError: (state) => {
            state.error = null;
        },
        setWishlistCount: (state, action) => {
            state.count = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
                state.count = action.payload.length;

                // Sync checkedProducts with current items in wishlist
                const checked = {};
                action.payload.forEach(item => {
                    checked[item.id] = true;
                });
                state.checkedProducts = checked;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;

            })

            // Add to Wishlist
            .addCase(addToWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.wishlist) {
                    state.items = action.payload.wishlist;
                    state.count = action.payload.wishlist.length;
                }
            })
            .addCase(addToWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Remove from Wishlist
            .addCase(removeFromWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.loading = false;
                // Remove by product_id (action.payload is the productId)
                state.items = state.items.filter(
                    (item) => item.id !== action.payload
                );
                state.count = state.items.length;
                delete state.checkedProducts[action.payload];

            })
            .addCase(removeFromWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Toggle Wishlist
            .addCase(toggleWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                state.loading = false;
                const { productId, isAdded } = action.payload;

                // Update checked products status
                state.checkedProducts[productId] = isAdded;

                // If added, we need to refetch to get the full item data
                // If removed, filter it out
                if (!isAdded) {
                    state.items = state.items.filter(item => item.id !== productId);
                    state.count = state.items.length;
                }


            })
            .addCase(toggleWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Check Wishlist
            .addCase(checkWishlist.fulfilled, (state, action) => {
                state.checkedProducts[action.payload.productId] = action.payload.isInWishlist;
            })

            // Batch Check Wishlist
            .addCase(batchCheckWishlist.fulfilled, (state, action) => {
                state.checkedProducts = { ...state.checkedProducts, ...action.payload };
            })

            // Clear Wishlist
            .addCase(clearWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(clearWishlist.fulfilled, (state) => {
                state.loading = false;
                state.items = [];
                state.count = 0;
                state.checkedProducts = {};
            })
            .addCase(clearWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Get Wishlist Count
            .addCase(getWishlistCount.fulfilled, (state, action) => {
                state.count = action.payload;
            });
    },
});

// ===================================
// EXPORTS
// ===================================

export const { clearWishlistError, setWishlistCount } = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistLoading = (state) => state.wishlist.loading;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectWishlistCount = (state) => state.wishlist.count;
export const selectIsInWishlist = (productId) => (state) =>
    state.wishlist.checkedProducts[productId] || false;

export default wishlistSlice.reducer;


