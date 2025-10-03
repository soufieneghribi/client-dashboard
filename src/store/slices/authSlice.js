// authSlice.js - Version corrigée complète
import { createSlice } from "@reduxjs/toolkit";

// Fonction pour récupérer le token du storage (DIFFÉRENTE de celle dans OrderConfirmation.jsx)
const getStoredToken = () => {
  try {
    // Priorité 1: localStorage
    const localToken = localStorage.getItem("token");
    
    // Priorité 2: Cookies
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    return localToken || cookieToken;
  } catch (error) {
    console.error("Error getting stored token:", error);
    return null;
  }
};

const getInitialState = () => {
  try {
    const token = getStoredToken();
    const user = localStorage.getItem("user");
    
    return {
      user: user ? JSON.parse(user) : null,
      token: token,
      isLoggedIn: !!token,
      isLoading: false,
    };
  } catch (error) {
    console.error("Error loading auth state:", error);
    return {
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,
    };
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      
      if (!token) {
        console.error("No token provided in loginSuccess");
        return;
      }
      
      state.user = user;
      state.token = token;
      state.isLoggedIn = true;
      state.isLoading = false;

      // Sauvegarder de manière COHÉRENTE partout
      try {
        // localStorage (pour compatibilité)
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Cookies (comme dans Login.jsx)
        const oneDay = 60 * 60 * 24;
        document.cookie = `auth_token=${token}; path=/; max-age=${oneDay}; Secure; SameSite=Lax`;
        
        // sessionStorage (optionnel - pour l'ID utilisateur)
        sessionStorage.setItem('user_id', user.ID_client || user.id);
        
        console.log("✅ Auth synchronisé: localStorage, cookies, sessionStorage");
      } catch (error) {
        console.error("Error saving auth data:", error);
      }
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.isLoading = false;

      // Nettoyer TOUS les storage
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem('user_id');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        
        console.log("✅ Auth nettoyé de tous les storage");
      } catch (error) {
        console.error("Error clearing auth data:", error);
      }
    },
    
    setToken: (state, action) => {
      const token = action.payload;
      state.token = token;
      state.isLoggedIn = !!token;
      
      // Synchroniser partout
      if (token) {
        localStorage.setItem("token", token);
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24}; Secure; SameSite=Lax`;
      } else {
        localStorage.removeItem("token");
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    },
    
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Action pour forcer la synchronisation
    refreshAuth: (state) => {
      const token = localStorage.getItem("token") || 
                    document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
      const user = localStorage.getItem("user");
      
      state.token = token;
      state.user = user ? JSON.parse(user) : null;
      state.isLoggedIn = !!token;
      
      console.log("🔄 Auth rafraîchi:", { 
        token: !!token, 
        user: !!user,
        isLoggedIn: state.isLoggedIn 
      });
    },
  },
});

export const { 
  loginSuccess, 
  logout, 
  setToken, 
  updateUser, 
  setLoading,
  refreshAuth 
} = authSlice.actions;

// Middleware pour synchroniser l'authentification
export const authMiddleware = (store) => (next) => (action) => {
  // Synchroniser le token dans tous les storage après login
  if (action.type === loginSuccess.type) {
    const { token, user } = action.payload;
    if (token) {
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem('user_id', user.ID_client || user.id);
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24}; Secure; SameSite=Lax`;
      } catch (error) {
        console.error("Error syncing auth data:", error);
      }
    }
  }
  
  // Nettoyer après logout
  if (action.type === logout.type) {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem('user_id');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  }
  
  return next(action);
};

// Sélecteurs
export const selectAuth = (state) => state.auth;
export const selectToken = (state) => state.auth.token;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectUser = (state) => state.auth.user;

export default authSlice.reducer;