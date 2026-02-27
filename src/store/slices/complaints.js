import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from '../../services/api';

// ==================== ASYNC THUNKS ====================

// Récupérer toutes les réclamations du client
export const fetchComplaints = createAsyncThunk(
    'complaints/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            // Le backend filtre automatiquement par l'utilisateur connecté
            const response = await axios.get(API_ENDPOINTS.CLAIMS.ALL, {
                headers: getAuthHeaders(),
            });
            // Le backend peut retourner un objet avec une propriété 'data' ou directement le tableau
            return response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors du chargement des réclamations'
            );
        }
    }
);

// Récupérer les types de réclamations
export const fetchClaimTypes = createAsyncThunk(
    'complaints/fetchTypes',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.CLAIMS.TYPES, {
                headers: getAuthHeaders(),
            });
            return response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors du chargement des types de réclamations'
            );
        }
    }
);

// Créer une nouvelle réclamation
export const createComplaint = createAsyncThunk(
    'complaints/create',
    async (complaintData, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('claim_type_id', complaintData.claim_type_id);
            formData.append('subject', complaintData.subject);
            formData.append('description', complaintData.description);
            if (complaintData.priority) {
                formData.append('priority', complaintData.priority);
            }
            if (complaintData.attachment) {
                formData.append('attachment', complaintData.attachment);
            }

            const response = await axios.post(
                API_ENDPOINTS.CLAIMS.CREATE,
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data.data || response.data;
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
            const response = await axios.get(API_ENDPOINTS.CLAIMS.BY_ID(id), {
                headers: getAuthHeaders(),
            });
            return response.data.data || response.data;
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
                API_ENDPOINTS.CLAIMS.UPDATE(id),
                data,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data.data || response.data;
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
            await axios.delete(API_ENDPOINTS.CLAIMS.DELETE(id), {
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

// Envoyer un message sur une réclamation
export const sendClaimMessage = createAsyncThunk(
    'complaints/sendMessage',
    async ({ id, message, attachment }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            if (message) {
                formData.append('message', message);
            }
            if (attachment) {
                formData.append('attachment', attachment);
            }

            const response = await axios.post(
                API_ENDPOINTS.CLAIMS.MESSAGES(id),
                formData,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return { claimId: id, message: response.data.data || response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'envoi du message'
            );
        }
    }
);

// Soumettre un feedback pour une réclamation
export const submitClaimFeedback = createAsyncThunk(
    'complaints/submitFeedback',
    async ({ id, rating, comment }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.CLAIMS.FEEDBACK(id),
                { rating, comment },
                {
                    headers: getAuthHeaders(),
                }
            );
            return { claimId: id, feedback: response.data.data || response.data };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la soumission du feedback'
            );
        }
    }
);

// ==================== SLICE ====================

const complaintsSlice = createSlice({
    name: 'complaints',
    initialState: {
        complaints: [],
        claimTypes: [],
        currentComplaint: null,
        loading: false,
        typesLoading: false,
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
            // Fetch claim types
            .addCase(fetchClaimTypes.pending, (state) => {
                state.typesLoading = true;
                state.error = null;
            })
            .addCase(fetchClaimTypes.fulfilled, (state, action) => {
                state.typesLoading = false;
                state.claimTypes = action.payload;
            })
            .addCase(fetchClaimTypes.rejected, (state, action) => {
                state.typesLoading = false;
                state.error = action.payload;
            })

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
            })

            // Send message
            .addCase(sendClaimMessage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendClaimMessage.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentComplaint && state.currentComplaint.id === action.payload.claimId) {
                    if (!state.currentComplaint.messages) {
                        state.currentComplaint.messages = [];
                    }
                    state.currentComplaint.messages.push(action.payload.message);
                }
                state.success = true;
            })
            .addCase(sendClaimMessage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Submit feedback
            .addCase(submitClaimFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitClaimFeedback.fulfilled, (state, action) => {
                state.loading = false;
                if (state.currentComplaint && state.currentComplaint.id === action.payload.claimId) {
                    state.currentComplaint.feedback = action.payload.feedback;
                    state.currentComplaint.status = 'closed';
                }
                state.success = true;
            })
            .addCase(submitClaimFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearSuccess, clearCurrentComplaint } = complaintsSlice.actions;
export default complaintsSlice.reducer;
