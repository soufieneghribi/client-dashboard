import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from '../../services/api';

// ==================== ASYNC THUNKS ====================

// Récupérer toutes les réclamations du client
export const fetchComplaints = createAsyncThunk(
    'complaints/fetchAll',
    async (clientId, { rejectWithValue }) => {
        try {
            const url = clientId
                ? API_ENDPOINTS.COMPLAINTS.BY_CLIENT(clientId)
                : API_ENDPOINTS.COMPLAINTS.ALL;

            const response = await axios.get(url, {
                headers: getAuthHeaders(),
            });
            // Le backend peut retourner un objet avec une propriété 'complaints' ou directement le tableau
            return response.data.complaints || response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors du chargement des réclamations'
            );
        }
    }
);

// Créer une nouvelle réclamation
export const createComplaint = createAsyncThunk(
    'complaints/create',
    async (complaintData, { rejectWithValue }) => {
        try {
            // S'assurer que l'ID client est présent
            const clientId = sessionStorage.getItem('user_id') || localStorage.getItem('client_id');
            const dataToSubmit = {
                ...complaintData,
                id_client: clientId, // Souvent requis par le backend
                client_id: clientId, // Au cas où le nom du champ diffère
            };

            const response = await axios.post(
                API_ENDPOINTS.COMPLAINTS.CREATE,
                dataToSubmit,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data.complaint || response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la création de la réclamation'
            );
        }
    }
);

// Récupérer les détails d'une réclamation
export const fetchComplaintById = createAsyncThunk(
    'complaints/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.COMPLAINTS.BY_ID(id), {
                headers: getAuthHeaders(),
            });
            return response.data.complaint || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors du chargement de la réclamation'
            );
        }
    }
);

// Mettre à jour une réclamation
export const updateComplaint = createAsyncThunk(
    'complaints/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await axios.put(
                API_ENDPOINTS.COMPLAINTS.UPDATE(id),
                data,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data.complaint || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la mise à jour de la réclamation'
            );
        }
    }
);

// Supprimer une réclamation
export const deleteComplaint = createAsyncThunk(
    'complaints/delete',
    async (id, { rejectWithValue }) => {
        try {
            await axios.delete(API_ENDPOINTS.COMPLAINTS.DELETE(id), {
                headers: getAuthHeaders(),
            });
            return id;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la suppression de la réclamation'
            );
        }
    }
);

// ==================== SLICE ====================

const complaintsSlice = createSlice({
    name: 'complaints',
    initialState: {
        complaints: [],
        currentComplaint: null,
        loading: false,
        error: null,
        success: false,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
        },
        clearCurrentComplaint: (state) => {
            state.currentComplaint = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all complaints
            .addCase(fetchComplaints.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComplaints.fulfilled, (state, action) => {
                state.loading = false;
                state.complaints = action.payload;
            })
            .addCase(fetchComplaints.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create complaint
            .addCase(createComplaint.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createComplaint.fulfilled, (state, action) => {
                state.loading = false;
                state.complaints.unshift(action.payload);
                state.success = true;
            })
            .addCase(createComplaint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch complaint by ID
            .addCase(fetchComplaintById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchComplaintById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentComplaint = action.payload;
            })
            .addCase(fetchComplaintById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Update complaint
            .addCase(updateComplaint.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateComplaint.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.complaints.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.complaints[index] = action.payload;
                }
                state.currentComplaint = action.payload;
                state.success = true;
            })
            .addCase(updateComplaint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Delete complaint
            .addCase(deleteComplaint.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteComplaint.fulfilled, (state, action) => {
                state.loading = false;
                state.complaints = state.complaints.filter(c => c.id !== action.payload);
                state.success = true;
            })
            .addCase(deleteComplaint.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearSuccess, clearCurrentComplaint } = complaintsSlice.actions;
export default complaintsSlice.reducer;
