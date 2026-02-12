import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { recruitmentService } from "../../services/api";

export const fetchJobs = createAsyncThunk(
    "recruitment/fetchJobs",
    async (params, { rejectWithValue }) => {
        try {
            const response = await recruitmentService.getJobs(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const fetchJobDetails = createAsyncThunk(
    "recruitment/fetchJobDetails",
    async (slug, { rejectWithValue }) => {
        try {
            const response = await recruitmentService.getJobDetails(slug);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const applyForJob = createAsyncThunk(
    "recruitment/applyForJob",
    async (formData, { rejectWithValue }) => {
        try {
            const response = await recruitmentService.apply(formData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const recruitmentSlice = createSlice({
    name: "recruitment",
    initialState: {
        jobs: [],
        currentJob: null,
        loading: false,
        detailsLoading: false,
        submitting: false,
        error: null,
        successMessage: null,
    },
    reducers: {
        clearCurrentJob: (state) => {
            state.currentJob = null;
        },
        clearMessages: (state) => {
            state.successMessage = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Jobs
            .addCase(fetchJobs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchJobs.fulfilled, (state, action) => {
                state.loading = false;
                state.jobs = action.payload.data;
            })
            .addCase(fetchJobs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch Job Details
            .addCase(fetchJobDetails.pending, (state) => {
                state.detailsLoading = true;
                state.error = null;
            })
            .addCase(fetchJobDetails.fulfilled, (state, action) => {
                state.detailsLoading = false;
                state.currentJob = action.payload.data;
            })
            .addCase(fetchJobDetails.rejected, (state, action) => {
                state.detailsLoading = false;
                state.error = action.payload;
            })
            // Apply
            .addCase(applyForJob.pending, (state) => {
                state.submitting = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(applyForJob.fulfilled, (state, action) => {
                state.submitting = false;
                state.successMessage = action.payload.message;
            })
            .addCase(applyForJob.rejected, (state, action) => {
                state.submitting = false;
                state.error = action.payload;
            });
    },
});

export const { clearCurrentJob, clearMessages } = recruitmentSlice.actions;
export default recruitmentSlice.reducer;
