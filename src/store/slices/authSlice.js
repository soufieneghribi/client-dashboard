import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: localStorage.getItem('token') || null, // Retrieve token from localStorage on initial load
    isLoggedIn: localStorage.getItem('token') ? true : false, // Derive isLoggedIn from token
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isLoggedIn = true;

            // Save authentication details to localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user)); // Store user as JSON string
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isLoggedIn = false;

            // Clear authentication details from localStorage
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
    },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
