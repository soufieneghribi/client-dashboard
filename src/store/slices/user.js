import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import store from "../index";
import { logout, updateUser as updateAuthUser } from "./authSlice";
import { API_ENDPOINTS, getAuthHeaders } from "../../services/api";

/**
 * User Redux Slice
 * Manages user authentication, profile, and related operations
 * All API calls are secure with proper error handling
 */

// ==================== CONSTANTS ====================
const API_TIMEOUT = 15000;
const RATE_LIMIT_DELAY = 2000;

// ==================== HELPER FUNCTIONS ====================
let lastRequestTime = 0;

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
    const waitTime = RATE_LIMIT_DELAY - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

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

const testTokenValidity = async (token) => {
  try {
    await waitForRateLimit();
    
    const response = await axios.get(
      API_ENDPOINTS.USER.PROFILE,
      {
        headers: getAuthHeaders(token),
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
      return true;
    }
    
    return true;
  }
};

// ==================== ASYNC THUNKS ====================

export const forgetPassword = createAsyncThunk(
  "user/forgetPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      await waitForRateLimit();
      
      const { data } = await axios.post(
        API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
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

export const signUp = createAsyncThunk(
  "user/signup",
  async ({ user, navigate }) => {
    try {
      await waitForRateLimit();
      
      const { data } = await axios.post(
        API_ENDPOINTS.AUTH.REGISTER,
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

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue, dispatch, getState }) => {
    try {
      const state = getState();
      const lastFetch = state.user.lastFetch;
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (lastFetch && (now - lastFetch) < fiveMinutes && state.user.Userprofile) {
        return state.user.Userprofile;
      }
      
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Token d'authentification non trouvé");
      }

      if (!state.user.Userprofile) {
        const isValid = await testTokenValidity(token);
        if (!isValid) {
          throw new Error("Token invalide ou expiré");
        }
      }

      await waitForRateLimit();
      
      const { data } = await axios.get(API_ENDPOINTS.USER.PROFILE, {
        headers: getAuthHeaders(token),
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

export const fetchUserProfileForce = createAsyncThunk(
  "user/fetchUserProfileForce",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        throw new Error("Token d'authentification non trouvé");
      }

      const { data } = await axios.get(API_ENDPOINTS.USER.PROFILE, {
        headers: getAuthHeaders(token),
        timeout: API_TIMEOUT
      });
      
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du chargement du profil";
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        dispatch(logout());
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update User Profile - MISE À JOUR AVEC GESTION D'ERREUR 422 AMÉLIORÉE
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

      const { data } = await axios.post(
        API_ENDPOINTS.AUTH.PROFILE_UPDATE,
        profileData,
        {
          headers: getAuthHeaders(token),
          timeout: API_TIMEOUT
        }
      );

      dispatch(updateAuthUser(data));
      toast.success("Profil mis à jour avec succès");
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Veuillez patienter un moment.");
        return rejectWithValue("Rate limit exceeded");
      }

      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors;
        
        if (validationErrors) {
          if (Array.isArray(validationErrors)) {
            const firstError = validationErrors[0]?.message || validationErrors[0] || "Erreur de validation";
            toast.error(firstError);
            return rejectWithValue(firstError);
          }
          
          if (typeof validationErrors === 'object') {
            const firstKey = Object.keys(validationErrors)[0];
            const firstError = validationErrors[firstKey][0] || validationErrors[firstKey] || "Erreur de validation";
            toast.error(firstError);
            return rejectWithValue(firstError);
          }
        }
        
        const fallbackMessage = error.response.data.message || "Données invalides";
        toast.error(fallbackMessage);
        return rejectWithValue(fallbackMessage);
      }

      const errorMessage = error.response?.data?.message || error.message || "Erreur lors de la mise à jour du profil";
      
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
 * Update Cagnotte in Database
 */
export const updateCagnotteInDB = createAsyncThunk(
  "user/updateCagnotteInDB",
  async ({ amount }, { rejectWithValue, dispatch }) => {
    try {
      await waitForRateLimit();
      
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const { data } = await axios.post(
        API_ENDPOINTS.USER.UPDATE_CAGNOTTE,
        { 
          amount: parseFloat(amount),
          operation: 'add'
        },
        {
          headers: getAuthHeaders(token),
          timeout: API_TIMEOUT
        }
      );

      toast.success(`${amount} DT ajoutés à votre cagnotte`);
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Veuillez patienter un moment.");
        return rejectWithValue("Rate limit exceeded");
      }

      const errorMessage = error.response?.data?.message || "Erreur lors de la mise à jour de la cagnotte";
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Session expirée. Veuillez vous reconnecter.");
        dispatch(logout());
      } else {
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Change Password
 */
export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData, { rejectWithValue }) => {
    try {
      await waitForRateLimit();
      
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      const { data } = await axios.post(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
        passwordData,
        {
          headers: getAuthHeaders(token),
          timeout: API_TIMEOUT
        }
      );

      toast.success("Mot de passe changé avec succès");
      return data;
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error("Trop de requêtes. Veuillez patienter un moment.");
        return rejectWithValue("Rate limit exceeded");
      }

      const errorMessage = error.response?.data?.message || "Erreur lors du changement de mot de passe";
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Mot de passe actuel incorrect");
      } else {
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (token, { rejectWithValue }) => {
    try {
      await waitForRateLimit();
      
      const { data } = await axios.post(
        API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
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

export const googleRegister = createAsyncThunk(
  "user/googleRegister",
  async (token, { rejectWithValue }) => {
    try {
      await waitForRateLimit();
      
      const { data } = await axios.post(
        API_ENDPOINTS.AUTH.GOOGLE_REGISTER,
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

export const updateCagnotteBalance = createAsyncThunk(
  "user/updateCagnotteBalance",
  async (amount, { getState }) => {
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
    clearError: (state) => {
      state.error = null;
    },
    clearUserProfile: (state) => {
      state.Userprofile = null;
      state.loggedInUser = null;
    },
    updateUserLocal: (state, action) => {
      if (state.Userprofile) {
        state.Userprofile = { ...state.Userprofile, ...action.payload };
      }
      if (state.loggedInUser) {
        state.loggedInUser = { ...state.loggedInUser, ...action.payload };
      }
    },
    setLastFetch: (state, action) => {
      state.lastFetch = action.payload;
    },
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
        if (action.payload !== "Rate limit exceeded") {
          state.Userprofile = null;
          state.loggedInUser = null;
        }
      })

      .addCase(fetchUserProfileForce.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfileForce.fulfilled, (state, action) => {
        state.loading = false;
        state.Userprofile = action.payload;
        state.loggedInUser = action.payload;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchUserProfileForce.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.Userprofile = action.payload;
        state.loggedInUser = action.payload;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

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

export const { 
  clearError, 
  clearUserProfile, 
  updateUserLocal, 
  setLastFetch,
  clearAllUserData 
} = UserSlice.actions;

export const selectUserProfile = (state) => state.user.Userprofile;
export const selectLoggedInUser = (state) => state.user.loggedInUser;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectLastFetch = (state) => state.user.lastFetch;

export default UserSlice.reducer;