import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-hot-toast";

// Async thunk for user sign-in
export const signUp = createAsyncThunk(
  "user/signup",
  async ({ user, navigate }) => {
    
    try {
      const { data } = await axios.post(
        "https://tn360-122923924979.europe-west1.run.app/api/v1/auth/register",
        user
      );
      navigate("/login");
      toast.success("Account created Successfully");
      return data;
    } catch (error) {
      toast.error(error.response.data.message);
    }
  }
);
export const fetchUserProfile = createAsyncThunk(
  "user/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); // Assuming token is stored in localStorage
      const { data } = await axios.get("https://tn360-122923924979.europe-west1.run.app/api/v1/customer/info1", {
        headers: {
          Authorization: `Bearer ${token}`, // Add token for authentication
        },
      });
      return data; // Return the profile data
    } catch (error) {
      // Handle errors and return an error message
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user profile"
      );
    }
  }
);
// Update user profile
export const updateUserProfile = createAsyncThunk(
  "user/updateUserProfile ",
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await axios.put("https://tn360-122923924979.europe-west1.run.app/api/v1/customer/update-profile", profileData);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update profile");
    }
  }
);
const UserSlice = createSlice({
  name: "user",
  initialState: {
    Userprofile: null,
    loggedInUser: null, // Initially no user logged in
    loading: false, // Track loading state
    error: null, // Track error message
  },
  extraReducers: (builder) => {
    builder.addCase(signUp.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.loading = false;
      state.createdUser = action.payload;
    });
    builder.addCase(signUp.rejected, (state) => {
      state.loading = false;
    });
  
  builder.addCase(fetchUserProfile.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
    state.loading = false;
    state.Userprofile = action.payload;
  })
  builder.addCase(fetchUserProfile.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
  builder.addCase(updateUserProfile.pending, (state) => {
    state.loading = true;
    state.error = null;
  })
  builder.addCase(updateUserProfile.fulfilled, (state, action) => {
    state.loading = false;
    state.Userprofile = action.payload;
  })
  builder.addCase(updateUserProfile.rejected, (state, action) => {
    state.loading = false;
    state.error = action.payload;
  })
},
});


export default UserSlice.reducer;
