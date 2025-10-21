import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import store from "../index";
import { logout } from "./authSlice";

/**
 * User Redux Slice
 * Manages user authentication, profile, and related operations
 * All API calls are secure with proper error handling
 */

// ==================== CONSTANTS ====================
const API_BASE_URL = "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1";
const API_TIMEOUT = 15000;
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests

// ==================== HELPER FUNCTIONS ====================

// Rate limiting tracker
let lastRequestTime = 0;

/**
 * Enforces rate limiting between requests
 */
const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

/**
 * Retrieves authentication token from multiple sources
 * Priority: localStorage > Redux > Cookies
 * @returns {string|null} Authentication token
 */
const getAuthToken = () => {
  try {
    const localToken = localStorage.getItem("token");
    const state = store.getState();
    const reduxToken = state?.auth?.token;
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    return localToken || reduxToken || cookieToken || null;
  } catch (error) {
    return null;
  }
};

/**
 * Validates token by making API call
 * @param {string} token - Authentication token
 * @returns {Promise<boolean>} Token validity status
 */
const testTokenValidity = async (token) => {
  try {
    // Wait for rate limit before making request
    await waitForRateLimit();
    
    const response = await axios.get(
      `${API_BASE_URL}/customer/info1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    if (response.data && (response.data.id || response.data.email || response.data.ID_client)) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403) {
      return false;
    }
    
    if (error.response?.status === 429) {
      console.warn("Rate limit hit during token validation");
      return true; // Assume valid to allow retry later
    }
    
    // Network errors - assume valid to allow retry
    return true;
  }
};

// ==================== ASYNC THUNKS ====================

/**
 * Forget Password - Sends password reset email
 */
export const forgetPassword = createAsyncThunk(
  "user/forgetPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      await waitForRateLimit();
      
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/password/email`,
        { email }
      );
      toast.success("Un lien de réinitialisation a été envoyé à votre e-mail.");
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de tentatives. Veuillez réessayer dans quelques instants.");
        return rejectWithValue("Rate limit exceeded");
      }
      
      if (error.response) {
        toast.error(error.response.data.message || "Une erreur est survenue.");
        return rejectWithValue(error.response.data.message || "Une erreur est survenue.");
      } else {
        toast.error("Problème de connexion. Veuillez réessayer.");
        return rejectWithValue("Problème de connexion. Veuillez réessayer.");
      }
    }
  }
);

/**
 * Sign Up - User registration
 */
export const signUp = createAsyncThunk(
  "user/signup",
  async ({ user, navigate }) => {
    try {
      await waitForRateLimit();
      
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/register`,
        user
      );
      navigate("/login");
      toast.success("Compte créé. Veuillez vérifier votre e-mail pour activer votre compte.");
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de tentatives. Veuillez réessayer dans quelques instants.");
        throw new Error("Rate limit exceeded");
      }
      
      const errorMessage = error.response?.data?.message || "Compte déjà existant.";
      toast.error(errorMessage);
      throw error;
    }
  }
);

/**
 * Fetch User Profile - Retrieves current user information
 */
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      // Check if we have recent data (cache for 5 minutes)
      const state = getState();
      const lastFetch = state.user.lastFetch;
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (lastFetch && (now - lastFetch) < fiveMinutes && state.user.Userprofile) {
        console.log("Using cached user profile");
        return state.user.Userprofile;
      }
      
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Token d'authentification non trouvé");
      }

      // Skip token validation if we have cached data
      if (!state.user.Userprofile) {
        const isValid = await testTokenValidity(token);
        if (!isValid) {
          throw new Error("Token invalide ou expiré");
        }
      }

      await waitForRateLimit();
      
      const { data } = await axios.get(`${API_BASE_URL}/customer/info1`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: API_TIMEOUT
      });
      
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Veuillez patienter un moment.");
        return rejectWithValue("Rate limit exceeded");
      }
      
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du chargement du profil";
      
      if (error.response?.status === 401 || error.response?.status === 403 || error.message.includes("Token invalide") || error.message.includes("Token non trouvé")) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        dispatch(logout());
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error("Délai d'attente dépassé. Veuillez réessayer.");
      } else if (error.message !== "Rate limit exceeded") {
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update User Profile - Updates user information
 */
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      await waitForRateLimit();
      
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/profile/update`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: API_TIMEOUT
        }
      );
      
      toast.success("Profil mis à jour avec succès");
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Veuillez patienter un moment.");
        return rejectWithValue("Rate limit exceeded");
      }
      
      let errorMessage = "Erreur lors de la mise à jour du profil";
      
      if (error.response?.status === 422) {
        if (error.response?.data?.errors) {
          const validationErrors = error.response.data.errors;
          
          const allErrorMessages = [];
          Object.keys(validationErrors).forEach(field => {
            validationErrors[field].forEach(msg => {
              allErrorMessages.push(`${field}: ${msg}`);
            });
          });
          
          errorMessage = allErrorMessages.join(', ');
          toast.error(`Erreur: ${errorMessage}`);
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          toast.error(errorMessage);
        } else {
          errorMessage = "Erreur de validation des données";
          toast.error(errorMessage);
        }
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
        toast.error(errorMessage);
        dispatch(logout());
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        errorMessage = error.response?.data?.message || error.message || "Erreur lors de la mise à jour du profil";
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update Cagnotte in Database - Updates user's cagnotte balance
 */
export const updateCagnotteInDB = createAsyncThunk(
  "user/updateCagnotteInDB",
  async (updatedBalance, { rejectWithValue, dispatch }) => {
    try {
      await waitForRateLimit();
      
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/update-cagnotte`,
        { cagnotte_balance: updatedBalance },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: API_TIMEOUT
        }
      );
      toast.success("Cagnotte mise à jour avec succès");
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Veuillez patienter un moment.");
        return rejectWithValue("Rate limit exceeded");
      }
      
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la mise à jour de la cagnotte";
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        dispatch(logout());
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Change Password - Updates user password
 */
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData, { rejectWithValue, dispatch }) => {
    try {
      await waitForRateLimit();
      
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/auth/change-password-without-current`,
        {
          new_password: passwordData.new_password,
          new_password_confirmation: passwordData.new_password_confirmation
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: API_TIMEOUT
        }
      );
      
      toast.success("Mot de passe modifié avec succès");
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Veuillez patienter un moment.");
        return rejectWithValue("Rate limit exceeded");
      }
      
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la modification du mot de passe";
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        dispatch(logout());
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Google Login - Authenticates user via Google
 */
export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (token, { rejectWithValue }) => {
    try {
      await waitForRateLimit();
      
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/google-login`,
        { token }
      );
      toast.success("Connexion Google réussie");
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Veuillez patienter un moment.");
        return rejectWithValue("Rate limit exceeded");
      }
      
      const errorMessage = error.response?.data?.message || "Erreur lors de la connexion Google";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Google Register - Registers user via Google
 */
export const googleRegister = createAsyncThunk(
  "user/googleRegister",
  async (token, { rejectWithValue }) => {
    try {
      await waitForRateLimit();
      
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/google/register`,
        { token }
      );
      toast.success("Inscription Google réussie");
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Veuillez patienter un moment.");
        return rejectWithValue("Rate limit exceeded");
      }
      
      const errorMessage = error.response?.data?.message || "Erreur lors de l'inscription Google";
      
      if (error.response?.status === 409) {
        toast.error("Cet email est déjà utilisé. Veuillez vous connecter.");
      } else {
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Dans store/slices/user.js - ajoutez cette action
export const updateCagnotteBalance = createAsyncThunk(
  "user/updateCagnotteBalance",
  async (amount, { getState }) => {
    // Mise à jour locale immédiate
    return amount;
  }
);

// ==================== SLICE CONFIGURATION ====================

const UserSlice = createSlice({
  name: "user",
  initialState: {
    Userprofile: null,
    loggedInUser: null,
    createdUser: null,
    loading: false,
    error: null,
    lastFetch: null,
  },
  reducers: {
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
    
    // Clear user profile
    clearUserProfile: (state) => {
      state.Userprofile = null;
      state.loggedInUser = null;
    },
    
    // Update user locally without API call
    updateUserLocal: (state, action) => {
      if (state.Userprofile) {
        state.Userprofile = { ...state.Userprofile, ...action.payload };
      }
      if (state.loggedInUser) {
        state.loggedInUser = { ...state.loggedInUser, ...action.payload };
      }
    },
    
    // Set last fetch timestamp
    setLastFetch: (state, action) => {
      state.lastFetch = action.payload;
    },
    
    // Clear all user data
    clearAllUserData: (state) => {
      state.Userprofile = null;
      state.loggedInUser = null;
      state.createdUser = null;
      state.error = null;
      state.lastFetch = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // ==================== SIGN UP ====================
      .addCase(signUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false;
        state.createdUser = action.payload;
        state.error = null;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // ==================== FETCH USER PROFILE ====================
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.Userprofile = action.payload;
        state.loggedInUser = action.payload;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // Don't clear profile data on rate limit errors
        if (action.payload !== "Rate limit exceeded") {
          state.Userprofile = null;
          state.loggedInUser = null;
        }
      })

      // ==================== UPDATE USER PROFILE ====================
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.Userprofile = action.payload;
        state.loggedInUser = action.payload;
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== UPDATE CAGNOTTE ====================
      .addCase(updateCagnotteInDB.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCagnotteInDB.fulfilled, (state, action) => {
        state.loading = false;
        state.Userprofile = action.payload;
        state.loggedInUser = action.payload;
      })
      .addCase(updateCagnotteInDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ==================== FORGET PASSWORD ====================
      .addCase(forgetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgetPassword.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(forgetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== CHANGE PASSWORD ====================
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== GOOGLE LOGIN ====================
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.loggedInUser = action.payload.user;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== GOOGLE REGISTER ====================
      .addCase(googleRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleRegister.fulfilled, (state, action) => {
        state.loading = false;
        state.createdUser = action.payload;
        state.error = null;
      })
      .addCase(googleRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ==================== EXPORTS ====================

// Export actions
export const { 
  clearError, 
  clearUserProfile, 
  updateUserLocal, 
  setLastFetch,
  clearAllUserData 
} = UserSlice.actions;

// Selectors
export const selectUserProfile = (state) => state.user.Userprofile;
export const selectLoggedInUser = (state) => state.user.loggedInUser;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectLastFetch = (state) => state.user.lastFetch;

// Export reducer
export default UserSlice.reducer;