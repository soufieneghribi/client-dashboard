/**
 * Authentication Redux Slice
 * Manages user authentication state and token management
 * Security: All sensitive data handling is silent - no console logs
 */

import { createSlice } from "@reduxjs/toolkit";

// ==================== CONSTANTS ====================
const TOKEN_EXPIRY = 60 * 60 * 24; // 24 hours in seconds

// ==================== HELPER FUNCTIONS ====================

/**
 * Retrieves stored authentication token
 * Priority: localStorage > Cookies
 * @returns {string|null} Authentication token
 */
const getStoredToken = () => {
  try {
    // Priority 1: localStorage
    const localToken = localStorage.getItem("token");
    
    // Priority 2: Cookies
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    return localToken || cookieToken;
  } catch (error) {
    return null;
  }
};

/**
 * Initializes authentication state from storage
 * @returns {Object} Initial auth state
 */
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
    return {
      user: null,
      token: null,
      isLoggedIn: false,
      isLoading: false,
    };
  }
};

// ==================== SLICE CONFIGURATION ====================

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    /**
     * Login Success - Stores user and token securely
     */
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      
      if (!token) {
        return;
      }
      
      state.user = user;
      state.token = token;
      state.isLoggedIn = true;
      state.isLoading = false;

      // Store authentication data securely
      try {
        // localStorage (for persistence)
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        
        // Cookies (HTTP-only would be better, but set via frontend for compatibility)
        document.cookie = `auth_token=${token}; path=/; max-age=${TOKEN_EXPIRY}; Secure; SameSite=Lax`;
        
        // sessionStorage (for user ID reference)
        sessionStorage.setItem('user_id', user.ID_client || user.id);
      } catch (error) {
        // Silent failure - auth still works via state
      }
    },
    
    /**
     * Logout - Clears all authentication data
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isLoggedIn = false;
      state.isLoading = false;

      // Clear all storage
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem('user_id');
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch (error) {
        // Silent failure - state is already cleared
      }
    },
    
    /**
     * Set Token - Updates token in state and storage
     */
    setToken: (state, action) => {
      const token = action.payload;
      state.token = token;
      state.isLoggedIn = !!token;
      
      // Synchronize storage
      if (token) {
        try {
          localStorage.setItem("token", token);
          document.cookie = `auth_token=${token}; path=/; max-age=${TOKEN_EXPIRY}; Secure; SameSite=Lax`;
        } catch (error) {
          // Silent failure
        }
      } else {
        try {
          localStorage.removeItem("token");
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        } catch (error) {
          // Silent failure
        }
      }
    },
    
    /**
     * Update User - Updates user information
     */
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      try {
        localStorage.setItem("user", JSON.stringify(state.user));
      } catch (error) {
        // Silent failure
      }
    },
    
    /**
     * Set Loading - Updates loading state
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    /**
     * Refresh Auth - Synchronizes state from storage
     */
    refreshAuth: (state) => {
      const token = localStorage.getItem("token") || 
                    document.cookie.split('; ').find(row => row.startsWith('auth_token='))?.split('=')[1];
      const user = localStorage.getItem("user");
      
      state.token = token;
      state.user = user ? JSON.parse(user) : null;
      state.isLoggedIn = !!token;
    },
  },
});

// ==================== EXPORTS ====================

// Export actions
export const { 
  loginSuccess, 
  logout, 
  setToken, 
  updateUser, 
  setLoading,
  refreshAuth 
} = authSlice.actions;

// ==================== MIDDLEWARE ====================

/**
 * Auth Middleware - Synchronizes authentication across storage
 * Ensures token is stored securely without logging sensitive data
 */
export const authMiddleware = (store) => (next) => (action) => {
  // Synchronize token in all storage after login
  if (action.type === loginSuccess.type) {
    const { token, user } = action.payload;
    if (token) {
      try {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem('user_id', user.ID_client || user.id);
        document.cookie = `auth_token=${token}; path=/; max-age=${TOKEN_EXPIRY}; Secure; SameSite=Lax`;
      } catch (error) {
        // Silent failure - token is still in Redux state
      }
    }
  }
  
  // Clean up after logout
  if (action.type === logout.type) {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem('user_id');
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    } catch (error) {
      // Silent failure
    }
  }
  
  return next(action);
};

// ==================== SELECTORS ====================

/**
 * Selectors for accessing auth state
 * These should be used instead of direct state access
 */
export const selectAuth = (state) => state.auth;
export const selectToken = (state) => state.auth.token;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectUser = (state) => state.auth.user;

// ==================== DEFAULT EXPORT ====================

export default authSlice.reducer;