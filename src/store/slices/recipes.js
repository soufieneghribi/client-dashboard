import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1";

// Fetch featured recipes
export const fetchFeaturedRecipes = createAsyncThunk(
  "recipes/fetchFeatured",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/recipes/featured`);
      return data;
    } catch (error) {
      console.error("Error fetching featured recipes:", error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors du chargement des recettes"
      );
    }
  }
);

// Fetch all recipes
export const fetchAllRecipes = createAsyncThunk(
  "recipes/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/recipes`);
      return data;
    } catch (error) {
      console.error("Error fetching all recipes:", error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors du chargement des recettes"
      );
    }
  }
);

// Fetch recipe details
export const fetchRecipeDetails = createAsyncThunk(
  "recipes/fetchDetails",
  async (recipeId, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/recipes/${recipeId}`);
      return data;
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      return rejectWithValue(
        error.response?.data?.message || "Erreur lors du chargement de la recette"
      );
    }
  }
);

const recipesSlice = createSlice({
  name: "recipes",
  initialState: {
    featuredRecipes: [],
    allRecipes: [],
    currentRecipe: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRecipe: (state) => {
      state.currentRecipe = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Featured recipes
      .addCase(fetchFeaturedRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeaturedRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.featuredRecipes = action.payload;
        state.error = null;
      })
      .addCase(fetchFeaturedRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.featuredRecipes = [];
      })
      // All recipes
      .addCase(fetchAllRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.allRecipes = action.payload;
        state.error = null;
      })
      .addCase(fetchAllRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.allRecipes = [];
      })
      // Recipe details
      .addCase(fetchRecipeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecipeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecipe = action.payload;
        state.error = null;
      })
      .addCase(fetchRecipeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentRecipe } = recipesSlice.actions;

export const selectFeaturedRecipes = (state) => state.recipes.featuredRecipes;
export const selectAllRecipes = (state) => state.recipes.allRecipes;
export const selectCurrentRecipe = (state) => state.recipes.currentRecipe;
export const selectRecipesLoading = (state) => state.recipes.loading;
export const selectRecipesError = (state) => state.recipes.error;

export default recipesSlice.reducer;