import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { blogService } from "../../services/api";

export const fetchAllPosts = createAsyncThunk(
    "blog/fetchAllPosts",
    async (params, { rejectWithValue }) => {
        try {
            const response = await blogService.getAll(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchFeaturedPosts = createAsyncThunk(
    "blog/fetchFeaturedPosts",
    async (_, { rejectWithValue }) => {
        try {
            const response = await blogService.getFeatured();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchPostDetails = createAsyncThunk(
    "blog/fetchPostDetails",
    async (idOrSlug, { rejectWithValue }) => {
        try {
            const response = await blogService.getDetails(idOrSlug);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const blogSlice = createSlice({
    name: "blog",
    initialState: {
        posts: [],
        featuredPosts: [],
        currentPost: null,
        loading: false,
        featuredLoading: false,
        detailsLoading: false,
        error: null,
        meta: null,
    },
    reducers: {
        clearCurrentPost: (state) => {
            state.currentPost = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All Posts
            .addCase(fetchAllPosts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllPosts.fulfilled, (state, action) => {
                state.loading = false;
                // Normalize data from backend (image_url -> image, provide default tags)
                state.posts = action.payload.data.map(post => ({
                    ...post,
                    image: post.image_url || post.img || post.image,
                    tags: post.tags || ["Actualité"] // Fallback since backend might not have tags
                }));
                state.meta = action.payload.meta;
            })
            .addCase(fetchAllPosts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Featured Posts
            .addCase(fetchFeaturedPosts.pending, (state) => {
                state.featuredLoading = true;
            })
            .addCase(fetchFeaturedPosts.fulfilled, (state, action) => {
                state.featuredLoading = false;
                state.featuredPosts = action.payload.data.map(post => ({
                    ...post,
                    image: post.image_url || post.img || post.image,
                    tags: post.tags || ["Actualité"]
                }));
            })
            .addCase(fetchFeaturedPosts.rejected, (state, action) => {
                state.featuredLoading = false;
            })
            // Fetch Post Details
            .addCase(fetchPostDetails.pending, (state) => {
                state.detailsLoading = true;
                state.error = null;
            })
            .addCase(fetchPostDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                const post = action.payload.data;
                state.currentPost = {
                    ...post,
                    image: post.image_url || post.img || post.image,
                    tags: post.tags || ["Actualité"]
                };
            })
            .addCase(fetchPostDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentPost } = blogSlice.actions;
export default blogSlice.reducer;
