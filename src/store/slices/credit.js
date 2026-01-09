import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from '../../services/api';

// ==================== ASYNC THUNKS ====================

// Fetch credit rules
export const fetchCreditRules = createAsyncThunk(
    'credit/fetchRules',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.CREDIT.RULES, {
                headers: getAuthHeaders(),
            });
            return response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors du chargement des règles de crédit'
            );
        }
    }
);

// Simulate credit
export const simulateCredit = createAsyncThunk(
    'credit/simulate',
    async (simulationData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.CREDIT.SIMULATE,
                simulationData,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.response?.data?.error || 'Erreur lors de la simulation'
            );
        }
    }
);

// Check eligibility
export const checkEligibility = createAsyncThunk(
    'credit/checkEligibility',
    async (eligibilityData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.CREDIT.ELIGIBILITY,
                eligibilityData,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la vérification d\'éligibilité'
            );
        }
    }
);

// Create dossier
export const createDossier = createAsyncThunk(
    'credit/createDossier',
    async (dossierData, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                API_ENDPOINTS.CREDIT.CREATE_DOSSIER,
                dossierData,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de la création du dossier'
            );
        }
    }
);

// Helper to convert file to base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

// Upload document
export const uploadDocument = createAsyncThunk(
    'credit/uploadDocument',
    async ({ dossierId, typeDocument, file }, { rejectWithValue }) => {
        try {
            const base64File = await fileToBase64(file);

            const payload = {
                dossier_id: dossierId,
                type_document: typeDocument,
                file_base64: base64File,
                file_name: file.name
            };

            const response = await axios.post(
                API_ENDPOINTS.CREDIT.UPLOAD_DOCUMENT,
                payload,
                {
                    headers: getAuthHeaders(),
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors de l\'upload du document'
            );
        }
    }
);

// Fetch dossiers
export const fetchDossiers = createAsyncThunk(
    'credit/fetchDossiers',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(API_ENDPOINTS.CREDIT.LIST_DOSSIERS, {
                headers: getAuthHeaders(),
            });
            return response.data.data || response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors du chargement des dossiers'
            );
        }
    }
);

// Fetch single dossier
// Fetch single dossier (Modified to filter from list as backend endpoint is missing)
export const fetchDossierById = createAsyncThunk(
    'credit/fetchDossierById',
    async (id, { rejectWithValue }) => {
        try {
            // Use LIST_DOSSIERS instead of GET_DOSSIER
            const response = await axios.get(API_ENDPOINTS.CREDIT.LIST_DOSSIERS, {
                headers: getAuthHeaders(),
            });

            const dossiers = response.data.data || response.data;
            const dossier = dossiers.find(d => d.id === id);

            if (!dossier) {
                return rejectWithValue('Dossier non trouvé');
            }

            return dossier;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || 'Erreur lors du chargement du dossier'
            );
        }
    }
);

// ==================== SLICE ====================

const creditSlice = createSlice({
    name: 'credit',
    initialState: {
        rules: [],
        simulation: null,
        eligibility: null,
        dossiers: [],
        currentDossier: null,
        loading: false,
        rulesLoading: false,
        uploadLoading: false,
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
        setCurrentDossier: (state, action) => {
            state.currentDossier = action.payload;
        },
        resetCreditProcess: (state) => {
            state.simulation = null;
            state.eligibility = null;
            state.currentDossier = null;
            state.success = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch credit rules
            .addCase(fetchCreditRules.pending, (state) => {
                state.rulesLoading = true;
                state.error = null;
            })
            .addCase(fetchCreditRules.fulfilled, (state, action) => {
                state.rulesLoading = false;
                state.rules = action.payload;
            })
            .addCase(fetchCreditRules.rejected, (state, action) => {
                state.rulesLoading = false;
                state.error = action.payload;
            })

            // Simulate credit
            .addCase(simulateCredit.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(simulateCredit.fulfilled, (state, action) => {
                state.loading = false;
                state.simulation = action.payload;
            })
            .addCase(simulateCredit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Check eligibility
            .addCase(checkEligibility.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(checkEligibility.fulfilled, (state, action) => {
                state.loading = false;
                state.eligibility = action.payload;
            })
            .addCase(checkEligibility.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create dossier
            .addCase(createDossier.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createDossier.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDossier = action.payload;
                state.success = true;
            })
            .addCase(createDossier.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Upload document
            .addCase(uploadDocument.pending, (state) => {
                state.uploadLoading = true;
                state.error = null;
            })
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.uploadLoading = false;
                state.success = true;
                // Add document to current dossier if it exists
                if (state.currentDossier) {
                    if (!state.currentDossier.documents) {
                        state.currentDossier.documents = [];
                    }
                    state.currentDossier.documents.push(action.payload.document);
                }
            })
            .addCase(uploadDocument.rejected, (state, action) => {
                state.uploadLoading = false;
                state.error = action.payload;
            })

            // Fetch dossiers
            .addCase(fetchDossiers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDossiers.fulfilled, (state, action) => {
                state.loading = false;
                state.dossiers = action.payload;
            })
            .addCase(fetchDossiers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch single dossier
            .addCase(fetchDossierById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDossierById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentDossier = action.payload;
            })
            .addCase(fetchDossierById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, clearSuccess, setCurrentDossier, resetCreditProcess } = creditSlice.actions;
export default creditSlice.reducer;
