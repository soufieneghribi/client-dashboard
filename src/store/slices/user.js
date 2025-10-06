import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";
import store from "../index";
import { logout } from "./authSlice";

// Fonction pour récupérer le token de manière cohérente
const getAuthToken = () => {
  try {
    const localToken = localStorage.getItem("token");
    const state = store.getState();
    const reduxToken = state?.auth?.token;
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    const token = localToken || reduxToken || cookieToken;
    
    if (!token) {
      console.warn("❌ Aucun token d'authentification trouvé dans user.js");
      return null;
    }
    
    return token;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du token dans user.js:", error);
    return null;
  }
};

// Test de validité du token
const testTokenValidity = async (token) => {
  try {
    const response = await axios.get(
      'https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/customer/info1',
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
      console.log("✅ Token valide - Utilisateur:", response.data.nom_et_prenom || response.data.email);
      return true;
    } else {
      console.log("❌ Token valide mais réponse utilisateur incomplète");
      return false;
    }
  } catch (error) {
    console.error("🔴 Échec validation token:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      return false;
    }
    
    console.warn("⚠️ Erreur réseau, on considère le token valide");
    return true;
  }
};

export const forgetPassword = createAsyncThunk(
  "user/forgetPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/auth/password/email",
        { email }
      );
      toast.success("Un lien de réinitialisation a été envoyé à votre e-mail.");
      return data;
    } catch (error) {
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
      const { data } = await axios.post(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/auth/register",
        user
      );
      navigate("/login");
      toast.success("Compte créé. Veuillez vérifier votre e-mail pour activer votre compte.");
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Compte déjà existant.";
      toast.error(errorMessage);
      throw error;
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();
      
      if (!token) {
        console.error("❌ Token non trouvé dans fetchUserProfile");
        throw new Error("Token d'authentification non trouvé");
      }

      console.log("🔐 Test de validité du token...");
      const isValid = await testTokenValidity(token);
      if (!isValid) {
        console.error("❌ Token invalide dans fetchUserProfile");
        throw new Error("Token invalide ou expiré");
      }

      console.log("📡 Chargement du profil utilisateur...");
      const { data } = await axios.get("https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/customer/info1", {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      console.log("✅ Profil utilisateur chargé avec succès:", data);
      return data;
    } catch (error) {
      console.error("❌ Erreur chargement profil user.js:", error);
      
      const errorMessage = error.response?.data?.message || error.message || "Erreur lors du chargement du profil";
      
      if (error.response?.status === 401 || error.response?.status === 403 || error.message.includes("Token invalide") || error.message.includes("Token non trouvé")) {
        console.log("🔒 Session expirée, déconnexion...");
        toast.error("Session expirée. Veuillez vous reconnecter.");
        dispatch(logout());
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        toast.error("Délai d'attente dépassé. Veuillez réessayer.");
      } else {
        toast.error(errorMessage);
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Update user profile - VERSION CORRIGÉE AVEC MEILLEURE GESTION D'ERREUR
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile",
  async (profileData, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      console.log("📡 Données envoyées pour mise à jour profil:", profileData);

      const response = await axios.post(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/auth/profile/update",
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      console.log("✅ Réponse succès mise à jour profil:", response.data);
      toast.success("Profil mis à jour avec succès");
      return response.data;
    } catch (error) {
      console.error("❌ Erreur COMPLÈTE mise à jour profil:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      let errorMessage = "Erreur lors de la mise à jour du profil";
      
      if (error.response?.status === 422) {
        // Gestion améliorée des erreurs 422
        if (error.response?.data?.errors) {
          const validationErrors = error.response.data.errors;
          console.error("🚨 ERREURS DE VALIDATION DÉTAILLÉES:", validationErrors);
          
          // Extraire tous les messages d'erreur
          const allErrorMessages = [];
          Object.keys(validationErrors).forEach(field => {
            validationErrors[field].forEach(msg => {
              allErrorMessages.push(`${field}: ${msg}`);
            });
          });
          
          errorMessage = allErrorMessages.join(', ');
          console.error("📝 Messages d'erreur formatés:", errorMessage);
          toast.error(`Erreur: ${errorMessage}`);
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
          toast.error(errorMessage);
        } else {
          console.error("🚨 DONNÉES ERREUR 422:", error.response.data);
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

export const updateCagnotteInDB = createAsyncThunk(
  "user/updateCagnotteInDB",
  async (updatedBalance, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      console.log("📡 Mise à jour de la cagnotte...");
      const { data } = await axios.post(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/update-cagnotte",
        { cagnotte_balance: updatedBalance },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      toast.success("Cagnotte mise à jour avec succès");
      return data;
    } catch (error) {
      console.error("❌ Erreur mise à jour cagnotte:", error);
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

export const changePassword = createAsyncThunk(
  "user/changePassword",
  async (passwordData, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      console.log("📡 Changement de mot de passe...");
      const { data } = await axios.post(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/auth/change-password-without-current",
        {
          new_password: passwordData.new_password,
          new_password_confirmation: passwordData.new_password_confirmation
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );
      
      toast.success("Mot de passe modifié avec succès");
      return data;
    } catch (error) {
      console.error("❌ Erreur changement mot de passe:", error);
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

// Google login
export const googleLogin = createAsyncThunk(
  "user/googleLogin",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/auth/google-login",
        { token }
      );
      toast.success("Connexion Google réussie");
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Erreur lors de la connexion Google";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Google register
export const googleRegister = createAsyncThunk(
  "user/googleRegister",
  async (token, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        "https://tn360-back-office-122923924979.europe-west1.run.app/api/v1/auth/google/register",
        { token }
      );
      toast.success("Inscription Google réussie");
      return data;
    } catch (error) {
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
      // Sign Up
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

      // Fetch User Profile
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
        console.log("✅ Profil utilisateur stocké dans Redux");
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.Userprofile = null;
        state.loggedInUser = null;
      })

      // Update User Profile
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

      // Update Cagnotte
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
      
      // Forget Password
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

      // Change Password
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

      // Google Login
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

      // Google Register
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

export const { 
  clearError, 
  clearUserProfile, 
  updateUserLocal, 
  setLastFetch,
  clearAllUserData 
} = UserSlice.actions;

// Sélecteurs
export const selectUserProfile = (state) => state.user.Userprofile;
export const selectLoggedInUser = (state) => state.user.loggedInUser;
export const selectUserLoading = (state) => state.user.loading;
export const selectUserError = (state) => state.user.error;
export const selectLastFetch = (state) => state.user.lastFetch;

export default UserSlice.reducer;